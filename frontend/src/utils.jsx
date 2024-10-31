import { Alert, Container } from "@mui/material";
import { isBefore, isAfter, isEqual } from "date-fns";

export default function getAlertRender(text, severity) {
  return (
    <Container>
      <Alert variant="filled" severity={severity}>
        {text}
      </Alert>
    </Container>
  );
}

export function getEventStatus(event) {
  const now = new Date();
  const startTime = new Date(event.start_time);
  const endTime = new Date(event.end_time);

  if (isBefore(now, startTime)) {
    return {
        status: "upcoming",
        color: "#4CAF50"
    };
  } else if (isAfter(now, endTime)) {
    return {
        status: "past",
        color: "#9E9E9E"
    };
  } else if (
    isEqual(now, startTime) ||
    (isAfter(now, startTime) && isBefore(now, endTime))
  ) {
    return {
        status: "current",
        color: "#2196F3"
    };
  }

  return {
        status: "unknown",
        color: "#9E9E9E"
  };
}
