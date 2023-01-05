import { useEffect } from "react";
import { useCookies } from "react-cookie";

function Auth({ baseURL, authData, setAuthData, setLoading }) {
  const [cookies, setCookie] = useCookies(["wheel-of-styles"]);

  const clientId = process.env.REACT_APP_CLIENT_ID;
  const clientSecret = process.env.REACT_APP_CLIENT_SECRET;
  const deviceUDID = "9b5e46525304d62a";

  const authUser = () => {
    setLoading(true);

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
      .then((response) => response.json())
      .then((data) => {
        const accessToken = data.response.access_token;
        const expires = new Date(
          new Date().getTime() + 1000 * 60 * 60 * 24 * 365
        );

        setCookie("accessToken", accessToken, {
          path: "/",
          expires,
        });
        setAuthData({ ...authData, accessToken });

        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        console.error("Error:", error);
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
}

export default Auth;
