assets

```sh
# Download the original svg
curl https://fonts.gstatic.com/s/i/materialicons/subtitles/v1/24px.svg > src/assets/subtitles_v1_24px.svg

# Convert to different sizes
for px in 32 192 512; do
  convert -density 1000 -resize "${px}x${px}" -background none src/assets/subtitles_v1_24px.svg "src/assets/icon-${px}.png"
done
```
