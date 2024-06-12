package main

import (
	"encoding/json"
	"fmt"
	"whtwnd/xrpc/com_whtwnd_blog_getMentionsByEntry"
)

func getComments() {
	resp, _ := com_whtwnd_blog_getMentionsByEntry.Main("", map[string]string{
		"postUri": "at://whtwnd.com/com.whtwnd.blog.entry/3kpf7sy4wnq2d",
	})
	retstr, _ := json.Marshal(resp)
	fmt.Println(string(retstr))

	resp, _ = com_whtwnd_blog_getMentionsByEntry.Main("", map[string]string{
		"postUri": "at://did:plc:fzkpgpjj7nki7r5rhtmgzrez/com.whtwnd.blog.entry/3kpf7sy4wnq2d",
	})
	retstr, _ = json.Marshal(resp)
	fmt.Println(string(retstr))
}

func main() {
	getComments()
}
