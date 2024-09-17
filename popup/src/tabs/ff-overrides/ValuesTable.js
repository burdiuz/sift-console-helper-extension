import Button from "@mui/joy/Button";
import Table from "@mui/joy/Table";
import { useMemo } from "react";
import ClearIcon from "@mui/icons-material/Clear";
import { renderInputByValueType } from "./FFInput";

const createSortFn = (values, overrides) => (a, b) => {
  if (!(a.name in values) && !(b.name in values)) {
    return a.name > b.name ? 1 : -1;
  }

  if (!(a.name in values)) {
    return -1;
  }

  if (!(b.name in values)) {
    return 1;
  }

  if (
    (a.name in overrides && b.name in overrides) ||
    (!(a.name in overrides) && !(b.name in overrides))
  ) {
    return a.name > b.name ? 1 : -1;
  }

  if (!(a.name in overrides)) {
    return 1;
  }

  if (!(b.name in overrides)) {
    return -1;
  }
};

const valueToString = (value) => {
  switch (value) {
    case true:
      return "Enabled";
    case false:
      return "Disabled";
    default:
      return JSON.stringify(value);
  }
};

export const ValuesTable = ({
  filter,
  values,
  overrides,
  onOverride,
  onClear,
}) => {
  const list = useMemo(
    () =>
      Object.entries({ ...values, ...overrides })
        .map(([name, value]) => ({
          name,
          value,
        }))
        .sort(createSortFn(values, overrides)),
    [values, overrides]
  );

  return (
    <Table>
      <tbody>
        <tr style={{ visibility: "hidden" }}>
          <td style={{ height: "0px", padding: 0 }}></td>
          <td style={{ height: "0px", padding: 0, width: "200px" }}></td>
          <td style={{ height: "0px", padding: 0, width: "45px" }}></td>
        </tr>
        {list.map(({ name, value }) => {
          if (filter && !name.includes(filter)) {
            return null;
          }

          return (
            <tr key={name}>
              <td
                style={{
                  borderLeft:
                    name in values
                      ? ""
                      : "2px solid var(--joy-palette-primary-solidBg)",
                }}
              >
                {name}&nbsp;
                {name in values && value !== values[name] ? (
                  <span
                    style={{
                      color: "var(--joy-palette-neutral-plainDisabledColor)",
                    }}
                  >
                    ( {valueToString(values[name])} )
                  </span>
                ) : null}
              </td>
              <td>
                {renderInputByValueType(
                  value,
                  (newValue) => onOverride(name, newValue),
                  true
                )}
              </td>
              <td>
                {name in overrides ? (
                  <Button
                    variant="soft"
                    color="primary"
                    onClick={() => onClear(name)}
                    title="Clear feature flag override"
                  >
                    <ClearIcon />
                  </Button>
                ) : null}
              </td>
            </tr>
          );
        })}
        <tr>
          <td colSpan={3}></td>
        </tr>
      </tbody>
    </Table>
  );
};
