import { Dispatch, SetStateAction, useEffect, useState } from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Select,
  SelectChangeEvent,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Box,
} from "@mui/material";
import { useLists } from "@/context/lists";
import { useStyles } from "@/context/styles";

interface Props {
  open: boolean;
  openHandler: Dispatch<SetStateAction<boolean>>;
}

export default function SettingsModal({ open, openHandler }: Props) {
  const {
    userLists,
    selectedListId,
    fetchUserLists,
    setSelectedList,
    loading,
  } = useLists();
  const { fetchStyles } = useStyles();

  const [touched, setTouched] = useState(false);

  const handleChange = (event: SelectChangeEvent) => {
    const listId = event.target.value as string;
    setSelectedList(listId);

    if (listId !== selectedListId) {
      setTouched(true);
    }
  };

  const closeHandler = () => {
    if (touched) {
      fetchStyles();
    }

    openHandler(false);
  };

  useEffect(() => {
    if (!userLists.length && open) {
      fetchUserLists();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, userLists.length]);

  return (
    <Dialog
      fullWidth
      maxWidth="xs"
      onClose={() => openHandler(false)}
      open={open}
    >
      <DialogTitle>Account Settings</DialogTitle>
      <DialogContent>
        {loading && (
          <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
            <CircularProgress />
          </Box>
        )}
        {!loading && (
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="stock-list-select-label">Stock list</InputLabel>
            <Select
              id="stock-list-select"
              label="Stock list"
              value={selectedListId}
              onChange={handleChange}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {userLists.map((list: UserList) => (
                <MenuItem key={list.list_id} value={list.list_id}>
                  {`${list.list_name} (${list.total_item_count})`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </DialogContent>
      <DialogActions sx={{ mr: 1 }}>
        <Button onClick={() => closeHandler()}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
