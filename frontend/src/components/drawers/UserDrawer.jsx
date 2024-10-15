import React from "react";
import PropTypes from "prop-types";
import { Drawer } from "@mui/material";

function UserDrawer({ open, handleClose }) {
  return (
    <React.Fragment anchor={"right"}>
      <Drawer open={open} onClose={handleClose} anchor="right">
        <div>
          <h1>User Drawer</h1>
        </div>
      </Drawer>
    </React.Fragment>
  );
}

UserDrawer.propTypes = {};

export default UserDrawer;
