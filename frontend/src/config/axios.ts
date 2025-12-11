import axios from "axios";

export const axiosClient = axios.create({
  baseURL: process.env.SERVER_URL || "http://localhost:4000",
  withCredentials: false,
});
