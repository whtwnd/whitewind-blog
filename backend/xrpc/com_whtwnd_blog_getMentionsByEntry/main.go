package com_whtwnd_blog_getMentionsByEntry

import (
	"encoding/json"
	"errors"
	"whtwnd/common/blog"
	"whtwnd/common/lambda"
	"whtwnd/common/whtwnd_autogen"

	"github.com/bluesky-social/indigo/atproto/syntax"
)

func Main(body string, queryParam map[string]string) (lambda.Response, error) {
	var postUri string
	var ok bool
	var err error
	code := 200
	failResponse := lambda.Response{
		IsBase64Encoded: false,
		StatusCode:      code, // internal server error
		Body:            "Unable to resolve the entry",
	}

	if postUri, ok = queryParam["postUri"]; !ok {
		failResponse.Body = "no postUri query param"
		failResponse.StatusCode = 400
		return failResponse, errors.New("no postUri query param")
	}

	postAtUri, err := syntax.ParseATURI(postUri)
	if err != nil {
		failResponse.Body = "invalid postUri syntax"
		failResponse.StatusCode = 400
		return failResponse, errors.New("invalid postUri syntax")
	}

	// TODO: validate actor did
	posts, err := blog.GetMentionsByEntry(postAtUri)
	if err != nil {
		failResponse.Body = "failed to get entry metadata"
		failResponse.StatusCode = 404
		return failResponse, err
	}

	retRaw := whtwnd_autogen.BlogGetMentionsByEntry_Output{
		Mentions: posts,
	}

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
