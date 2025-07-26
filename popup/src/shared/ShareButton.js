import { Button } from "@mui/joy";
import Icon from "@mui/icons-material/IosShareOutlined";
import { useSnackbars } from "./Snackbars";

export const ShareButton = ({
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
        navigator.clipboard.writeText(value);
        message && showSnackbar(message);
      }}
    >
      <Icon />
      {children}
    </Button>
  );
};
