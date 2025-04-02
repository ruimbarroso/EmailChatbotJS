package utils

import (
	"fmt"

	"github.com/golang-jwt/jwt/v5"
	"github.com/ruimbarroso/emailchatbot-be/src/types"
)

var JwtKey = []byte(GetEnv("JWT_TOKEN", "defaultPassword"))

func GenerateJWT(user *types.UserCredentials) (string, error) {

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"email":    user.Email,
		"password": user.Password,
		"provider": user.Provider,
	})

	tokenString, err := token.SignedString(JwtKey)
	if err != nil {
		return "", err
	}

	return tokenString, nil
}
func ReadJWT(tokenString string) (*types.UserCredentials, error) {
	claims := &jwt.MapClaims{}

	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return JwtKey, nil
	})

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, fmt.Errorf("invalid token")
	}

	user := &types.UserCredentials{
		Email:    (*claims)["email"].(string),
		Password: (*claims)["password"].(string),
		Provider: (*claims)["provider"].(string),
	}

	return user, nil
}
