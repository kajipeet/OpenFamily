package handlers

import (
	"context"
	"net/http"
	"strings"
	"time"

	"openfamily/models"
	"openfamily/services"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type UserHandler struct {
	db *mongo.Database
}

func NewUserHandler(db *mongo.Database) *UserHandler {
	return &UserHandler{db: db}
}

// Me returns the authenticated user's profile.
func (h *UserHandler) Me(c *gin.Context) {
	myID, _ := primitive.ObjectIDFromHex(c.GetString("user_id"))
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var u models.User
	if err := h.db.Collection("users").FindOne(ctx, bson.M{"_id": myID}).Decode(&u); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}
	u.Username = services.MustDecrypt(u.Username)
	u.DisplayName = services.MustDecrypt(u.DisplayName)
	u.Avatar = services.MustDecrypt(u.Avatar)
	c.JSON(http.StatusOK, u)
}

// SearchByTag searches users by their tag (exact or prefix match).
func (h *UserHandler) SearchByTag(c *gin.Context) {
	tag := strings.TrimSpace(c.Query("tag"))
	if tag == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "tag required"})
		return
	}
	if !strings.HasPrefix(tag, "@") {
		tag = "@" + tag
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Tags are stored plain — we can use regex.
	cursor, err := h.db.Collection("users").Find(ctx, bson.M{
		"tag": bson.M{"$regex": primitive.Regex{Pattern: "^" + escapeRegex(tag), Options: "i"}},
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "search error"})
		return
	}
	defer cursor.Close(ctx)

	var users []models.User
	for cursor.Next(ctx) {
		var u models.User
		if err := cursor.Decode(&u); err != nil {
			continue
		}
		u.Username = services.MustDecrypt(u.Username)
		u.DisplayName = services.MustDecrypt(u.DisplayName)
		u.Avatar = services.MustDecrypt(u.Avatar)
		users = append(users, u)
	}
	c.JSON(http.StatusOK, users)
}

// GetUser returns a specific user's public profile.
func (h *UserHandler) GetUser(c *gin.Context) {
	uid, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var u models.User
	if err := h.db.Collection("users").FindOne(ctx, bson.M{"_id": uid}).Decode(&u); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}
	u.Username = services.MustDecrypt(u.Username)
	u.DisplayName = services.MustDecrypt(u.DisplayName)
	u.Avatar = services.MustDecrypt(u.Avatar)
	c.JSON(http.StatusOK, u)
}

// UpdateAvatar stores a newly uploaded avatar path for the authenticated user.
func (h *UserHandler) UpdateAvatar(c *gin.Context) {
	myID, _ := primitive.ObjectIDFromHex(c.GetString("user_id"))

	var req struct {
		AvatarURL string `json:"avatar_url" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	encURL, _ := services.Encrypt(req.AvatarURL)
	h.db.Collection("users").UpdateOne(ctx,
		bson.M{"_id": myID},
		bson.M{"$set": bson.M{"avatar": encURL}},
	)
	c.JSON(http.StatusOK, gin.H{"avatar_url": req.AvatarURL})
}

// UpdateE2EEPublicKey stores the caller's current public key for client-side E2EE.
func (h *UserHandler) UpdateE2EEPublicKey(c *gin.Context) {
	myID, _ := primitive.ObjectIDFromHex(c.GetString("user_id"))

	var req models.UpdateE2EEPublicKeyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if _, err := h.db.Collection("users").UpdateOne(ctx,
		bson.M{"_id": myID},
		bson.M{"$set": bson.M{"e2ee_public_key": req.PublicKey}},
	); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "update error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"public_key": req.PublicKey})
}

// UpdateOnline sets the user's online/last-seen status.
func (h *UserHandler) UpdateOnline(db *mongo.Database, userID string, online bool) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	uid, _ := primitive.ObjectIDFromHex(userID)
	db.Collection("users").UpdateOne(ctx,
		bson.M{"_id": uid},
		bson.M{"$set": bson.M{"is_online": online, "last_seen": time.Now()}},
	)
}

func escapeRegex(s string) string {
	replacer := strings.NewReplacer(
		`\`, `\\`, `.`, `\.`, `+`, `\+`, `*`, `\*`, `?`, `\?`,
		`(`, `\(`, `)`, `\)`, `|`, `\|`, `[`, `\[`, `]`, `\]`,
		`{`, `\{`, `}`, `\}`, `^`, `\^`, `$`, `\$`,
	)
	return replacer.Replace(s)
}
