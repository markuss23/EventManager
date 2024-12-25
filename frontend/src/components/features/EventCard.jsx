import {
  Card,
  Typography,
  CardActions,
  Button,
  Box,
  Stack,
} from "@mui/material";
import { format } from "date-fns";
import PropTypes from "prop-types";
import { getEventStatus } from "../../utils";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EventIcon from "@mui/icons-material/Event";

export const EventCard = ({ event }) => {
  const status = getEventStatus(event);
  const startTime = new Date(event.start_time);
  const endTime = new Date(event.end_time);

  return (
    <Card
      sx={{
        mb: 2,
        borderRadius: 2,
        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
        display: "flex",
      }}
    >
      <Box
        sx={{
          width: "120px",
          backgroundColor: status.color,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          borderTopLeftRadius: "8px",
          borderBottomLeftRadius: "8px",
          py: 2,
        }}
      >
        <Typography variant="h5" fontWeight="bold" align="center">
          {format(startTime, "d")}
        </Typography>
        <Typography variant="body1" align="center">
          {format(startTime, "MMM")}
        </Typography>
        <Typography variant="body2" align="center">
          {format(startTime, "yyyy")}
        </Typography>
      </Box>
      <Box
        sx={{
          flexGrow: 1,
          p: 2,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            {event.title}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={1} mb={1}>
            <EventIcon color="action" fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              {format(startTime, "PP")} - {format(endTime, "PP")}
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1} mb={1}>
            <AccessTimeIcon color="action" fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              {format(startTime, "p")} - {format(endTime, "p")}
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" mt={1}>
            {event.description}
          </Typography>
        </Box>
        <CardActions sx={{ p: 0, mt: 1, justifyContent: "flex-end" }}>
          <Button size="small" color="primary" href={`/${event._id}`}>
            View Details
          </Button>
        </CardActions>

      </Box>
    </Card>
  );
};

EventCard.propTypes = {
  event: PropTypes.shape({
    title: PropTypes.string.isRequired,
    start_time: PropTypes.string.isRequired,
    end_time: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    _id: PropTypes.string.isRequired,
  }).isRequired,
};
