#!/bin/bash

set -euo pipefail

npx ts-node -T ./src/dev/cli.ts generate-demo-entry > misc/youtube/demo/MoH8Fk2K9bc.json <<EOF
{
  "videoId": "MoH8Fk2K9bc",
  "captions": [{ "id": ".fr-FR" }, { "id": ".en" }]
}
EOF

npx ts-node -T ./src/dev/cli.ts generate-demo-entry > misc/youtube/demo/EnPYXckiUVg.json <<EOF
{
  "videoId": "EnPYXckiUVg",
  "captions": [{ "id": ".fr" }, { "id": ".en" }]
}
EOF

npx ts-node -T ./src/dev/cli.ts generate-demo-entry > misc/youtube/demo/vCb8iA4SjOI.json <<EOF
{
  "videoId": "vCb8iA4SjOI",
  "captions": [{ "id": "a.fr" }, { "id": "a.fr", "translation": "en" }]
}
EOF

npx ts-node -T ./src/dev/cli.ts generate-demo-entry > misc/youtube/demo/GZ2uc-3pQbA.json <<EOF
{
  "videoId": "GZ2uc-3pQbA",
  "captions": [{ "id": ".ru" }, { "id": ".ru", "translation": "en" }]
}
EOF

npx ts-node -T ./src/dev/cli.ts generate-demo-entry > misc/youtube/demo/FSYe9GQc9Ow.json <<EOF
{
  "videoId": "FSYe9GQc9Ow",
  "captions": [{ "id": "a.ru" }, { "id": "a.ru", "translation": "en" }]
}
EOF
