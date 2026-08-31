import axios from "axios";

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // for cookies if used
  headers: {
    "Content-Type": "application/json",
  },
});

instance.interceptors.request.use((context) => {
  return context;
});

export { instance as api };
