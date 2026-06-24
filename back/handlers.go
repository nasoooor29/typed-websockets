package main

import "fmt"

type User struct {
	Name     string `json:"name"`
	Password string `json:"password"` // unencrypted password for demo
}

var users = map[string]User{}

type CreateUser User

func CreateUserHandler(ctx *Context, p CreateUser) error {
	// check if user already exists
	if _, ok := users[p.Name]; ok {
		return fmt.Errorf("user %s already exists", p.Name)
	}
	if p.Name == "" || p.Password == "" {
		return fmt.Errorf("name and password cannot be empty")
	}

	if len(p.Password) < 6 {
		return fmt.Errorf("password must be at least 6 characters long")
	}

	user := User{
		Name:     p.Name,
		Password: p.Password,
	}
	users[p.Name] = user
	return Send(ctx.Conn, user)
}

type GetUser struct {
	Name string `json:"name"`
}

func GetUserHandler(ctx *Context, u GetUser) error {
	// check if user exists
	user, ok := users[u.Name]
	if !ok {
		return fmt.Errorf("user %s not found", u.Name)
	}
	return Send(ctx.Conn, user)
}

type Ping struct {
	Ping string `json:"ping"`
}
type Pong struct {
	Pong string `json:"pong"`
}

func PingHandler(ctx *Context, p Ping) error {
	return Send(ctx.Conn, Pong{Pong: p.Ping})
}
