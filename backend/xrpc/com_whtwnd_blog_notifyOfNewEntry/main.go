package com_whtwnd_blog_notifyOfNewEntry

import (
	"encoding/json"
	"errors"
	"whtwnd/common/blog"
	"whtwnd/common/lambda"
	"whtwnd/common/whtwnd_autogen"

	"github.com/bluesky-social/indigo/atproto/syntax"
)

func Main(body string, queryParam map[string]string) (lambda.Response, error) {
	var err error
	code := 200
	failResponse := lambda.Response{
		IsBase64Encoded: false,
		StatusCode:      code, // internal server error
		Body:            "Unable to resolve the entry",
	}

	var req whtwnd_autogen.BlogNotifyOfNewEntry_Input
	err = json.Unmarshal([]byte(body), &req)
	if err != nil {
		failResponse.Body = "invalid body"
		failResponse.StatusCode = 400
		return failResponse, errors.New("invalid body")
	}

	aturi, err := syntax.ParseATURI(req.EntryUri)
	if err != nil {
		failResponse.Body = "invalid entryUri"
		failResponse.StatusCode = 400
		return failResponse, errors.New("invalid entryUri")
	}

	err = blog.NotifyOfNewEntry(&aturi)
	if err != nil {
		failResponse.Body = "failed to index"
		failResponse.StatusCode = 500
		return failResponse, errors.New("failed to index")
	}

	retRaw := whtwnd_autogen.BlogNotifyOfNewEntry_Output{}

	ret, err := json.Marshal(retRaw)
	if err != nil {
		failResponse.Body = "failed to create return data"
		failResponse.StatusCode = 500
		return failResponse, err
	}

	return lambda.Response{
		IsBase64Encoded: false,
		StatusCode:      code,
		Body:            string(ret),
		Headers: map[string]string{
			"Access-Control-Allow-Headers": "Content-Type",
			"Access-Control-Allow-Origin":  "*",
			"Access-Control-Allow-Methods": "OPTIONS,GET",
		},
	}, nil
}
