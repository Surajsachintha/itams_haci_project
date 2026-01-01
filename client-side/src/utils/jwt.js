import api from '../axiosConfig';

export function getPayloadFromToken() {
  const token = localStorage.getItem("accessToken");
  if (!token) return null;

  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid token format");
  }

  try {
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    return payload;
  } catch (err) {
    console.error("Failed to decode token:", err);
    return null;
  }
}


async function getClientIP() {
  try {
    const res = await fetch("https://api.ipify.org?format=json");
    const data = await res.json();
    return data.ip;
  } catch (err) {
    console.error("Failed to fetch IP address:", err);
    return null;
  }
}

export async function sendUserLogs(page, event, rowID, old_data, new_data) {
  try {
    const user = getPayloadFromToken();
    if (!user || !user.id) {
      throw new Error("User ID not found in token");
    }

    const ip_address = await getClientIP();

    const logData = {
      user_id: user.id,
      page,
      event,
      rowID,
      old_data,
      new_data,
      ip_address
    };

    const response = await api.post("/userlog", logData);
    return response.data;
  } catch (err) {
    console.error("Failed to send user logs:", err);
    return null;
  }
}