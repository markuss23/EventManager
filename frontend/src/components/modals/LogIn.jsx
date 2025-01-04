import PropTypes from "prop-types";
import { Alert, Box, Button, Modal, TextField } from "@mui/material";
import { useContext, useState } from "react";
import UserContext from "../../context/UserContext";
import { API_URL } from "../../variables";

const LogInStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const decodeJWT = (token) => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
};

function LogIn({ open, handleClose }) {
  const { setUser } = useContext(UserContext); // use context to update user state

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // Add error state

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    const formData = new URLSearchParams();
    formData.append("grant_type", "password");
    formData.append("username", email);
    formData.append("password", password);
    formData.append("scope", "");
    formData.append("client_id", "string"); // Replace with your client_id
    formData.append("client_secret", "string"); // Replace with your client_secret

    fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        accept: "application/json",
      },
      body: formData,
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          if (response.status === 401) {
            throw new Error("Unauthorized: Incorrect credentials.");
          } else if (response.status === 404) {
            throw new Error("Not found: User not found.");
          } else if (response.status === 500) {
            throw new Error("Server error, please try again later.");
          } else {
            throw new Error(`Unexpected status code: ${response.status}`);
          }
        }
      })
      .then((data) => {
        const decoded = decodeJWT(data.access_token);

        // Save token to localStorage
        localStorage.setItem("token", data.access_token);

        // Update user context with decoded data
        setUser({
          username: decoded.username,
          email: decoded.email,
          _id: decoded.user_id,
          token: data.access_token,
        });
        handleClose();

      })
      .catch((error) => {
        setError(error.message);
        console.error("Error:", error.message);
      });
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={LogInStyle}>
        <form onSubmit={handleSubmit}>
        {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            sx={{ mb: 2 }}
            label="Email"
            variant="filled"
            required
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            sx={{ mb: 2 }}
            label="Password"
            variant="filled"
            type="password"
            required
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div
            style={{ display: "flex", justifyContent: "space-between", mx: 5 }}
          >
            <Button variant="contained" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="success">
              Signup
            </Button>
          </div>
        </form>
      </Box>
    </Modal>
  );
}

LogIn.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
};

export default LogIn;
