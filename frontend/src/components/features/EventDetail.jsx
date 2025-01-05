import {
  Box,
  Typography,
  Container,
  Divider,
  Button,
  Stack,
  Alert,
  Modal,
} from "@mui/material";
import { format, differenceInMinutes } from "date-fns";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EventIcon from "@mui/icons-material/Event";
import PersonIcon from "@mui/icons-material/Person";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import PropTypes from "prop-types";
import QRCode from "react-qr-code"; // Import QR code library
import EditEvent from "../modals/EditEvent";
import { useState, useRef } from "react";
import { APP_URL } from "../../variables";
import { useNavigate } from "react-router-dom";

const EventDetail = ({ event, eventID, onDelete }) => {
  const startTime = new Date(event.start_time);
  const endTime = new Date(event.end_time);
  const duration = differenceInMinutes(endTime, startTime);

  const [openEditEvent, setOpenEditEvent] = useState(false);
  const [openShareModal, setOpenShareModal] = useState(false);
  const qrCodeRef = useRef();  

  const navigate = useNavigate();
  
    const handleGoToDetail = (messageId) => {
      navigate(`/users/${messageId}`); // Navigace na detail
    };

  const handleOpenEditEvent = () => {
    setOpenEditEvent(true);
  };

  const handleCloseEditEvent = () => {
    setOpenEditEvent(false);
  };

  const handleOpenShareModal = () => {
    setOpenShareModal(true);
  };

  const handleCloseShareModal = () => {
    setOpenShareModal(false);
  };

  const copyQRCodeToClipboard = async () => {
    // created by CHATGPT
    try {
      const svgElement = qrCodeRef.current.querySelector("svg");
      if (svgElement) {
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const blob = new Blob([svgData], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);

        const image = new Image();
        image.onload = async () => {
          const canvas = document.createElement("canvas");
          canvas.width = image.width;
          canvas.height = image.height;
          const context = canvas.getContext("2d");
          context.drawImage(image, 0, 0);
          URL.revokeObjectURL(url);

          const blob = await new Promise((resolve) =>
            canvas.toBlob(resolve, "image/png")
          );
          const clipboardItem = new ClipboardItem({ "image/png": blob });
          await navigator.clipboard.write([clipboardItem]);
        };
        image.src = url;
      } else {
        alert("Failed to find QR code.");
      }
    } catch (error) {
      console.error("Error copying QR code to clipboard:", error);
      alert("Failed to copy QR code to clipboard.");
    }
  };

  const getOrganizerName = () => {
    const organizer = event.attendees.find((attendee) => attendee.creator);
    return organizer ? organizer.username : "Not specified";
  };

  const handleDeleteEvent = () => {
    if (onDelete) {
      onDelete(eventID);
    }
  };

  console.log(event.attendees);
  

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
        <Typography variant="body1">{event.description}</Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" gutterBottom>
          Organizer
        </Typography>
        <Stack direction="row" alignItems="center" spacing={1} mb={2}>
          <PersonIcon color="action" fontSize="small" />
          <Typography
            variant="body1"
            color="text.secondary"
            onClick={() => handleGoToDetail(event.creator)}
            style={{ cursor: "pointer" }}
          >
            {getOrganizerName(event)}
          </Typography>
        </Stack>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" gutterBottom>
          Attendees
        </Typography>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          flexWrap="wrap"
          mb={2}
        >
          <PersonIcon color="action" fontSize="small" />
          {event.attendees && event.attendees.length > 0 ? (
            event.attendees.map((attendee) => (
              <Typography
                key={attendee.username}
                variant="body1"
                color="text.secondary"
                onClick={() => handleGoToDetail(attendee.id)}
                style={{ cursor: "pointer" }}
              >
                {attendee.username}
              </Typography>
            ))
          ) : (
            <Typography variant="body1" color="text.secondary">
              No attendees
            </Typography>
          )}
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
          <Button variant="outlined" onClick={handleOpenShareModal}>
            Share
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={handleOpenEditEvent}
          >
            Edit
          </Button>
          <Button variant="contained" color="error" onClick={handleDeleteEvent}>
            Delete
          </Button>

          <EditEvent
            open={openEditEvent}
            handleClose={handleCloseEditEvent}
            event={event}
            eventId={eventID}
          />
        </Stack>
      </Box>

      <Modal
        open={openShareModal}
        onClose={handleCloseShareModal}
        aria-labelledby="share-modal-title"
        aria-describedby="share-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 300,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography id="share-modal-title" variant="h4" component="h2" mb={2}>
            Share Event
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <div ref={qrCodeRef}>
            <QRCode value={`${APP_URL}/event/${eventID}`} size={300} />
          </div>
          <Button
            variant="contained"
            color="primary"
            onClick={copyQRCodeToClipboard}
            sx={{ mt: 2 }}
            fullWidth
          >
            Copy QR Code
          </Button>
          <Button
            onClick={handleCloseShareModal}
            variant="contained"
            color="secondary"
            sx={{ mt: 2 }}
            fullWidth
          >
            Close
          </Button>
        </Box>
      </Modal>
    </Container>
  );
};

EventDetail.propTypes = {
  event: PropTypes.object.isRequired,
  eventID: PropTypes.string.isRequired,
  onDelete: PropTypes.func,
};

export default EventDetail;