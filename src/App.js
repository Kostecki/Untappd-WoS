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
  const [getVenuesLoading, setGetVenuesLoading] = useState(false);
  const [getVenueBeersLoading, setGetVenueBeersLoading] = useState(false);

  const [isMobile, setIsMobile] = useState(false);
  const [userData, setUserData] = useState(null);
  const [haveHadCount, setHaveHadCount] = useState(0);
  const [styles, setStyles] = useState(null);
  const [showHaveHad, setShowHaveHad] = useState(false);
  const [venueBeers, setVenueBeers] = useState([]);
  const [options, setOptions] = useState([]);

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

  useEffect(() => {
    function handleResize() {
      const width = window.innerWidth;
      setIsMobile(width < 800);
    }

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // TODO: Move props around 🤷‍♂️

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
                      logOut={logOut}
                      showHaveHad={showHaveHad}
                      toggleHaveHad={toggleHaveHad}
                      getStylesHad={getStylesHad}
                      haveHadCount={haveHadCount}
                      checkinsPerLevel={checkinsPerLevel}
                      styles={styles}
                      isMobile={isMobile}
                      totalStyles={totalStyles}
                      calcLeftToNextLevel={calcLeftToNextLevel}
                    />
                  </Paper>
                  <Paper sx={{ mb: 2, p: 2 }}>
                    <VenueSearch
                      options={options}
                      getVenueBeers={getVenueBeers}
                      searchVenues={searchVenues}
                      venueBeers={venueBeers}
                      styles={styles}
                      getVenuesLoading={getVenuesLoading}
                      getVenueBeersLoading={getVenueBeersLoading}
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
