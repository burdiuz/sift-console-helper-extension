import Button from "@mui/joy/Button";
import Table from "@mui/joy/Table";
import { useState } from "react";
import ClearIcon from "@mui/icons-material/Clear";
import { Box, Input } from "@mui/joy";
import { HeightProvider } from "shared/HeightProvider";
import { ValuesTable } from "./ValuesTable";

export const List = ({
  values,
  overrides,
  onClear,
  onOverride,
  onClearAll,
}) => {
  const [filter, setFilter] = useState("");

  return (
    <Box>
      <Table>
        <thead>
          <tr>
            <th>
              <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span>Feature Flag</span>{" "}
                <Input
                  placeholder="Filter by name"
                  sx={{ flex: 1 }}
                  value={filter}
                  onChange={({ currentTarget: { value } }) => setFilter(value)}
                  endDecorator={
                    filter ? (
                      <Button variant="plain" onClick={() => setFilter("")}>
                        <ClearIcon />
                      </Button>
                    ) : null
                  }
                />
              </Box>
            </th>
            <th style={{ width: "200px" }}>Value</th>
            <th style={{ width: "45px" }}>
              {
                <Button
                  variant="soft"
                  color="primary"
                  onClick={() => onClearAll()}
                  title="Clear all feature flag overrides"
                  disabled={!Object.keys(overrides).length}
                >
                  <ClearIcon />
                </Button>
              }
            </th>
          </tr>
        </thead>
      </Table>
      <HeightProvider reservedTop={95}>
        {(ref, height) => (
          <Box ref={ref} style={{ height: `${height}px`, overflow: "auto" }}>
            <Box>
              <ValuesTable
                filter={filter}
                values={values}
                overrides={overrides}
                onOverride={onOverride}
                onClear={onClear}
              />
            </Box>
          </Box>
        )}
      </HeightProvider>
    </Box>
  );
};
