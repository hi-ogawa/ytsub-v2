import { useSnackbar } from "notistack";
import * as React from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { parseVideoId } from "../utils/youtube";

const SHARE_TARGET_TEXT = "share-target-text";

export function ShareTargetPage() {
  const [params] = useSearchParams();
  const { enqueueSnackbar } = useSnackbar();

  let to: string | undefined = undefined;
  const shareTargetText = params.get(SHARE_TARGET_TEXT);
  if (shareTargetText) {
    const videoId = parseVideoId(shareTargetText);
    if (videoId) {
      to = `/setup/${videoId}`;
    }
  }

  React.useEffect(() => {
    if (!to) {
      enqueueSnackbar("Failed to load share data", { variant: "error" });
    }
  }, []);

  return <Navigate to={to ?? "/"} />;
}
