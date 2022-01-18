```sh
# Download "watch" page
curl -H 'accept-language: en' 'https://www.youtube.com/watch?v=MoH8Fk2K9bc' > misc/youtube/examples/MoH8Fk2K9bc.html

# Parse "player response" metadata
python -c 'import re, sys; print(re.search("var ytInitialPlayerResponse = ({.+?});", sys.stdin.read()).group(1))' < misc/youtube/examples/MoH8Fk2K9bc.html | jq > misc/youtube/examples/MoH8Fk2K9bc.json

# Extract "language code" mapping
jq '.captions.playerCaptionsTracklistRenderer.translationLanguages | map({"\(.languageCode)": .languageName.simpleText}) | add' misc/youtube/examples/MoH8Fk2K9bc.json > misc/youtube/languages.json
```
