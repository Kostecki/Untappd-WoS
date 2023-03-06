import { Alert } from "@mui/material";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";

function Auth({ baseURL, authData, setAuthData, setGetUserLoading }) {
  const [cookies, setCookie] = useCookies(["wheel-of-styles"]);
  const [messageText, setMessageText] = useState(null);
  const [messageType, setMessageType] = useState(null);

  const clientId = process.env.REACT_APP_CLIENT_ID;
  const clientSecret = process.env.REACT_APP_CLIENT_SECRET;
  const deviceUDID = "9b5e46525304d62a";

  const authUser = () => {
    setGetUserLoading(true);

    const formData = new FormData();
    formData.append("user_name", authData.username);
    formData.append("user_password", authData.password);
    formData.append("device_udid", deviceUDID);

    fetch(
      `${baseURL}/xauth?client_id=${clientId}&client_secret=${clientSecret}`,
      {
        method: "POST",
        body: formData,
      }
    )
      .then((response) => {
        if (response.ok) return response.json();
        return response.json().then((response) => {
          throw new Error(response.meta.error_detail);
        });
      })
      .then((data) => {
        const accessToken = data.response.access_token;
        const expires = new Date(
          new Date().getTime() + 1000 * 60 * 60 * 24 * 365
        );

        setCookie("accessToken", accessToken, {
          path: "/",
          expires,
        });
        setCookie("username", authData.username, {
          path: "/",
          expires,
        });
        setAuthData({ ...authData, accessToken });
        setMessageText(null);
        setMessageType(null);

        setGetUserLoading(false);
      })
      .catch((error) => {
        setGetUserLoading(false);
        setAuthData({ username: null, password: null, accessToken: null });
        setMessageText(error.message);
        setMessageType("error");

        setTimeout(() => {
          setMessageText(null);
          setMessageType(null);
        }, 3000);
      });
  };

  useEffect(() => {
    if (
      (!cookies.accessToken || cookies.accessToken === "undefined") &&
      authData.username &&
      authData.password
    ) {
      authUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authData.username, authData.password]);

  return (
    <>
      {messageText && messageType && (
        <Alert
          sx={{ position: "absolute", top: 0, left: 0, right: 0 }}
          severity={messageType}
        >
          {messageText}
        </Alert>
      )}
    </>
  );
}

export default Auth;
