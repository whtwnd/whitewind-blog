FROM mcr.microsoft.com/devcontainers/go:1-1.22-bookworm
ARG SSO_ACCOUNT_ID=""
ARG SSO_REGION=""
ARG SSO_START_URL=""

USER vscode
RUN <<EOF
mkdir /home/vscode/.aws
cat <<EOT > /home/vscode/.aws/config
[default]
sso_session = session
sso_account_id = ${SSO_ACCOUNT_ID}
sso_role_name = AdministratorAccess
region = ${SSO_REGION}
output = json
[sso-session session]
sso_start_url = ${SSO_START_URL}
sso_region = ${SSO_REGION}
sso_registration_scopes = sso:account:access
EOT
EOF

USER root
# /go permission change
RUN chown -R vscode /go

# lexgen (for golang) setup
RUN <<EOF
git clone https://github.com/bluesky-social/indigo.git
cd indigo
go build ./cmd/lexgen
chmod a+x lexgen
mv lexgen /usr/local/bin/lexgen
EOF

USER vscode