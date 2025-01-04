import { useState, useEffect, useContext } from "react";
import { Container, Box, CircularProgress } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import UserContext from "../context/UserContext";
import getAlertRender from "../utils";
import { API_URL } from "../variables";
import EventDetail from "../components/features/EventDetail";
function EventsDetailPage() {
  const { id } = useParams(); // Get the id from the URL parameters
  const [event, setEvent] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = () => {
      fetch(`${API_URL}/events/${id}/users`, {
        // Use the id in the API URL
        headers: {
          Authorization: `Bearer ${user.user.token}`,
        },
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else if (response.status === 400) {
            throw new Error("Invalid request.");
          } else if (response.status === 404) {
            throw new Error("Event not found.");
          } else {
            throw new Error("Failed to fetch events.");
          }
        })
        .then((data) => {
          setEvent(data);
          setLoading(false);
        })
        .catch((error) => {
          console.log(error);

          setError(error.message);
          setLoading(false);
        });
    };

    if (user.user.token) {
      fetchEvents();
    }
  }, [id, user.user._id, user.user.token]); // Add id to the dependency array

  const handleDeleteEvent = (eventID) => {
    fetch(`${API_URL}/events/${eventID}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${user.user.token}`,
      },
    })
      .then((response) => {
        if (response.ok) {
          navigate("/");
        } else {
          throw new Error("Failed to delete event.");
        }
      })
      .catch((error) => {
        setError(error.message);
      });
  };

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
        <EventDetail event={event} eventID={id} onDelete={handleDeleteEvent} />
      </Box>
    </Container>
  );
}

export default EventsDetailPage;
