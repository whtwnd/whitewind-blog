// Code generated by cmd/lexgen (see Makefile's lexgen); DO NOT EDIT.

package whtwnd_autogen

// schema: com.whtwnd.blog.getEntryMetadataByName

import (
	"context"

	"github.com/bluesky-social/indigo/xrpc"
)

// BlogGetEntryMetadataByName_Output is the output of a com.whtwnd.blog.getEntryMetadataByName call.
type BlogGetEntryMetadataByName_Output struct {
	Cid        *string `json:"cid,omitempty" cborgen:"cid,omitempty"`
	EntryUri   string  `json:"entryUri" cborgen:"entryUri"`
	LastUpdate *string `json:"lastUpdate,omitempty" cborgen:"lastUpdate,omitempty"`
}

// BlogGetEntryMetadataByName calls the XRPC method "com.whtwnd.blog.getEntryMetadataByName".
func BlogGetEntryMetadataByName(ctx context.Context, c *xrpc.Client, author string, entryTitle string) (*BlogGetEntryMetadataByName_Output, error) {
	var out BlogGetEntryMetadataByName_Output

	params := map[string]interface{}{
		"author":     author,
		"entryTitle": entryTitle,
	}
	if err := c.Do(ctx, xrpc.Query, "", "com.whtwnd.blog.getEntryMetadataByName", params, nil, &out); err != nil {
		return nil, err
	}

	return &out, nil
}
