Examples for data exploration and testing

- https://www.youtube.com/watch?v=MoH8Fk2K9bc (Learn French with Elisabeth - HelloFrench)

```sh
# Download "watch" page
curl -H 'accept-language: en' 'https://www.youtube.com/watch?v=MoH8Fk2K9bc' > misc/youtube/examples/MoH8Fk2K9bc.html

# Parse "player response" metadata
python -c 'import re, sys; print(re.search("var ytInitialPlayerResponse = ({.+?});", sys.stdin.read()).group(1))' < misc/youtube/examples/MoH8Fk2K9bc.html | jq > misc/youtube/examples/MoH8Fk2K9bc.json

# Extract "language code" mapping
jq '.captions.playerCaptionsTracklistRenderer.translationLanguages | map({"\(.languageCode)": .languageName.simpleText}) | add' misc/youtube/examples/MoH8Fk2K9bc.json > misc/youtube/languages.json

# Download ttml files
curl "$(jq -r '.captions.playerCaptionsTracklistRenderer.captionTracks | .[0].baseUrl' misc/youtube/examples/MoH8Fk2K9bc.json)&fmt=ttml" > misc/youtube/examples/MoH8Fk2K9bc-en.ttml
curl "$(jq -r '.captions.playerCaptionsTracklistRenderer.captionTracks | .[1].baseUrl' misc/youtube/examples/MoH8Fk2K9bc.json)&fmt=ttml" > misc/youtube/examples/MoH8Fk2K9bc-fr-FR.ttml

# Download ttml files via youtube-dl
video_id="9tnBukLH0Vc"
youtube-dl -o "misc/youtube/examples/${video_id}.%(ext)s" --skip-download --write-auto-sub --sub-lang=en,fr-FR --sub-format=ttml "https://www.youtube.com/watch?v=${video_id}"
```
