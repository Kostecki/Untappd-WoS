import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CookiesProvider } from "react-cookie";

const theme = createTheme({
  palette: {
    primary: {
      main: "#ffc000",
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <CookiesProvider>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </CookiesProvider>
  </React.StrictMode>
);
