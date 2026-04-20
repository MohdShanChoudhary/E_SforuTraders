
import axios from "axios";

const API = axios.create({
  baseURL: "https://e-sforutraders.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
});

// Token automatically attach hoga (login ke baad)
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = "Bearer " + token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("API ERROR:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default API;

