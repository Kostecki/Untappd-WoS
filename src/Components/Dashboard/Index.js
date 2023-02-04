import {
  Box,
  Typography,
  Switch,
  Button,
  FormGroup,
  FormControlLabel,
  Avatar,
  IconButton,
  Divider,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";

import CustomTextProgressbar from "../CustomTextProgressbar";

import "./Dashboard.css";

function Dashboard({
  userData,
  logOut,
  showHaveHad,
  toggleHaveHad,
  getStylesHad,
  haveHadCount,
  checkinsPerLevel,
  styles,
  isMobile,
  totalStyles,
  calcLeftToNextLevel,
}) {
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
          <Avatar
            sx={{ mr: 1 }}
            alt={`${userData.first_name} ${userData.last_name}`}
            src={userData.user_avatar}
          />
          <Typography>
            {userData.first_name} {userData.last_name}
          </Typography>
        </Box>
        <IconButton onClick={logOut} aria-label="logout">
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
        <Button variant="outlined" onClick={getStylesHad}>
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
            <CustomTextProgressbar
              strokeWidth={4}
              value={Math.floor(haveHadCount / checkinsPerLevel)}
              maxValue={Math.floor(styles.length / checkinsPerLevel)}
              mobile={isMobile}
            >
              <div
                style={{
                  fontSize: 16,
                  fontWeight: "bold",
                  marginBottom: 4,
                  position: isMobile ? "absolute" : "relative",
                  top: isMobile ? "-50px" : "unset",
                }}
              >
                Level progress
              </div>
              <div style={{ fontSize: 14 }}>
                {Math.floor(haveHadCount / checkinsPerLevel)}
                {" / "}
                {Math.floor(styles.length / checkinsPerLevel)}
              </div>
            </CustomTextProgressbar>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              py: 3,
            }}
            className="style-progress"
          >
            <CustomTextProgressbar
              strokeWidth={4}
              value={haveHadCount}
              maxValue={totalStyles}
              mobile={isMobile}
            >
              <div
                style={{
                  fontSize: 16,
                  fontWeight: "bold",
                  marginBottom: 4,
                  position: isMobile ? "absolute" : "relative",
                  top: isMobile ? "-50px" : "unset",
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
                }}
              >
                Missing: {isMobile && <br />} {totalStyles - haveHadCount}
              </div>
            </CustomTextProgressbar>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              py: 3,
            }}
            className="style-progress"
          >
            <CustomTextProgressbar
              strokeWidth={4}
              value={calcLeftToNextLevel()}
              maxValue={checkinsPerLevel}
              mobile={isMobile}
            >
              <div
                style={{
                  fontSize: 16,
                  fontWeight: "bold",
                  marginBottom: 4,
                  position: isMobile ? "absolute" : "relative",
                  top: isMobile ? "-50px" : "unset",
                }}
              >
                To next level
              </div>
              <div style={{ fontSize: 14 }}>
                {calcLeftToNextLevel()} / {checkinsPerLevel}
              </div>
            </CustomTextProgressbar>
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default Dashboard;
