package handlers

import (
	"net/http"

	"openfamily/services"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"go.mongodb.org/mongo-driver/mongo"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  4096,
	WriteBufferSize: 4096,
	CheckOrigin: func(r *http.Request) bool {
		// Origin is validated at the Nginx level; allow all here for self-hosting.
		return true
	},
}

type WSHandler struct {
	db *mongo.Database
}

func NewWSHandler(db *mongo.Database) *WSHandler {
	return &WSHandler{db: db}
}

func (h *WSHandler) Handle(c *gin.Context) {
	userID := c.GetString("user_id")

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		return
	}

	client := &services.WSClient{
		Hub:    services.Hub,
		UserID: userID,
		Conn:   conn,
		Send:   make(chan []byte, 256),
	}

	services.Hub.Register <- client

	// Broadcast online status.
	services.Hub.SendToUser(userID, services.WSMessage{Type: services.WSTypeUserOnline, SenderID: userID})
	(&UserHandler{db: h.db}).UpdateOnline(h.db, userID, true)

	go client.WritePump()
	client.ReadPump(func(cl *services.WSClient, msg services.WSMessage) {
		h.route(cl, msg)
	})

	// Client disconnected.
	(&UserHandler{db: h.db}).UpdateOnline(h.db, userID, false)
	services.Hub.SendToUser(userID, services.WSMessage{Type: services.WSTypeUserOffline, SenderID: userID})
}

// route forwards signalling messages (calls, typing, etc.) to the intended recipient.
func (h *WSHandler) route(cl *services.WSClient, msg services.WSMessage) {
	switch msg.Type {
	case services.WSTypeTyping,
		services.WSTypeSignal,
		services.WSTypeCallOffer,
		services.WSTypeCallAnswer,
		services.WSTypeCallICE,
		services.WSTypeCallEnd,
		services.WSTypeCallRing,
		services.WSTypeCallReject:
		if msg.ReceiverID != "" {
			msg.SenderID = cl.UserID
			services.Hub.SendToUser(msg.ReceiverID, msg)
		}
	}
}
