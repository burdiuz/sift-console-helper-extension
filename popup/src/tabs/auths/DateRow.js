import Box from "@mui/joy/Box";
import Divider from "@mui/joy/Divider";

export const DateRow = ({ date }) => (
  <tr>
    <td colSpan={4}>
      <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <Divider sx={{ flex: "1" }} />
        {new Date(date).toLocaleDateString()}
        <Divider sx={{ flex: "1" }} />
      </Box>
    </td>
  </tr>
);
