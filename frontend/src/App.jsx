import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Navbar from "./components/Navbar";
import UserContext from "./context/UserContext";
import { useState, useEffect } from "react";
import { Box, Container, Typography } from "@mui/material";
import GetAlertRender from "./utils";
import EventsPage from "./pages/EventsPage";
import EventsDetailPage from "./pages/EventDetailPage";
import UserDetailPage from "./pages/UserDetailPage";

function checkToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded = JSON.parse(atob(token.split('.')[1]));
    
    if (Date.now() >= decoded.exp * 1000) {
      localStorage.removeItem("token");
      return null;
    }
    return {
      username: decoded.username,
      email: decoded.email,
      _id: decoded.user_id,
      token,
    };
  } catch (e) {
    localStorage.removeItem("token");
    console.error("Error decoding token:", e);
    return null;
  }
}

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = checkToken();
    if (userData) {
      setUser(userData);
    }
  }, []);

  function getUser(user) {
    if (!user) {
      return (
        <div style={{ marginTop: 5 }}>
          {GetAlertRender("Please log in to view events.", "warning")}
        </div>
      );
    }
  }

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <BrowserRouter>
        <Navbar />
        <div style={{ minHeight: "100vh" }}>
          {getUser(user)}
          {user && (
            <Routes>
              <Route path="/" element={<EventsPage />} />
              <Route path="/:id" element={<EventsDetailPage />} />
              <Route path="users/:id" element={<UserDetailPage />} />
            </Routes>
          )}
          <Box sx={{ flexGrow: 1 }} />
        </div>
        <Box
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === "light"
                ? theme.palette.grey[200]
                : theme.palette.grey[800],
            p: 6,
          }}
          component="footer"
        >
          <Container>
            <Typography variant="body2" align="center">
              {"Copyright © "}
              <Link
                color="inherit"
                href="https://github.com/markuss23"
                target="_blank"
                rel="noopener noreferrer"
              >
                Marek Tremel
              </Link>{" "}
              2024.
            </Typography>
          </Container>
        </Box>
      </BrowserRouter>
    </UserContext.Provider>
  );
}

export default App;
