import { Dispatch, SetStateAction, useEffect, useState } from "react";

import Cookies from "universal-cookie";
import {
  Dialog,
  DialogTitle,
  Stack,
  TextField,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";

interface Props {
  open: boolean;
  openHandler: Dispatch<SetStateAction<boolean>>;
}

export default function SettingsModal({ open, openHandler }: Props) {
  const cookies = new Cookies();

  const [listName, setListName] = useState<string | undefined>(undefined);

  const saveHandler = () => {
    cookies.set("stockList", listName, { path: "/" });

    openHandler(false);
  };

  useEffect(() => {
    const list = cookies.get("stockList");
    if (list) {
      setListName(list);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Dialog onClose={() => openHandler(false)} open={open}>
      <DialogTitle>Account Settings</DialogTitle>
      <DialogContent>
        <Stack
          component="form"
          sx={{ my: 1, width: "50ch" }}
          spacing={2}
          noValidate
          autoComplete="off"
        >
          <TextField
            label="Personal stock list"
            id="outlined-size-small"
            placeholder="List name"
            value={listName}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setListName(event.target.value);
            }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => saveHandler()}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}
