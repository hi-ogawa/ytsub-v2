// Cf.
// - https://github.com/hi-ogawa/apps-script-proxy
// - https://developers.google.com/apps-script/reference/url-fetch/url-fetch-app#fetch(String,Object)

const PROXY_BASE_URL =
  "https://script.google.com/macros/s/AKfycbxEFXwjhCq6Iu8_dNXI1Cc6uZbVAGgaO1nBOY2wpuxZRDx9Fihsycdm16erectNJ7UaDQ/exec";

interface RequestOptions {
  headers?: Record<string, string>;
}

export async function proxyFetch(
  url: string,
  options: RequestOptions = {}
): Promise<string> {
  const encodedUrl = encodeURIComponent(url);
  const encodedOptions = encodeURIComponent(JSON.stringify(options));
  const response = await fetch(
    `${PROXY_BASE_URL}?url=${encodedUrl}&options=${encodedOptions}`
  );
  if (response.ok) {
    const { status, content } = await response.json();
    if (status === "success" && typeof content === "string") {
      return content;
    }
  }
  throw new Error("Proxy fetch failed");
}
