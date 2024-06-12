package blog

import (
	"fmt"
	"sort"
	"time"
	"whtwnd/common/com_autogen"
	"whtwnd/common/whtwnd_autogen"

	"context"

	"github.com/bluesky-social/indigo/atproto/identity"
	"github.com/bluesky-social/indigo/atproto/syntax"
	"github.com/bluesky-social/indigo/xrpc"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/expression"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
)

// com.whtwnd.blog.metadata
type BlogMetadataItem struct {
	AuthorDid   string `dynamodbav:"authorDid"`
	Rkey        string `dynamodbav:"rkey"`
	EntryTitle  string `dynamodbav:"entryTitle,omitempty"`
	LastUpdate  string `dynamodbav:"lastUpdate"`
	Cid         string `dynamodbav:"cid"`
	Handle      string `dynamodbav:"handle,omitempty"`
	TrackedPost string `dynamodbav:"trackedPost,omitempty"`
}

// com.whtwnd.blog.mentions
type Mentioning struct {
	SubjectAtUri string `dynamodbav:"subjectAtUri"`
	Time         string `dynamodbav:"time"`
	PostAtUri    string `dynamodbav:"postAtUri"`
	Rec          []byte `dynamodbav:"rec"`
}

func GetEntryMetadataByName(author *syntax.AtIdentifier, entryTitle string) (*BlogMetadataItem, error) {
	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		return nil, err
	}
	client := dynamodb.NewFromConfig(cfg)

	var did syntax.DID
	fmt.Printf("[GetEntryMetadataByName] author=%s entryTitle=%s\n", author, entryTitle)
	if author.IsHandle() {
		handle, _ := author.AsHandle()
		directory := identity.DefaultDirectory()
		ident, err := directory.LookupHandle(context.TODO(), handle)
		if err != nil {
			return nil, err
		}
		did = ident.DID
		fmt.Printf("[GetEntry] Obtained did: %s", did)
	} else {
		did, err = author.AsDID()
		if err != nil {
			return nil, err
		}
	}

	// query
	didEx := expression.Key("authorDid").Equal(expression.Value(did))
	entryTitleEx := expression.Key("entryTitle").Equal(expression.Value(entryTitle))
	builder := expression.NewBuilder().WithKeyCondition(didEx.And(entryTitleEx))
	expr, err := builder.Build()
	if err != nil {
		return nil, err
	}
	indexName := "entryTitleToRkey"
	response, err := client.Query(context.TODO(), &dynamodb.QueryInput{
		TableName:                 aws.String("com.whtwnd.blog.metadata"),
		ExpressionAttributeNames:  expr.Names(),
		ExpressionAttributeValues: expr.Values(),
		KeyConditionExpression:    expr.KeyCondition(),
		IndexName:                 &indexName,
	})
	if err != nil {
		return nil, err
	}

	var entries []BlogMetadataItem
	err = attributevalue.UnmarshalListOfMaps(response.Items, &entries)
	if err != nil {
		return nil, err
	} else if len(entries) == 0 {
		return nil, fmt.Errorf("[GetEntryMetadataByName] Invalid count of results: %d", len(entries))
	} else if len(entries) > 1 {
		fmt.Printf("Warning: %d entries", len(entries))
	}
	sort.Slice(entries, func(i, j int) bool { return entries[i].LastUpdate > entries[j].LastUpdate })

	return &entries[0], nil
}

func NotifyOfNewEntry(entryUri *syntax.ATURI) error {
	// get pds location
	authority := entryUri.Authority()
	var err error
	var did syntax.DID
	handle := syntax.HandleInvalid
	directory := identity.DefaultDirectory()

	ident, err := directory.Lookup(context.TODO(), authority)
	if err != nil {
		return err
	}

	did = ident.DID
	if authority.IsHandle() {
		handle = ident.Handle
	} else {
		if ident.Handle != syntax.HandleInvalid {
			handle = ident.Handle
		}
	}

	// get entry
	client := xrpc.Client{
		Host: ident.PDSEndpoint(),
	}

	var out com_autogen.RepoGetRecord_Output

	params := map[string]interface{}{
		"collection": entryUri.Collection(),
		"repo":       entryUri.Authority(),
		"rkey":       entryUri.RecordKey(),
	}
	if err := client.Do(context.TODO(), xrpc.Query, "", "com.atproto.repo.getRecord", params, nil, &out); err != nil {
		return err
	}

	entry := out.Value.Val.(*whtwnd_autogen.BlogEntry)

	// Index
	itemToWrite := BlogMetadataItem{
		AuthorDid:  did.String(),
		Rkey:       entryUri.RecordKey().String(),
		EntryTitle: *entry.Title,
		LastUpdate: time.Now().Format(time.RFC3339),
		Cid:        *out.Cid,
	}
	if handle != syntax.HandleInvalid {
		itemToWrite.Handle = handle.String()
	}
	if entry.Tracker != nil {
		itemToWrite.TrackedPost = *entry.Tracker
	}
	item, err := attributevalue.MarshalMap(itemToWrite)
	if err != nil {
		return err
	}
	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		return err
	}
	dynamoClient := dynamodb.NewFromConfig(cfg)
	_, err = dynamoClient.PutItem(context.TODO(), &dynamodb.PutItemInput{
		TableName: aws.String("com.whtwnd.blog.metadata"),
		Item:      item,
	})
	if err != nil {
		return err
	}

	return nil
}

func GetMentionsByEntry(postAtUri syntax.ATURI) ([]string, error) {
	ident := postAtUri.Authority()
	var did syntax.DID
	var err error
	if ident.IsHandle() {
		handle, _ := ident.AsHandle()
		directory := identity.DefaultDirectory()
		ident, err := directory.LookupHandle(context.TODO(), handle)
		if err != nil {
			return nil, err
		}
		did = ident.DID
	} else {
		did, err = ident.AsDID()
		if err != nil {
			return nil, err
		}
	}
	postAtUriStr := fmt.Sprintf("at://%s/%s/%s", did, postAtUri.Collection(), postAtUri.RecordKey())

	// query
	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		return nil, err
	}
	client := dynamodb.NewFromConfig(cfg)
	uriEx := expression.Key("subjectAtUri").Equal(expression.Value(postAtUriStr))
	builder := expression.NewBuilder().WithKeyCondition(uriEx)
	expr, err := builder.Build()
	if err != nil {
		return nil, err
	}
	response, err := client.Query(context.TODO(), &dynamodb.QueryInput{
		TableName:                 aws.String("com.whtwnd.blog.mentions"),
		ExpressionAttributeNames:  expr.Names(),
		ExpressionAttributeValues: expr.Values(),
		KeyConditionExpression:    expr.KeyCondition(),
	})
	if err != nil {
		return nil, err
	}
	var mentions []Mentioning
	err = attributevalue.UnmarshalListOfMaps(response.Items, &mentions)
	if err != nil {
		return nil, err
	}
	sort.Slice(mentions, func(i, j int) bool { return mentions[i].Time > mentions[j].Time })

	ret := []string{}
	for _, comment := range mentions {
		ret = append(ret, comment.PostAtUri)
	}

	return ret, nil
}
