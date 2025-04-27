import axios from "axios";
const production = "";
// const local = "https://hotel-softmariyam.onrender.com/";
const local = "http://localhost:4000";
const api = axios.create({
  baseURL: `${local}/api/v1`,
  withCredentials: true,
});
export default api;
