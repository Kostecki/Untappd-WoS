import {
  Avatar,
  Box,
  Button,
  Divider,
  FormControlLabel,
  FormGroup,
  IconButton,
  Switch,
  Typography,
} from "@mui/material";
import { useSession, signOut } from "next-auth/react";
import LogoutIcon from "@mui/icons-material/Logout";

import { useMobileMode } from "@/context/mobileMode";

import CircularProgress from "../CircularProgress";

export default function Dashboard() {
  const { data: session } = useSession();
  const { mobileMode } = useMobileMode();

  const checkinsPerLevel = 5;
  const haveHadCount = 158; // TODO: API
  const totalStyles = 252; // TODO: API

  const calcLeftToNextLevel = () => haveHadCount % checkinsPerLevel;

  // TODO: Make toggle work
  const showHaveHad = false;
  const toggleHaveHad = () => {
    console.log("toggleHaveHad");
  };
  const refreshData = () => {
    console.log("refreshData");
  };

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
        className="actions"
      >
        <FormGroup>
          <FormControlLabel
            control={<Switch checked={showHaveHad} onChange={toggleHaveHad} />}
            label='Show "have had"'
          />
        </FormGroup>
        <Button variant="outlined" onClick={refreshData}>
          Refresh data
        </Button>
      </Box>
      <Box sx={{ my: 2 }}>
        <Divider />
      </Box>
      <Box>
        <Typography
          variant="h6"
          sx={{ textAlign: "left" }}
          className="badge-title"
        >
          Wheel of Styles
        </Typography>
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
            className="style-progress"
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
            className="style-progress"
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
            className="style-progress"
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
      </Box>
    </>
  );
}
