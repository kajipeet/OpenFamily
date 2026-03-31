package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"openfamily/config"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type uploadInitRequest struct {
	FileName string `json:"file_name" binding:"required,min=1,max=512"`
	FileSize int64  `json:"file_size" binding:"required"`
	MimeType string `json:"mime_type"`
}

type uploadCompleteRequest struct {
	TotalParts int `json:"total_parts" binding:"required,min=1,max=200000"`
}

type uploadMeta struct {
	UploadID     string    `json:"upload_id"`
	OriginalName string    `json:"original_name"`
	FileSize     int64     `json:"file_size"`
	MimeType     string    `json:"mime_type"`
	ChunkSize    int64     `json:"chunk_size"`
	Subdir       string    `json:"subdir"`
	CreatedAt    time.Time `json:"created_at"`
}

// InitChunkedUpload creates a temporary upload session for a large file.
func InitChunkedUpload(c *gin.Context) {
	var req uploadInitRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if req.FileSize <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "file_size must be > 0"})
		return
	}
	if req.FileSize > config.Cfg.MaxUploadBytes {
		c.JSON(http.StatusRequestEntityTooLarge, gin.H{"error": "file too large"})
		return
	}

	ext := strings.ToLower(filepath.Ext(req.FileName))
	subdir := categoryFromExt(ext)
	uploadID := uuid.New().String()
	uploadDir := uploadTempDir(uploadID)

	if err := os.MkdirAll(uploadDir, 0750); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "storage error"})
		return
	}

	meta := uploadMeta{
		UploadID:     uploadID,
		OriginalName: req.FileName,
		FileSize:     req.FileSize,
		MimeType:     req.MimeType,
		ChunkSize:    config.Cfg.UploadChunkSize,
		Subdir:       subdir,
		CreatedAt:    time.Now(),
	}
	if err := writeUploadMeta(uploadDir, meta); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "storage error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"upload_id":  uploadID,
		"chunk_size": config.Cfg.UploadChunkSize,
	})
}

// UploadChunk accepts a binary chunk for a previously initialized upload.
func UploadChunk(c *gin.Context) {
	uploadID := c.Param("upload_id")
	partRaw := c.Param("part")
	part, err := strconv.Atoi(partRaw)
	if err != nil || part < 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid part index"})
		return
	}

	uploadDir := uploadTempDir(uploadID)
	meta, err := readUploadMeta(uploadDir)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "upload session not found"})
		return
	}

	chunkPath := filepath.Join(uploadDir, fmt.Sprintf("part-%08d.bin", part))
	tmpPath := chunkPath + ".tmp"

	out, err := os.Create(tmpPath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "storage error"})
		return
	}
	defer out.Close()

	written, err := io.Copy(out, c.Request.Body)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to read chunk"})
		return
	}
	if written <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "empty chunk"})
		return
	}
	if written > meta.ChunkSize+64*1024 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "chunk too large"})
		return
	}

	if err := os.Rename(tmpPath, chunkPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "storage error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"part": part, "bytes": written})
}

// CompleteChunkedUpload merges uploaded chunks into the final file.
func CompleteChunkedUpload(c *gin.Context) {
	uploadID := c.Param("upload_id")
	var req uploadCompleteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	uploadDir := uploadTempDir(uploadID)
	meta, err := readUploadMeta(uploadDir)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "upload session not found"})
		return
	}

	ext := strings.ToLower(filepath.Ext(meta.OriginalName))
	if err := os.MkdirAll(filepath.Join(config.Cfg.UploadDir, meta.Subdir), 0750); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "storage error"})
		return
	}
	filename := fmt.Sprintf("%s_%d%s", uuid.New().String(), time.Now().UnixNano(), ext)
	finalPath := filepath.Join(config.Cfg.UploadDir, meta.Subdir, filename)

	out, err := os.Create(finalPath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "storage error"})
		return
	}

	var totalWritten int64
	for i := 0; i < req.TotalParts; i++ {
		chunkPath := filepath.Join(uploadDir, fmt.Sprintf("part-%08d.bin", i))
		in, err := os.Open(chunkPath)
		if err != nil {
			out.Close()
			os.Remove(finalPath)
			c.JSON(http.StatusBadRequest, gin.H{"error": "missing chunk", "part": i})
			return
		}
		written, err := io.Copy(out, in)
		in.Close()
		if err != nil {
			out.Close()
			os.Remove(finalPath)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to assemble file"})
			return
		}
		totalWritten += written
	}

	if err := out.Close(); err != nil {
		os.Remove(finalPath)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "storage error"})
		return
	}

	if totalWritten != meta.FileSize {
		os.Remove(finalPath)
		c.JSON(http.StatusBadRequest, gin.H{"error": "assembled size mismatch"})
		return
	}

	_ = os.RemoveAll(uploadDir)

	fileURL := fmt.Sprintf("/api/files/%s/%s", meta.Subdir, filename)
	c.JSON(http.StatusOK, gin.H{
		"url":       fileURL,
		"file_name": meta.OriginalName,
		"file_size": totalWritten,
		"mime_type": meta.MimeType,
	})
}

// UploadFile handles multipart file uploads. Returns the file URL to embed in messages.
func UploadFile(c *gin.Context) {
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "no file provided"})
		return
	}
	defer file.Close()

	if header.Size > config.Cfg.MaxUploadBytes {
		c.JSON(http.StatusRequestEntityTooLarge, gin.H{"error": "file too large"})
		return
	}

	ext := strings.ToLower(filepath.Ext(header.Filename))
	subdir := categoryFromExt(ext)
	dir := filepath.Join(config.Cfg.UploadDir, subdir)
	if err := os.MkdirAll(dir, 0750); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "storage error"})
		return
	}

	filename := fmt.Sprintf("%s_%d%s", uuid.New().String(), time.Now().UnixNano(), ext)
	dest := filepath.Join(dir, filename)

	if err := c.SaveUploadedFile(header, dest); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "save error"})
		return
	}

	fileURL := fmt.Sprintf("/api/files/%s/%s", subdir, filename)
	c.JSON(http.StatusOK, gin.H{
		"url":       fileURL,
		"file_name": header.Filename,
		"file_size": header.Size,
	})
}

// ServeFile serves an uploaded file. Protected by the auth middleware.
func ServeFile(c *gin.Context) {
	subdir := c.Param("subdir")
	filename := c.Param("filename")

	// Prevent path traversal.
	if strings.Contains(subdir, "..") || strings.Contains(filename, "..") {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid path"})
		return
	}

	filePath := filepath.Join(config.Cfg.UploadDir, filepath.Clean(subdir), filepath.Clean(filename))
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		c.JSON(http.StatusNotFound, gin.H{"error": "file not found"})
		return
	}
	c.File(filePath)
}

func categoryFromExt(ext string) string {
	switch ext {
	case ".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif":
		return "images"
	case ".mp4", ".webm", ".mov":
		return "video"
	case ".mp3", ".ogg", ".opus", ".wav", ".m4a":
		return "audio"
	default:
		return "files"
	}
}

func uploadTempDir(uploadID string) string {
	return filepath.Join(config.Cfg.UploadDir, ".chunks", uploadID)
}

func writeUploadMeta(uploadDir string, meta uploadMeta) error {
	metaPath := filepath.Join(uploadDir, "meta.json")
	data, err := json.Marshal(meta)
	if err != nil {
		return err
	}
	return os.WriteFile(metaPath, data, 0640)
}

func readUploadMeta(uploadDir string) (uploadMeta, error) {
	metaPath := filepath.Join(uploadDir, "meta.json")
	data, err := os.ReadFile(metaPath)
	if err != nil {
		return uploadMeta{}, err
	}
	var meta uploadMeta
	if err := json.Unmarshal(data, &meta); err != nil {
		return uploadMeta{}, err
	}
	return meta, nil
}
