package main

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
)

func createSession(userID int64) (string, error) {
	randomBytes := make([]byte, 32)
	if _, err := rand.Read(randomBytes); err != nil {
		return "", fmt.Errorf("generate session token: %w", err)
	}

	token := hex.EncodeToString(randomBytes)
	if _, err := db.Exec(
		"INSERT INTO sessions (user_id, token_hash) VALUES (?, ?)",
		userID,
		hashSessionToken(token),
	); err != nil {
		return "", fmt.Errorf("create session: %w", err)
	}

	return token, nil
}

func findUserBySession(token string) (*User, error) {
	if token == "" {
		return nil, nil
	}

	var user User
	err := db.QueryRow(
		`SELECT users.id, users.name
		 FROM sessions
		 JOIN users ON users.id = sessions.user_id
		 WHERE sessions.token_hash = ?`,
		hashSessionToken(token),
	).Scan(&user.ID, &user.Name)
	if err != nil {
		return nil, err
	}

	return &user, nil
}

func deleteSession(token string) error {
	if token == "" {
		return nil
	}

	if _, err := db.Exec(
		"DELETE FROM sessions WHERE token_hash = ?",
		hashSessionToken(token),
	); err != nil {
		return fmt.Errorf("delete session: %w", err)
	}
	return nil
}

func hashSessionToken(token string) string {
	hash := sha256.Sum256([]byte(token))
	return hex.EncodeToString(hash[:])
}
