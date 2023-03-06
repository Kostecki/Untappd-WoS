import React, { useEffect, useState } from "react";
import { useCookies } from "react-cookie";

import { Container, Box, Paper } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import { debounce } from "@mui/material/utils";

import Auth from "./Auth/Auth";
import Spinner from "./Components/Spinner";
import Login from "./Components/Login";
import StylesTable from "./Components/StylesTable";
import Dashboard from "./Components/Dashboard/Index";
import VenueSearch from "./Components/VenueSearch";
import Scanner from "./Components/Scanner";

import "react-circular-progressbar/dist/styles.css";
import "./App.css";

function App() {
  const [cookies, setCookie, removeCookie] = useCookies(["wheel-of-styles"]);

  const apiBaseURL = "https://api.untappd.com/v4";

  const [authData, setAuthData] = useState({
    username: null,
    password: null,
    accessToken: null,
  });

  const [getUserLoading, setGetUserLoading] = useState(false);
  const [getStylesLoading, setGetStylesLoading] = useState(false);
  const [getVenuesLoading, setGetVenuesLoading] = useState(false);
  const [getVenueBeersLoading, setGetVenueBeersLoading] = useState(false);

  const [isMobile, setIsMobile] = useState(false);
  const [userData, setUserData] = useState(null);
  const [wosBadgeId, setWosBadgeId] = useState(null);
  const [styles, setStyles] = useState([]);
  const [venueBeers, setVenueBeers] = useState([]);
  const [options, setOptions] = useState([]);
  const [showHaveHad, setShowHaveHad] = useState(false);

  const updateWosBadgeIt = (badgeId) => {
    setWosBadgeId(badgeId);

    const expires = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 365);
    setCookie(`wosBadgeId`, badgeId, {
      path: "/",
      expires,
    });
  };

  const getUserInfo = () => {
    if (authData.accessToken && authData.accessToken !== "undefined") {
      setGetUserLoading(true);

      fetch(`${apiBaseURL}/user/info?access_token=${authData.accessToken}`)
        .then((response) => response.json())
        .then((data) => {
          setUserData(data.response.user);
          setGetUserLoading(false);
        })
        .catch((error) => {
          setGetUserLoading(false);
          console.error("Error:", error);
        });
    }
  };

  const getBadgeId = (offset = 0) => {
    if (authData.accessToken && authData.accessToken !== "undefined") {
      fetch(
        `${apiBaseURL}/user/badges?offset=${offset}&access_token=${authData.accessToken}`
      )
        .then((response) => response.json())
        .then((data) => {
          if (!data.response.items) {
            console.error("Couldn't find badge id for wheel of styles");
          } else {
            const badges = data.response.items;
            const wosBadge = badges.find((e) => e.badge_id === 5115);
            if (wosBadge) {
              console.log(authData);
              updateWosBadgeIt(wosBadge.user_badge_id);
            } else {
              getBadgeId(offset + 50);
            }
          }
        });
    }
  };

  const getStylesHad = () => {
    if (
      authData.accessToken &&
      authData.accessToken !== "undefined" &&
      wosBadgeId
    ) {
      setGetStylesLoading(true);

      fetch(
        `${apiBaseURL}/badges/view/${wosBadgeId}?access_token=${authData.accessToken}`
      )
        .then((response) => response.json())
        .then((data) => {
          const items = data.response.badge.special_status_list.items[0].items;

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
    setGetStylesLoading(true);

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

        setGetStylesLoading(false);
      })
      .catch((error) => console.error("Error:", error));
  };

  const searchVenues = debounce((query) => {
    if (!query || query === "") return setOptions([]);

    setGetVenuesLoading(true);

    fetch(
      `${apiBaseURL}/search/venue?q=${query}&access_token=${authData.accessToken}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          const options = data.response.venues.items.map((e) => e.venue);
          const sorted = options.sort((a, b) => {
            if (
              a.venue_country === "Danmark" &&
              b.venue_country !== "Danmark"
            ) {
              return -1;
            }

            if (
              a.venue_country !== "Danmark" &&
              b.venue_country === "Danmark"
            ) {
              return 1;
            }

            return 0;
          });

          setOptions(sorted);
          setGetVenuesLoading(false);
        }
      })
      .catch((error) => {
        setGetVenuesLoading(false);
        console.error("Error:", error);
      });
  }, 500);

  const getVenueBeers = (venue) => {
    if (!venue) return setVenueBeers([]);

    setGetVenueBeersLoading(true);
    const { venue_id, venue_name, venue_slug } = venue;

    fetch(
      `${apiBaseURL}/inventory/view/${venue_id}?hasNotHadBefore=true&access_token=${authData.accessToken}`
    )
      .then((response) => response.json())
      .then((data) => {
        const beers = [];

        data.response.items.forEach((e) => {
          const list = [];

          e.menu.sections.items.forEach((items) => list.push(...items.items));

          beers.push({
            beers: list,
            menu: e.menu.menu_name,
            venueId: venue_id,
            venueName: venue_name,
            venueSlug: venue_slug,
          });
        });

        setVenueBeers(beers);
        setGetVenueBeersLoading(false);
      })
      .catch((error) => {
        setGetVenueBeersLoading(false);
        console.error("Error:", error);
      });
  };

  const logOut = () => {
    removeCookie("accessToken");
    removeCookie("username");
    removeCookie("wosBadgeId");
    window.location.reload();
  };

  useEffect(() => {
    if (cookies.accessToken && cookies.accessToken !== "undefined") {
      setAuthData({ ...authData, accessToken: cookies.accessToken });
      setGetUserLoading(false);
    }

    if (!userData) {
      getUserInfo();
    }

    if (!wosBadgeId) {
      if (cookies.wosBadgeId) {
        setWosBadgeId(cookies.wosBadgeId);
      } else {
        getBadgeId();
      }
    }

    if (!styles.length) {
      getStylesHad();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cookies, authData.accessToken]);

  useEffect(() => {
    function handleResize() {
      const width = window.innerWidth;
      setIsMobile(width < 800);
    }

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <Auth
          baseURL={apiBaseURL}
          authData={authData}
          setAuthData={setAuthData}
          setGetUserLoading={setGetUserLoading}
        />

        {!getUserLoading &&
          (!authData.accessToken || authData.accessToken === "undefined") && (
            <Login authData={authData} setAuthData={setAuthData} />
          )}
        {(getUserLoading || getStylesLoading) && (
          <Box sx={{ display: "flex", m: 2 }}>
            <Spinner />
          </Box>
        )}

        {!getStylesLoading &&
          styles.length > 0 &&
          userData &&
          userData.first_name && (
            <Container>
              <Grid container spacing={2} className="cards">
                <Grid xs={12} md={6} sx={{ mt: 2 }} className="table">
                  <StylesTable
                    data={styles}
                    showHaveHad={showHaveHad}
                    apiBaseURL={apiBaseURL}
                    authData={authData}
                  />
                </Grid>
                <Grid xs={12} md={6} sx={{ mt: 2 }}>
                  <Paper sx={{ mb: 2, p: 2 }}>
                    <Dashboard
                      userData={userData}
                      showHaveHad={showHaveHad}
                      styles={styles}
                      isMobile={isMobile}
                      setShowHaveHad={setShowHaveHad}
                      getStylesHad={getStylesHad}
                      logOut={logOut}
                    />
                  </Paper>
                  {/* <Paper sx={{ mb: 2, p: 2 }}>
                    <Scanner authData={authData} apiBaseURL={apiBaseURL} />
                  </Paper> */}
                  <Paper sx={{ mb: 2, p: 2 }}>
                    <VenueSearch
                      options={options}
                      searchVenues={searchVenues}
                      venueBeers={venueBeers}
                      styles={styles}
                      getVenuesLoading={getVenuesLoading}
                      getVenueBeersLoading={getVenueBeersLoading}
                      getVenueBeers={getVenueBeers}
                    />
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
