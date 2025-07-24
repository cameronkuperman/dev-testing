"use client";

import { useState, useRef } from "react";

export default function TestPage() {
  const [log, setLog] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  
  const addLog = (message: string) => {
    setLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };
  
  const connect = () => {
    addLog("Connecting to WebSocket...");
    
    const ws = new WebSocket("ws://localhost:8080");
    wsRef.current = ws;
    
    ws.onopen = () => {
      addLog("✅ Connected!");
      setIsConnected(true);
      
      // Send start command
      ws.send(JSON.stringify({ type: "control", action: "start" }));
      addLog("Sent start command");
    };
    
    ws.onmessage = async (event) => {
      try {
        const message = JSON.parse(event.data);
        addLog(`Received: ${message.type}`);
        
        if (message.type === "audio" && message.data) {
          addLog("🎵 Playing audio...");
          await playAudio(message.data);
        }
        
        if (message.type === "status" && message.status === "ready") {
          addLog("Sending test message...");
          ws.send(JSON.stringify({
            type: "text",
            text: "Hi Mei"
          }));
        }
      } catch (err) {
        addLog(`Error: ${err}`);
      }
    };
    
    ws.onerror = (error) => {
      addLog(`❌ WebSocket error: ${error}`);
    };
    
    ws.onclose = () => {
      addLog("Connection closed");
      setIsConnected(false);
    };
  };
  
  const playAudio = async (base64Audio: string) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    
    try {
      // Decode base64
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Convert to audio buffer (24kHz PCM)
      const int16Array = new Int16Array(bytes.buffer);
      const float32Array = new Float32Array(int16Array.length);
      
      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768;
      }
      
      const audioBuffer = audioContextRef.current.createBuffer(1, float32Array.length, 24000);
      audioBuffer.getChannelData(0).set(float32Array);
      
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.start();
      
      addLog("✅ Audio playing!");
    } catch (err) {
      addLog(`Audio error: ${err}`);
    }
  };
  
  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
  };
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">WebSocket Audio Test</h1>
      
      <div className="space-x-2 mb-4">
        <button
          onClick={connect}
          disabled={isConnected}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
        >
          Connect
        </button>
        
        <button
          onClick={disconnect}
          disabled={!isConnected}
          className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-400"
        >
          Disconnect
        </button>
        
        <button
          onClick={() => setLog([])}
          className="px-4 py-2 bg-gray-500 text-white rounded"
        >
          Clear Log
        </button>
      </div>
      
      <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-96 overflow-y-auto">
        {log.length === 0 ? (
          <div className="text-gray-500">Click Connect to start...</div>
        ) : (
          log.map((entry, i) => (
            <div key={i}>{entry}</div>
          ))
        )}
      </div>
    </div>
  );
}