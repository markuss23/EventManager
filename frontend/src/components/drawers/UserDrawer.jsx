import PropTypes from "prop-types";
import { Drawer } from "@mui/material";

function UserDrawer({ open, handleClose }) {
  return (
      <Drawer open={open} onClose={handleClose} anchor="right">
        <div>
          <h1>User Drawer</h1>
        </div>
      </Drawer>
  );
}

UserDrawer.propTypes = {
    open: PropTypes.bool,
    handleClose: PropTypes.func,
};

export default UserDrawer;
