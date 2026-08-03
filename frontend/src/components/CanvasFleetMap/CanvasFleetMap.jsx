import { useEffect, useRef } from "react";
import "./CanvasFleetMap.css";

/**
 * High-frequency Canvas fleet layer driven by requestAnimationFrame.
 * Decouples live marker painting from React state commits.
 */
function CanvasFleetMap({ vehicles = [], width = 900, height = 420 }) {
  const canvasRef = useRef(null);
  const vehiclesRef = useRef(vehicles);
  const rafRef = useRef(null);

  useEffect(() => {
    vehiclesRef.current = vehicles;
  }, [vehicles]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const project = (lat, lng) => {
      // Simple equirectangular projection centered on India
      const minLat = 8;
      const maxLat = 35;
      const minLng = 68;
      const maxLng = 90;
      const x = ((lng - minLng) / (maxLng - minLng)) * canvas.width;
      const y = ((maxLat - lat) / (maxLat - minLat)) * canvas.height;
      return { x, y };
    };

    const draw = () => {
      const list = vehiclesRef.current || [];
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Atmosphere
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, "#0b1220");
      gradient.addColorStop(1, "#111827");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid
      ctx.strokeStyle = "rgba(148, 163, 184, 0.08)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 10; i++) {
        const x = (canvas.width / 10) * i;
        const y = (canvas.height / 10) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      for (const vehicle of list) {
        const lat = vehicle.location?.lat;
        const lng = vehicle.location?.lng;
        if (lat == null || lng == null) continue;

        const { x, y } = project(lat, lng);
        let color = "#22c55e";
        if (vehicle.status === "Offline") color = "#64748b";
        else if ((vehicle.speed || 0) > 80) color = "#ef4444";
        else if ((vehicle.speed || 0) > 50) color = "#f59e0b";

        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "rgba(226, 232, 240, 0.9)";
        ctx.font = "10px ui-monospace, SFMono-Regular, Menlo, monospace";
        ctx.fillText(vehicle.vehicleId || "", x + 8, y - 6);
      }

      ctx.fillStyle = "rgba(148, 163, 184, 0.9)";
      ctx.font = "12px Inter, system-ui, sans-serif";
      ctx.fillText(`${list.length} vehicles · Canvas rAF`, 14, 22);

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="canvas-fleet-map card">
      <div className="canvas-fleet-map__header">
        <h3>Live Canvas Viewport</h3>
        <span>requestAnimationFrame · 60 FPS target</span>
      </div>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="canvas-fleet-map__canvas"
      />
    </div>
  );
}

export default CanvasFleetMap;
