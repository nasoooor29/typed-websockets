package main

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	_ "github.com/mattn/go-sqlite3"
)

var db *sql.DB

func initDatabase() error {
	database, err := sql.Open("sqlite3", filepath.Join(".", "typed-sock.db"))
	if err != nil {
		return fmt.Errorf("open database: %w", err)
	}

	schemaPath, err := findSchemaPath()
	if err != nil {
		database.Close()
		return err
	}

	schema, err := os.ReadFile(schemaPath)
	if err != nil {
		database.Close()
		return fmt.Errorf("read schema: %w", err)
	}

	if _, err := database.Exec(string(schema)); err != nil {
		database.Close()
		return fmt.Errorf("apply schema: %w", err)
	}

	if err := database.Ping(); err != nil {
		database.Close()
		return fmt.Errorf("ping database: %w", err)
	}

	db = database
	return nil
}

func findSchemaPath() (string, error) {
	candidates := []string{
		"schema.sql",
		filepath.Join("..", "schema.sql"),
	}

	for _, candidate := range candidates {
		if _, err := os.Stat(candidate); err == nil {
			return candidate, nil
		}
	}

	return "", fmt.Errorf("schema.sql not found")
}

func isUniqueConstraintError(err error) bool {
	return strings.Contains(err.Error(), "UNIQUE constraint")
}
