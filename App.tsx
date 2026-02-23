
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import MapView from './components/MapView';
import NavigationOverlay from './components/NavigationOverlay';
import { GeoPoint, AppState } from './types';
import { calculateDistance } from './utils';
import { Info } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    isTracking: false,
    path: [],
    currentLocation: null,
    distance: 0,
    offlineMode: false,
  });

  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [showAdvice, setShowAdvice] = useState(false);
  const watchId = useRef<number | null>(null);

  // Initialize GPS Tracking
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const newPoint: GeoPoint = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: Date.now(),
          altitude: position.coords.altitude,
          speed: position.coords.speed,
        };

        setState(prev => {
          let newDistance = prev.distance;
          if (prev.path.length > 0) {
            const lastPoint = prev.path[prev.path.length - 1];
            newDistance += calculateDistance(lastPoint, newPoint);
          }

          return {
            ...prev,
            currentLocation: newPoint,
            path: [...prev.path, newPoint],
            distance: newDistance
          };
        });
      },
      (error) => {
        console.error("GPS Error:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  }, []);

  const stopTracking = useCallback(() => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
  }, []);

  const handleToggleTracking = () => {
    if (state.isTracking) {
      stopTracking();
      setState(prev => ({ ...prev, isTracking: false }));
    } else {
      startTracking();
      setState(prev => ({ ...prev, isTracking: true }));
    }
  };

  const handleReset = () => {
    const confirmed = window.confirm("Reset current path?");
    if (confirmed) {
      setState(prev => ({
        ...prev,
        path: [],
        distance: 0
      }));
    }
  };

  const handleToggleOffline = () => {
    setState(prev => ({ ...prev, offlineMode: !prev.offlineMode }));
  };

  // AI Logic - Gemini Mountain Guide
  const fetchMountainGuideAdvice = async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `
      I am currently hiking. 
      Distance traveled: ${state.distance.toFixed(0)} meters.
      Current Altitude: ${state.currentLocation?.altitude?.toFixed(0) || 'Unknown'} meters.
      Current Speed: ${((state.currentLocation?.speed || 0) * 3.6).toFixed(1)} km/h.
      Provide one short sentence of advice for a mountaineer based on these stats. 
      Keep it under 15 words. Focus on safety, pace, or hydration.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      setAiAdvice(response.text || "Keep moving at a steady pace.");
      setShowAdvice(true);
      setTimeout(() => setShowAdvice(false), 8000);
    } catch (err) {
      console.error("AI Error:", err);
    }
  };

  useEffect(() => {
    // Fetch AI advice every 10 minutes of tracking
    if (state.isTracking && state.distance > 0 && Math.floor(state.distance / 1000) > 0) {
      fetchMountainGuideAdvice();
    }
  }, [state.isTracking, Math.floor(state.distance / 1000)]);

  return (
    <div className="watch-frame shadow-2xl relative select-none">
      {/* Map Background */}
      <MapView 
        path={state.path} 
        currentLocation={state.currentLocation} 
        offlineMode={state.offlineMode}
      />

      {/* UI Overlay */}
      <NavigationOverlay 
        isTracking={state.isTracking}
        distance={state.distance}
        currentLocation={state.currentLocation}
        onToggleTracking={handleToggleTracking}
        onReset={handleReset}
        onToggleOffline={handleToggleOffline}
        offlineMode={state.offlineMode}
      />

      {/* AI Advice Notification */}
      {showAdvice && aiAdvice && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-3/4 z-[2000] bg-blue-600/90 backdrop-blur-lg border border-blue-400 p-3 rounded-2xl animate-bounce">
          <div className="flex items-start gap-2">
            <Info size={16} className="text-white shrink-0 mt-0.5" />
            <p className="text-[11px] font-bold text-white leading-tight">
              {aiAdvice}
            </p>
          </div>
        </div>
      )}

      {/* Connection Status Ring */}
      <div className={`absolute inset-0 border-4 pointer-events-none rounded-full transition-colors duration-1000 z-[1002] ${
        state.isTracking ? 'border-emerald-500/20' : 'border-red-500/20'
      }`} />
    </div>
  );
};

export default App;
