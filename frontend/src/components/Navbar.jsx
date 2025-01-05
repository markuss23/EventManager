import { useContext, useState } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import LogIn from "./modals/LogIn";
import UserContext from "../context/UserContext";
import UserDrawer from "./features/UserDrawer";
import { Link } from "react-router-dom";
import AddTaskIcon from "@mui/icons-material/AddTask";
import CreateEvent from "./modals/CreateEvent";

export default function Navbar() {
  const user = useContext(UserContext);
  
  const [openLogIn, setOpenLogIn] = useState(false);
  const [openUserDrawer, setOpenUserDrawer] = useState(false);
  const [openCreateEvent, setOpenCreateEvent] = useState(false);

  const handleOpenUserDrawer = () => {
    setOpenUserDrawer(true);
  };

  const handleCloseUserDrawer = () => {
    setOpenUserDrawer(false);
  }

  const handleOpenLogIn = () => {
    setOpenLogIn(true);
  };

  const handleCloseLogIn = () => {
    setOpenLogIn(false);
  };

  const handleOpenCreateEvent = () => {
    setOpenCreateEvent(true);
  };

  const handleCloseCreateEvent = () => {
    setOpenCreateEvent(false);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Link
            to="/"
            style={{
              textDecoration: "none",
              color: "white",
              flexGrow: 1,
            }}
          >
            <Button color="inherit">Home</Button>
          </Link>
          {
            user.user && (
              <Button onClick={handleOpenCreateEvent} color="inherit">
                <AddTaskIcon />
              </Button>
            )
          }
          {user.user ? (
            <Button onClick={handleOpenUserDrawer} color="inherit">
              {user.user.username}
            </Button>
          ) : (
            <>
              <Button onClick={handleOpenLogIn} color="inherit">
                Login
              </Button>
            </>
          )}
          {user.user && (
            <UserDrawer
              open={openUserDrawer}
              handleClose={handleCloseUserDrawer}
              user={user.user}
            />
          )}
          <LogIn open={openLogIn} handleClose={handleCloseLogIn} />
          <CreateEvent
            open={openCreateEvent}
            handleClose={handleCloseCreateEvent}
          />
        </Toolbar>
      </AppBar>
    </Box>
  );
}
