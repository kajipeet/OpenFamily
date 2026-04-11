package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"openfamily/config"
	"openfamily/models"
	"openfamily/services"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type ChatHandler struct {
	db *mongo.Database
}

func NewChatHandler(db *mongo.Database) *ChatHandler {
	return &ChatHandler{db: db}
}

// GetChats returns a list of the caller's chats, enriched with the other participant's profile.
func (h *ChatHandler) GetChats(c *gin.Context) {
	userID, _ := primitive.ObjectIDFromHex(c.GetString("user_id"))
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := h.db.Collection("chats").Find(ctx,
		bson.M{"participants": userID},
		options.Find().SetSort(bson.M{"last_message_at": -1}),
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}
	defer cursor.Close(ctx)

	var result []models.ChatWithUser
	for cursor.Next(ctx) {
		var chat models.Chat
		if err := cursor.Decode(&chat); err != nil {
			continue
		}
		if chat.LastMessage != "" && !strings.HasPrefix(chat.LastMessage, "[") {
			chat.LastMessage = "[encrypted message]"
		}

		// Find the other participant.
		var otherID primitive.ObjectID
		for _, p := range chat.Participants {
			if p != userID {
				otherID = p
				break
			}
		}

		var other models.User
		h.db.Collection("users").FindOne(ctx, bson.M{"_id": otherID}).Decode(&other)
		other.Username = services.MustDecrypt(other.Username)
		other.DisplayName = services.MustDecrypt(other.DisplayName)
		other.Avatar = services.MustDecrypt(other.Avatar)

		// Count unread messages sent by the other participant.
		unreadCount, _ := h.db.Collection("messages").CountDocuments(ctx, bson.M{
			"chat_id":   chat.ID,
			"sender_id": otherID,
			"read_at":   bson.M{"$exists": false},
		})
		chat.UnreadCount = int(unreadCount)

		result = append(result, models.ChatWithUser{Chat: chat, OtherUser: &other})
	}
	c.JSON(http.StatusOK, result)
}

// GetOrCreateChat gets or creates a 1-to-1 chat with another user.
func (h *ChatHandler) GetOrCreateChat(c *gin.Context) {
	myID, _ := primitive.ObjectIDFromHex(c.GetString("user_id"))

	var req struct {
		UserID string `json:"user_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	otherID, err := primitive.ObjectIDFromHex(req.UserID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user_id"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Find existing chat between the two users.
	var chat models.Chat
	err = h.db.Collection("chats").FindOne(ctx, bson.M{
		"participants": bson.M{"$all": []primitive.ObjectID{myID, otherID}, "$size": 2},
	}).Decode(&chat)

	if err == mongo.ErrNoDocuments {
		// Create new chat.
		chat = models.Chat{
			ID:           primitive.NewObjectID(),
			Participants: []primitive.ObjectID{myID, otherID},
			CreatedAt:    time.Now(),
		}
		if _, err := h.db.Collection("chats").InsertOne(ctx, chat); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "create chat failed"})
			return
		}
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}

	c.JSON(http.StatusOK, chat)
}

// GetMessages returns messages in a chat (newest last, max 50).
func (h *ChatHandler) GetMessages(c *gin.Context) {
	myID, _ := primitive.ObjectIDFromHex(c.GetString("user_id"))
	chatID, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Verify the caller is a participant.
	var chat models.Chat
	if err := h.db.Collection("chats").FindOne(ctx, bson.M{
		"_id": chatID, "participants": myID,
	}).Decode(&chat); err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "not a participant"})
		return
	}

	opts := options.Find().
		SetSort(bson.M{"created_at": 1}).
		SetLimit(100)

	cursor, err := h.db.Collection("messages").Find(ctx, bson.M{"chat_id": chatID}, opts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}
	defer cursor.Close(ctx)

	var messages []models.Message
	for cursor.Next(ctx) {
		var m models.Message
		if err := cursor.Decode(&m); err != nil {
			continue
		}
		messages = append(messages, m)
	}
	c.JSON(http.StatusOK, messages)
}

// SendMessage stores a new message and pushes it to the recipient via WebSocket.
func (h *ChatHandler) SendMessage(c *gin.Context) {
	senderID, _ := primitive.ObjectIDFromHex(c.GetString("user_id"))
	chatID, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	var req models.SendMessageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Verify participant.
	var chat models.Chat
	if err := h.db.Collection("chats").FindOne(ctx, bson.M{
		"_id": chatID, "participants": senderID,
	}).Decode(&chat); err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "not a participant"})
		return
	}

	var replyToID *primitive.ObjectID
	if req.ReplyToID != "" {
		replyID, parseErr := primitive.ObjectIDFromHex(req.ReplyToID)
		if parseErr != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid reply_to_id"})
			return
		}

		count, countErr := h.db.Collection("messages").CountDocuments(ctx, bson.M{
			"_id":     replyID,
			"chat_id": chatID,
		})
		if countErr != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
			return
		}
		if count == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "reply target not found"})
			return
		}

		replyToID = &replyID
	}

	msg := models.Message{
		ID:            primitive.NewObjectID(),
		ChatID:        chatID,
		SenderID:      senderID,
		ReplyToID:     replyToID,
		Type:          req.Type,
		Content:       req.Content,
		Nonce:         req.Nonce,
		FileName:      req.FileName,
		FileNameNonce: req.FileNameNonce,
		FileURL:       req.FileURL,
		FileNonce:     req.FileNonce,
		MimeType:      req.MimeType,
		E2EEVersion:   req.E2EEVersion,
		FileSize:      req.FileSize,
		Duration:      req.Duration,
		CreatedAt:     time.Now(),
	}

	if _, err := h.db.Collection("messages").InsertOne(ctx, msg); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "insert error"})
		return
	}

	// Update chat last message.
	preview := "[encrypted message]"
	if req.Type != models.MsgTypeText {
		preview = "[encrypted file]"
	}
	now := time.Now()
	h.db.Collection("chats").UpdateOne(ctx,
		bson.M{"_id": chatID},
		bson.M{"$set": bson.M{"last_message": preview, "last_message_at": now}},
	)

	msgJSON, _ := json.Marshal(msg)
	wsMsg := services.WSMessage{
		Type:     services.WSTypeNewMessage,
		ChatID:   chatID.Hex(),
		SenderID: senderID.Hex(),
		Data:     msgJSON,
	}

	// Push to every participant except the sender.
	for _, p := range chat.Participants {
		if p != senderID {
			services.Hub.SendToUser(p.Hex(), wsMsg)
		}
	}

	c.JSON(http.StatusCreated, msg)
}

// MarkRead marks all unread messages from the other participant as read
// and schedules them for deletion.
func (h *ChatHandler) MarkRead(c *gin.Context) {
	myID, _ := primitive.ObjectIDFromHex(c.GetString("user_id"))
	chatID, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	now := time.Now()
	deleteAt := now.Add(config.Cfg.MessageTTL)

	// Mark messages that were sent TO me (by other participant) as read.
	res, err := h.db.Collection("messages").UpdateMany(ctx,
		bson.M{
			"chat_id":   chatID,
			"sender_id": bson.M{"$ne": myID},
			"read_at":   bson.M{"$exists": false},
		},
		bson.M{"$set": bson.M{"read_at": now, "delete_at": deleteAt}},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "update error"})
		return
	}

	// Notify the sender about the read receipt + delete countdown.
	var chat models.Chat
	h.db.Collection("chats").FindOne(ctx, bson.M{"_id": chatID}).Decode(&chat)
	for _, p := range chat.Participants {
		if p != myID {
			_, _ = h.db.Collection("read_receipts").UpdateOne(
				ctx,
				bson.M{"user_id": p, "chat_id": chatID},
				bson.M{"$set": bson.M{"delete_at": deleteAt, "updated_at": now}},
				options.Update().SetUpsert(true),
			)

			payload, _ := json.Marshal(map[string]interface{}{
				"chat_id":   chatID.Hex(),
				"delete_at": deleteAt,
				"count":     res.ModifiedCount,
			})
			services.Hub.SendToUser(p.Hex(), services.WSMessage{
				Type:   services.WSTypeRead,
				ChatID: chatID.Hex(),
				Data:   payload,
			})
		}
	}

	c.JSON(http.StatusOK, gin.H{"marked": res.ModifiedCount, "delete_at": deleteAt})
}
