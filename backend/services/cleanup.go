package services

import (
	"context"
	"encoding/json"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

// StartCleanupWorker runs the message auto-deletion background goroutine.
// It checks every 30 seconds and hard-deletes messages whose delete_at has passed.
func StartCleanupWorker(db *mongo.Database) {
	go func() {
		ticker := time.NewTicker(30 * time.Second)
		defer ticker.Stop()
		for range ticker.C {
			deleteExpiredMessages(db)
		}
	}()
}

func deleteExpiredMessages(db *mongo.Database) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	col := db.Collection("messages")
	now := time.Now()

	// Find messages that have passed their delete_at time.
	cursor, err := col.Find(ctx, bson.M{
		"delete_at": bson.M{"$lte": now},
	})
	if err != nil {
		log.Printf("cleanup: find error: %v", err)
		return
	}
	defer cursor.Close(ctx)

	type msgMeta struct {
		ID           primitive.ObjectID `bson:"_id"`
		ChatID       primitive.ObjectID `bson:"chat_id"`
		SenderID     primitive.ObjectID `bson:"sender_id"`
		Participants []primitive.ObjectID
	}

	var toDelete []primitive.ObjectID

	for cursor.Next(ctx) {
		var m msgMeta
		if err := cursor.Decode(&m); err != nil {
			continue
		}
		toDelete = append(toDelete, m.ID)

		// Notify participants via WebSocket.
		notifyDeletion(m.ID.Hex(), m.ChatID.Hex(), m.SenderID.Hex(), db, ctx)
	}

	if len(toDelete) == 0 {
		return
	}

	res, err := col.DeleteMany(ctx, bson.M{"_id": bson.M{"$in": toDelete}})
	if err != nil {
		log.Printf("cleanup: delete error: %v", err)
		return
	}
	if res.DeletedCount > 0 {
		log.Printf("cleanup: deleted %d expired messages", res.DeletedCount)
	}
}

func notifyDeletion(msgID, chatID, senderID string, db *mongo.Database, ctx context.Context) {
	// Find the chat to get both participants.
	type chat struct {
		Participants []primitive.ObjectID `bson:"participants"`
	}
	chatOID, err := primitive.ObjectIDFromHex(chatID)
	if err != nil {
		return
	}
	var c chat
	if err := db.Collection("chats").FindOne(ctx, bson.M{"_id": chatOID}).Decode(&c); err != nil {
		return
	}

	payload, _ := json.Marshal(map[string]string{"message_id": msgID, "chat_id": chatID})
	msg := WSMessage{
		Type:      WSTypeMessageDeleted,
		MessageID: msgID,
		ChatID:    chatID,
		Data:      payload,
	}
	for _, p := range c.Participants {
		Hub.SendToUser(p.Hex(), msg)
	}
}
