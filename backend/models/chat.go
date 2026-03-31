package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Chat is a 1-to-1 conversation between two users.
type Chat struct {
	ID            primitive.ObjectID   `bson:"_id,omitempty" json:"id"`
	Participants  []primitive.ObjectID `bson:"participants" json:"participants"`
	CreatedAt     time.Time            `bson:"created_at" json:"created_at"`
	LastMessageAt *time.Time           `bson:"last_message_at,omitempty" json:"last_message_at,omitempty"`
	LastMessage   string               `bson:"last_message,omitempty" json:"last_message,omitempty"` // encrypted preview
	UnreadCount   int                  `bson:"unread_count,omitempty" json:"unread_count,omitempty"` // not persisted, computed
}

// ChatWithUser is returned to clients — enriched with the other participant's info.
type ChatWithUser struct {
	Chat
	OtherUser *User `json:"other_user"`
}
