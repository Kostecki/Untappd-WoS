import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

interface Props {
  amount?: number;
}

export default function LastXBadgeBeers({ amount = 5 }: Props) {
  return (
    <Box>
      <Typography variant="h5" sx={{ mt: 3, mb: 2 }}>
        Last {amount} badge beer{amount !== 1 ? "s" : ""}
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Brewery</TableCell>
            <TableCell>Style</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>Tysker Havn</TableCell>
            <TableCell>Hvide Sande Bryghus</TableCell>
            <TableCell>Non-Alcoholic Beer - Pale Ale</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Box>
  );
}
