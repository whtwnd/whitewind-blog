//go:build exclude
// Code generated by cmd/lexgen (see Makefile's lexgen); DO NOT EDIT.

package app_autogen

// schema: app.bsky.feed.searchPosts

import (
	"context"

	"github.com/bluesky-social/indigo/xrpc"
)

// FeedSearchPosts_Output is the output of a app.bsky.feed.searchPosts call.
type FeedSearchPosts_Output struct {
	Cursor *string `json:"cursor,omitempty" cborgen:"cursor,omitempty"`
	// hitsTotal: Count of search hits. Optional, may be rounded/truncated, and may not be possible to paginate through all hits.
	HitsTotal *int64               `json:"hitsTotal,omitempty" cborgen:"hitsTotal,omitempty"`
	Posts     []*FeedDefs_PostView `json:"posts" cborgen:"posts"`
}

// FeedSearchPosts calls the XRPC method "app.bsky.feed.searchPosts".
//
// cursor: Optional pagination mechanism; may not necessarily allow scrolling through entire result set.
// q: Search query string; syntax, phrase, boolean, and faceting is unspecified, but Lucene query syntax is recommended.
func FeedSearchPosts(ctx context.Context, c *xrpc.Client, cursor string, limit int64, q string) (*FeedSearchPosts_Output, error) {
	var out FeedSearchPosts_Output

	params := map[string]interface{}{
		"cursor": cursor,
		"limit":  limit,
		"q":      q,
	}
	if err := c.Do(ctx, xrpc.Query, "", "app.bsky.feed.searchPosts", params, nil, &out); err != nil {
		return nil, err
	}

	return &out, nil
}
