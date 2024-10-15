import PropTypes from "prop-types";
import { Box, Button, Modal, TextField } from "@mui/material";
import { useContext, useState } from "react";
import UserContext from "../../context/UserContext";

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

function LogIn({ open, handleClose }) {
  const { setUser } = useContext(UserContext); // use context to update user state

  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch("http://127.0.0.1:8000/users/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: "password",
      }),
    })
      .then((response) => {
        // Check if the response status is in the successful range (2xx)
        if (response.ok) {
          return response.json();
        } else {
          // Handle different status codes here
          if (response.status === 401) {
            throw new Error("Unauthorized: Incorrect email or password.");
          } else if (response.status === 500) {
            throw new Error("Server error, please try again later.");
          } else {
            throw new Error(`Unexpected status code: ${response.status}`);
          }
        }
      })
      .then((data) => {
        setUser({ username: data.username });
      })
      .catch((error) => {
        console.error("Error:", error.message);
      });
    handleClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={LogInStyle}>
        <form onSubmit={handleSubmit}>
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
            // value={password}
            // onChange={(e) => setPassword(e.target.value)}
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
