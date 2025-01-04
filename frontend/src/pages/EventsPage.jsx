import { useState, useEffect, useContext } from "react";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  ListItemText,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import UserContext from "../context/UserContext";
import getAlertRender from "../utils";
import { EventCard } from "../components/features/EventCard";
import { API_URL } from "../variables";

function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState([]); // Default to no filters
  const user = useContext(UserContext);

  // Function to generate the query string based on the selected filters
  const generateQueryParams = () => {
    const includePastEvent = filters.includes("past");
    const includeUpcomingEvent = filters.includes("upcoming");
    const includeCurrentEvent = filters.includes("current");

    return `&include_pass_event=${includePastEvent}&include_upcoming_event=${includeUpcomingEvent}&include_current_event=${includeCurrentEvent}`;
  };

  // Fetch events when the component mounts or when the filter changes
  useEffect(() => {
    const fetchEvents = () => {
      const queryParams = generateQueryParams();

      fetch(`${API_URL}/events/?attend=${user.user._id}${queryParams}`, {
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
          setEvents(data);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.user._id, user.user.token, filters]); // Added filters dependency

  const handleFilterChange = (event) => {
    setFilters(event.target.value);
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
        <Typography variant="h4" component="h1" gutterBottom>
          My Events
        </Typography>

        <Divider sx={{ mb: 4 }} />

        <FormControl fullWidth>
          <InputLabel>Filter Events</InputLabel>
          <Select
            multiple
            value={filters}
            onChange={handleFilterChange}
            label="Filter Events"
            renderValue={(selected) => selected.join(", ")}
          >
            <MenuItem value="current">
              <Checkbox checked={filters.includes("current")} />
              <ListItemText primary="Current" />
            </MenuItem>
            <MenuItem value="upcoming">
              <Checkbox checked={filters.includes("upcoming")} />
              <ListItemText primary="Upcoming" />
            </MenuItem>
            <MenuItem value="past">
              <Checkbox checked={filters.includes("past")} />
              <ListItemText primary="Past" />
            </MenuItem>
          </Select>
        </FormControl>

        <Divider sx={{ mb: 4 }} />

        {events.length === 0 ? (
          <div>
            {getAlertRender(
              "No events match your filter. Create one now!",
              "info"
            )}
          </div>
        ) : (
          <Grid container spacing={2}>
            {events.map((event) => (
              <Grid item xs={12} sm={6} md={4} key={event.id}>
                <EventCard event={event} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
}

export default EventsPage;
