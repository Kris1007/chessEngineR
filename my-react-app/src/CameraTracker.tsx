import { useEffect, useRef, useState } from "react";

type CameraTrackerProps = {
  onMoveDetected?: (squares: string[]) => void;
};

export default function CameraTracker({ onMoveDetected }: CameraTrackerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [calibrating, setCalibrating] = useState(false);
  const [corners, setCorners] = useState<{ x: number; y: number }[]>([]);
  const [debugInfo, setDebugInfo] = useState("");
  const onMoveRef = useRef(onMoveDetected);
  onMoveRef.current = onMoveDetected;

  // Start default camera
  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Failed to start camera:", err);
      }
    }
    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // WebSocket connection
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8765");

    socket.onopen = () => {
      console.log("Connected to Python CV Server");
      setConnected(true);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.status === "calibrated") {
          setDebugInfo("Baseline captured! Waiting for moves...");
        } else if (data.debug) {
          const top = data.top;
          setDebugInfo(`${top[0].sq}=${top[0].change} | ${top[1].sq}=${top[1].change} | ${top[2].sq}=${top[2].change} | stable=${data.stable}`);
        } else if (data.move && data.squares && onMoveRef.current) {
          setDebugInfo(`MOVE: ${data.squares[0]} ↔ ${data.squares[1]}`);
          onMoveRef.current(data.squares);
        }
      } catch (e) {
        console.error("Error parsing WS message", e);
      }
    };

    socket.onclose = () => {
      console.log("Disconnected from CV server");
      setConnected(false);
    };

    socket.onerror = () => {
      console.error("WebSocket error - is the Python server running?");
      setConnected(false);
    };

    setWs(socket);
    return () => { socket.close(); };
  }, []);

  // Frame capture loop
  useEffect(() => {
    if (!connected || !ws || calibrating) return;

    const interval = setInterval(() => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.7);

      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: "frame",
          image: dataUrl,
          corners: corners.length === 4 ? corners : null
        }));
      }
    }, 500);

    return () => clearInterval(interval);
  }, [connected, ws, calibrating, corners]);

  const handleVideoClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!calibrating) return;

    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    setCorners(prev => {
      const next = [...prev, { x, y }];
      if (next.length === 4) {
        setCalibrating(false);
      }
      return next;
    });
  };

  return (
    <div style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "8px", background: "#f9f9f9" }}>
      <h4>Physical Board Tracker</h4>
      <div style={{ marginBottom: "10px" }}>
        Status: <span style={{ color: connected ? "green" : "red", fontWeight: "bold" }}>{connected ? "Connected to CV Engine" : "Disconnected"}</span>
      </div>

      <div
        style={{ position: "relative", display: "inline-block", cursor: calibrating ? "crosshair" : "default" }}
        onClick={handleVideoClick}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          width={400}
          style={{ borderRadius: "8px", display: "block" }}
        />

        {/* Draw calibration dots */}
        {corners.map((c, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${c.x * 100}%`,
              top: `${c.y * 100}%`,
              width: "10px",
              height: "10px",
              background: "red",
              borderRadius: "50%",
              transform: "translate(-50%, -50%)",
              pointerEvents: "none"
            }}
          />
        ))}
      </div>

      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} style={{ display: "none" }} />

      <div style={{ marginTop: "10px" }}>
        {corners.length === 4 ? (
          <button onClick={() => { setCorners([]); setCalibrating(true); }}>
            Recalibrate Corners
          </button>
        ) : (
          <button
            onClick={() => setCalibrating(true)}
            disabled={calibrating}
          >
            {calibrating ? `Click corner ${corners.length + 1} of 4` : "Start Calibration"}
          </button>
        )}
      </div>
      <p style={{ fontSize: "12px", color: "#666", marginTop: "10px" }}>
        * Point a webcam at the physical board. Click the 4 outer corners of the board starting from top-left, going clockwise.
      </p>
      {debugInfo && (
        <div style={{ marginTop: "8px", padding: "6px 10px", background: "#eee", borderRadius: "6px", fontFamily: "monospace", fontSize: "12px" }}>
          CV Debug: {debugInfo}
        </div>
      )}
    </div>
  );
}
