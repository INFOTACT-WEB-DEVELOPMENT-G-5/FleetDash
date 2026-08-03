import { io } from "socket.io-client";
import { decode } from "@msgpack/msgpack";

function resolveSocketUrl() {
  if (import.meta.env.VITE_SOCKET_URL) return import.meta.env.VITE_SOCKET_URL;
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "");
  }
  if (typeof window !== "undefined" && window.location?.origin) {
    if (!window.location.hostname.includes("localhost")) {
      return window.location.origin;
    }
  }
  return "http://localhost:5000";
}

const SOCKET_URL = resolveSocketUrl();

const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
});

export function onVehicleUpdate(handler) {
  const jsonHandler = (payload) => handler(normalizeVehiclePayload(payload));
  const binaryHandler = (buffer) => {
    try {
      const bytes =
        buffer instanceof ArrayBuffer
          ? new Uint8Array(buffer)
          : buffer?.buffer
            ? new Uint8Array(buffer)
            : buffer;
      const decoded = decode(bytes);
      handler(normalizeVehiclePayload(decoded));
    } catch (err) {
      console.error("Failed to decode binary vehicle update", err);
    }
  };

  socket.on("vehicleUpdate", jsonHandler);
  socket.on("vehicleUpdateBinary", binaryHandler);

  return () => {
    socket.off("vehicleUpdate", jsonHandler);
    socket.off("vehicleUpdateBinary", binaryHandler);
  };
}

export function onAlert(handler) {
  socket.on("alert", handler);
  return () => socket.off("alert", handler);
}

function normalizeVehiclePayload(payload) {
  if (!payload) return [];
  const list = Array.isArray(payload) ? payload : [payload];
  return list.map((item) => {
    if (item.location) return item;
    if (item.lat != null && item.lng != null) {
      return {
        ...item,
        location: { lat: item.lat, lng: item.lng },
      };
    }
    return item;
  });
}

export default socket;
