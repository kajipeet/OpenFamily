package services

import (
	"encoding/json"
	"log"
	"sync"

	"github.com/gorilla/websocket"
)

// WSMessageType enumerates all WebSocket event types.
type WSMessageType string

const (
	WSTypeNewMessage     WSMessageType = "message"
	WSTypeRead           WSMessageType = "read"
	WSTypeTyping         WSMessageType = "typing"
	WSTypeSignal         WSMessageType = "signal"
	WSTypeCallOffer      WSMessageType = "call_offer"
	WSTypeCallAnswer     WSMessageType = "call_answer"
	WSTypeCallICE        WSMessageType = "call_ice"
	WSTypeCallEnd        WSMessageType = "call_end"
	WSTypeCallRing       WSMessageType = "call_ring"
	WSTypeCallReject     WSMessageType = "call_reject"
	WSTypeUserOnline     WSMessageType = "user_online"
	WSTypeUserOffline    WSMessageType = "user_offline"
	WSTypeMessageDeleted WSMessageType = "message_deleted"
)

// WSMessage is the envelope for all WebSocket events.
type WSMessage struct {
	Type       WSMessageType   `json:"type"`
	ChatID     string          `json:"chat_id,omitempty"`
	MessageID  string          `json:"message_id,omitempty"`
	SenderID   string          `json:"sender_id,omitempty"`
	ReceiverID string          `json:"receiver_id,omitempty"`
	Data       json.RawMessage `json:"data,omitempty"`
}

// Client holds a single user's WebSocket connection.
type WSClient struct {
	Hub    *WSHub
	UserID string
	Conn   *websocket.Conn
	Send   chan []byte
}

// WSHub manages all connected clients.
type WSHub struct {
	clients    map[string]*WSClient
	mu         sync.RWMutex
	Register   chan *WSClient
	Unregister chan *WSClient
}

var Hub = &WSHub{
	clients:    make(map[string]*WSClient),
	Register:   make(chan *WSClient, 16),
	Unregister: make(chan *WSClient, 16),
}

func (h *WSHub) Run() {
	for {
		select {
		case client := <-h.Register:
			h.mu.Lock()
			h.clients[client.UserID] = client
			h.mu.Unlock()

		case client := <-h.Unregister:
			h.mu.Lock()
			if c, ok := h.clients[client.UserID]; ok && c == client {
				delete(h.clients, client.UserID)
				close(client.Send)
			}
			h.mu.Unlock()
		}
	}
}

// SendToUser delivers a message to a specific user if they are connected.
func (h *WSHub) SendToUser(userID string, msg WSMessage) bool {
	h.mu.RLock()
	client, ok := h.clients[userID]
	h.mu.RUnlock()
	if !ok {
		return false
	}
	data, err := json.Marshal(msg)
	if err != nil {
		return false
	}
	select {
	case client.Send <- data:
		return true
	default:
		return false
	}
}

// IsOnline reports whether a user has an active WebSocket connection.
func (h *WSHub) IsOnline(userID string) bool {
	h.mu.RLock()
	_, ok := h.clients[userID]
	h.mu.RUnlock()
	return ok
}

// ReadPump pumps messages from the WebSocket connection and routes them.
func (c *WSClient) ReadPump(routeFunc func(client *WSClient, msg WSMessage)) {
	defer func() {
		c.Hub.Unregister <- c
		c.Conn.Close()
	}()
	for {
		_, raw, err := c.Conn.ReadMessage()
		if err != nil {
			break
		}
		var msg WSMessage
		if err := json.Unmarshal(raw, &msg); err != nil {
			log.Printf("ws: bad message from %s: %v", c.UserID, err)
			continue
		}
		msg.SenderID = c.UserID
		routeFunc(c, msg)
	}
}

// WritePump sends queued messages to the WebSocket connection.
func (c *WSClient) WritePump() {
	defer c.Conn.Close()
	for data := range c.Send {
		if err := c.Conn.WriteMessage(websocket.TextMessage, data); err != nil {
			break
		}
	}
}
