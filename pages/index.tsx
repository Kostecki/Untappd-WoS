import { useEffect } from "react";
import Head from "next/head";
import { useSession } from "next-auth/react";
import { Container, Paper } from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";

import { useMobileMode } from "@/context/mobileMode";
import { useStyles } from "@/context/styles";

import Login from "@/components/Login";
import Dashboard from "@/components/Dashboard";
import VenueSearch from "@/components/VenueSearch";
import StylesTable from "@/components/StylesTable";

import styles from "@/styles/Home.module.css";
import Scanner from "@/components/Scanner";

export default function Home() {
  const { data: session } = useSession();
  const { updateMobileMode } = useMobileMode();
  const { fetchStyles } = useStyles();

  useEffect(() => {
    if (session?.user) {
      fetchStyles();
    }

    function handleResize() {
      const width = window.innerWidth;
      updateMobileMode(width < 800);
    }

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Head>
        <title>Wheel of Styles</title>
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
                  <Scanner />
                </Paper>
              </Grid2>
            </Grid2>
          </Container>
        )}
        {!session && <Login />}
      </main>
    </>
  );
}
