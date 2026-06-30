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
	Conn *websocket.Conn
	User *User
}

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
