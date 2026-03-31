package config

import (
	"log"
	"os"
	"strconv"
	"time"
)

type Config struct {
	MongoURI        string
	JWTSecret       string
	EncryptionKey   string
	UploadDir       string
	AdminUsername   string
	AdminPassword   string
	MessageTTL      time.Duration
	MaxUploadBytes  int64
	UploadChunkSize int64
}

var Cfg *Config

func Load() *Config {
	key := getEnv("ENCRYPTION_KEY", "change_this_32byte_key_please!!")
	if len(key) != 32 {
		log.Fatalf("ENCRYPTION_KEY must be exactly 32 bytes, got %d", len(key))
	}
	Cfg = &Config{
		MongoURI:        getEnv("MONGO_URI", "mongodb://localhost:27017/openfamily"),
		JWTSecret:       getEnv("JWT_SECRET", "change_this_jwt_secret"),
		EncryptionKey:   key,
		UploadDir:       getEnv("UPLOAD_DIR", "./uploads"),
		AdminUsername:   getEnv("ADMIN_USERNAME", "admin"),
		AdminPassword:   getEnv("ADMIN_PASSWORD", "admin"),
		MessageTTL:      3 * time.Minute,
		MaxUploadBytes:  getEnvInt64("MAX_UPLOAD_BYTES", 10*1024*1024*1024),
		UploadChunkSize: getEnvInt64("UPLOAD_CHUNK_SIZE", 8*1024*1024),
	}
	if Cfg.UploadChunkSize < 1024*1024 {
		log.Fatalf("UPLOAD_CHUNK_SIZE must be >= 1MB, got %d", Cfg.UploadChunkSize)
	}
	if Cfg.MaxUploadBytes < Cfg.UploadChunkSize {
		log.Fatalf("MAX_UPLOAD_BYTES (%d) must be >= UPLOAD_CHUNK_SIZE (%d)", Cfg.MaxUploadBytes, Cfg.UploadChunkSize)
	}
	return Cfg
}

func getEnv(key, defaultVal string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultVal
}

func getEnvInt64(key string, defaultVal int64) int64 {
	val := os.Getenv(key)
	if val == "" {
		return defaultVal
	}
	parsed, err := strconv.ParseInt(val, 10, 64)
	if err != nil {
		log.Fatalf("%s must be int64, got %q", key, val)
	}
	return parsed
}
