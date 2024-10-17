import { useState } from "react";
import PropTypes from "prop-types";
import { Box, Button, Modal, TextField, Typography } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

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

function CreateEvent({ open, handleClose, onCreate }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState(dayjs());
  const [endTime, setEndTime] = useState(dayjs());

  const handleSubmit = (e) => {
    e.preventDefault();
    const eventObject = {
      title,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      description,
      owner_id: "670ebab70ee831bcf8c4c924", // You can replace this with the actual owner ID
      attendees: [],
    };

    // Call the parent callback to create the event
    onCreate(eventObject);

    handleClose(); // Close the modal after submission
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
  onCreate: PropTypes.func.isRequired, // Expect a function to be passed for event creation
};

export default CreateEvent;
