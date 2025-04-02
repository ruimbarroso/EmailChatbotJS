package middleware

import (
	"log"
	"net/http"
	"regexp"
	"slices"
	"time"

	"github.com/rs/cors"
	"github.com/ruimbarroso/emailchatbot-be/src/utils"
)

func AddMiddleware(middlewares ...func(next http.HandlerFunc) http.HandlerFunc) func(mux http.HandlerFunc) http.HandlerFunc {
	return func(mux http.HandlerFunc) http.HandlerFunc {
		slices.Reverse(middlewares)
		for _, m := range middlewares {
			mux = m(mux)
		}

		return func(w http.ResponseWriter, r *http.Request) {
			mux(w, r)
		}
	}
}

func LogRequest(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		initTime := time.Now().UnixMicro()
		next(w, r)
		elapsedTime := time.Now().UnixMicro() - initTime

		log.Printf("%s handled %s: %s in %d Microsec\n", r.Pattern, r.Method, r.URL, elapsedTime)
	}
}
func HandleErrors(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if err := recover(); err != nil {
				log.Printf("Recovered from panic: %v", err)
				http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			}
		}()
		next(w, r)
	}
}

func AuthRequest(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("session_token")
		if err != nil {
			log.Println("Unauthorized access attempt")
			next(w, r)
			return
		}

		user, err := utils.ReadJWT(cookie.Value)
		if err != nil {
			log.Println("Unauthorized access attempt")
			next(w, r)
			return
		}

		log.Printf("%s just made a request\n", user.Email)
		rWithUser := utils.SetInContext(r, "user", user)
		next(w, rWithUser)

	}
}

func ParseUrlQuery(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "" && r.URL.Path[len(r.URL.Path)-1] != '/' {
			r.URL.Path += "/"
		}

		re := regexp.MustCompile(`(\w+)=([^&]+)`)

		matches := re.FindAllStringSubmatch(r.URL.RawQuery, -1)
		if len(matches) == 0 {
			next(w, r)
			return
		}

		params := make(map[string]string)

		log.Println("Query:")
		for _, match := range matches {
			key := match[1]
			value := match[2]
			params[key] = value
		}

		rWithQuery := utils.SetInContext(r, "query", &params)
		next(w, rWithQuery)
	}
}

func CorsMiddleware(next http.HandlerFunc) http.HandlerFunc {

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
		AllowCredentials: true,
	})
	return func(w http.ResponseWriter, r *http.Request) {
		c.ServeHTTP(w, r, next)

	}
}
