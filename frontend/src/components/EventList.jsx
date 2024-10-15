import { Divider, List, ListItem, IconButton } from "@mui/material";
import AddTaskIcon from "@mui/icons-material/AddTask";
import PropTypes from "prop-types";
import { useState } from "react";

function EventList(props) {
  const [eventsList, setEventsList] = useState([
    { id: 1, name: "Event 1" },
    { id: 2, name: "Event 2" },
    { id: 3, name: "Event 3" },
    
  ]);

  return (
    <List>
      <h2>Event list</h2>
      <IconButton  color="info">
        {" "}
        <AddTaskIcon />
      </IconButton>
      {eventsList.map((event) => (
        <>
          <ListItem key={event.id}>{event.name}</ListItem>
          <Divider />
        </>
      ))}
    </List>
  );
}

EventList.propTypes = {};

export default EventList;
