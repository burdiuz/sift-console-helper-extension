import { Button } from "@mui/joy";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useSnackbars } from "./Snackbars";

export const CopyToClipboardButton = ({
  value,
  message,
  children,
  variant = "plain",
  ...props
}) => {
  const { showSnackbar } = useSnackbars();

  return (
    <Button
      variant={variant}
      {...props}
      onClick={() => {
        navigator.clipboard.writeText(JSON.stringify(value, null, 2));
        message && showSnackbar(message);
      }}
    >
      <ContentCopyIcon />
      {children}
    </Button>
  );
};
