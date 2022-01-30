import { useQuery, UseQueryOptions } from "react-query";
import { proxyFetch } from "./proxy";
import { parseVideoMetadata, ttmlsToCaptionEntries } from "./youtube";
import { loadYoutubeApi } from "./youtube";

function createUseQuery<TQueryFnArg, TQueryFnData>(
  key: any,
  queryFnWithArg: (arg: TQueryFnArg) => Promise<TQueryFnData>,
  defaultOptions?: Pick<
    UseQueryOptions<TQueryFnData, Error, unknown>,
    "staleTime" | "cacheTime"
  >
) {
  return function useQueryWrapper<TData = TQueryFnData>(
    arg: TQueryFnArg,
    options?: Omit<
      UseQueryOptions<TQueryFnData, Error, TData>,
      "queryKey" | "queryFn"
    >
  ) {
    return useQuery<TQueryFnData, Error, TData>(
      [key, arg],
      () => queryFnWithArg(arg),
      { ...defaultOptions, ...options }
    );
  };
}

export const useVideoMetadata = createUseQuery(
  "video-metadata",
  async (videoId: string) => {
    const response = await proxyFetch(
      `https://www.youtube.com/watch?v=${videoId}`,
      { headers: { "accept-language": "en-US,en" } }
    );
    const metadata = parseVideoMetadata(response);
    if (metadata.playabilityStatus.status !== "OK") {
      console.error(metadata);
      throw new Error("Invalid video metadata");
    }
    return metadata;
  }
);

export const useCaptionEntries = createUseQuery(
  "caption-entries",
  async ([url1, url2]: [string, string]) => {
    const [res1, res2] = await Promise.all([fetch(url1), fetch(url2)]);
    if (!res1.ok || !res2.ok) {
      throw new Error();
    }
    const ttml1 = await res1.text();
    const ttml2 = await res2.text();
    return ttmlsToCaptionEntries(ttml1, ttml2);
  }
);

export const useYoutubeApi = createUseQuery("youtube-api", loadYoutubeApi, {
  staleTime: Infinity,
  cacheTime: Infinity,
});

export function toDemoDataOptions(initialData: any): any {
  return initialData
    ? {
        // Rely on the given data completely during the hook call,
        // but don't let it affect other calls using the same key
        initialData,
        staleTime: Infinity,
        cacheTime: 0,
      }
    : {};
}
