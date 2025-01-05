import PropTypes from "prop-types";
import { Card, CardContent, Typography, Avatar, Box } from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

const UserDetail = ({ user }) => {
  const initials = `${user.first_name[0]}${user.last_name[0]}`;

  return (
    <Card sx={{ padding: 2 }}>
      {" "}
      {/* Removed flex for better vertical layout */}
      <Box sx={{ display: "flex", alignItems: "center", marginBottom: 2 }}>
        {" "}
        {/* Avatar and Initials */}
        <Avatar
          sx={{ bgcolor: "primary.main", color: "white", marginRight: 1 }}
        >
          {initials}
        </Avatar>
        <Typography variant="h6" component="div">
          {user.first_name} {user.last_name}
        </Typography>
      </Box>
      <CardContent sx={{ padding: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", marginBottom: 1 }}>
          {" "}
          {/* Username with Icon */}
          <AccountCircleIcon sx={{ marginRight: 1, color: "text.secondary" }} />
          <Typography variant="body1">{user.username}</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {" "}
          {/* Email with Icon */}
          <EmailIcon sx={{ marginRight: 1, color: "text.secondary" }} />
          <Typography variant="body1">{user.email}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default UserDetail;

UserDetail.propTypes = {
  user: PropTypes.object.isRequired,
};
