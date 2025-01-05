import { useContext, useState } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Button,
  Modal,
  TextField,
  Typography,
  ListItem,
  IconButton,
  List,
  Alert,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { API_URL } from "../../variables";
import UserContext from "../../context/UserContext";

const CreateEventStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

function CreateEvent({ open, handleClose }) {
  const user = useContext(UserContext);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState(dayjs());
  const [endTime, setEndTime] = useState(dayjs());
  const [reminders, setReminders] = useState([]);
  const [newReminderTime, setNewReminderTime] = useState("");
  const [newReminderText, setNewReminderText] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(""); // Clear any previous errors

    if (!title || !title.trim()) {
      setError("Please fill in the title.");
      return;
    }

    if (title.length > 50 || title.length < 4) {
      setError("Title should be less than 50 characters and more than 3 characters.");
      return;
    }

    if (description.length > 250) {
      setError("Description should be less than 250 characters.");
      return;
    }
      
    if (!startTime || !endTime) {
      setError("Please fill in the start and end time.");
      return;
    }


    if (startTime.isAfter(endTime)) {
      setError("End time should be after start time.");
      return;
    }
    const eventObject = {
      title,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      description,
      creator: user.user._id,
      attendees: [],
      reminders,
    };

    fetch(`${API_URL}/events/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.user.token}`,
      },
      body: JSON.stringify(eventObject),
    })
      .then((response) => {
        if (!response.ok) {
          if (response.status === 400) {
            throw new Error("Bad Request: Check your input data.");
          } else if (response.status === 409) {
            throw new Error(`Conflict: Event already exists.`);
          } else if (response.status === 401) {
            throw new Error("Unauthorized: Please log in again.");
          } else if (response.status === 500) {
            throw new Error("Server error, please try again later.");
          } else {
            throw new Error(`Unexpected error: ${response.statusText}`);
          }
        }
        window.location.reload();
        return response.json();
      })
      .then(() => {
        setTitle("");
        setDescription("");
        setStartTime(dayjs());
        setEndTime(dayjs());
        setReminders([]);
        setNewReminderTime("");
        setNewReminderText("");
        handleClose();

      })
      .catch((error) => {
        setError(error.message);
        console.error("Error:", error.message);
      });
  };

  const handleAddReminder = () => {
    if (newReminderTime && newReminderText) {
      setReminders([
        ...reminders,
        { reminder_time: newReminderTime, reminder_text: newReminderText },
      ]);
      setNewReminderTime("");
      setNewReminderText("");
    }
  };

  const handleDeleteReminder = (index) => {
    const updatedReminders = reminders.filter((_, i) => i !== index);
    setReminders(updatedReminders);
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={CreateEventStyle}>
        <form onSubmit={handleSubmit}>
          <Typography variant="h6" component="h2">
            Create Event
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            label="Title"
            variant="outlined"
            margin="normal"
            required
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            label="Description"
            variant="outlined"
            margin="normal"
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
              }}
            >
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                  label="Start Date"
                  value={startTime}
                  required
                  onChange={(newValue) => setStartTime(newValue)}
                  sx={{ mb: 2 }}
                />
              </LocalizationProvider>
              <DateTimePicker
                label="End Date"
                value={endTime}
                required
                onChange={(newValue) => setEndTime(newValue)}
                sx={{ mb: 2 }}
              />
            </div>
          </LocalizationProvider>

          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            Reminders:
          </Typography>
          <div>
            <TextField
              label="Reminder Time (minutes)"
              type="number"
              value={newReminderTime}
              onChange={(e) => setNewReminderTime(e.target.value)}
              sx={{ mr: 1, width: "40%" }}
            />
            <TextField
              label="Reminder Text"
              value={newReminderText}
              onChange={(e) => setNewReminderText(e.target.value)}
              sx={{ width: "50%" }}
            />
            <Button
              variant="contained"
              onClick={handleAddReminder}
              sx={{ ml: 1, mt: 1 }}
            >
              Add Reminder
            </Button>
          </div>
          <List>
            {reminders.map((reminder, index) => (
              <ListItem
                key={index}
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDeleteReminder(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                {reminder.reminder_time} minutes before:{" "}
                {reminder.reminder_text}
              </ListItem>
            ))}
          </List>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "16px",
            }}
          >
            <Button variant="contained" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="success">
              Create
            </Button>
          </div>
        </form>
      </Box>
    </Modal>
  );
}

CreateEvent.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
};

export default CreateEvent;
