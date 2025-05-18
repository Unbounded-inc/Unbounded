import { io } from "socket.io-client";

const API_BASE = import.meta.env.PROD ? "" : "http://localhost:5001";
export const socket = io(API_BASE, {
  withCredentials: true,
});