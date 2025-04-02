package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/ruimbarroso/emailchatbot-be/src/handlers"
	"github.com/ruimbarroso/emailchatbot-be/src/middleware"
)

func main() {
	log.Println("Server Init...")
	mainMux := http.NewServeMux()

	mainMux.Handle("/auth/", &handlers.AuthHandler{})
	mainMux.Handle("/chat/", &handlers.AiChatHandler{})
	mainMux.Handle("/email/", &handlers.EmailHandler{})

	mux := middleware.AddMiddleware(
		middleware.CorsMiddleware,
		middleware.HandleErrors,
		middleware.ParseUrlQuery,
		middleware.AuthRequest,
		middleware.LogRequest,
	)(mainMux.ServeHTTP)

	port := fmt.Sprintf(":%s", "8080")
	log.Printf("Server starting at %s\n", port)
	http.ListenAndServe(port, mux)

	log.Println("Ending Server...")
}
