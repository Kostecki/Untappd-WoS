import { useState } from "react";
import { signIn } from "next-auth/react";
import { Box, Typography, useTheme, TextField } from "@mui/material";
import { LoadingButton } from "@mui/lab";

export default function Login() {
  const theme = useTheme();
  const [loading, setIsloading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleUsername = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  const handlePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const clickHandler = () => {
    if (username && password) {
      setIsloading(true);
      signIn("untappd", {
        redirect: false,
        username,
        password,
      });
    }
  };

  return (
    <Box
      component="form"
      sx={{
        background: "white",
        borderRadius: 2,
        p: 2,
        mt: 2,
        [theme.breakpoints.up("md")]: {
          minWidth: "450px",
        },
        "& .MuiTextField-root": { width: "100%" },
      }}
      noValidate
      autoComplete="off"
    >
      <Typography variant="h3" color="black" sx={{ mt: 2 }}>
        Wheel of Styles
      </Typography>
      <Typography
        variant="h6"
        color="#9e9e9e"
        sx={{ mb: 3, fontStyle: "italic" }}
      >
        Login using your Untappd account
      </Typography>
      <div>
        <TextField
          sx={{ marginBottom: 2 }}
          required
          id="input-username"
          label="Username"
          value={username}
          onChange={handleUsername}
          onKeyDown={clickHandler}
        />
      </div>
      <div>
        <TextField
          required
          id="input-password"
          label="Password"
          type="password"
          value={password}
          onChange={handlePassword}
          onKeyDown={clickHandler}
        />
      </div>
      <Box sx={{ textAlign: "right" }}>
        <LoadingButton
          color="primary"
          disabled={!username || !password}
          loading={loading}
          sx={{ mt: 4 }}
          variant="outlined"
          onClick={clickHandler}
        >
          Login with Untappd
        </LoadingButton>
      </Box>
    </Box>
  );
}
