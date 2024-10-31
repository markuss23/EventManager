import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import { Snackbar, Alert } from "@mui/material";

function Websocket({ event }) {
  const socketRef = useRef(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    if (!event || socketRef.current) return;

    // Initialize WebSocket connection
    socketRef.current = new WebSocket(`ws://127.0.0.1:8000/ws/notification/${event._id}`);

    // Connection opened
    socketRef.current.addEventListener("open", () => {
      console.log("WebSocket connection established");
      socketRef.current.send("Connection established");
    });

    // Listen for messages
    socketRef.current.addEventListener("message", (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Message from server ", data);

        // Check if the message is an expiration message
        if (data.type === "expiration") {
          setSnackbarMessage(`Event ${data.event_id} has expired.`);
          setOpenSnackbar(true);
        }
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    });

    // Cleanup WebSocket on unmount
    return () => {
      if (socketRef.current) {
        console.log("Closing WebSocket connection");
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close the snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setOpenSnackbar(false);
  };

  return (
    <div>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={handleCloseSnackbar} severity="warning" sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}

Websocket.propTypes = {
  event: PropTypes.object.isRequired,
};

export default Websocket;
