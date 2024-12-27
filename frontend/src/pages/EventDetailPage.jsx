import { useState, useEffect, useContext } from "react";
import { Container, Box, CircularProgress } from "@mui/material";
import UserContext from "../context/UserContext";
import getAlertRender from "../utils";
import { API_URL } from "../variables";
import { useParams } from "react-router-dom";
import EventDetail from "../components/features/EventDetail";

function EventsDetailPage() {
  const { id } = useParams(); // Get the id from the URL parameters
  const [event, setEvent] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = useContext(UserContext);

  useEffect(() => {
    const fetchEvents = () => {
      fetch(`${API_URL}/events/${id}`, {
        // Use the id in the API URL
        headers: {
          Authorization: `Bearer ${user.user.token}`,
        },
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error("Failed to fetch events.");
          }
        })
        .then((data) => {
          setEvent(data);
          setLoading(false);
        })
        .catch((error) => {
          setError(error.message);
          setLoading(false);
        });
    };

    if (user.user.token) {
      fetchEvents();
    }
  }, [id, user.user._id, user.user.token]); // Add id to the dependency array

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" m={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Box my={4}>{getAlertRender(error, "error")}</Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box my={4}>
        <EventDetail event={event} />
      </Box>
    </Container>
  );
}

export default EventsDetailPage;
