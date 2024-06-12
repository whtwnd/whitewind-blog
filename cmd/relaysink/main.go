package main

import (
	"bytes"
	"container/list"
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"
	"whtwnd/common/blog"
	"whtwnd/common/whtwnd_autogen"

	aho_corasick "github.com/pgavlin/aho-corasick"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/bluesky-social/indigo/api/atproto"
	"github.com/bluesky-social/indigo/api/bsky"
	"github.com/bluesky-social/indigo/atproto/identity"
	"github.com/bluesky-social/indigo/atproto/syntax"
	"github.com/bluesky-social/indigo/events"
	"github.com/bluesky-social/indigo/events/schedulers/sequential"
	"github.com/bluesky-social/indigo/repo"
	"github.com/gorilla/websocket"
)

// com.whtwnd.blog.rawrelay
type RawRelayData struct {
	DataType string `dynamodbav:"dataType"`
	Time     string `dynamodbav:"time"`
	AtUris   string `dynamodbav:"aturis,omitempty"`
	Actions  string `dynamodbav:"actions,omitempty"`
}

/*
requirements:
- post tracking
	- like, reply, repost
	- needs:
		- tracked post aturi (dynamically updated)
			- get initial tracked uris by metadata query
			- live update matcher of tracked records by watching firehose
- keywords (whitewind, whtwnd, etc.)
	- blog url tracking can be automatically done
*/

func writeDB(item map[string]types.AttributeValue, table string) error {
	cfg, err := config.LoadDefaultConfig(context.TODO(), config.WithRegion("ap-northeast-1"))
	if err != nil {
		return err
	}
	dynamoClient := dynamodb.NewFromConfig(cfg)
	_, err = dynamoClient.PutItem(context.TODO(), &dynamodb.PutItemInput{
		TableName: aws.String(table),
		Item:      item,
	})
	if err != nil {
		return err
	}

	return nil
}

func deleteDB(key map[string]types.AttributeValue, table string) error {
	cfg, err := config.LoadDefaultConfig(context.TODO(), config.WithRegion("ap-northeast-1"))
	if err != nil {
		return err
	}
	dynamoClient := dynamodb.NewFromConfig(cfg)
	_, err = dynamoClient.DeleteItem(context.TODO(), &dynamodb.DeleteItemInput{
		Key:       key,
		TableName: &table,
	})
	if err != nil {
		return err
	}

	return nil
}

func scanDB(table string) ([]map[string]types.AttributeValue, error) {
	cfg, err := config.LoadDefaultConfig(context.TODO(), config.WithRegion("ap-northeast-1"))
	if err != nil {
		return nil, err
	}
	dynamoClient := dynamodb.NewFromConfig(cfg)
	output, err := dynamoClient.Scan(context.TODO(), &dynamodb.ScanInput{
		TableName: &table,
	})
	if err != nil {
		return nil, err
	}
	return output.Items, nil
}

// encodeURIComponent equivalent in Go
func encodeURIComponent(s string) string {
	// First, use url.QueryEscape to escape the string
	escaped := url.QueryEscape(s)

	// Then, replace special characters
	// Chrome's encodeURIComponent doesn't encode '(', ')', '!', '*', "'", and '~'
	escaped = strings.ReplaceAll(escaped, "+", "%20")
	escaped = strings.ReplaceAll(escaped, "%21", "!")
	escaped = strings.ReplaceAll(escaped, "%27", "'")
	escaped = strings.ReplaceAll(escaped, "%28", "(")
	escaped = strings.ReplaceAll(escaped, "%29", ")")
	escaped = strings.ReplaceAll(escaped, "%2A", "*")
	escaped = strings.ReplaceAll(escaped, "%7E", "~")

	return escaped
}

func getPatternForBlog(item map[string]types.AttributeValue) (string, Pattern) {
	// patterns are:
	// 1. at uri of blog entry
	// 2. https uri of blog entry (name, rkey)
	authorDid := item["authorDid"].(*types.AttributeValueMemberS).Value
	rkey := item["rkey"].(*types.AttributeValueMemberS).Value
	cid := item["cid"].(*types.AttributeValueMemberS).Value
	aturi := fmt.Sprintf("at://%s/com.whtwnd.blog.entry/%s", authorDid, rkey)
	permalink := fmt.Sprintf("https://whtwnd.com/%s/%s/%s", authorDid, rkey, cid)
	titleAv := item["entryTitle"]
	handleAv := item["handle"]
	ret := []string{aturi, permalink}

	authorVariant := []string{authorDid}

	if handleAv != nil {
		handle := handleAv.(*types.AttributeValueMemberS).Value
		authorVariant = append(authorVariant, handle)
	}
	titleVariant := []string{}
	if titleAv != nil {
		title := titleAv.(*types.AttributeValueMemberS).Value
		titleVariant = []string{title, url.PathEscape(title), encodeURIComponent(title)}
	}
	for _, author := range authorVariant {
		ret = append(ret, fmt.Sprintf("https://whtwnd.com/%s/%s", author, rkey))
		for _, titlePart := range titleVariant {
			ret = append(ret, fmt.Sprintf("https://whtwnd.com/%s/entries/%s", author, titlePart))
		}
	}
	builder := aho_corasick.NewAhoCorasickBuilder(aho_corasick.Opts{AsciiCaseInsensitive: false, MatchOnlyWholeWords: false, MatchKind: aho_corasick.StandardMatch, DFA: false})
	m := builder.Build(ret)
	return aturi, Pattern{raw: ret, m: &m, isWhtWnd: true}
}

func getPatternMentioner(aturi string) Pattern {
	source := []string{aturi}

	builder := aho_corasick.NewAhoCorasickBuilder(aho_corasick.Opts{AsciiCaseInsensitive: false, MatchOnlyWholeWords: false, MatchKind: aho_corasick.StandardMatch, DFA: false})
	m := builder.Build(source)
	return Pattern{raw: source, m: &m}
}

func buildPattern(patterns *map[string]Pattern) *aho_corasick.AhoCorasick {
	arg := []string{}
	for _, pattern := range *patterns {
		arg = append(arg, pattern.raw...)
	}
	builder := aho_corasick.NewAhoCorasickBuilder(aho_corasick.Opts{AsciiCaseInsensitive: false, MatchOnlyWholeWords: false, MatchKind: aho_corasick.StandardMatch, DFA: false})
	m := builder.Build(arg)
	return &m
}

type Pattern struct {
	raw       []string
	m         *aho_corasick.AhoCorasick
	isWhtWnd  bool
	mentioned []string
}

func commitConsumer(commits chan *atproto.SyncSubscribeRepos_Commit, newMatcher chan *aho_corasick.AhoCorasick, logger *slog.Logger) {
	patterns := map[string]Pattern{
		"1": {raw: []string{"WhiteWind"}, m: nil},
		"2": {raw: []string{"White Wind"}, m: nil},
		"3": {raw: []string{"whitewind"}, m: nil},
		"4": {raw: []string{"white wind"}, m: nil},
		"5": {raw: []string{"whtwnd"}, m: nil},
	}
	// get all current trackers
	metadataItems, err := scanDB("com.whtwnd.blog.metadata")
	if err != nil {
		panic(err.Error())
	}
	for _, item := range metadataItems {
		key, pattern := getPatternForBlog(item)
		pattern.isWhtWnd = true
		patterns[key] = pattern
	}
	mentionItems, err := scanDB("com.whtwnd.blog.mentions")
	if err != nil {
		panic(err.Error())
	}
	for _, item := range mentionItems {
		key := item["postAtUri"].(*types.AttributeValueMemberS).Value
		subjectAtUri := item["subjectAtUri"].(*types.AttributeValueMemberS).Value
		curPat, ok := patterns[key]
		if !ok {
			pattern := getPatternMentioner(key)
			pattern.mentioned = append(pattern.mentioned, subjectAtUri)
			patterns[key] = pattern
		} else {
			curPat.mentioned = append(curPat.mentioned, subjectAtUri)
			patterns[key] = curPat
		}
	}

	matcher := buildPattern(&patterns)
	newMatcher <- matcher

	for {
		evt := <-commits

		logger.Info("RepoCommit", slog.String("evt_time", evt.Time), slog.String("repo", evt.Repo))
		repo, err := repo.ReadRepoFromCar(context.TODO(), bytes.NewReader(evt.Blocks))
		if err != nil {
			logger.Error("Error during reading CAR", slog.String("err", err.Error()))
			continue
		}

		aturis := []string{}
		actions := []string{}

		patDirty := false
		for _, op := range evt.Ops {
			logger.Info("record", slog.String("action", op.Action), slog.String("path", op.Path))

			curAtUriStr := fmt.Sprintf("at://%s/%s", evt.Repo, op.Path)
			curAtUri, err := syntax.ParseATURI(curAtUriStr)
			if err != nil {
				continue
			}

			aturis = append(aturis, curAtUriStr)
			actions = append(actions, op.Action)

			if op.Action == "delete" {
				pat, ok := patterns[curAtUriStr]
				if !ok { // irrelevant record
					continue
				}
				// relevant
				// delete from watch list
				delete(patterns, curAtUriStr)
				patDirty = true
				// delete mention records
				for _, subjectAtUri := range pat.mentioned {
					key := map[string]types.AttributeValue{
						"subjectAtUri": &types.AttributeValueMemberS{
							Value: subjectAtUri,
						},
						"postAtUri": &types.AttributeValueMemberS{
							Value: curAtUriStr,
						},
					}
					deleteDB(key, "com.whtwnd.blog.mentions")
				}
				// delete metadata if it is whtwnd record
				if curAtUri.Collection() != "com.whtwnd.blog.entry" {
					continue
				}
				key := map[string]types.AttributeValue{
					"authorDid": &types.AttributeValueMemberS{
						Value: evt.Repo,
					},
					"rkey": &types.AttributeValueMemberS{
						Value: curAtUri.RecordKey().String(),
					},
				}
				deleteDB(key, "com.whtwnd.blog.metadata")
				continue
			}

			// action is create or update
			// mention or new blog entry
			_, bytes, err := repo.GetRecordBytes(context.TODO(), op.Path)
			// include aturis included in this commit
			uris := []byte(fmt.Sprintf("at://%s/%s", evt.Repo, op.Path))
			if bytes == nil || err != nil || (matcher.IterByte(*bytes).Next() == nil && matcher.IterByte(uris).Next() == nil) {
				// this is not the matched record or there is some error
				continue
			}
			// this is the matched record
			cid, rec, err := repo.GetRecord(context.TODO(), op.Path)
			if err != nil {
				logger.Error("getrecord_error", slog.String("err", err.Error()))
				continue
			}
			isWhtWnd := false
			if strings.HasPrefix(op.Path, "com.whtwnd.blog.entry") {
				isWhtWnd = true
				logger.Info("whitewind_blogpost")
				title := ""
				entry := (rec).(*whtwnd_autogen.BlogEntry)
				if entry.Title != nil {
					title = *entry.Title
				}
				handle := syntax.HandleInvalid
				directory := identity.DefaultDirectory()
				ident, err := directory.Lookup(context.TODO(), curAtUri.Authority())
				if err != nil {
					logger.Warn("lookup_error", slog.String("err", err.Error()))
					continue
				}
				if ident.Handle != syntax.HandleInvalid {
					handle = ident.Handle
				}

				logger.Info("blog_metadata", slog.String("title", title), slog.String("handle", handle.String()))
				itemToWrite := blog.BlogMetadataItem{
					AuthorDid:  evt.Repo,
					Rkey:       curAtUri.RecordKey().String(),
					EntryTitle: title,
					LastUpdate: time.Now().Format(time.RFC3339),
					Cid:        cid.String(),
					Handle:     handle.String(),
				}
				item, err := attributevalue.MarshalMap(itemToWrite)
				if err != nil {
					logger.Warn("marshal_error", slog.String("err", err.Error()))
					continue
				}
				if err = writeDB(item, "com.whtwnd.blog.metadata"); err != nil {
					logger.Warn("writeDB_error", slog.String("aturi", curAtUriStr))
				}
				key, pattern := getPatternForBlog(item)
				oldPat, ok := patterns[key]
				if ok {
					// This is necessary for later mention analysis
					// If omitted, old mention stays forever in the DB
					pattern.mentioned = oldPat.mentioned
				}
				patterns[key] = pattern
				patDirty = true
			} else if strings.HasPrefix(op.Path, "app.bsky.feed.post") {
				post := (rec).(*bsky.FeedPost)
				logger.Info("post", slog.String("createdAt", post.CreatedAt), slog.String("text", post.Text), slog.String("repo", evt.Repo))
			}
			// mention check
			// check what blog entry has matched
			subjectAtUris := map[string]struct{}{}
			for subjectAtUri, pattern := range patterns {
				if !pattern.isWhtWnd {
					// ignore non-blog entry
					continue
				}
				if pattern.m == nil {
					continue
				}
				if pattern.m.IterByte(*bytes).Next() == nil {
					continue
				}
				subjectAtUris[subjectAtUri] = struct{}{}
				// this blog entry with subjectAtUri is mentioned in the data
				itemToWrite := blog.Mentioning{
					SubjectAtUri: subjectAtUri,
					Time:         time.Now().Format(time.RFC3339),
					PostAtUri:    curAtUriStr,
					Rec:          *bytes,
				}
				logger.Info("mention_hit", slog.String("subject", subjectAtUri), slog.String("post", curAtUriStr))
				item, err := attributevalue.MarshalMap(itemToWrite)
				if err != nil {
					continue
				}
				writeDB(item, "com.whtwnd.blog.mentions")
			}

			pat, ok := patterns[curAtUriStr]
			if ok { // there is existing pattern
				// delete outdated mention if any
				for _, oldSubjectAtUri := range pat.mentioned {
					_, ok := subjectAtUris[oldSubjectAtUri]
					if ok {
						continue
					}
					key := map[string]types.AttributeValue{
						"subjectAtUri": &types.AttributeValueMemberS{
							Value: oldSubjectAtUri,
						},
						"postAtUri": &types.AttributeValueMemberS{
							Value: curAtUriStr,
						},
					}
					if err := deleteDB(key, "com.whtwnd.blog.mentions"); err != nil {
						logger.Warn("mention_replace_fail", slog.String("subject", oldSubjectAtUri), slog.String("post", curAtUriStr))
					}
				}
				// if there is mention in it, add it to watch list
				pat.mentioned = []string{}
				for subjectAtUri := range subjectAtUris {
					pat.mentioned = append(pat.mentioned, subjectAtUri)
				}
				patterns[curAtUriStr] = pat
				patDirty = true
			} else if len(subjectAtUris) > 0 { // new pattern and there are mentions in it
				pat := getPatternMentioner(curAtUriStr)
				pat.isWhtWnd = isWhtWnd
				pat.mentioned = []string{}
				for subjectAtUri := range subjectAtUris {
					pat.mentioned = append(pat.mentioned, subjectAtUri)
				}
				patterns[curAtUriStr] = pat
				patDirty = true
			}
		}
		// new mentioner or blog entry found, rebuild
		if patDirty {
			matcher = buildPattern(&patterns)
			newMatcher <- matcher
		}

		// write dynamodb
		itemToWrite := RawRelayData{
			DataType: "aturi",
			Time:     time.Now().Format(time.RFC3339Nano),
			AtUris:   strings.Join(aturis, ","),
			Actions:  strings.Join(actions, ","),
		}
		item, err := attributevalue.MarshalMap(itemToWrite)
		if err != nil {
			continue
		}
		writeDB(item, "com.whtwnd.blog.rawrelay")
	}
}

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	// URL of the WebSocket server.
	const SERVER_URL = "wss://bsky.network/xrpc/com.atproto.sync.subscribeRepos"

	c := make(chan *atproto.SyncSubscribeRepos_Commit, 100)
	matcherChan := make(chan *aho_corasick.AhoCorasick)
	go commitConsumer(c, matcherChan, logger)
	matcher := <-matcherChan

	seq := int64(-1)

	defer func() {
		if rec := recover(); rec != nil {
			logger.Error("panic", slog.String("err", fmt.Sprint(rec)))
		}
	}()

	for {
		url := SERVER_URL
		if seq > 0 {
			url = fmt.Sprintf("%s?cursor=%d", SERVER_URL, seq)
		}
		// Dial the server.
		// for client
		dialer := websocket.Dialer{
			Proxy:             http.ProxyFromEnvironment, // From default dialer
			HandshakeTimeout:  45 * time.Second,          // From default dialer
			EnableCompression: true,
		}
		con, _, err := dialer.Dial(url, http.Header{})
		if err != nil {
			logger.Error("dial_error", slog.String("err", err.Error()))
			time.Sleep(5 * time.Second)
			continue
		}
		const MAX_ITEMS = 100
		delays := list.New()
		lastShown := time.Now().UTC()
		cumsum := float64(0)
		ingestion := 0
		rsc := &events.RepoStreamCallbacks{
			RepoCommit: func(evt *atproto.SyncSubscribeRepos_Commit) error {
				select {
				case matcher = <-matcherChan:
				default:
				}

				seq = evt.Seq
				ingestion++

				dataTime, err := time.Parse(time.RFC3339, evt.Time)
				if err == nil {
					now := time.Now().UTC()
					delay := float64(now.Sub(dataTime).Seconds())
					delays.PushFront(delay)
					cumsum += delay
					if delays.Len() > MAX_ITEMS {
						back := delays.Back()
						cumsum -= back.Value.(float64)
						delays.Remove(back)
					}
					if now.Sub(lastShown).Seconds() > 60 {
						delay := cumsum / float64(delays.Len())
						logger.Info("avg_delay", slog.Float64("avg_delay", delay), slog.Int("ingestion", ingestion))
						lastShown = now
						ingestion = 0
					}
				}

				// include aturis included in this commit
				uris := []byte{}
				for _, op := range evt.Ops {
					uris = append(uris, []byte(fmt.Sprintf("at://%s/%s", evt.Repo, op.Path))...)
				}

				if matcher.IterByte(evt.Blocks).Next() != nil || matcher.IterByte(uris).Next() != nil {
					c <- evt
				}
				return nil
			},
			RepoHandle: func(evt *atproto.SyncSubscribeRepos_Handle) error {
				seq = evt.Seq
				//fmt.Printf("RepoHandle %s -> %s\n", evt.Did, evt.Handle)
				return nil
			},
			RepoIdentity: func(evt *atproto.SyncSubscribeRepos_Identity) error {
				seq = evt.Seq
				//fmt.Printf("RepoIdentity %s\n", evt.Did)
				return nil
			},
			RepoTombstone: func(evt *atproto.SyncSubscribeRepos_Tombstone) error {
				seq = evt.Seq
				//fmt.Printf("RepoTombstone %s\n", evt.Did)
				return nil
			},
			RepoInfo: func(evt *atproto.SyncSubscribeRepos_Info) error {
				msg := ""
				if evt.Message != nil {
					msg = *evt.Message
				}
				logger.Info("RepoInfo", slog.String("name", evt.Name), slog.String("msg", msg))
				return nil
			},
			Error: func(evt *events.ErrorFrame) error {
				logger.Error("RepoError", slog.String("Error", evt.Error), slog.String("Message", evt.Message))
				return nil
			},
		}

		sched := sequential.NewScheduler("myfirehose", rsc.EventHandler)
		err = events.HandleRepoStream(context.Background(), con, sched)
		con.Close()
		logger.Warn("Connection close", slog.String("err", err.Error()))
	}
}
