package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Role string

const (
	RoleAdmin Role = "admin"
	RoleUser  Role = "user"
)

type User struct {
	ID            primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Username      string             `bson:"username" json:"username"`
	PasswordHash  string             `bson:"password_hash" json:"-"`
	Tag           string             `bson:"tag" json:"tag"`
	DisplayName   string             `bson:"display_name" json:"display_name"`
	Avatar        string             `bson:"avatar,omitempty" json:"avatar,omitempty"`
	E2EEPublicKey string             `bson:"e2ee_public_key,omitempty" json:"e2ee_public_key,omitempty"`
	Role          Role               `bson:"role" json:"role"`
	IsOnline      bool               `bson:"is_online" json:"is_online"`
	LastSeen      time.Time          `bson:"last_seen" json:"last_seen"`
	CreatedAt     time.Time          `bson:"created_at" json:"created_at"`
}

type CreateUserRequest struct {
	Username    string `json:"username" binding:"required,min=3,max=32"`
	Password    string `json:"password" binding:"required,min=8"`
	DisplayName string `json:"display_name" binding:"required"`
	Role        Role   `json:"role"`
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
	Token string `json:"token"`
	User  *User  `json:"user"`
}

type UpdateE2EEPublicKeyRequest struct {
	PublicKey string `json:"public_key" binding:"required,min=16,max=2048"`
}
