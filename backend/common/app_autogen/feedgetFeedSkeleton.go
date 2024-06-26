//go:build exclude
// Code generated by cmd/lexgen (see Makefile's lexgen); DO NOT EDIT.

package app_autogen

// schema: app.bsky.feed.getFeedSkeleton

import (
	"context"

	"github.com/bluesky-social/indigo/xrpc"
)

// FeedGetFeedSkeleton_Output is the output of a app.bsky.feed.getFeedSkeleton call.
type FeedGetFeedSkeleton_Output struct {
	Cursor *string                      `json:"cursor,omitempty" cborgen:"cursor,omitempty"`
	Feed   []*FeedDefs_SkeletonFeedPost `json:"feed" cborgen:"feed"`
}

// FeedGetFeedSkeleton calls the XRPC method "app.bsky.feed.getFeedSkeleton".
func FeedGetFeedSkeleton(ctx context.Context, c *xrpc.Client, cursor string, feed string, limit int64) (*FeedGetFeedSkeleton_Output, error) {
	var out FeedGetFeedSkeleton_Output

	params := map[string]interface{}{
		"cursor": cursor,
		"feed":   feed,
		"limit":  limit,
	}
	if err := c.Do(ctx, xrpc.Query, "", "app.bsky.feed.getFeedSkeleton", params, nil, &out); err != nil {
		return nil, err
	}

	return &out, nil
}
