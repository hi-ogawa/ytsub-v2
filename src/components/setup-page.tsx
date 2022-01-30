import {
  Box,
  Button,
  Card,
  CircularProgress,
  InputAdornment,
  TextField,
  TextFieldProps,
  Typography,
} from "@mui/material";
import { useSnackbar } from "notistack";
import * as React from "react";
import { Navigate, useParams } from "react-router-dom";
import { Err, Ok } from "ts-results";
import { findDemoEntry } from "../utils/demo-entries";
import { toDemoDataOptions, useVideoMetadata } from "../utils/hooks";
import { FILTERED_LANGUAGE_CODES, languageCodeToName } from "../utils/language";
import { useHistoryEntries, useLanguageSetting } from "../utils/storage";
import { CaptionConfig, VideoMetadata, WatchParameters } from "../utils/types";
import { useNavigateCustom, useSearchParamsCustom } from "../utils/url";
import { withHook } from "../utils/with-hook";
import { findCaptionConfig } from "../utils/youtube";
// import {}

export const SetupPage = withHook(
  () => {
    const { videoId } = useParams();
    // TODO: more validation
    if (!videoId) {
      return Err(undefined);
    }
    return Ok(videoId);
  },
  SetupPageOk,
  function SetupPageErr(_: unknown) {
    const { enqueueSnackbar } = useSnackbar();
    React.useEffect(() => {
      enqueueSnackbar("Video ID is invalid", { variant: "error" });
    });
    return <Navigate to="/" />;
  }
);

function SetupPageOk({ data: videoId }: { data: string }) {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigateCustom();
  const [{ language1, language2 }] = useLanguageSetting();
  const [caption1, setCaption1] = React.useState<CaptionConfig>();
  const [caption2, setCaption2] = React.useState<CaptionConfig>();
  const addHistoryEntry = useHistoryEntries()[1];
  const watchParameters = useSearchParamsCustom<WatchParameters>();
  const {
    data: videoMetadata,
    isSuccess,
    isLoading,
    isError,
  } = useVideoMetadata(videoId, {
    onError: (error) => {
      console.error(error);
      enqueueSnackbar("Failed to load captions data");
    },
    ...toDemoDataOptions(
      watchParameters.ok && findDemoEntry(watchParameters.val)?.videoMetadata
    ),
  });

  React.useEffect(() => {
    if (videoMetadata) {
      // Pre fill by search params
      if (watchParameters.ok) {
        setCaption1(watchParameters.val.captions[0]);
        setCaption2(watchParameters.val.captions[1]);
        return;
      }
      // Pre fill by language setting
      if (language1 && language2) {
        const found1 = findCaptionConfig(videoMetadata, language1);
        let found2 = findCaptionConfig(videoMetadata, language2);
        if (found1 && !found2) {
          found2 = { id: found1.id, translation: language2 };
        }
        setCaption1(found1);
        setCaption2(found2);
        return;
      }
    }
  }, [videoMetadata]);

  function onPlay() {
    if (!videoMetadata || !caption1 || !caption2) return;

    const watchParameters: WatchParameters = {
      videoId,
      captions: [caption1, caption2],
    };

    addHistoryEntry({
      watchParameters,
      videoDetails: videoMetadata.videoDetails,
    });
    navigate("/watch", watchParameters);
  }

  return (
    <Box
      sx={{
        flex: "1 0 auto",
        display: "flex",
        justifyContent: "center",
        padding: 2,
      }}
    >
      <Card
        sx={{
          flex: "1 0 auto",
          maxWidth: "500px",
          height: 1,
          padding: 2,
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
        }}
      >
        <Typography variant="h5">Select Languages</Typography>
        <TextField
          label="Video ID"
          value={videoId}
          variant="filled"
          sx={{ marginBottom: 1, pointerEvents: "none" }}
          error={isError}
          InputProps={{
            endAdornment: isLoading && (
              <InputAdornment position="end">
                <CircularProgress size={25} />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          label="Author"
          variant="filled"
          sx={{ marginBottom: 1, pointerEvents: "none" }}
          inputProps={{ style: { textOverflow: "ellipsis" } }}
          disabled={!isSuccess}
          value={videoMetadata?.videoDetails?.author ?? ""}
        />
        <TextField
          label="Title"
          variant="filled"
          sx={{ marginBottom: 1, pointerEvents: "none" }}
          inputProps={{ style: { textOverflow: "ellipsis" } }}
          disabled={!isSuccess}
          value={videoMetadata?.videoDetails?.title ?? ""}
        />
        <CaptionConfigSelect
          label="1st language"
          disabled={!isSuccess}
          videoMetadata={videoMetadata}
          value={caption1}
          onChange={setCaption1}
        />
        <CaptionConfigSelect
          label="2nd language"
          disabled={!isSuccess}
          videoMetadata={videoMetadata}
          value={caption2}
          onChange={setCaption2}
        />
        <Button
          onClick={onPlay}
          variant="contained"
          disabled={!isSuccess || !caption1 || !caption2}
        >
          Play
        </Button>
      </Card>
    </Box>
  );
}

function renderCaptionConfigSelectOptions(
  videoMetadata: VideoMetadata
): React.ReactNode[] {
  const { captionTracks, translationLanguages } =
    videoMetadata.captions.playerCaptionsTracklistRenderer;

  const children: React.ReactNode[] = [];

  const captionOptions: React.ReactNode[] = [];
  for (const track of captionTracks) {
    const { vssId, languageCode, kind } = track;
    const config: CaptionConfig = { id: vssId };
    const value = JSON.stringify(config);
    captionOptions.push(
      <option key={value} value={value}>
        {languageCodeToName(languageCode, kind)}
      </option>
    );
  }

  children.push(
    <optgroup key={`group-captions`} label="Captions">
      {captionOptions}
    </optgroup>
  );

  for (const track of captionTracks) {
    const { vssId, languageCode, kind } = track;
    const value = JSON.stringify({ vssId });

    const translationOptions: React.ReactNode[] = [];
    for (const translation of translationLanguages) {
      const code = translation.languageCode;
      const config: CaptionConfig = { id: vssId, translation: code };
      if (!FILTERED_LANGUAGE_CODES.includes(code as any)) {
        continue;
      }
      const value = JSON.stringify(config);
      translationOptions.push(
        <option key={value} value={value}>
          {languageCodeToName(code)}
        </option>
      );
    }

    children.push(
      <optgroup
        key={`group-translations-${value}`}
        label={`Auto Translations (${languageCodeToName(languageCode, kind)})`}
      >
        {translationOptions}
      </optgroup>
    );
  }

  return children;
}

function CaptionConfigSelect({
  videoMetadata,
  value,
  onChange,
  ...props
}: {
  videoMetadata?: VideoMetadata;
  value?: CaptionConfig;
  onChange: (value?: CaptionConfig) => void;
} & Omit<TextFieldProps, "value" | "onChange">) {
  return (
    <TextField
      {...props}
      select
      SelectProps={{ native: true }}
      value={value ? JSON.stringify(value) : ""}
      onChange={({ target: { value } }) => {
        onChange(value ? JSON.parse(value) : undefined);
      }}
    >
      <option key="" value="" disabled />
      {videoMetadata && renderCaptionConfigSelectOptions(videoMetadata)}
    </TextField>
  );
}
