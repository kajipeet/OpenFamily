package main

import (
	"context"
	"log"
	"os"
	"time"

	"openfamily/config"
	"openfamily/handlers"
	"openfamily/middleware"
	"openfamily/models"
	"openfamily/services"
	"openfamily/utils"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	cfg := config.Load()
	services.InitEncryption(cfg.EncryptionKey)
	services.InitJWT(cfg.JWTSecret)

	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(cfg.MongoURI))
	if err != nil {
		log.Fatalf("mongo connect: %v", err)
	}
	if err := client.Ping(ctx, nil); err != nil {
		log.Fatalf("mongo ping: %v", err)
	}

	db := client.Database("openfamily")
	ensureIndexes(db)
	seedAdmin(db, cfg)

	if err := os.MkdirAll(cfg.UploadDir, 0750); err != nil {
		log.Fatalf("upload dir: %v", err)
	}

	go services.Hub.Run()
	services.StartCleanupWorker(db)

	r := gin.Default()
	r.MaxMultipartMemory = cfg.UploadChunkSize * 2
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: false,
	}))

	authH := handlers.NewAuthHandler(db)
	r.POST("/api/auth/login", authH.Login)

	api := r.Group("/api", middleware.Auth())
	{
		userH := handlers.NewUserHandler(db)
		api.GET("/users/me", userH.Me)
		api.GET("/users/search", userH.SearchByTag)
		api.GET("/users/:id", userH.GetUser)
		api.PUT("/users/me/avatar", userH.UpdateAvatar)
		api.PUT("/users/me/e2ee-key", userH.UpdateE2EEPublicKey)

		chatH := handlers.NewChatHandler(db)
		api.GET("/chats", chatH.GetChats)
		api.POST("/chats", chatH.GetOrCreateChat)
		api.GET("/chats/:id/messages", chatH.GetMessages)
		api.POST("/chats/:id/messages", chatH.SendMessage)
		api.PUT("/chats/:id/read", chatH.MarkRead)

		// Polling fallback for mobile/unreliable connections
		api.POST("/events/poll", handlers.PollEvents(db))

		api.POST("/upload", handlers.UploadFile)
		api.POST("/upload/init", handlers.InitChunkedUpload)
		api.PUT("/upload/:upload_id/parts/:part", handlers.UploadChunk)
		api.POST("/upload/:upload_id/complete", handlers.CompleteChunkedUpload)
		api.GET("/files/:subdir/:filename", handlers.ServeFile)

		adminH := handlers.NewAdminHandler(db)
		api.GET("/sticker-packs", adminH.ListStickerPacks)
		api.GET("/sticker-packs/:pack_id/stickers", adminH.ListStickers)

		admin := api.Group("/admin", middleware.AdminOnly())
		{
			admin.GET("/users", adminH.ListUsers)
			admin.POST("/users", adminH.CreateUser)
			admin.DELETE("/users/:id", adminH.DeleteUser)
			admin.POST("/sticker-packs", adminH.CreateStickerPack)
		}
	}

	wsH := handlers.NewWSHandler(db)
	r.GET("/ws", middleware.Auth(), wsH.Handle)

	log.Println("server listening on :8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("server: %v", err)
	}
}

func ensureIndexes(db *mongo.Database) {
	ctx := context.Background()
	_, _ = db.Collection("users").Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys:    bson.M{"tag": 1},
		Options: options.Index().SetUnique(true),
	})
	_, _ = db.Collection("messages").Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: bson.D{{Key: "chat_id", Value: 1}, {Key: "created_at", Value: 1}},
	})
	_, _ = db.Collection("messages").Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: bson.M{"delete_at": 1},
	})
	_, _ = db.Collection("chats").Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: bson.M{"participants": 1},
	})
}

func seedAdmin(db *mongo.Database, cfg *config.Config) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	count, _ := db.Collection("users").CountDocuments(ctx, bson.M{"role": "admin"})
	if count > 0 {
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(cfg.AdminPassword), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("seed admin hash: %v", err)
	}

	encUsername, _ := services.Encrypt(cfg.AdminUsername)
	encDisplay, _ := services.Encrypt("Administrator")

	admin := models.User{
		ID:           primitive.NewObjectID(),
		Username:     encUsername,
		PasswordHash: string(hash),
		Tag:          utils.GenerateTag(),
		DisplayName:  encDisplay,
		Role:         models.RoleAdmin,
		IsOnline:     false,
		LastSeen:     time.Now(),
		CreatedAt:    time.Now(),
	}

	if _, err := db.Collection("users").InsertOne(ctx, admin); err != nil {
		log.Fatalf("seed admin insert: %v", err)
	}
}
