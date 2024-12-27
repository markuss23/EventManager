import PropTypes from "prop-types";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useRef, useState } from "react";
import { API_URL, WS_URL } from "../../variables";
import { useNavigate } from "react-router-dom";

function UserDrawer({ open, handleClose, user }) {
  const ws = useRef(null);
  const [messages, setMessages] = useState([]);
  const [wsConnected, setWsConnected] = useState(false);
  const [userDetail, setUserDetail] = useState();

  const navigate = useNavigate();
  console.log(user);

  useEffect(() => {
    if (!user || !user._id) return;

    ws.current = new WebSocket(`${WS_URL}${user._id}`);

    ws.current.onopen = () => {
      console.log("Connected to websocket");
      setWsConnected(true);
    };

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      message["seen"] = false;
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    ws.current.onclose = () => {
      console.log("Disconnected from websocket");
      setWsConnected(false);
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      setWsConnected(false);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [user]);

  useEffect(() => {
    const fetchUserDetail = async () => {
      try {
        const response = await fetch(`${API_URL}/users/${user._id}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch user details.");
        }
        const data = await response.json();
        setUserDetail(data);
      } catch (error) {
        console.error(error);
      }
    };

    if (user.token) {
      fetchUserDetail();
    }
  }, [user]);

  const handleMarkSeen = (message) => {
    if (
      !message.seen &&
      ws.current &&
      ws.current.readyState === WebSocket.OPEN
    ) {
      const seenMessage = { ...message, seen: true };
      ws.current.send(JSON.stringify(seenMessage));
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.event_id === message.event_id ? seenMessage : msg
        )
      );
    }
  };

  const handleMarkAllSeen = () => {
    messages.forEach((message) => handleMarkSeen(message));
  };

  const handleDeleteAllNotifications = () => {
    // Zde by se odesílala žádost na server pro smazání notifikací
    // Prozatím pouze vymažeme lokální stav
    setMessages([]);
  };

  const handleGoToDetail = (messageId) => {
    navigate(`/${messageId}`);
    handleClose();
  };

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      anchor="right"
      PaperProps={{
        sx: {
          width: { xs: "90%", sm: 400 },
          padding: 2,
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography variant="h6" component="h2">
          Profile Info
        </Typography>
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider sx={{ mb: 2 }} />
      <Box sx={{ p: 2 }}>
        {userDetail && (
          <div>
            <Typography>Username: {userDetail.username}</Typography>
            <Typography>First name: {userDetail.first_name}</Typography>
            <Typography>last name: {userDetail.last_name}</Typography>
          </div>
        )}

        <Typography variant="body2" color={wsConnected ? "green" : "red"}>
          WebSocket: {wsConnected ? "Connected" : "Disconnected"}
        </Typography>
      </Box>
      <Divider sx={{ mb: 2 }} />

      <Box sx={{ overflowY: "auto", flexGrow: 1, p: 2 }}>
        <Typography variant="h6">Notifications</Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 2,
            px: 2,
          }}
        >
          <Button
            variant="contained"
            onClick={handleMarkAllSeen}
            sx={{ mr: 2 }}
          >
            Mark All Seen
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteAllNotifications}
          >
            Delete All
          </Button>
        </Box>
        <List>
          {messages.map((message, index) => (
            <ListItem
              key={index}
              alignItems="flex-start"
              sx={{
                borderBottom: "1px solid #eee",
              }}
            >
              <Grid container spacing={2} alignItems="center">
                <Grid
                  item
                  xs={9}
                  onClick={() => handleMarkSeen(message)}
                  sx={{
                    cursor: "pointer",
                    backgroundColor: message.seen ? "#f0f0f0" : "white",
                    "&:hover": {
                      backgroundColor: message.seen ? "#e0e0e0" : "#f5f5f5",
                    },
                    padding: 2,
                  }}
                >
                  {/* Přidán padding */}
                  <ListItemText
                    primary={message.event_title}
                    secondary={
                      <>
                        {message.reminder_text}
                        {message.seen && (
                          <Chip
                            label="Seen"
                            size="small"
                            sx={{
                              ml: 1,
                              color: "grey",
                              backgroundColor: "lightgrey",
                            }}
                          />
                        )}
                      </>
                    }
                  />
                </Grid>
                <Grid
                  item
                  xs={3}
                  display="flex"
                  justifyContent="flex-end"
                  padding={1}
                >
                  {" "}
                  {/* Přidán padding */}
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGoToDetail(message.event_id);
                    }}
                  >
                    Detail
                  </Button>
                </Grid>
              </Grid>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
}

UserDrawer.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
};

export default UserDrawer;
