import {
    Box,
    Typography,
    Container,
    Divider,
    Button,
    Stack,
    Alert,
  } from "@mui/material";
  import { format, differenceInMinutes } from "date-fns";
  import AccessTimeIcon from "@mui/icons-material/AccessTime";
  import EventIcon from "@mui/icons-material/Event";
  import PersonIcon from "@mui/icons-material/Person";
  import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
  import PropTypes from "prop-types";
  
  const EventDetail = ({ event }) => {
    const startTime = new Date(event.start_time);
    const endTime = new Date(event.end_time);
    const duration = differenceInMinutes(endTime, startTime);
  
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Box
          sx={{
            p: 3,
            borderRadius: "0 0 8px 8px",
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {event.title}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={1} mb={1}>
            <EventIcon color="action" fontSize="small" />
            <Typography variant="body1" color="text.secondary">
              {format(startTime, "PP")} - {format(endTime, "PP")}
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1} mb={2}>
            <AccessTimeIcon color="action" fontSize="small" />
            <Typography variant="body1" color="text.secondary">
              {format(startTime, "p")} - {format(endTime, "p")} ({duration} min)
            </Typography>
          </Stack>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Description
          </Typography>
          <Typography variant="body1" paragraph>
            {event.description}
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Organizer
          </Typography>
          <Stack direction="row" alignItems="center" spacing={1} mb={2}>
            <PersonIcon color="action" fontSize="small" />
            <Typography variant="body1" color="text.secondary">
              {event.creator} {/* Replace with actual organizer name retrieval */}
            </Typography>
          </Stack>
          {event.reminders && event.reminders.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Notifications
              </Typography>
              <Stack direction="column" spacing={1}>
                {event.reminders.map((reminder) => (
                  <Alert
                    key={reminder.reminder_time}
                    icon={<NotificationsActiveIcon />}
                    severity="info"
                  >
                    {reminder.reminder_text}
                  </Alert>
                ))}
              </Stack>
            </>
          )}
          <Divider sx={{ my: 2 }} />
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button variant="outlined">Sdílet</Button>
            <Button variant="contained">Zúčastnit se</Button>
          </Stack>
        </Box>
      </Container>
    );
  };
  
  EventDetail.propTypes = {
    event: PropTypes.shape({
      title: PropTypes.string.isRequired,
      start_time: PropTypes.string.isRequired,
      end_time: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      creator: PropTypes.string.isRequired,
      reminders: PropTypes.arrayOf(
        PropTypes.shape({
          reminder_time: PropTypes.string.isRequired,
          reminder_text: PropTypes.string.isRequired,
        })
      ),
    }).isRequired,
  };
  
  export default EventDetail;