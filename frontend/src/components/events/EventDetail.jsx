import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  CircularProgress,
  Box,
  Typography,
  Container,
  Divider,
} from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DescriptionIcon from "@mui/icons-material/Description";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import CalendarView from "../calendar/CalendarView";
import getAlertRender from "../../utils";

function EventDetailRender({ event }) {

  return (
    <Container>
      <Card
        variant="outlined"
        sx={{
          margin: 2,
          borderRadius: 3,
          boxShadow: 3,
          bgcolor: "#f9f9f9",
          padding: 2,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <CardContent>
            {/* Title */}
            <Typography
              variant="h4"
              component="div"
              sx={{ fontWeight: "bold", color: "#3f51b5", mb: 2 }}
            >
              {event.title}
            </Typography>

            {/* Owner */}
            <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
              <AccountCircleIcon sx={{ mr: 1, color: "#757575" }} />
              <Typography variant="body1" sx={{ color: "#757575" }}>
                Owner: {event.owner_id}
              </Typography>
            </Box>

            {/* Start and End Times */}
            <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
              <AccessTimeIcon sx={{ mr: 1, color: "#757575" }} />
              <Typography variant="body2" sx={{ color: "#757575" }}>
                Start: {format(new Date(event.start_time), "PPpp")}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
              <AccessTimeIcon sx={{ mr: 1, color: "#757575" }} />
              <Typography variant="body2" sx={{ color: "#757575" }}>
                End: {format(new Date(event.end_time), "PPpp")}
              </Typography>
            </Box>

            {/* Description */}
            <Box sx={{ mt: 2 }}>
              <DescriptionIcon sx={{ mr: 1, color: "#757575" }} />
              <Typography
                variant="body1"
                component="p"
                sx={{
                  color: "#424242",
                  wordWrap: "break-word", // Ensure text wraps within its container
                  whiteSpace: "pre-line", // Keep formatting for new lines
                  maxWidth: "230px",
                }}
              >
                {event.description}
              </Typography>
            </Box>
          </CardContent>
          <div>
            <CalendarView
              startDate={new Date(event.start_time)}
              endDate={new Date(event.end_time)}
            />
          </div>
        </div>
        <Divider sx={{ mt: 2 }} />
        {/* Actions */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            component={Link}
            to={`/events/edit/${event._id}`}
          >
            Edit Event
          </Button>
          <Button variant="outlined" color="secondary" component={Link} to="/">
            Back to Events
          </Button>
        </Box>
      </Card>
    </Container>
  );
}

function EventDetail() {
  const { id } = useParams(); // Get the id from the URL params
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch the event with the id from the server
    fetch("http://127.0.0.1:8000/events/" + id)
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("Událost nebyla nalezena"); // Pokud není nalezena událost
          }
          throw new Error("Došlo k chybě při načítání události"); // Ostatní chyby
        }
        return res.json();
      })
      .then((data) => {
        setEventData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <div style={{marginTop:5}}>
          {getAlertRender(error, "error")}
      </div>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      {eventData ? (
        <EventDetailRender event={eventData} />
      ) : (
        <Typography>No event found</Typography>
      )}
    </Box>
  );
}

EventDetailRender.propTypes = {
  event: PropTypes.object.isRequired,
};

export default EventDetail;
