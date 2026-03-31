package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type StickerPack struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name        string             `bson:"name" json:"name"`
	Description string             `bson:"description,omitempty" json:"description,omitempty"`
	Thumbnail   string             `bson:"thumbnail,omitempty" json:"thumbnail,omitempty"`
	CreatedBy   primitive.ObjectID `bson:"created_by" json:"created_by"`
	CreatedAt   time.Time          `bson:"created_at" json:"created_at"`
}

type Sticker struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	PackID    primitive.ObjectID `bson:"pack_id" json:"pack_id"`
	Name      string             `bson:"name" json:"name"`
	FileURL   string             `bson:"file_url" json:"file_url"` // encrypted
	CreatedAt time.Time          `bson:"created_at" json:"created_at"`
}
