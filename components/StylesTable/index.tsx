import { useEffect, useState } from "react";

import {
  Box,
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

import { useStyles } from "@/context/styles";

import TR from "../TableRow";
import Spinner from "../Spinner";

export default function StylesTable() {
  const { styles, loading } = useStyles();

  const [searchInput, setSearchInput] = useState("");
  const [tableData, setTableData] = useState(styles);

  const handleChange = (input?: string) => {
    setSearchInput(input ?? "");

    if (input) {
      const result = styles.filter((style) =>
        style.style_name.toLowerCase().includes(input.toLowerCase())
      );
      setTableData(result);
    } else {
      setTableData(styles);
    }
  };

  const handleClickClear = () => handleChange("");
  const handleMouseDownClear = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
  };

  useEffect(() => {
    if (styles) {
      setTableData(styles);
    }
  }, [styles]);

  return (
    <TableContainer
      component={Paper}
      sx={{ position: "relative", maxHeight: document.body.scrollHeight - 100 }}
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
          {!loading && (
            <>
              {tableData.map((style) => (
                <TR key={style.style_id} style={style} />
              ))}
            </>
          )}
        </TableBody>
      </Table>
      {loading && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            py: 5,
          }}
        >
          <Spinner />
        </Box>
      )}
    </TableContainer>
  );
}
