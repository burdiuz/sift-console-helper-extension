import { Typography } from "@mui/joy";

export const ConfirmationText = () => (
  <Typography sx={{ textAlign: "center" }}>
    This extension is still in development. It alters core browser
    functionalities like fetch() function, used to communicate with API, and
    might affect application stability. If you see an unusual behavior, please
    try to disable this extension in browser settings.
  </Typography>
);
