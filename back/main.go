package main

import (
	"fmt"
	"net/http"
	"time"
)

func greet(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hello World! %s", time.Now())
}

func main() {

	router := NewRouter()
	Register(router, GetUserHandler)
	Register(router, CreateUserHandler)
	for k := range router.handlers {
		fmt.Printf("router.handlers: %s\n", k)
	}

	mux := http.NewServeMux()
	mux.Handle("/ws", withCORS(WSHandler(router)))
	mux.Handle("/", withCORS(http.HandlerFunc(greet)))
	http.ListenAndServe(":8080", mux)
}
