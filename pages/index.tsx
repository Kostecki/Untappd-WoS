import { useEffect, useState } from "react";

import Head from "next/head";
import Script from "next/script";
import { useSession } from "next-auth/react";
import { Container, Paper } from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";

import { useSettings } from "@/context/settings";
import { useMobileMode } from "@/context/mobileMode";
import { useStyles } from "@/context/styles";

import Login from "@/components/Login";
import Dashboard from "@/components/Dashboard";
import VenueSearch from "@/components/VenueSearch";
import StylesTable from "@/components/StylesTable";
import Checker from "@/components/Checker";

import styles from "@/styles/Home.module.css";
import Countries from "@/components/Countries";

export default function Home() {
  const { data: session } = useSession();
  const [title, setTitle] = useState("Wheel of Styles");

  const { featureCountryBadges, updateSettings } = useSettings();
  const { updateMobileMode } = useMobileMode();
  const { fetchStyles } = useStyles();

  useEffect(() => {
    const settings = localStorage.getItem("settings-wos");
    if (settings) {
      updateSettings(JSON.parse(settings));
    }

    if (session?.user) {
      fetchStyles();
    }

    const handleResize = () => {
      const width = window.innerWidth;
      updateMobileMode(width < 800);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (session?.user.firstName && session?.user.lastName) {
      setTitle(
        `Wheel of Styles | ${session?.user.firstName} ${session?.user.lastName}`
      );
    }
  }, [session?.user.firstName, session?.user.lastName]);

  return (
    <>
      {process.env.NODE_ENV === "production" && (
        <Script
          async
          src="https://umami.israndom.win/script.js"
          data-website-id="84995db7-3b4e-4c2e-8b0c-7f6c8c88f920"
        ></Script>
      )}
      <Head>
        <title>{title}</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicon/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon/favicon-16x16.png"
        />
        <link rel="manifest" href="/favicon/site.webmanifest" />
        <link
          rel="mask-icon"
          href="/favicon/safari-pinned-tab.svg"
          color="#5bbad5"
        />
        <link rel="shortcut icon" href="/favicon/favicon.ico" />
        <meta name="msapplication-TileColor" content="#00aba9" />
        <meta
          name="msapplication-config"
          content="/favicon/browserconfig.xml"
        />
        <meta name="theme-color" content="#ffffff" />
      </Head>
      <main className={styles.main}>
        {session && (
          <Container>
            <Grid2 container spacing={2} className={styles.cards}>
              <Grid2 xs={12} md={6} sx={{ mt: 2 }} className={styles.table}>
                <StylesTable />
              </Grid2>
              <Grid2 xs={12} md={6} sx={{ mt: 2 }}>
                <Paper sx={{ mb: 2, p: 2 }}>
                  <Dashboard />
                </Paper>
                <Paper sx={{ mb: 2, p: 2 }}>
                  <VenueSearch />
                </Paper>
                <Paper sx={{ mb: 2, p: 2 }}>
                  <Checker />
                </Paper>
                {featureCountryBadges && (
                  <Paper sx={{ mb: 2, p: 2 }}>
                    <Countries />
                  </Paper>
                )}
              </Grid2>
            </Grid2>
          </Container>
        )}
        {!session && <Login />}
      </main>
    </>
  );
}
