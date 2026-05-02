const BASE = "http://localhost:5000";

export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("email");
};

export const getToken = () => localStorage.getItem("token");

// Profile API calls
export const getProfile = async () => {
  const res = await fetch(`${BASE}/api/profile`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.json();
};

export const updateProfile = async (data) => {
  const res = await fetch(`${BASE}/api/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
};