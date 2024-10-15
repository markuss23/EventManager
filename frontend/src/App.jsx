import { Box, Container, Typography } from "@mui/material";
import EventList from "./components/EventList";
import Navbar from "./components/Navbar";
import UserContext from "./context/UserContext";
import { useState } from "react";

// https://colorhunt.co/palette/f4f6fff3c623eb831710375c
function App() {
  const [user, setUser] = useState(null); // null to represent not logged in

  function render() {
    if (user) {
      return <EventList />;
    } else {
      return (
        <Typography variant="h6" align="center">
          Not Logged In
        </Typography>
      );
    }
  }

  return (
    <>
      <UserContext.Provider value={{ user, setUser }}>
        <Navbar />

        <Container>
          <Box sx={{ my: 4 }}>{render()}</Box>
        </Container>
      </UserContext.Provider>
    </>
  );
}

export default App;
