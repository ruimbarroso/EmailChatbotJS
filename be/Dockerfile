# Use official Go image as the builder
FROM golang:1.23.1 AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy go.mod and go.sum to download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy the entire project into the container
COPY . .

# Set the working directory to the location of main.go
WORKDIR /app/src/cmd

# Build the Go application
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /server main.go

# Use a minimal base image for the final container
FROM alpine:latest

# Install SSL certificates (needed for secure connections in Go)
RUN apk --no-cache add ca-certificates

# Set working directory
WORKDIR /root/

# Copy built binary from builder stage
COPY --from=builder /server .

# Expose the application port
EXPOSE 8080

# # Run the application
# CMD ["./server"]
