package handlers

import (
	"context"
	"net/http"
	"time"

	"openfamily/models"
	"openfamily/services"
	"openfamily/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

type AdminHandler struct {
	db *mongo.Database
}

func NewAdminHandler(db *mongo.Database) *AdminHandler {
	return &AdminHandler{db: db}
}

// CreateUser — admin creates a new account.
func (h *AdminHandler) CreateUser(c *gin.Context) {
	var req models.CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Role == "" {
		req.Role = models.RoleUser
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "hash error"})
		return
	}

	encUsername, _ := services.Encrypt(req.Username)
	encDisplay, _ := services.Encrypt(req.DisplayName)

	// Generate a unique tag.
	var tag string
	for {
		tag = utils.GenerateTag()
		count, _ := h.db.Collection("users").CountDocuments(ctx, bson.M{"tag": tag})
		if count == 0 {
			break
		}
	}

	user := models.User{
		ID:           primitive.NewObjectID(),
		Username:     encUsername,
		PasswordHash: string(hash),
		Tag:          tag,
		DisplayName:  encDisplay,
		Role:         req.Role,
		IsOnline:     false,
		LastSeen:     time.Now(),
		CreatedAt:    time.Now(),
	}

	if _, err := h.db.Collection("users").InsertOne(ctx, user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "insert error"})
		return
	}

	// Return decrypted form.
	user.Username = req.Username
	user.DisplayName = req.DisplayName
	c.JSON(http.StatusCreated, user)
}

// ListUsers — admin lists all accounts.
func (h *AdminHandler) ListUsers(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := h.db.Collection("users").Find(ctx, bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
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

// DeleteUser — admin removes an account and all associated data.
func (h *AdminHandler) DeleteUser(c *gin.Context) {
	id, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	res, err := h.db.Collection("users").DeleteOne(ctx, bson.M{"_id": id})
	if err != nil || res.DeletedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	// Remove messages and chats where the user is a participant.
	h.db.Collection("messages").DeleteMany(ctx, bson.M{"sender_id": id})
	h.db.Collection("chats").DeleteMany(ctx, bson.M{"participants": id})

	c.JSON(http.StatusOK, gin.H{"message": "user deleted"})
}

// CreateStickerPack — admin uploads a sticker pack.
func (h *AdminHandler) CreateStickerPack(c *gin.Context) {
	adminID, _ := c.Get("user_id")
	adminOID, _ := primitive.ObjectIDFromHex(adminID.(string))

	name := c.PostForm("name")
	description := c.PostForm("description")
	if name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "name required"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	pack := models.StickerPack{
		ID:          primitive.NewObjectID(),
		Name:        name,
		Description: description,
		CreatedBy:   adminOID,
		CreatedAt:   time.Now(),
	}
	if _, err := h.db.Collection("sticker_packs").InsertOne(ctx, pack); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "insert error"})
		return
	}
	c.JSON(http.StatusCreated, pack)
}

// ListStickerPacks — returns all sticker packs.
func (h *AdminHandler) ListStickerPacks(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := h.db.Collection("sticker_packs").Find(ctx, bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}
	defer cursor.Close(ctx)

	var packs []models.StickerPack
	cursor.All(ctx, &packs)
	c.JSON(http.StatusOK, packs)
}

// ListStickers — returns all stickers in a pack.
func (h *AdminHandler) ListStickers(c *gin.Context) {
	packID, err := primitive.ObjectIDFromHex(c.Param("pack_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid pack_id"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := h.db.Collection("stickers").Find(ctx, bson.M{"pack_id": packID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}
	defer cursor.Close(ctx)

	var stickers []models.Sticker
	for cursor.Next(ctx) {
		var s models.Sticker
		cursor.Decode(&s)
		s.FileURL = services.MustDecrypt(s.FileURL)
		stickers = append(stickers, s)
	}
	c.JSON(http.StatusOK, stickers)
}
