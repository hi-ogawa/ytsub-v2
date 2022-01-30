Fetch `videoDetails` for `home-page.tsx`

```sh
#!/bin/bash

video_ids=(
  "XrhqJmQnKAs"
  "MoH8Fk2K9bc"
  "vCb8iA4SjOI"
  "GZ2uc-3pQbA"
  "FSYe9GQc9Ow"
  "EnPYXckiUVg"
)

for video_id in "${video_ids[@]}"; do
  curl -H 'accept-language: en' "https://www.youtube.com/watch?v=$video_id" \
  | python -c 'import re, sys; print(re.search("var ytInitialPlayerResponse = ({.+?});", sys.stdin.read()).group(1))' \
  | jq '.videoDetails | with_entries(select(.key == ("videoId", "title", "author", "channelId", "thumbnail")))' \
  > "misc/youtube/video-details/$video_id.json"
done
```
