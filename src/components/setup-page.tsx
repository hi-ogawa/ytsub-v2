import {
  Box,
  Button,
  Card,
  CircularProgress,
  InputAdornment,
  ListSubheader,
  MenuItem,
  TextField,
  TextFieldProps,
  Typography,
} from "@mui/material";
import { useSnackbar } from "notistack";
import * as React from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Err, Ok } from "ts-results";
import { useVideoMetadata } from "../utils/hooks";
import { FILTERED_LANGUAGE_CODES, languageCodeToName } from "../utils/language";
import { CaptionConfig, VideoMetadata, WatchParameters } from "../utils/types";
import { toSearchParams } from "../utils/url";
import { withHook } from "../utils/with-hook";

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
  const navigate = useNavigate();

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
  });

  const [caption1, setCaption1] = React.useState<CaptionConfig>();
  const [caption2, setCaption2] = React.useState<CaptionConfig>();

  function onPlay() {
    if (!caption1 || !caption2) return;

    const watchParameters: WatchParameters = {
      videoId,
      captionConfig1: caption1,
      captionConfig2: caption2,
    };
    navigate("/watch?" + toSearchParams(watchParameters).toString());
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
          value={videoMetadata ? videoMetadata.videoDetails.author : "----"}
        />
        <TextField
          label="Title"
          variant="filled"
          sx={{ marginBottom: 1, pointerEvents: "none" }}
          inputProps={{ style: { textOverflow: "ellipsis" } }}
          disabled={!isSuccess}
          value={videoMetadata ? videoMetadata.videoDetails.title : "----"}
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

  children.push(
    <ListSubheader key={`group-captions`}>
      <Box sx={{ opacity: 0.8, textTransform: "uppercase" }}>Captions</Box>
    </ListSubheader>
  );

  for (const track of captionTracks) {
    const { vssId, languageCode, kind } = track;
    const value = JSON.stringify({ vssId, languageCode });
    children.push(
      <MenuItem key={value} value={value} sx={{ marginLeft: 2 }}>
        {languageCodeToName(languageCode, kind)}
      </MenuItem>
    );
  }

  for (const track of captionTracks) {
    const { vssId, languageCode, kind } = track;
    const value = JSON.stringify({ vssId, languageCode });
    children.push(
      <ListSubheader key={`group-translations-${value}`}>
        <Box sx={{ opacity: 0.8, textTransform: "uppercase" }}>
          Auto Translations ({languageCodeToName(languageCode, kind)})
        </Box>
      </ListSubheader>
    );

    for (const translation of translationLanguages) {
      const code = translation.languageCode;
      if (!FILTERED_LANGUAGE_CODES.includes(code as any)) {
        continue;
      }
      const value = JSON.stringify({
        vssId,
        languageCode,
        translationLanguageCode: code,
      });
      children.push(
        <MenuItem key={value} value={value} sx={{ marginLeft: 2 }}>
          {languageCodeToName(translation.languageCode)}
        </MenuItem>
      );
    }
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
  const children: React.ReactNode[] = [
    <MenuItem
      key=""
      value=""
      sx={{
        fontSize: "0.8rem",
        opacity: 0.5,
        display: "flex",
        justifyContent: "center",
      }}
    >
      SELECT LANGUAGE
    </MenuItem>,
  ];
  if (videoMetadata) {
    children.push(...renderCaptionConfigSelectOptions(videoMetadata));
  }
  return (
    <TextField
      {...props}
      select
      value={value ? JSON.stringify(value) : ""}
      onChange={({ target: { value } }) => {
        onChange(value ? JSON.parse(value) : undefined);
      }}
    >
      {children}
    </TextField>
  );
}
