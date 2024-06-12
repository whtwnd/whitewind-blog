package util

type XrpcError struct {
	Error   string `json:"error" validate:"required"`
	Message string `json:"message"`
}
