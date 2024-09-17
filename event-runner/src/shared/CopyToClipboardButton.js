import { Button } from "@mui/joy";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useSnackbars } from "./Snackbars";

export const CopyToClipboardButton = ({
  value,
  children,
  message,
  ...props
}) => {
  const { showSnackbar } = useSnackbars();

  return (
    <Button
      variant="plain"
      {...props}
      onClick={() => {
        navigator.clipboard.writeText(JSON.stringify(value, null, 2));
        message && showSnackbar(message);
      }}
    >
      <ContentCopyIcon />
      {children ? <>&nbsp;{children}</> : null}
    </Button>
  );
};
