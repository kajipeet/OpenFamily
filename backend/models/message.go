package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type MessageType string

const (
	MsgTypeText    MessageType = "text"
	MsgTypeImage   MessageType = "image"
	MsgTypeVideo   MessageType = "video"
	MsgTypeAudio   MessageType = "audio"
	MsgTypeVoice   MessageType = "voice"
	MsgTypeFile    MessageType = "file"
	MsgTypeSticker MessageType = "sticker"
)

// Message stores end-to-end encrypted payload fields.
type Message struct {
	ID            primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	ChatID        primitive.ObjectID `bson:"chat_id" json:"chat_id"`
	SenderID      primitive.ObjectID `bson:"sender_id" json:"sender_id"`
	Type          MessageType        `bson:"type" json:"type"`
	Content       string             `bson:"content,omitempty" json:"content,omitempty"`
	Nonce         string             `bson:"nonce,omitempty" json:"nonce,omitempty"`
	FileName      string             `bson:"file_name,omitempty" json:"file_name,omitempty"`
	FileNameNonce string             `bson:"file_name_nonce,omitempty" json:"file_name_nonce,omitempty"`
	FileURL       string             `bson:"file_url,omitempty" json:"file_url,omitempty"`
	FileNonce     string             `bson:"file_nonce,omitempty" json:"file_nonce,omitempty"`
	MimeType      string             `bson:"mime_type,omitempty" json:"mime_type,omitempty"`
	E2EEVersion   string             `bson:"e2ee_version,omitempty" json:"e2ee_version,omitempty"`
	FileSize      int64              `bson:"file_size,omitempty" json:"file_size,omitempty"`
	Duration      int                `bson:"duration,omitempty" json:"duration,omitempty"` // seconds (voice/video)
	CreatedAt     time.Time          `bson:"created_at" json:"created_at"`
	ReadAt        *time.Time         `bson:"read_at,omitempty" json:"read_at,omitempty"`
	DeleteAt      *time.Time         `bson:"delete_at,omitempty" json:"delete_at,omitempty"`
}

type SendMessageRequest struct {
	Type          MessageType `json:"type" binding:"required"`
	Content       string      `json:"content"`
	Nonce         string      `json:"nonce"`
	FileURL       string      `json:"file_url"`
	FileName      string      `json:"file_name"`
	FileNameNonce string      `json:"file_name_nonce"`
	FileNonce     string      `json:"file_nonce"`
	MimeType      string      `json:"mime_type"`
	E2EEVersion   string      `json:"e2ee_version"`
	FileSize      int64       `json:"file_size"`
	Duration      int         `json:"duration"`
}
