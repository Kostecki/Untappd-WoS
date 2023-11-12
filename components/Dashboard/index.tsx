import { useEffect, useState } from "react";

import {
  Avatar,
  Box,
  Divider,
  FormControlLabel,
  FormGroup,
  IconButton,
  Link,
  Switch,
  Typography,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useSession, signOut } from "next-auth/react";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";

import { useMobileMode } from "@/context/mobileMode";
import { useStyles } from "@/context/styles";
import { useSettings } from "@/context/settings";

import CircularStatus from "../CircularStatus";
import Spinner from "../Spinner";
import SettingsModal from "../SettingsModal";

import styles from "./Dashboard.module.css";

export default function Dashboard() {
  const { data: session } = useSession();
  const { mobileMode } = useMobileMode();
  const {
    totalStyles,
    haveHadCount,
    loading: stylesLoading,
    showHaveHad,
    showOnlyOnList,
    fetchStyles,
    toggleShowHaveHad,
    toggleShowOnlyOnList,
  } = useStyles();
  const { stockList } = useSettings();

  const [showSettings, setShowSettings] = useState(false);

  const checkinsPerLevel = 5;

  const calcLeftToNextLevel = () => haveHadCount % checkinsPerLevel;
  const refreshData = () => fetchStyles();

  useEffect(() => {
    if (totalStyles === 0) {
      fetchStyles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <Link
            href={session?.user.untappdUrl}
            target="_blank"
            sx={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
              color: "black",
            }}
          >
            <Avatar
              sx={{ mr: 1 }}
              alt={`${session?.user.firstName} ${session?.user.lastName}`}
              src={session?.user.image}
            />
            <Typography>
              {session?.user.firstName} {session?.user.lastName}
            </Typography>
          </Link>
        </Box>
        <Box>
          <IconButton sx={{ mr: 1 }} onClick={() => setShowSettings(true)}>
            <SettingsIcon />
          </IconButton>
          <IconButton
            onClick={() => signOut({ redirect: false })}
            aria-label="logout"
          >
            <LogoutIcon />
          </IconButton>
        </Box>
      </Box>
      <Box sx={{ my: 2 }}>
        <Divider />
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
        className={styles.actions}
      >
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={showHaveHad}
                disabled={showOnlyOnList}
                onChange={(event) => toggleShowHaveHad(event.target.checked)}
              />
            }
            label='Show "have had"'
          />
          {stockList?.listName && (
            <FormControlLabel
              control={
                <Switch
                  checked={showOnlyOnList}
                  onChange={(event) => {
                    const state = event.target.checked;
                    if (state) {
                      toggleShowHaveHad(false);
                    }

                    toggleShowOnlyOnList(state);
                  }}
                />
              }
              label={`Show only missing and also on list: ${stockList?.listName}`}
            />
          )}
        </FormGroup>

        <LoadingButton
          variant="outlined"
          loading={stylesLoading}
          onClick={refreshData}
        >
          Refresh data
        </LoadingButton>
      </Box>
      <Box sx={{ my: 2 }}>
        <Divider />
      </Box>
      <Box className={styles.progressCircles}>
        {stylesLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", pt: 3, pb: 1 }}>
            <Spinner height={145} />
          </Box>
        )}
        {!stylesLoading && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                py: 3,
              }}
              className={styles.styleProgress}
            >
              <CircularStatus
                currentValue={Math.floor(haveHadCount / checkinsPerLevel)}
                maxValue={Math.floor(totalStyles / checkinsPerLevel)}
                mobile={mobileMode}
              >
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    marginBottom: 4,
                    position: mobileMode ? "absolute" : "relative",
                    top: mobileMode ? "-50px" : "unset",
                    textAlign: "center",
                  }}
                >
                  Badge progress
                </div>
                <div style={{ fontSize: 14 }}>
                  {Math.floor(haveHadCount / checkinsPerLevel)}
                  {" / "}
                  {Math.floor(totalStyles / checkinsPerLevel)}
                </div>
              </CircularStatus>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                py: 3,
              }}
              className={styles.styleProgress}
            >
              <CircularStatus
                currentValue={haveHadCount}
                maxValue={totalStyles}
                mobile={mobileMode}
              >
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    marginBottom: 4,
                    position: mobileMode ? "absolute" : "relative",
                    top: mobileMode ? "-50px" : "unset",
                    textAlign: "center",
                  }}
                >
                  Style progress
                </div>
                <div style={{ fontSize: 14 }}>
                  {haveHadCount} / {totalStyles}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    marginTop: 5,
                    fontStyle: "italic",
                    textAlign: "center",
                  }}
                >
                  Missing: {mobileMode && <br />} {totalStyles - haveHadCount}
                </div>
              </CircularStatus>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                py: 3,
              }}
              className={styles.styleProgress}
            >
              <CircularStatus
                currentValue={calcLeftToNextLevel()}
                maxValue={checkinsPerLevel}
                mobile={mobileMode}
              >
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    marginBottom: 4,
                    position: mobileMode ? "absolute" : "relative",
                    top: mobileMode ? "-50px" : "unset",
                    textAlign: "center",
                  }}
                >
                  Level progress
                </div>
                <div style={{ fontSize: 14 }}>
                  {calcLeftToNextLevel()} / {checkinsPerLevel}
                </div>
              </CircularStatus>
            </Box>
          </Box>
        )}
      </Box>

      <SettingsModal open={showSettings} openHandler={setShowSettings} />
    </>
  );
}
