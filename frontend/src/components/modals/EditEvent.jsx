import { useContext, useState, useEffect } from "react";
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
  Autocomplete,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { API_URL } from "../../variables";
import UserContext from "../../context/UserContext";

import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Europe/Prague');

const EditEventStyle = {
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

function EditEvent({ open, handleClose, event, eventId }) {
  const user = useContext(UserContext);

  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description);
  const [startTime, setStartTime] = useState(dayjs(event.start_time));
  const [endTime, setEndTime] = useState(dayjs(event.end_time));
  const [reminders, setReminders] = useState(event.reminders);
  const [newReminderTime, setNewReminderTime] = useState("");
  const [newReminderText, setNewReminderText] = useState("");
  const [error, setError] = useState("");
  const [attendees, setAttendees] = useState(event.attendees || []);
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    if (user && user.user && user.user.token) {
      fetch(`${API_URL}/users/`, {
        headers: {
          Authorization: `Bearer ${user.user.token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => setAllUsers(data))
        .catch((error) => console.error("Error fetching users:", error));
    }
  }, [user]);

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

    if (!user || !user.user || !user.user.token) {
      setError("User is not authenticated.");
      return;
    }
    let attendees_id_list = []

    if (attendees) {
      attendees.forEach(element => {
        console.log(element);
        
        if (element.id !== undefined && element.id !== null)
        attendees_id_list.push(element.id);

        if (element._id !== undefined && element._id !== null)
          attendees_id_list.push(element._id);
        
      });
    }
    const eventObject = {
      title,
      start_time: startTime.utc(true).format(),
      end_time: endTime.utc(true).format(),
      description,
      creator: event.creator,
      attendees: attendees_id_list,
      reminders,
    };

    fetch(`${API_URL}/events/${eventId}`, {
      method: "PUT",
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
        setAttendees([]);
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
      <Box sx={EditEventStyle}>
        <form onSubmit={handleSubmit}>
          <Typography variant="h6" component="h2">
            Edit Event
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
              <DateTimePicker
                label="Start Date"
                value={startTime}
                required
                onChange={(newValue) => setStartTime(newValue)}
                sx={{ mb: 2 }}
              />
              <DateTimePicker
                label="End Date"
                value={endTime}
                required
                onChange={(newValue) => setEndTime(newValue)}
                sx={{ mb: 2 }}
              />
            </div>
          </LocalizationProvider>

          <Autocomplete
            multiple
            options={allUsers}
            getOptionLabel={(option) => option.username}
            value={attendees}
            onChange={(event, newValue) => setAttendees(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label="Attendees"
                placeholder="Select attendees"
                margin="normal"
                fullWidth
              />
            )}
            sx={{ mb: 2 }}
          />

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
            <Button type="submit" variant="contained" color="warning">
              Edit
            </Button>
          </div>
        </form>
      </Box>
    </Modal>
  );
}

EditEvent.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  event: PropTypes.object,
  eventId: PropTypes.string,
};

export default EditEvent;