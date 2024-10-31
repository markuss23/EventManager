import PropTypes from "prop-types";
import { Box, Card, CardContent, Typography } from "@mui/material";
import { format } from "date-fns";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DescriptionIcon from "@mui/icons-material/Description";
import { Link } from "react-router-dom";
import { getEventStatus } from "../../utils";
import Websocket from "../websocket/Websocket";

function EventCard({ event }) {
  const eventStatus = getEventStatus(event);

  const truncatedDescription =
    event.description.length > 12
      ? `${event.description.substring(0, 12)}...`
      : event.description;

  return (
    <Card
      variant="outlined"
      sx={{
        margin: 2,
        borderRadius: 3,
        boxShadow: 3,
        bgcolor: "#f9f9f9",
        "&:hover": { boxShadow: 6 },
        borderColor: eventStatus.color,
        borderWidth: 2,
      }}
    >
      <Link
        to={`/events/${event._id}`}
        style={{
          textDecoration: "none",
        }}
      >
        <CardContent>
          <Typography
            variant="h5"
            component="div"
            sx={{ fontWeight: "bold", color: "#3f51b5" }}
          >
            {event.title}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
            <AccountCircleIcon sx={{ mr: 1, color: "#757575" }} />
            <Typography sx={{ color: "#757575" }}>
              Owner: {event.owner.username}
            </Typography>
          </Box>
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
          <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
            <DescriptionIcon sx={{ mr: 1, color: "#757575" }} />
            <Typography variant="body1" sx={{ color: "#424242" }}>
              {truncatedDescription}
            </Typography>
          </Box>
        </CardContent>
      </Link>
      {eventStatus.status === "upcoming" && <Websocket event={event} />}
    </Card>
  );
}

EventCard.propTypes = {
  event: PropTypes.object.isRequired,
};

export default EventCard;
