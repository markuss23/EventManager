import { List, IconButton, Grid2, Divider } from "@mui/material";
import AddTaskIcon from "@mui/icons-material/AddTask";
import PropTypes from "prop-types";
import { useState, useEffect, useContext, useCallback } from "react";
import UserContext from "../../context/UserContext";
import EventCard from "./EventCard";
import CreateEvent from "../modals/CreateEvent";

const EventListRender = ({ events }) => {
  return (
    <Grid2 container spacing={2}>
      {events &&
        events.map((event) => (
          <Grid2 item xs={12} sm={6} md={4} key={event._id}>
            <EventCard event={event} />
          </Grid2>
        ))}
    </Grid2>
  );
};

function EventList() {
  const user = useContext(UserContext);
  const [eventsListData, setEventsListData] = useState([]);
  const [openCreateEvent, setOpenCreateEvent] = useState(false);

  const handleOpenCreateEvent = () => {
    setOpenCreateEvent(true);
  };

  const handleCloseCreateEvent = () => {
    setOpenCreateEvent(false);
  };

  // Callback to create an event
  const handleCreateEvent = useCallback(
    (eventObject) => {
      fetch("http://127.0.0.1:8000/events/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventObject),
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error(`Unexpected status code: ${response.status}`);
          }
        })
        .then((data) => {
          if (user.user._id === data.owner_id) {
            console.log(data);

            setEventsListData((prevEvents) => [...prevEvents, data]);
          }
        })
        .catch((error) => {
          console.error("Error:", error.message);
        });
    },
    [user.user]
  );

  useEffect(() => {
    if (user.user) {
      fetch("http://127.0.0.1:8000/events/user/" + user.user._id)
        .then((res) => res.json())
        .then((data) => {
          setEventsListData(data);
        });
    }
  }, [user.user]);

  return (
    <>
      <List>
        <h2>Event list</h2>
        <IconButton color="info" onClick={handleOpenCreateEvent}>
          <AddTaskIcon color="success" />
        </IconButton>
        <Divider />
        <EventListRender events={eventsListData} />
      </List>
      <CreateEvent
        open={openCreateEvent}
        handleClose={handleCloseCreateEvent}
        onCreate={handleCreateEvent} // Pass the callback to the child
      />
    </>
  );
}

EventList.propTypes = {
  events: PropTypes.array,
};

EventListRender.propTypes = {
  events: PropTypes.array.isRequired,
};

export default EventList;
