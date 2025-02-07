import PropTypes from "prop-types";
import { Alert, Box, Button, Modal, TextField } from "@mui/material";
import { useContext, useState } from "react";
import UserContext from "../../context/UserContext";
import { API_URL } from "../../variables";
import SignUp from "./SignUp"; // Import SignUp komponenty

const ModalStyle = {
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
  const { setUser } = useContext(UserContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const formData = new URLSearchParams();
    formData.append("grant_type", "password");
    formData.append("username", email);
    formData.append("password", password);
    formData.append("scope", "");
    formData.append("client_id", "string");
    formData.append("client_secret", "string");

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
    <>
      <Modal open={open} onClose={handleClose}>
        <Box sx={ModalStyle}>
          <form onSubmit={handleSubmit}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <TextField
              sx={{ mb: 2 }}
              label="Username"
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
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Button variant="contained" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={() => setIsSignUpOpen(true)}
                color="secondary"
              >
                Sign Up
              </Button>
              <Button type="submit" variant="contained" color="success">
                Login
              </Button>
              
            </div>
          </form>
        </Box>
      </Modal>

      <SignUp
        open={isSignUpOpen}
        handleClose={() => setIsSignUpOpen(false)}
      />
    </>
  );
}

LogIn.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
};

export default LogIn;
