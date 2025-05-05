package utils

import (
	"context"
	"net/http"
)

// Set pair [key K Value V] in context
func SetInContext[K any, V any](r *http.Request, key K, value *V) *http.Request {
	ctx := context.WithValue(r.Context(), key, value)
	return r.WithContext(ctx)
}

// Get Value V* from context with Key K
func GetFromContext[K any, V any](ctx context.Context, key K) (*V, bool) {
	value, ok := ctx.Value(key).(*V)
	return value, ok
}
