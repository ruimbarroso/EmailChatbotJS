package utils

import (
	"context"
	"net/http"
)

// Retrieve User from context
func SetInContext[K any, V any](r *http.Request, key K, value *V) *http.Request {
	ctx := context.WithValue(r.Context(), key, value)
	return r.WithContext(ctx)
}

// Retrieve User from context
func GetFromContext[K any, V any](ctx context.Context, key K) (*V, bool) {
	value, ok := ctx.Value(key).(*V)
	return value, ok
}
