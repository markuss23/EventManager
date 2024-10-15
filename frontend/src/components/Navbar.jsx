import { useContext, useState } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import LogIn from "./modals/LogIn";
import UserContext from "../context/UserContext";
import UserDrawer from "./drawers/UserDrawer";

export default function Navbar() {
  const user = useContext(UserContext);

  const [openLogIn, setOpenLogIn] = useState(false);
  const [openUserDrawer, setOpenUserDrawer] = useState(false);

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

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Events
          </Typography>
          {user.user ? (
            <Button onClick={handleOpenUserDrawer} color="inherit">
              {" "}
              {user.user.username}{" "}
            </Button>
          ) : (
            <>
              <Button onClick={handleOpenLogIn} color="inherit">
                Login
              </Button>
            </>
          )}
          <UserDrawer open={openUserDrawer} handleClose={handleCloseUserDrawer} />
          <LogIn open={openLogIn} handleClose={handleCloseLogIn} />
        </Toolbar>
      </AppBar>
    </Box>
  );
}
