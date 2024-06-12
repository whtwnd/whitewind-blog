package main

import (
	"fmt"
	"time"

	"github.com/bluesky-social/indigo/atproto/syntax"
)

func main() {
	now := time.Now()
	fmt.Println(now.UnixMicro())
	tid := syntax.NewTIDNow(0)
	fmt.Println(tid)
	parsed, _ := syntax.ParseTID(string(tid))
	fmt.Println(parsed.Time())

	tid = syntax.NewTIDNow(1)
	fmt.Println(tid)
	parsed, _ = syntax.ParseTID(string(tid))
	fmt.Println(parsed.Time())
}
