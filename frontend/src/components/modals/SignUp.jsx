import PropTypes from "prop-types";
import { Alert, Box, Button, Modal, TextField } from "@mui/material";
import { useState } from "react";
import { API_URL } from "../../variables";

const SignUpStyle = {
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

function SignUp({ open, handleClose }) {
  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Dvojitá kontrola hesla
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // eslint-disable-next-line no-unused-vars
    const { confirmPassword, ...dataToSubmit } = formData; // Remove confirmPassword before sending to the API

    fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(dataToSubmit),
    })
      .then((response) => {
        if (response.ok) {
          setSuccess(true);
          setFormData({
            username: "",
            first_name: "",
            last_name: "",
            email: "",
            password: "",
            confirmPassword: "",
          });
          handleClose();
        } else {
          if (response.status === 409) {
            throw new Error("Conflict: Email or username already exists.");
          } else if (response.status === 400) {
            throw new Error("Bad Request: Invalid input.");
          } else if (response.status === 500) {
            throw new Error("Server Error: Please try again later.");
          } else {
            return response.json().then((data) => {
              const errorMessage = data?.detail || "Registration failed.";
              throw new Error(errorMessage);
            });
          }
        }
      })
      .catch((error) => {
        setError(error.message);
        console.error("Error:", error.message);
      });
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={SignUpStyle}>
        <form onSubmit={handleSubmit}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Registration successful! You can now log in.
            </Alert>
          )}
          <TextField
            sx={{ mb: 2 }}
            label="Username"
            variant="filled"
            name="username"
            required
            fullWidth
            value={formData.username}
            onChange={handleChange}
          />
          <TextField
            sx={{ mb: 2 }}
            label="First Name"
            variant="filled"
            name="first_name"
            required
            fullWidth
            value={formData.first_name}
            onChange={handleChange}
          />
          <TextField
            sx={{ mb: 2 }}
            label="Last Name"
            variant="filled"
            name="last_name"
            required
            fullWidth
            value={formData.last_name}
            onChange={handleChange}
          />
          <TextField
            sx={{ mb: 2 }}
            label="Email"
            variant="filled"
            name="email"
            type="email"
            required
            fullWidth
            value={formData.email}
            onChange={handleChange}
          />
          <TextField
            sx={{ mb: 2 }}
            label="Password"
            variant="filled"
            name="password"
            type="password"
            required
            fullWidth
            value={formData.password}
            onChange={handleChange}
          />
          <TextField
            sx={{ mb: 2 }}
            label="Confirm Password"
            variant="filled"
            name="confirmPassword"
            type="password"
            required
            fullWidth
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          <div
            style={{ display: "flex", justifyContent: "space-between", mx: 5 }}
          >
            <Button variant="contained" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="success">
              Register
            </Button>
          </div>
        </form>
      </Box>
    </Modal>
  );
}

SignUp.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
};

export default SignUp;
