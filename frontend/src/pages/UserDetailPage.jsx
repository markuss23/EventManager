import { useState, useEffect, useContext } from "react";
import { Container, Box, CircularProgress } from "@mui/material";
import { useParams } from "react-router-dom";
import UserContext from "../context/UserContext";
import getAlertRender from "../utils";
import { API_URL } from "../variables";

import UserDetail from "../components/features/UserDetail";

function UserDetailPage() {
  const { id } = useParams(); // Get the id from the URL parameters
  const [userDetail, setUserDetail] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = useContext(UserContext);

  useEffect(() => {
    const fetchEvents = () => {
      fetch(`${API_URL}/users/${id}`, {
        // Use the id in the API URL
        headers: {
          Authorization: `Bearer ${user.user.token}`,
        },
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else if (response.status === 400) {
            throw new Error("Invalid request.");
          } else if (response.status === 404) {
            throw new Error("User not found.");
          } else {
            throw new Error("Failed to fetch user.");
          }
        })
        .then((data) => {
          setUserDetail(data);
          setLoading(false);
        })
        .catch((error) => {
          console.log(error);

          setError(error.message);
          setLoading(false);
        });
    };

    if (user.user.token) {
      fetchEvents();
    }
  }, [id, user.user._id, user.user.token]); // Add id to the dependency array

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" m={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Box my={4}>{getAlertRender(error, "error")}</Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <UserDetail user={userDetail} />
      </Box>
    </Container>
  );
}

export default UserDetailPage;
