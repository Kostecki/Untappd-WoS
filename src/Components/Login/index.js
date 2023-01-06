import React, { useState } from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

function Login({ authData, setAuthData }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleUsername = (event) => {
    setUsername(event.target.value);
  };
  const handlePassword = (event) => {
    setPassword(event.target.value);
  };

  const handleClick = (event) => {
    if (
      username &&
      password &&
      (event.type === "click" || event.keyCode === 13)
    ) {
      setAuthData({
        ...authData,
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
        padding: 2,
        "& .MuiTextField-root": { width: "20ch" },
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
          onKeyDown={handleClick}
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
          onKeyDown={handleClick}
        />
      </div>
      <Box sx={{ textAlign: "right" }}>
        <Button
          disabled={!username || !password}
          sx={{ mt: 4 }}
          variant="outlined"
          onClick={handleClick}
        >
          Login
        </Button>
      </Box>
    </Box>
  );
}

export default Login;
