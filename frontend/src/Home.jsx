import PropTypes from "prop-types";
import { Box, Container } from "@mui/material";
import EventList from "./components/events/EventList";

function Home() {
  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <EventList />
      </Box>
      {/* <CalendarView /> */}
    </Container>
  );
}

Home.propTypes = {
  user: PropTypes.object,
};

export default Home;
