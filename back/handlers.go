package main

import (
	"database/sql"
	"errors"
	"fmt"

	"golang.org/x/crypto/bcrypt"
)

type User struct {
	ID   int64  `json:"id"`
	Name string `json:"name"`
}

type AuthSession struct {
	User  User   `json:"user"`
	Token string `json:"token"`
}

type CreateUser struct {
	Name     string `json:"name"`
	Password string `json:"password"`
}

func CreateUserHandler(ctx *Context, p CreateUser) error {
	if p.Name == "" || p.Password == "" {
		return fmt.Errorf("name and password cannot be empty")
	}
	if len(p.Password) < 6 {
		return fmt.Errorf("password must be at least 6 characters long")
	}

	passwordHash, err := bcrypt.GenerateFromPassword([]byte(p.Password), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("hash password: %w", err)
	}

	result, err := db.Exec(
		"INSERT INTO users (name, password) VALUES (?, ?)",
		p.Name,
		string(passwordHash),
	)
	if err != nil {
		if isUniqueConstraintError(err) {
			return fmt.Errorf("user %s already exists", p.Name)
		}
		return fmt.Errorf("create user: %w", err)
	}

	id, err := result.LastInsertId()
	if err != nil {
		return fmt.Errorf("create user: %w", err)
	}

	user := User{ID: id, Name: p.Name}
	return authenticateUser(ctx, user)
}

type LoginUser struct {
	Name     string `json:"name"`
	Password string `json:"password"`
}

func LoginUserHandler(ctx *Context, p LoginUser) error {
	if p.Name == "" || p.Password == "" {
		return fmt.Errorf("name and password cannot be empty")
	}

	var user User
	var passwordHash string
	err := db.QueryRow(
		"SELECT id, name, password FROM users WHERE name = ?",
		p.Name,
	).Scan(&user.ID, &user.Name, &passwordHash)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return fmt.Errorf("invalid username or password")
		}
		return fmt.Errorf("login user: %w", err)
	}

	if err := bcrypt.CompareHashAndPassword([]byte(passwordHash), []byte(p.Password)); err != nil {
		return fmt.Errorf("invalid username or password")
	}

	return authenticateUser(ctx, user)
}

func authenticateUser(ctx *Context, user User) error {
	token, err := createSession(user.ID)
	if err != nil {
		return err
	}

	ctx.User = &user
	ctx.SessionToken = token
	userIdConnections[user.ID] = ctx
	return Send(ctx.Conn, AuthSession{User: user, Token: token})
}

type MeRequest struct {
	Token string `json:"token"`
}

type Me struct {
	User *User `json:"user"`
}

func MeHandler(ctx *Context, p MeRequest) error {
	user, err := findUserBySession(p.Token)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		return fmt.Errorf("find session: %w", err)
	}

	ctx.User = user
	if user == nil {
		ctx.SessionToken = ""
	} else {
		ctx.SessionToken = p.Token
	}
	return Send(ctx.Conn, Me{User: user})
}

type LogoutRequest struct {
	Token string `json:"token"`
}

type LoggedOut struct{}

func LogoutHandler(ctx *Context, p LogoutRequest) error {
	if err := deleteSession(p.Token); err != nil {
		return err
	}
	ctx.User = nil
	ctx.SessionToken = ""
	userIdConnections[ctx.User.ID] = nil
	return Send(ctx.Conn, LoggedOut{})
}

type Ping struct {
	Ping string `json:"ping"`
}

type Pong struct {
	Pong string `json:"pong"`
}

func PingHandler(ctx *Context, p Ping) error {
	if ctx.User == nil {
		return fmt.Errorf("you must be logged in to send a ping")
	}
	return Send(ctx.Conn, Pong{Pong: p.Ping})
}
