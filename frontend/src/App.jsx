import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Navbar from "./components/Navbar";
import UserContext from "./context/UserContext";
import { useState } from "react";
import Home from "./Home";
import EventDetail from "./components/events/EventDetail";
import { Box, Container, Typography } from "@mui/material";

function App() {
  const [user, setUser] = useState(null); // null to represent not logged in

  function getUser(user) {
    if (!user) {
      return (
        <div>
          <h2>Not logged in</h2>
        </div>
      );
    }
  }

  return (
      <UserContext.Provider value={{ user, setUser }}>
        <BrowserRouter>
          <Navbar />
          <div style={{minHeight: "100vh"}}>
          {getUser(user)}
          {user && (
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/events/:id" element={<EventDetail />} />
            </Routes>
          )}
          <Box
            sx={{
              flexGrow: 1,
            }}
          />
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
                  rel="noopener noreferrer" // Important for security reasons

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
