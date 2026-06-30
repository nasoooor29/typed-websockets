package main

import (
	"fmt"
	"log"
	"net/http"
	"time"
)

func greet(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hello World! %s", time.Now())
}

func main() {
	if err := initDatabase(); err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	router := NewRouter()
	Register(router, "user.create", CreateUserHandler)
	Register(router, "user.login", LoginUserHandler)
	Register(router, "user.me", MeHandler)
	Register(router, "user.logout", LogoutHandler)
	Register(router, "main.ping", PingHandler)
	for k := range router.handlers {
		fmt.Printf("router.handlers: %s\n", k)
	}

	mux := http.NewServeMux()
	mux.Handle("/ws", withCORS(WSHandler(router)))
	mux.Handle("/", withCORS(http.HandlerFunc(greet)))
	log.Fatal(http.ListenAndServe(":8080", mux))
}
