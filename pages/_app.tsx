import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";

import { Inter } from "next/font/google";
import { createTheme, ThemeProvider } from "@mui/material";
import { CacheProvider, EmotionCache } from "@emotion/react";

import { SettingsProvider } from "@/context/settings";
import { MobileModeProvider } from "@/context/mobileMode";
import { StylesProvider } from "@/context/styles";
import { VenuesProvider } from "@/context/venues";
import { BeersProvider } from "@/context/beers";
import { ListsProvider } from "@/context/lists";
import { CountriesProvider } from "@/context/countries";

import lightThemeOptions from "../styles/theme/lightThemeOptions";
import createEmotionCache from "../utils/createEmotionCache";

import "@/styles/globals.css";

interface AppPropsCustom extends AppProps {
  emotionCache?: EmotionCache;
}

const lightTheme = createTheme(lightThemeOptions);
const clientSideEmotionCache = createEmotionCache();

const inter = Inter({ subsets: ["latin"] });

export default function App({
  Component,
  emotionCache = clientSideEmotionCache,
  pageProps: { session, ...pageProps },
}: AppPropsCustom) {
  return (
    <SessionProvider session={session}>
      <CacheProvider value={emotionCache}>
        <ThemeProvider theme={lightTheme}>
          <main className={inter.className}>
            <SettingsProvider>
              <MobileModeProvider>
                <ListsProvider>
                  <StylesProvider>
                    <VenuesProvider>
                      <BeersProvider>
                        <CountriesProvider>
                          <Component {...pageProps} />
                        </CountriesProvider>
                      </BeersProvider>
                    </VenuesProvider>
                  </StylesProvider>
                </ListsProvider>
              </MobileModeProvider>
            </SettingsProvider>
          </main>
        </ThemeProvider>
      </CacheProvider>
    </SessionProvider>
  );
}
