import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import TR from "../TableRow";

function StylesTable({ data, showHaveHad, apiBaseURL, authData }) {
  return (
    <TableContainer
      component={Paper}
      sx={{ maxHeight: document.body.scrollHeight - 100 }}
    >
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>Style</TableCell>
            <TableCell align="center" sx={{ width: 100 }}>
              Have Had
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((style) => {
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
