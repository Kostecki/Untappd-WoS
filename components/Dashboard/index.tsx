import { useEffect } from "react";

import {
  Avatar,
  Box,
  Divider,
  FormControlLabel,
  FormGroup,
  IconButton,
  Switch,
  Typography,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useSession, signOut } from "next-auth/react";
import LogoutIcon from "@mui/icons-material/Logout";

import { useMobileMode } from "@/context/mobileMode";
import { useStyles } from "@/context/styles";

import CircularProgress from "../CircularProgress";
import Spinner from "../Spinner";

import styles from "./Dashboard.module.css";

export default function Dashboard() {
  const { data: session } = useSession();
  const { mobileMode } = useMobileMode();
  const {
    totalStyles,
    haveHadCount,
    loading: stylesLoading,
    showHaveHad,
    fetchStyles,
    toggleShowHaveHad,
  } = useStyles();

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
          <>
            <Avatar
              sx={{ mr: 1 }}
              alt={`${session?.user.firstName} ${session?.user.lastName}`}
              src={session?.user.image}
            />
            <Typography>
              {session?.user.firstName} {session?.user.lastName}
            </Typography>
          </>
        </Box>
        <IconButton onClick={() => signOut()} aria-label="logout">
          <LogoutIcon />
        </IconButton>
      </Box>
      <Box sx={{ my: 2 }}>
        <Divider />
      </Box>
      <Box
        sx={{ display: "flex", justifyContent: "space-between" }}
        className={styles.actions}
      >
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={showHaveHad}
                onChange={() => toggleShowHaveHad()}
              />
            }
            label='Show "have had"'
          />
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
              <CircularProgress
                checkinsPerLevel={checkinsPerLevel}
                totalStyles={totalStyles}
                haveHadCount={haveHadCount}
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
              </CircularProgress>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                py: 3,
              }}
              className={styles.styleProgress}
            >
              <CircularProgress
                checkinsPerLevel={checkinsPerLevel}
                totalStyles={totalStyles}
                haveHadCount={haveHadCount}
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
              </CircularProgress>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                py: 3,
              }}
              className={styles.styleProgress}
            >
              <CircularProgress
                checkinsPerLevel={checkinsPerLevel}
                totalStyles={totalStyles}
                haveHadCount={haveHadCount}
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
              </CircularProgress>
            </Box>
          </Box>
        )}
      </Box>
    </>
  );
}
