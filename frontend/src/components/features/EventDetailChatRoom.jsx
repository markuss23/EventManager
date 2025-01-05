import { useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import {
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import UserContext from "../../context/UserContext";
import { WS_URL } from "../../variables";

export const EventDetailChatRoom = ({ event, eventId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const user = useContext(UserContext);
  console.log(user);

  useEffect(() => {
    // Establish WebSocket connection
    const ws = new WebSocket(`${WS_URL}chat/${eventId}`);

    ws.onopen = () => {
      console.log("WebSocket connection established.");
      // Send request to load chat history
      ws.send(
        JSON.stringify({
          event_id: eventId,
          user_id: user.user._id,
          name: user.user.username,
          message: "",
          type: "load", // Request to load history
        })
      );
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      // Check if the message is a history message or a new message
      if (Array.isArray(message)) {
        // If it's a history message, set the initial messages
        console.log("Loading history messages...");
        setMessages(message);
      } else {
        // If it's a new message, append it to the messages
        setMessages((prev) => [...prev, message]);
      }
      console.log(message);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed.");
    };

    setSocket(ws);

    // Cleanup on component unmount
    return () => {
      ws.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event._id, user.user.token]);

  const handleSendMessage = () => {
    if (socket && newMessage.trim()) {
      const messageData = {
        event_id: eventId,
        user_id: user.user._id,
        name: user.user.username,
        message: newMessage,
        type: "message",
      };
      console.log(messageData);

      socket.send(JSON.stringify(messageData));
      setNewMessage("");
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Chat for: {event.title}
      </Typography>
      <Box
        sx={{
          maxHeight: "300px",
          overflowY: "auto",
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: "8px",
          marginBottom: "16px",
        }}
      >
        <List>
          {messages.length > 0 ? (
            messages.map((message, index) => (
              <ListItem key={index}>
                <ListItemText
                  align={message.user_id === user.user._id ? "right" : "left"}
                  primary={message.message}
                  secondary={`By: ${message.name}`}
                />
              </ListItem>
            ))
          ) : (
            <Typography variant="body2" color="textSecondary">
              No messages yet.
            </Typography>
          )}
        </List>
      </Box>
      <Box display="flex" gap="8px">
        <TextField
          fullWidth
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSendMessage}
          disabled={!newMessage.trim()}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
};

EventDetailChatRoom.propTypes = {
  event: PropTypes.object.isRequired,
  eventId: PropTypes.string.isRequired,
};
