.PHONY: backend testcmd
.SECONDEXPANSION:

# ------------------AppView Backend------------------
# auto-detect APIs using directory structure
APISOURCEDIRS:= $(subst /main.go,,$(shell find /workspaces/backend/xrpc -type f -name 'main.go' -print))
APIS := $(subst _,.,$(subst /workspaces/backend/xrpc/,,$(APISOURCEDIRS)))
BINARIES:=$(APIS:%=/workspaces/build/lambda/%)

testcmd:
	@echo Building $@
# delete temp folder if exists
	@rm -rf /workspaces/build/temp 2> /dev/null
	@cp -r /workspaces/backend/lambda  /workspaces/build/temp
# modify import
	@cat /workspaces/build/temp/main.go | sed 's/com_atproto_server_createSession/$(subst .,_,$(@:/workspaces/build/lambda/%=%))/g' > /workspaces/build/temp/main.go
	@cat /workspaces/build/temp/go.mod | sed 's/lambda_main/temp/g' > /workspaces/build/temp/go.mod

# go source codes in backend/common
COMMONSOURCEFILES:=$(shell find /workspaces/backend/common -type f -name '*.go' -print)
LAMBDASOURCEFILES:=$(shell find /workspaces/backend/lambda -type f -name '*.go' -print)

go.work:
	@mkdir -p build
	@rm -rf /workspaces/build/temp 2> /dev/null
	@cp -r /workspaces/backend/lambda  /workspaces/build/temp
	@sed -i 's/lambda_main/temp/g' /workspaces/build/temp/go.mod
	@go work init backend/common backend/lambda backend/xrpc build/temp

init_backend: go.work

# build all APIs
backend: $(BINARIES)

# build each API
$(BINARIES): $$(shell find $$(subst .,_,$$(subst build/lambda,backend/xrpc,$$@)) -type f -name '*.go' -print) $(COMMONSOURCEFILES) $(LAMBDASOURCEFILES)
	@echo Building $@
	@mkdir -p build
# delete temp folder if exists
	@rm -rf /workspaces/build/temp 2> /dev/null
	@cp -r /workspaces/backend/lambda  /workspaces/build/temp
# modify import
	@sed -i 's/com_whtwnd_blog_getEntryMetadataByName/$(subst .,_,$(@:/workspaces/build/lambda/%=%))/g' /workspaces/build/temp/main.go
	@sed -i 's/lambda_main/temp/g' /workspaces/build/temp/go.mod
	@mkdir -p $(dir $@)
	@cd /workspaces/build/temp && \
	go mod tidy && \
	GOOS=linux GOARCH=amd64 go build -o $@ main.go

# manual build command
# usage: make com.atproto.server.createSession
$(APIS): $$(addprefix /workspaces/build/lambda/,$$@)

gen-app:
	lexgen --package app_autogen --prefix app.bsky --outdir backend/common/app_autogen ~/lexicons
	find backend/common/app_autogen -type f -name '*.go' -print | xargs sed -i '1 i\//go:build exclude'

gen-com:
	lexgen --package com_autogen --prefix com.atproto --outdir backend/common/com_autogen /workspaces/lexicons
	find backend/common/com_autogen -type f -name '*.go' -print | xargs sed -i '1 i\//go:build exclude'

# generate server-side api
gen-whtwnd:
	lexgen --package whtwnd_autogen --prefix com.whtwnd --outdir backend/common/whtwnd_autogen /workspaces/lexicons
#	find backend/common/whtwnd_autogen -type f -name '*.go' -print | xargs sed -i '1 i\//go:build exclude'
#	go run ./cmd/gen

gen-client:
	lex gen-api /workspaces/frontend/src/api \
	/workspaces/lexicons/com/atproto/repo/*.json \
	/workspaces/lexicons/com/atproto/label/*.json \
	/workspaces/lexicons/com/atproto/server/*.json \
	/workspaces/lexicons/com/atproto/sync/*.json \
	/workspaces/lexicons/com/atproto/identity/*.json \
	/workspaces/lexicons/app/bsky/actor/*.json \
	/workspaces/lexicons/app/bsky/feed/*.json \
	/workspaces/lexicons/app/bsky/richtext/*.json \
	/workspaces/lexicons/app/bsky/embed/*.json \
	/workspaces/lexicons/com/whtwnd/blog/*.json \
	/workspaces/lexicons/blue/linkat/*.json \
	/workspaces/lexicons/fyi/unravel/frontpage/*.json \
