// main.go
package main

import (
	"context"
	common_lambda "whtwnd/common/lambda"
	Api "whtwnd/xrpc/com_whtwnd_blog_getMentionsByEntry"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func main() {
	// Make the handler available for Remote Procedure Call by AWS Lambda
	lambda.Start(
		func(ctx context.Context, request events.APIGatewayProxyRequest) (common_lambda.Response, error) {
			return Api.Main(request.Body, request.QueryStringParameters)
		})
}
