import { useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import TR from "../TableRow";

function StylesTable({ data, showHaveHad, apiBaseURL, authData }) {
  const [tableData, setTableData] = useState(data);
  const [searchInput, setSearchInput] = useState("");

  const handleChange = (input) => {
    setSearchInput(input);

    if (input) {
      const result = data.filter((e) =>
        e.style_name.toLowerCase().includes(input)
      );
      setTableData(result);
    } else {
      setTableData(data);
    }
  };

  const handleClickClear = () => handleChange("");
  const handleMouseDownClear = (event) => event.preventDefault();

  return (
    <TableContainer
      component={Paper}
      sx={{ maxHeight: document.body.scrollHeight - 100 }}
    >
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>
              <TextField
                value={searchInput}
                label="Style"
                variant="standard"
                size="small"
                onChange={(event) => {
                  handleChange(event.target.value);
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleClickClear}
                        onMouseDown={handleMouseDownClear}
                      >
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </TableCell>
            <TableCell align="center" sx={{ width: 100 }}>
              Have Had
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tableData.map((style) => {
            if (showHaveHad) {
              return (
                <TR
                  key={style.style_id}
                  style={style}
                  apiBaseURL={apiBaseURL}
                  authData={authData}
                />
              );
            } else if (!style.had) {
              return (
                <TR
                  key={style.style_id}
                  style={style}
                  apiBaseURL={apiBaseURL}
                  authData={authData}
                />
              );
            } else {
              return "";
            }
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default StylesTable;
