package main

import (
	whtwnd_autogen "whtwnd/common/whtwnd_autogen"

	cbg "github.com/whyrusleeping/cbor-gen"
)

func main() {
	genCfg := cbg.Gen{
		MaxStringLength: 1_000_000,
	}
	if err := genCfg.WriteMapEncodersToFile("backend/common/whtwnd_autogen/cbor_gen.go", "whtwnd_autogen", whtwnd_autogen.BlogEntry{}, whtwnd_autogen.BlogDefs_BlobMetadata{}, whtwnd_autogen.BlogComment{}, whtwnd_autogen.BlogDefs_Ogp{}); err != nil {
		panic(err)
	}
}
