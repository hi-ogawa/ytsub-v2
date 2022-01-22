import { Box, Card, CircularProgress, Icon, Paper } from "@mui/material";
import { useSnackbar } from "notistack";
import * as React from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { Err, Ok, Result } from "ts-results";
import { useCaptionEntries, useVideoMetadata } from "../utils/hooks";
import { CaptionEntry, VideoMetadata, WatchParameters } from "../utils/types";
import { fromSearchParams } from "../utils/url";
import { withHook3 } from "../utils/with-hook";
import { captionConfigToUrl, stringifyTimestamp } from "../utils/youtube";

export const WatchPage = withHook3(
  (): Result<WatchParameters, "error" | "loading"> => {
    const [searchParams] = useSearchParams();
    // TODO: validate parameters
    const result = fromSearchParams<WatchParameters>(searchParams);
    if (!result.ok) {
      return Err("error");
    }
    return Ok(result.val);
  },
  (
    watchParameters: WatchParameters
  ): Result<[WatchParameters, VideoMetadata], "error" | "loading"> => {
    const { videoId } = watchParameters;
    const { data, isLoading, isError } = useVideoMetadata(videoId);
    if (isError) {
      return Err("error");
    }
    if (isLoading) {
      return Err("loading");
    }
    return Ok([watchParameters, data!]);
  },
  ([watchParameters, videoMetadata]: [WatchParameters, VideoMetadata]): Result<
    [WatchParameters, VideoMetadata, CaptionEntry[]],
    "error" | "loading"
  > => {
    const { captionConfig1, captionConfig2 } = watchParameters;
    const url1 = captionConfigToUrl(captionConfig1, videoMetadata);
    const url2 = captionConfigToUrl(captionConfig2, videoMetadata);
    const { data, isLoading, isError } = useCaptionEntries([url1!, url2!]);
    if (isError) {
      return Err("error");
    }
    if (isLoading) {
      return Err("loading");
    }
    return Ok([watchParameters, videoMetadata, data!]);
  },
  WatchPageOk,
  WatchPageErr
);

function WatchPageOk({
  data: [watchParameters, _, captionEntries],
}: {
  data: [WatchParameters, VideoMetadata, CaptionEntry[]];
}) {
  const { videoId } = watchParameters;

  return (
    <Box
      sx={(theme) => ({
        flex: "1 1 auto",
        display: "flex",
        padding: 0.6,
        gap: 1,

        "#watch-page-player-box": {
          display: "flex",
          "& > *": {
            flex: "1 0 auto",
          },
        },

        "#watch-page-subtitles-viewer-box": {
          flex: "1 0 0",
          display: "flex",
          flexDirection: "column",

          "& > *": {
            flex: "1 0 0",
            overflowY: "auto",
          },
        },

        // Split vertically by the height of `#watch-page-player-box` defined by aspect ratio `width * 9 / 16`
        [theme.breakpoints.down("md")]: {
          flexDirection: "column",

          "#watch-page-player-box": {
            flex: "0 0 auto",
          },
        },

        // Split horizontally by 2/3 and 1/3
        [theme.breakpoints.up("md")]: {
          flexDirection: "row",

          "#watch-page-player-box": {
            flex: "0 0 66%",
            alignSelf: "start",
          },
        },
      })}
    >
      <Box id="watch-page-player-box">
        <Player videoId={videoId} />
      </Box>
      <Box id="watch-page-subtitles-viewer-box">
        <SubtitlesViewer captionEntries={captionEntries} />
      </Box>
    </Box>
  );
}

function WatchPageErr({ data }: { data: "error" | "loading" }) {
  const { enqueueSnackbar } = useSnackbar();

  React.useEffect(() => {
    if (data === "error") {
      enqueueSnackbar("Invalid Video ID");
    }
  }, [data]);

  if (data === "loading") {
    return (
      <Box
        sx={{
          flex: "1 0 auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }
  return <Navigate to="/" />;
}

export function Player({ videoId }: { videoId: string }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "center" }}>
      <Box
        sx={{
          flex: "0 0 auto",
          width: "100%",
          maxWidth: { xs: "480px", md: "initial" },
          boxShadow: 3,
        }}
      >
        <Box sx={{ position: "relative", paddingTop: "56.25%" }}>
          <iframe
            style={{
              position: "absolute",
              top: 0,
              width: "100%",
              height: "100%",
            }}
            src={`https://www.youtube.com/embed/${videoId}`}
            frameBorder="0"
          />
        </Box>
      </Box>
    </Box>
  );
}

function SubtitlesViewer({
  captionEntries,
}: {
  captionEntries: CaptionEntry[];
}) {
  return (
    <Card
      elevation={1}
      square
      sx={{ display: "flex", flexDirection: "column", padding: 0.6, gap: 0.6 }}
    >
      {captionEntries.map((e) => (
        <CaptionEntryComponent key={toCaptionEntryId(e)} captionEntry={e} />
      ))}
    </Card>
  );
}

function CaptionEntryComponent({
  captionEntry,
}: {
  captionEntry: CaptionEntry;
}) {
  const { begin, end, text1, text2 } = captionEntry;
  const timestamp = [begin, end].map(stringifyTimestamp).join(" - ");
  return (
    <Paper
      variant="outlined"
      square
      sx={{
        display: "flex",
        flexDirection: "column",
        padding: 0.8,
        fontSize: 12,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "end",
          alignItems: "center",
          gap: 0.8,
        }}
      >
        <Box sx={{ fontSize: 12, color: "grey.700" }}>{timestamp}</Box>
        <Box
          sx={{ fontSize: 16, color: "grey.500", display: "flex", gap: 0.8 }}
        >
          <Icon sx={{ fontSize: 16 }}>repeat</Icon>
          <Icon sx={{ fontSize: 16 }}>play_circle_outline</Icon>
        </Box>
      </Box>
      <Box
        sx={{
          display: "flex",
          "> *": {
            flex: "1 1 50%",
            "&:first-child": {
              paddingRight: 0.8,
              borderRightWidth: "1px",
              borderRightStyle: "solid",
              borderRightColor: "grey.300",
            },
            "&:not(:first-child)": {
              paddingLeft: 0.8,
            },
          },
        }}
      >
        <Box>{text1}</Box>
        <Box>{text2}</Box>
      </Box>
    </Paper>
  );
}

function toCaptionEntryId({ begin, end }: CaptionEntry): string {
  return `${begin}--${end}`;
}
