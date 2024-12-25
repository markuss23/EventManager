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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
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
  const [reminders, setReminders] = useState([]); // Stav pro pole připomenutí
  const [newReminderTime, setNewReminderTime] = useState("");
  const [newReminderText, setNewReminderText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
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
        if (response.ok) {
          handleClose();
        } else {
          throw new Error("Failed to create event.");
        }
      })

    handleClose(); // Close the modal after submission
  };

  const handleAddReminder = () => {
    if (newReminderTime && newReminderText) {
      setReminders([...reminders, { reminder_time: newReminderTime, reminder_text: newReminderText }]);
      setNewReminderTime("");
      setNewReminderText("");
    }
  };

  const handleDeleteReminder = (index) => {
    const updatedReminders = [...reminders];
    updatedReminders.splice(index, 1);
    setReminders(updatedReminders);
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={CreateEventStyle}>
        <form onSubmit={handleSubmit}>
          <Typography variant="h6" component="h2">
            Create Event
          </Typography>
          <TextField
            label="Title"
            variant="outlined"
            margin="normal"
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
              <DatePicker
                label="Start Date"
                value={startTime}
                onChange={(newValue) => setStartTime(newValue)}
                sx={{ mb: 2 }}
              />
              <DatePicker
                label="End Date"
                value={endTime}
                onChange={(newValue) => setEndTime(newValue)}
                sx={{ mb: 2 }}
              />
            </div>
          </LocalizationProvider>

          <Typography variant="subtitle1" sx={{ mt: 2 }}>Reminders:</Typography>
          <div>
            <TextField
              label="Reminder Time (minutes)"
              type="number"
              value={newReminderTime}
              onChange={(e) => setNewReminderTime(e.target.value)}
              sx={{ mr: 1, width: '40%' }}
            />
            <TextField
              label="Reminder Text"
              value={newReminderText}
              onChange={(e) => setNewReminderText(e.target.value)}
              sx={{ width: '50%' }}
            />
            <Button variant="contained" onClick={handleAddReminder} sx={{ ml: 1, mt:1 }}>
              Add Reminder
            </Button>
          </div>
          <List>
            {reminders.map((reminder, index) => (
              <ListItem key={index} secondaryAction={
                <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteReminder(index)}>
                  <DeleteIcon />
                </IconButton>
              }>
                {reminder.time} minutes before: {reminder.text}
              </ListItem>
            ))}
          </List>

          <div
            style={{ display: "flex", justifyContent: "space-between", mx: 5 }}
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
  onCreate: PropTypes.func.isRequired,
};

export default CreateEvent;
