package handlers

import (
	"context"
	"net/http"
	"time"

	"openfamily/models"
	"openfamily/services"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

type AuthHandler struct {
	db *mongo.Database
}

func NewAuthHandler(db *mongo.Database) *AuthHandler {
	return &AuthHandler{db: db}
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Find user by encrypted username.
	cursor, err := h.db.Collection("users").Find(ctx, bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}
	defer cursor.Close(ctx)

	var found *models.User
	for cursor.Next(ctx) {
		var u models.User
		if err := cursor.Decode(&u); err != nil {
			continue
		}
		decryptedUsername := services.MustDecrypt(u.Username)
		if decryptedUsername == req.Username {
			found = &u
			break
		}
	}

	if found == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(found.PasswordHash), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
		return
	}

	token, err := services.GenerateToken(found.ID.Hex(), string(found.Role))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "token generation failed"})
		return
	}

	// Decrypt display fields for the response.
	found.Username = services.MustDecrypt(found.Username)
	found.DisplayName = services.MustDecrypt(found.DisplayName)
	found.Avatar = services.MustDecrypt(found.Avatar)

	// Mark online.
	h.db.Collection("users").UpdateOne(ctx,
		bson.M{"_id": found.ID},
		bson.M{"$set": bson.M{"is_online": true, "last_seen": time.Now()}},
	)

	c.JSON(http.StatusOK, models.LoginResponse{Token: token, User: found})
}
