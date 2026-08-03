import { useEffect, useRef, useState } from "react";
import API from "../api/axios";
import { onVehicleUpdate } from "../services/socket";

function mergeVehicles(previous, updates) {
  if (!updates?.length) return previous;

  const map = new Map(
    previous.map((v) => [String(v.vehicleId || v._id), v])
  );

  for (const update of updates) {
    const key = String(update.vehicleId || update._id);
    const existing = map.get(key);
    if (existing) {
      map.set(key, {
        ...existing,
        ...update,
        location: update.location || existing.location,
      });
    } else if (update.vehicleId || update._id) {
      map.set(key, update);
    }
  }

  return Array.from(map.values());
}

function useVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const pendingRef = useRef([]);
  const rafRef = useRef(null);

  const fetchVehicles = async () => {
    try {
      const response = await API.get("/vehicles");
      setVehicles(response.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();

    const flush = () => {
      rafRef.current = null;
      const batch = pendingRef.current;
      pendingRef.current = [];
      if (!batch.length) return;
      setVehicles((prev) => mergeVehicles(prev, batch));
    };

    const unsubscribe = onVehicleUpdate((updates) => {
      pendingRef.current.push(...updates);
      if (rafRef.current == null) {
        rafRef.current = requestAnimationFrame(flush);
      }
    });

    return () => {
      unsubscribe();
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return {
    vehicles,
    loading,
    refresh: fetchVehicles,
  };
}

export default useVehicles;
