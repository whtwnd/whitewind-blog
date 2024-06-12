package com_whtwnd_blog_getEntryMetadataByName

import (
	"encoding/json"
	"errors"
	"fmt"
	"whtwnd/common/blog"
	"whtwnd/common/lambda"
	"whtwnd/common/whtwnd_autogen"

	"github.com/bluesky-social/indigo/atproto/syntax"
)

func Main(body string, queryParam map[string]string) (lambda.Response, error) {
	var author string
	var entryTitle string
	var ok bool
	var err error
	code := 200
	failResponse := lambda.Response{
		IsBase64Encoded: false,
		StatusCode:      code, // internal server error
		Body:            "Unable to resolve the entry",
	}

	if author, ok = queryParam["author"]; !ok {
		failResponse.Body = "no author query param"
		failResponse.StatusCode = 400
		return failResponse, errors.New("no author query param")
	}
	if entryTitle, ok = queryParam["entryTitle"]; !ok {
		failResponse.Body = "no entryTitle query param"
		failResponse.StatusCode = 400
		return failResponse, errors.New("no entryTitle query param")
	}

	ident, err := syntax.ParseAtIdentifier(author)
	if err != nil {
		failResponse.Body = "invalid author value"
		failResponse.StatusCode = 400
		return failResponse, errors.New("invalid author value")
	}

	// TODO: validate actor did
	metadata, err := blog.GetEntryMetadataByName(ident, entryTitle)
	if err != nil {
		failResponse.Body = "failed to get entry metadata"
		failResponse.StatusCode = 404
		return failResponse, err
	}

	retRaw := whtwnd_autogen.BlogGetEntryMetadataByName_Output{
		Cid:        &metadata.Cid,
		EntryUri:   fmt.Sprintf("at://%s/com.whtwnd.blog.entry/%s", metadata.AuthorDid, metadata.Rkey),
		LastUpdate: &metadata.LastUpdate,
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
