package handlers

import (
	"context"
	"encoding/json"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type PollRequest struct {
	Since int64 `json:"since"` // Unix timestamp in milliseconds
}

// PollEvents returns recent events (messages, read receipts, etc.) since a given timestamp.
// Used as a fallback when WebSocket is unavailable (mobile networks, proxies, etc).
func PollEvents(db *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetString("user_id")
		if userID == "" {
			c.JSON(401, gin.H{"error": "unauthorized"})
			return
		}

		var req PollRequest
		if err := c.BindJSON(&req); err != nil {
			c.JSON(400, gin.H{"error": "invalid request"})
			return
		}

		// Convert client timestamp (milliseconds) to server time
		sinceTime := time.UnixMilli(req.Since).UTC()
		now := time.Now().UTC()

		// Don't poll older than 1 minute
		if now.Sub(sinceTime) > 1*time.Minute {
			sinceTime = now.Add(-1 * time.Minute)
		}

		ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
		defer cancel()

		// Fetch user's chats
		chatsCol := db.Collection("chats")
		cursor, err := chatsCol.Find(ctx, bson.M{
			"participants": userID,
		})
		if err != nil {
			c.JSON(500, gin.H{"error": "query failed"})
			return
		}
		defer cursor.Close(ctx)

		var chats []bson.M
		if err := cursor.All(ctx, &chats); err != nil {
			c.JSON(500, gin.H{"error": "query failed"})
			return
		}

		var chatIDs []interface{}
		for _, chat := range chats {
			if id, ok := chat["_id"]; ok {
				chatIDs = append(chatIDs, id)
			}
		}

		if len(chatIDs) == 0 {
			c.JSON(200, []gin.H{})
			return
		}

		// Fetch recent messages in user's chats
		messagesCol := db.Collection("messages")
		msgCursor, err := messagesCol.Find(ctx, bson.M{
			"chat_id":    bson.M{"$in": chatIDs},
			"created_at": bson.M{"$gt": sinceTime},
		})
		if err != nil {
			c.JSON(500, gin.H{"error": "query failed"})
			return
		}
		defer msgCursor.Close(ctx)

		var messages []bson.M
		if err := msgCursor.All(ctx, &messages); err != nil {
			c.JSON(500, gin.H{"error": "query failed"})
			return
		}

		// Convert messages to event format (same as WebSocket)
		var events []gin.H
		for _, msg := range messages {
			msgJSON, _ := json.Marshal(msg)
			events = append(events, gin.H{
				"type": "message",
				"data": string(msgJSON),
			})
		}

		// Fetch read receipts (messages marked as read since timestamp)
		readCol := db.Collection("read_receipts")
		readCursor, err := readCol.Find(ctx, bson.M{
			"user_id":    userID,
			"updated_at": bson.M{"$gt": sinceTime},
		})
		if err != nil {
			c.JSON(500, gin.H{"error": "query failed"})
			return
		}
		defer readCursor.Close(ctx)

		var receipts []bson.M
		if err := readCursor.All(ctx, &receipts); err != nil {
			c.JSON(500, gin.H{"error": "query failed"})
			return
		}

		// Convert receipts to event format
		for _, r := range receipts {
			if chatID, ok := r["chat_id"]; ok {
				if deleteAt, ok := r["delete_at"]; ok {
					receiptJSON, _ := json.Marshal(bson.M{
						"chat_id":   chatID,
						"delete_at": deleteAt,
					})
					events = append(events, gin.H{
						"type": "read",
						"data": string(receiptJSON),
					})
				}
			}
		}

		c.JSON(200, events)
	}
}
