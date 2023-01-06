import React, { useEffect, useState } from "react";
import { useCookies } from "react-cookie";

import {
  Container,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Switch,
  Button,
  FormGroup,
  FormControlLabel,
  Avatar,
  IconButton,
  Divider,
} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import LogoutIcon from "@mui/icons-material/Logout";

import Login from "./Components/Login";
import TR from "./Components/TableRow";
import Auth from "./Auth/Auth";
import CustomTextProgressbar from "./Components/CustomTextProgressbar";
import Spinner from "./Components/Spinner";

import "react-circular-progressbar/dist/styles.css";
import "./App.css";

function App() {
  const [cookies, removeCookie] = useCookies(["wheel-of-styles"]);

  const apiBaseURL = "https://api.untappd.com/v4";
  const checkinsPerLevel = 5;
  const totalStyles = 244;

  const [authData, setAuthData] = useState({
    username: null,
    password: null,
    accessToken: null,
  });

  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [haveHadCount, setHaveHadCount] = useState(0);
  const [styles, setStyles] = useState(null);
  const [showHaveHad, setShowHaveHad] = useState(false);

  const calcLeftToNextLevel = () => haveHadCount % checkinsPerLevel;

  const getUserInfo = () => {
    if (authData.accessToken && authData.accessToken !== "undefined") {
      setLoading(true);

      fetch(`${apiBaseURL}/user/info?access_token=${authData.accessToken}`)
        .then((response) => response.json())
        .then((data) => setUserData(data.response.user));
    }
  };

  const getStylesHad = () => {
    if (authData.accessToken && authData.accessToken !== "undefined") {
      setLoading(true);

      fetch(
        `${apiBaseURL}/badges/view/995171674?access_token=${authData.accessToken}`
      )
        .then((response) => response.json())
        .then((data) => {
          const items = data.response.badge.special_status_list.items[0].items;

          setHaveHadCount(items.length);
          const stylesHad = items.map((style) => ({
            style_id: style.item_id,
            style_name: style.item_name,
            had: true,
          }));

          getStylesNotHad(stylesHad);
        });
    }
  };

  const getStylesNotHad = (stylesHad) => {
    setLoading(true);

    fetch(
      `${apiBaseURL}/badges/styles_not_had?access_token=${authData.accessToken}`
    )
      .then((response) => response.json())
      .then((data) => {
        const items = data.response.items;
        const stylesNotHad = items.map((style) => ({
          style_id: style.style_id,
          style_name: style.style_name,
          had: false,
        }));

        let payload = [...stylesHad, ...stylesNotHad];
        payload.sort((a, b) =>
          a.style_name > b.style_name ? 1 : b.style_name > a.style_name ? -1 : 0
        );
        setStyles(payload);

        setLoading(false);
      })
      .catch((error) => console.error("Error:", error));
  };

  const toggleHaveHad = (event) => {
    setShowHaveHad(event.target.checked);
  };

  const logOut = () => {
    removeCookie("accessToken");
    setAuthData({ username: null, password: null, accessToken: null });
    setStyles(null);
    setUserData(null);
  };

  useEffect(() => {
    if (cookies.accessToken && cookies.accessToken !== "undefined") {
      setAuthData({ ...authData, accessToken: cookies.accessToken });
      setLoading(false);
    }

    if (!userData) {
      getUserInfo();
    }

    if (!styles) {
      getStylesHad();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cookies, authData.accessToken]);

  return (
    <div className="App">
      <header className="App-header">
        <Auth
          baseURL={apiBaseURL}
          authData={authData}
          setAuthData={setAuthData}
          setLoading={setLoading}
        />

        {!loading &&
          (!authData.accessToken || authData.accessToken === "undefined") && (
            <Login authData={authData} setAuthData={setAuthData} />
          )}
        {loading && (
          <Box sx={{ display: "flex", m: 2 }}>
            <Spinner />
          </Box>
        )}

        {!loading &&
          styles &&
          styles.length > 0 &&
          userData &&
          userData.first_name && (
            <Container>
              <Grid container spacing={2}>
                <Grid xs={6} sx={{ my: 3 }}>
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
                        {styles.map((style) => {
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
                </Grid>
                <Grid xs={6} sx={{ my: 2, p: 2 }}>
                  <Paper sx={{ mb: 2, p: 2 }}>
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
                    >
                      <FormGroup>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={showHaveHad}
                              onChange={toggleHaveHad}
                            />
                          }
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
                      <Typography variant="h6" sx={{ textAlign: "left" }}>
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
                        >
                          <CustomTextProgressbar
                            strokeWidth={4}
                            value={Math.floor(haveHadCount / checkinsPerLevel)}
                            maxValue={Math.floor(
                              styles.length / checkinsPerLevel
                            )}
                          >
                            <div
                              style={{
                                fontSize: 16,
                                fontWeight: "bold",
                                marginBottom: 4,
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
                        >
                          <CustomTextProgressbar
                            strokeWidth={4}
                            value={haveHadCount}
                            maxValue={totalStyles}
                          >
                            <div
                              style={{
                                fontSize: 16,
                                fontWeight: "bold",
                                marginBottom: 4,
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
                              Missing: {totalStyles - haveHadCount}
                            </div>
                          </CustomTextProgressbar>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            py: 3,
                          }}
                        >
                          <CustomTextProgressbar
                            strokeWidth={4}
                            value={calcLeftToNextLevel()}
                            maxValue={checkinsPerLevel}
                          >
                            <div
                              style={{
                                fontSize: 16,
                                fontWeight: "bold",
                                marginBottom: 4,
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
                  </Paper>
                </Grid>
              </Grid>
            </Container>
          )}
      </header>
    </div>
  );
}

export default App;
