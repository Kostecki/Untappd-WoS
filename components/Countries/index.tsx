import { useEffect, useState } from "react";

import {
  Box,
  Divider,
  FormControlLabel,
  FormGroup,
  LinearProgress,
  LinearProgressProps,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  Tooltip,
  Typography,
} from "@mui/material";

import { useCountries } from "@/context/countries";

import Spinner from "../Spinner";

export default function Countries() {
  const { countryBadges, fetchCountries, loading } = useCountries();

  const [showUnlocked, setShowUnlocked] = useState(false);

  const randomIndex = (country: any) => {
    const flags = country.flag.length;
    return flags === 1 ? 0 : Math.floor(Math.random() * (flags - 1));
  };

  useEffect(() => {
    fetchCountries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function LinearProgressWithLabel(
    props: LinearProgressProps & { value: number }
  ) {
    return (
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Box sx={{ width: "100%", mr: 1 }}>
          <LinearProgress variant="determinate" {...props} />
        </Box>
        <Box sx={{ minWidth: 55 }}>
          <Typography variant="body2" color="text.secondary">{`${Math.round(
            props.value
          )} / 100`}</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h5">Countries</Typography>
        <FormGroup>
          <FormControlLabel
            sx={{ m: 0 }}
            control={
              <Switch
                checked={showUnlocked}
                onChange={() =>
                  setShowUnlocked((showUnlocked) => !showUnlocked)
                }
              />
            }
            label="Show unlocked"
          />
        </FormGroup>
      </Box>
      <Box sx={{ mt: 2, mb: 2 }}>
        <Divider />
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Box style={{ width: "100%" }}>
          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
              <Spinner height={150} />
            </Box>
          )}
          <List>
            {!loading &&
              countryBadges.map((country, i, arr) => {
                if (showUnlocked || country.level === 0) {
                  return (
                    <Tooltip
                      key={country.badgeId}
                      title={country.badgeHint}
                      placement="left"
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      >
                        <ListItem disablePadding divider={arr.length - 1 !== i}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              width: "80%",
                              mr: 2,
                            }}
                          >
                            <ListItemIcon
                              sx={{ color: "initial", minWidth: 40 }}
                            >
                              {country.flag[randomIndex(country)]}
                            </ListItemIcon>
                            <ListItemText>{country.badgeName}</ListItemText>
                          </Box>
                          <Box sx={{ width: "100%" }}>
                            <LinearProgressWithLabel value={country.level} />
                          </Box>
                        </ListItem>
                      </Box>
                    </Tooltip>
                  );
                }
              })}
          </List>
        </Box>
      </Box>
    </>
  );
}
