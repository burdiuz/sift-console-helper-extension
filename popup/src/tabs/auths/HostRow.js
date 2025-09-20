import Box from "@mui/joy/Box";
import Divider from "@mui/joy/Divider";

export const HostRow = ({ host }) => (
  <tr>
    <td colSpan={4}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: (theme) => theme.vars.palette.background.level2,
        }}
      >
        <Divider sx={{ flex: "1" }} />
        {host || "Other"}
        <Divider sx={{ flex: "1" }} />
      </Box>
    </td>
  </tr>
);
