import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { createTheme, ThemeProvider } from "@mui/material";
import { CacheProvider, EmotionCache } from "@emotion/react";

import lightThemeOptions from "../styles/theme/lightThemeOptions";
import createEmotionCache from "../utils/createEmotionCache";

import "@/styles/globals.css";

interface AppPropsCustom extends AppProps {
  emotionCache?: EmotionCache;
}

const lightTheme = createTheme(lightThemeOptions);
const clientSideEmotionCache = createEmotionCache();

export default function App({
  Component,
  emotionCache = clientSideEmotionCache,
  pageProps: { session, ...pageProps },
}: AppPropsCustom) {
  return (
    <SessionProvider session={session}>
      <CacheProvider value={emotionCache}>
        <ThemeProvider theme={lightTheme}>
          <Component {...pageProps} />
        </ThemeProvider>
      </CacheProvider>
    </SessionProvider>
  );
}
