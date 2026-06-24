package main

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // fix later for production
	},
}

func WSHandler(router *Router) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Println("upgrade error:", err)
			return
		}
		defer conn.Close()

		ctx := &Context{
			Conn: conn,
		}

		for {
			_, data, err := conn.ReadMessage()
			if err != nil {
				log.Println("read error:", err)
				return
			}

			if err := router.Handle(ctx, data); err != nil {
				log.Println("handler error:", err)
				Send(ctx.Conn, ErrorResponse{
					Message: err.Error(),
				})
			}
		}
	}
}
