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
	for k, _ := range router.handlers {
		fmt.Printf("router.handlers: %s\n", k)
	}

	http.HandleFunc("/ws", WSHandler(router))
	http.HandleFunc("/", greet)
	http.ListenAndServe(":8080", nil)
}
