//go:build exclude
// Code generated by cmd/lexgen (see Makefile's lexgen); DO NOT EDIT.

package app_autogen

// schema: app.bsky.feed.threadgate

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"

	"github.com/bluesky-social/indigo/lex/util"
	cbg "github.com/whyrusleeping/cbor-gen"
)

func init() {
	util.RegisterType("app.bsky.feed.threadgate", &FeedThreadgate{})
} //
// RECORDTYPE: FeedThreadgate
type FeedThreadgate struct {
	LexiconTypeID string                       `json:"$type,const=app.bsky.feed.threadgate" cborgen:"$type,const=app.bsky.feed.threadgate"`
	Allow         []*FeedThreadgate_Allow_Elem `json:"allow,omitempty" cborgen:"allow,omitempty"`
	CreatedAt     string                       `json:"createdAt" cborgen:"createdAt"`
	Post          string                       `json:"post" cborgen:"post"`
}

type FeedThreadgate_Allow_Elem struct {
	FeedThreadgate_MentionRule   *FeedThreadgate_MentionRule
	FeedThreadgate_FollowingRule *FeedThreadgate_FollowingRule
	FeedThreadgate_ListRule      *FeedThreadgate_ListRule
}

func (t *FeedThreadgate_Allow_Elem) MarshalJSON() ([]byte, error) {
	if t.FeedThreadgate_MentionRule != nil {
		t.FeedThreadgate_MentionRule.LexiconTypeID = "app.bsky.feed.threadgate#mentionRule"
		return json.Marshal(t.FeedThreadgate_MentionRule)
	}
	if t.FeedThreadgate_FollowingRule != nil {
		t.FeedThreadgate_FollowingRule.LexiconTypeID = "app.bsky.feed.threadgate#followingRule"
		return json.Marshal(t.FeedThreadgate_FollowingRule)
	}
	if t.FeedThreadgate_ListRule != nil {
		t.FeedThreadgate_ListRule.LexiconTypeID = "app.bsky.feed.threadgate#listRule"
		return json.Marshal(t.FeedThreadgate_ListRule)
	}
	return nil, fmt.Errorf("cannot marshal empty enum")
}
func (t *FeedThreadgate_Allow_Elem) UnmarshalJSON(b []byte) error {
	typ, err := util.TypeExtract(b)
	if err != nil {
		return err
	}

	switch typ {
	case "app.bsky.feed.threadgate#mentionRule":
		t.FeedThreadgate_MentionRule = new(FeedThreadgate_MentionRule)
		return json.Unmarshal(b, t.FeedThreadgate_MentionRule)
	case "app.bsky.feed.threadgate#followingRule":
		t.FeedThreadgate_FollowingRule = new(FeedThreadgate_FollowingRule)
		return json.Unmarshal(b, t.FeedThreadgate_FollowingRule)
	case "app.bsky.feed.threadgate#listRule":
		t.FeedThreadgate_ListRule = new(FeedThreadgate_ListRule)
		return json.Unmarshal(b, t.FeedThreadgate_ListRule)

	default:
		return nil
	}
}

func (t *FeedThreadgate_Allow_Elem) MarshalCBOR(w io.Writer) error {

	if t == nil {
		_, err := w.Write(cbg.CborNull)
		return err
	}
	if t.FeedThreadgate_MentionRule != nil {
		return t.FeedThreadgate_MentionRule.MarshalCBOR(w)
	}
	if t.FeedThreadgate_FollowingRule != nil {
		return t.FeedThreadgate_FollowingRule.MarshalCBOR(w)
	}
	if t.FeedThreadgate_ListRule != nil {
		return t.FeedThreadgate_ListRule.MarshalCBOR(w)
	}
	return fmt.Errorf("cannot cbor marshal empty enum")
}
func (t *FeedThreadgate_Allow_Elem) UnmarshalCBOR(r io.Reader) error {
	typ, b, err := util.CborTypeExtractReader(r)
	if err != nil {
		return err
	}

	switch typ {
	case "app.bsky.feed.threadgate#mentionRule":
		t.FeedThreadgate_MentionRule = new(FeedThreadgate_MentionRule)
		return t.FeedThreadgate_MentionRule.UnmarshalCBOR(bytes.NewReader(b))
	case "app.bsky.feed.threadgate#followingRule":
		t.FeedThreadgate_FollowingRule = new(FeedThreadgate_FollowingRule)
		return t.FeedThreadgate_FollowingRule.UnmarshalCBOR(bytes.NewReader(b))
	case "app.bsky.feed.threadgate#listRule":
		t.FeedThreadgate_ListRule = new(FeedThreadgate_ListRule)
		return t.FeedThreadgate_ListRule.UnmarshalCBOR(bytes.NewReader(b))

	default:
		return nil
	}
}

// FeedThreadgate_FollowingRule is a "followingRule" in the app.bsky.feed.threadgate schema.
//
// Allow replies from actors you follow.
//
// RECORDTYPE: FeedThreadgate_FollowingRule
type FeedThreadgate_FollowingRule struct {
	LexiconTypeID string `json:"$type,const=app.bsky.feed.threadgate#followingRule" cborgen:"$type,const=app.bsky.feed.threadgate#followingRule"`
}

// FeedThreadgate_ListRule is a "listRule" in the app.bsky.feed.threadgate schema.
//
// Allow replies from actors on a list.
//
// RECORDTYPE: FeedThreadgate_ListRule
type FeedThreadgate_ListRule struct {
	LexiconTypeID string `json:"$type,const=app.bsky.feed.threadgate#listRule" cborgen:"$type,const=app.bsky.feed.threadgate#listRule"`
	List          string `json:"list" cborgen:"list"`
}

// FeedThreadgate_MentionRule is a "mentionRule" in the app.bsky.feed.threadgate schema.
//
// Allow replies from actors mentioned in your post.
//
// RECORDTYPE: FeedThreadgate_MentionRule
type FeedThreadgate_MentionRule struct {
	LexiconTypeID string `json:"$type,const=app.bsky.feed.threadgate#mentionRule" cborgen:"$type,const=app.bsky.feed.threadgate#mentionRule"`
}