package main

import (
	"encoding/json"
	"fmt"
	"reflect"

	"github.com/gorilla/websocket"
)

type Envelope struct {
	Type string `json:"type"`
	// RequestID string          `json:"requestId,omitempty"`
	Payload json.RawMessage `json:"payload"`
}
type ErrorResponse struct {
	Message string `json:"message"`
}

type HandlerFunc func(ctx *Context, raw json.RawMessage) error

type Context struct {
	Conn         *websocket.Conn
	User         *User
	SessionToken string
}

var userIdConnections = make(map[int64]*Context)

type Router struct {
	handlers map[string]HandlerFunc
}

func NewRouter() *Router {
	return &Router{
		handlers: map[string]HandlerFunc{},
	}
}

func Register[T any](r *Router, msgType string, fn func(*Context, T) error) {
	if _, ok := r.handlers[msgType]; ok {
		panic(fmt.Sprintf("Register: handler for %s already registered", msgType))
	}
	r.handlers[msgType] = func(ctx *Context, raw json.RawMessage) error {
		var payload T

		if err := json.Unmarshal(raw, &payload); err != nil {
			return fmt.Errorf("invalid payload for %s: %w", msgType, err)
		}

		return fn(ctx, payload)
	}
}

func (r *Router) Handle(ctx *Context, data []byte) error {
	var env Envelope
	if err := json.Unmarshal(data, &env); err != nil {
		return err
	}

	handler, ok := r.handlers[env.Type]
	if !ok {
		return fmt.Errorf("unknown message type: %s", env.Type)
	}

	return handler(ctx, env.Payload)
}

func Send[T any](conn *websocket.Conn, payload T) error {
	msgType := fmt.Sprintf("%T", payload)
	// if it's not struct panic and print error
	// use reflect
	if reflect.TypeOf(payload).Kind() != reflect.Struct {
		panic(fmt.Sprintf("Send: payload must be a struct, got %s", reflect.TypeOf(payload).Kind()))
	}

	return conn.WriteJSON(map[string]any{
		"type":    msgType,
		"payload": payload,
	})
}

func SendToUsers[T any](userIds []int, payload T) error {
	errors := []error{}

	for _, userId := range userIds {
		user, ok := userIdConnections[int64(userId)]
		if !ok {
			errors = append(errors, fmt.Errorf("user not found: %d", userId))
			continue
		}
		if user == nil {
			errors = append(errors, fmt.Errorf("user not found: %d", userId))
			continue
		}
		if user.Conn == nil {
			errors = append(errors, fmt.Errorf("user connection is nil: %d", userId))
			continue
		}
		if err := Send(user.Conn, payload); err != nil {
			errors = append(errors, fmt.Errorf("send to user %d: %w", userId, err))
		}
	}
	if len(errors) > 0 {
		return fmt.Errorf("failed to send to some users: %v", errors)
	}
	return nil
}

func SendToUser[T any](userId int, payload T) error {
	user, ok := userIdConnections[int64(userId)]
	if !ok {
		return fmt.Errorf("user not found: %d", userId)
	}
	if user == nil {
		return fmt.Errorf("user not found: %d", userId)
	}
	if user.Conn == nil {
		return fmt.Errorf("user connection is nil: %d", userId)
	}
	if err := Send(user.Conn, payload); err != nil {
		return fmt.Errorf("send to user %d: %w", userId, err)
	}
	return nil
}
