"use client";

import { useState } from "react";

export default function DebugPage() {
  const [log, setLog] = useState<string[]>([]);
  
  const testConnection = async () => {
    const wsEndpoint = process.env.NEXT_PUBLIC_WS_ENDPOINT || 'ws://localhost:8080';
    setLog(prev => [...prev, `Connecting to: ${wsEndpoint}`]);
    
    try {
      const ws = new WebSocket(wsEndpoint);
      
      ws.onopen = () => {
        setLog(prev => [...prev, '✅ WebSocket opened']);
        ws.send(JSON.stringify({ type: 'control', action: 'start' }));
      };
      
      ws.onmessage = (event) => {
        setLog(prev => [...prev, `📥 Message: ${event.data}`]);
      };
      
      ws.onerror = (error) => {
        setLog(prev => [...prev, `❌ Error: ${error}`]);
        console.error('WebSocket error:', error);
      };
      
      ws.onclose = (event) => {
        setLog(prev => [...prev, `🔌 Closed: ${event.code} - ${event.reason}`]);
      };
    } catch (error: any) {
      setLog(prev => [...prev, `❌ Exception: ${error.message}`]);
    }
  };
  
  const checkMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setLog(prev => [...prev, '✅ Microphone access granted']);
      stream.getTracks().forEach(track => track.stop());
    } catch (error: any) {
      setLog(prev => [...prev, `❌ Microphone error: ${error.message}`]);
    }
  };
  
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Voice System Debug</h1>
      
      <div className="mb-4 space-y-2">
        <p className="text-sm text-gray-600">WebSocket Endpoint: {process.env.NEXT_PUBLIC_WS_ENDPOINT || 'ws://localhost:8080'}</p>
        <p className="text-sm text-gray-600">Current URL: {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
      </div>
      
      <div className="space-x-2 mb-4">
        <button
          onClick={testConnection}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test WebSocket
        </button>
        
        <button
          onClick={checkMicrophone}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Test Microphone
        </button>
        
        <button
          onClick={() => setLog([])}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Clear Log
        </button>
      </div>
      
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="font-semibold mb-2">Log:</h2>
        {log.length === 0 ? (
          <p className="text-gray-500">No logs yet...</p>
        ) : (
          log.map((entry, i) => (
            <div key={i} className="font-mono text-sm py-1">{entry}</div>
          ))
        )}
      </div>
    </div>
  );
}