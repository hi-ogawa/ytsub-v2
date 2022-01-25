import {
  Box,
  CardContent,
  CardMedia,
  Icon,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";
import { last } from "lodash";
import * as React from "react";
import type { Dispatch } from "react";
import { useHistoryEntries } from "../utils/storage";
import { HistoryEntry } from "../utils/types";
import { useNavigateCustom } from "../utils/url";

export function WatchHistoryPage() {
  const [entries, addEntry, removeEntry] = useHistoryEntries();
  const navigate = useNavigateCustom();

  function onPlayEntry(entry: HistoryEntry) {
    addEntry(entry);
    navigate("/watch", entry.watchParameters);
  }

  function onRemoveEntry(entry: HistoryEntry) {
    removeEntry(entry);
  }

  return (
    <Box
      sx={{ padding: 1, height: 1, display: "flex", justifyContent: "center" }}
    >
      <Paper
        variant="outlined"
        square
        sx={{
          height: 1,
          flex: "1 0 auto",
          maxWidth: "500px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            flex: "0 0 auto",
            padding: 1.5,
            backgroundColor: "grey.100",
          }}
        >
          <Typography fontSize={24}>History</Typography>
        </Box>
        <Box
          sx={{
            flex: "1 0 0",
            overflowY: "auto",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              padding: 1.5,
              gap: 1,
            }}
          >
            {entries.map((entry) => (
              <HistoryEntryComponent
                key={JSON.stringify(entry.watchParameters)}
                entry={entry}
                onPlayEntry={onPlayEntry}
                onRemoveEntry={onRemoveEntry}
              />
            ))}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

function HistoryEntryComponent({
  entry,
  onPlayEntry,
  onRemoveEntry,
}: {
  entry: HistoryEntry;
  onPlayEntry: Dispatch<HistoryEntry>;
  onRemoveEntry: Dispatch<HistoryEntry>;
}) {
  const { title, author, thumbnail } = entry.videoDetails;
  // TODO: layout consistently
  return (
    <Paper
      variant="outlined"
      square
      sx={{
        height: "120px",
        display: "flex",
      }}
    >
      <CardMedia
        // TODO: wrap with react-router Link
        component="img"
        image={last(thumbnail.thumbnails)!.url}
        onClick={() => onPlayEntry(entry)}
        sx={{ height: "118px", cursor: "pointer" }}
      />
      <CardContent sx={{ display: "flex", flexDirection: "column" }}>
        <Box
          // TODO: Limit number of lines
          sx={{ fontSize: 14, cursor: "pointer" }}
          onClick={() => onPlayEntry(entry)}
        >
          {title}
        </Box>
        <Box sx={{ display: "flex", justifyContent: "stretch" }}>
          <Box sx={{ flex: "1 1 auto", fontSize: 12, color: "grey.700" }}>
            {author}
          </Box>
          <IconButton
            sx={{ flex: "0 0 auto" }}
            onClick={() => onRemoveEntry(entry)}
          >
            <Icon>close</Icon>
          </IconButton>
        </Box>
      </CardContent>
    </Paper>
  );
}
