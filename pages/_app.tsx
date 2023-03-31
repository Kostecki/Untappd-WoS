import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";

import { Inter } from "next/font/google";
import { createTheme, ThemeProvider } from "@mui/material";
import { CacheProvider, EmotionCache } from "@emotion/react";

import { MobileModeProvider } from "@/context/mobileMode";

import lightThemeOptions from "../styles/theme/lightThemeOptions";
import createEmotionCache from "../utils/createEmotionCache";

import "@/styles/globals.css";
import { StylesProvider } from "@/context/styles";

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
            <MobileModeProvider>
              <StylesProvider>
                <Component {...pageProps} />
              </StylesProvider>
            </MobileModeProvider>
          </main>
        </ThemeProvider>
      </CacheProvider>
    </SessionProvider>
  );
}