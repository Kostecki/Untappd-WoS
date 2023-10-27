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
  FormGroup,
  FormControlLabel,
  Switch,
  Typography,
  Link,
  Tooltip,
} from "@mui/material";

import { useSettings } from "@/context/settings";
import { useLists } from "@/context/lists";
import { useStyles } from "@/context/styles";

interface Props {
  open: boolean;
  openHandler: Dispatch<SetStateAction<boolean>>;
}

export default function SettingsModal({ open, openHandler }: Props) {
  const {
    saveSettings,
    stockList: settingsStockList,
    featureCountryBadges,
  } = useSettings();
  const { userLists, fetchUserLists, loading } = useLists();
  const { fetchStyles } = useStyles();

  const [touched, setTouched] = useState(false);
  const [stockList, setStockList] = useState<StockList | undefined>(undefined);
  const [countryBadges, setCountryBadges] = useState(false);

  const handleListUpdate = (event: SelectChangeEvent) => {
    const listId = parseInt(event.target.value as string);
    const listName = userLists.find(
      (list) => list.list_id === listId
    )?.list_name;

    setStockList({ listId, listName });

    if (listId !== settingsStockList?.listId) {
      setTouched(true);
    }
  };

  const handleChange = () => {
    saveSettings({
      stockList,
      featureCountryBadges: countryBadges,
    });

    if (touched) {
      fetchStyles(stockList?.listId);
      setTouched(false);
    }

    openHandler(false);
  };

  useEffect(() => {
    setStockList(settingsStockList);
    setCountryBadges(featureCountryBadges);

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
              value={stockList?.listId ? stockList?.listId?.toString() : ""}
              onChange={handleListUpdate}
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
        <Box sx={{ mt: 4 }}>
          <Typography sx={{ fontWeight: "bold" }}>Extra features</Typography>
          <FormGroup sx={{ mt: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={countryBadges}
                  onChange={(_event, checked) => setCountryBadges(checked)}
                />
              }
              label="Country badges"
            />
          </FormGroup>
        </Box>
      </DialogContent>
      <DialogActions
        sx={{ ml: 2, mr: 1, display: "flex", justifyContent: "space-between" }}
      >
        <Tooltip title={process.env.COMMIT_MESSAGE} arrow>
          <Link
            href={`https://github.com/Kostecki/Untappd-WoS/commit/${process.env.COMMIT_HASH}`}
            target="_blank"
            variant="caption"
            sx={{ fontStyle: "italic" }}
          >
            Commit: {process.env.COMMIT_HASH}
          </Link>
        </Tooltip>
        <Button onClick={handleChange}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}
