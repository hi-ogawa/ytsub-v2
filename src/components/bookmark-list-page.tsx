import { Box, Icon, IconButton, Paper, Typography } from "@mui/material";
import * as React from "react";
import { useBookmarkEntries } from "../utils/storage";
import { BookmarkEntry } from "../utils/types";

// TODO
// - polish UI
// - group by watchParameters
// - open in mini player

export function BookmarkListPage() {
  const [entries, _, removeEntry] = useBookmarkEntries();

  function onRemoveEntry(entry: BookmarkEntry) {
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
          <Typography fontSize={24}>Bookmarks</Typography>
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
              <Paper
                key={entry.bookmarkText}
                square
                variant="outlined"
                sx={{ padding: 1, display: "flex", alignItems: "center" }}
              >
                <Box sx={{ flex: "1 0 auto" }}>{entry.bookmarkText}</Box>
                <IconButton
                  sx={{ flex: "0 0 auto" }}
                  onClick={() => onRemoveEntry(entry)}
                >
                  <Icon>close</Icon>
                </IconButton>
              </Paper>
            ))}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
