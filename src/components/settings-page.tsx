import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useSnackbar } from "notistack";
import * as React from "react";
import {
  FILTERED_LANGUAGE_CODES,
  LanguageCode,
  languageCodeToName,
} from "../utils/language";
import { useLanguageSetting } from "../utils/storage";

function LanguageSelect({
  languageCodes,
  ...props
}: {
  languageCodes: LanguageCode[];
} & TextFieldProps) {
  return (
    <TextField {...props} select SelectProps={{ native: true }}>
      <option key="" value="" disabled />
      {languageCodes.map((code) => (
        <option key={code} value={code}>
          {languageCodeToName(code)}
        </option>
      ))}
    </TextField>
  );
}

export function SettingsPage() {
  const [languageSetting, setLanguageSetting] = useLanguageSetting();
  const [language1, setLanguage1] = React.useState<string>(
    languageSetting.language1 ?? ""
  );
  const [language2, setLanguage2] = React.useState<string>(
    languageSetting.language2 ?? ""
  );
  const { enqueueSnackbar } = useSnackbar();

  const changed =
    languageSetting.language1 !== language1 ||
    languageSetting.language2 !== language2;
  const valid =
    FILTERED_LANGUAGE_CODES.includes(language1 as any) &&
    FILTERED_LANGUAGE_CODES.includes(language2 as any);

  function onUpdate() {
    setLanguageSetting({ language1, language2 } as any);
    enqueueSnackbar("Successfuly updated", { variant: "success" });
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
      <Paper
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
        <Typography variant="h5">Settings</Typography>
        <LanguageSelect
          languageCodes={FILTERED_LANGUAGE_CODES}
          label="1st language"
          value={language1}
          onChange={({ target: { value } }) => setLanguage1(value as string)}
        />
        <LanguageSelect
          languageCodes={FILTERED_LANGUAGE_CODES}
          label="2nd language"
          value={language2}
          onChange={({ target: { value } }) => setLanguage2(value as string)}
        />
        <Button
          variant="contained"
          disabled={!changed || !valid}
          onClick={onUpdate}
        >
          Update
        </Button>
      </Paper>
    </Box>
  );
}
