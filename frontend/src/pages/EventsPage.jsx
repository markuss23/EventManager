import { useState, useEffect, useContext } from 'react';
import { 
  Container,
  Typography,
  Box,
  CircularProgress,
  Divider,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import UserContext from '../context/UserContext';
import getAlertRender from '../utils';
import { EventCard } from '../components/features/EventCard';
import { API_URL } from '../variables';

function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = useContext(UserContext);

  useEffect(() => {
    const fetchEvents = () => {
        fetch(`${API_URL}/events/?attend=${user.user._id}`, {
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
}, [user.user._id, user.user.token]);


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
        <Box my={4}>
          {getAlertRender(error, "error")}
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Events
        </Typography>

        <Divider sx={{ mb:4}} />
        
        {events.length === 0 ? (
        <div>
        {getAlertRender("You have no events. Create one now!", "info")}    
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