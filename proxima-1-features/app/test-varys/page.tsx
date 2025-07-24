'use client';

import { useGeminiVoice } from '@/app/hooks/useGeminiVoiceRealtime';
import { useEffect, useState } from 'react';

export default function TestVarys() {
  const [selectedAssistant, setSelectedAssistant] = useState<'mei' | 'varys'>('mei');
  
  const {
    isConnected,
    status,
    connect,
    disconnect,
    voiceActivity,
  } = useGeminiVoice({
    assistantType: selectedAssistant
  });

  const handleAssistantChange = (assistant: 'mei' | 'varys') => {
    if (isConnected) {
      disconnect();
    }
    setSelectedAssistant(assistant);
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Test Mei vs Varys</h1>
      
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Assistant Selection */}
        <div className="bg-zinc-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Select Assistant</h2>
          <div className="flex gap-4">
            <button
              onClick={() => handleAssistantChange('mei')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                selectedAssistant === 'mei'
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              Mei (Standard)
            </button>
            <button
              onClick={() => handleAssistantChange('varys')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                selectedAssistant === 'varys'
                  ? 'bg-purple-600 text-white'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              Varys (Reasoning)
            </button>
          </div>
        </div>

        {/* Connection Status */}
        <div className="bg-zinc-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
          <div className="flex items-center gap-4">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>{isConnected ? `Connected to ${selectedAssistant}` : 'Disconnected'}</span>
            <span className="text-zinc-400">Status: {status}</span>
            <div className="ml-auto">
              {!isConnected ? (
                <button
                  onClick={connect}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
                >
                  Connect
                </button>
              ) : (
                <button
                  onClick={disconnect}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
                >
                  Disconnect
                </button>
              )}
            </div>
          </div>
          
          {/* Voice Activity */}
          {isConnected && (
            <div className="mt-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-400">Voice Activity:</span>
                <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-100"
                    style={{ width: `${voiceActivity * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Model Info */}
        <div className="bg-zinc-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Model Information</h2>
          <div className="space-y-3">
            <div>
              <span className="text-zinc-400">Selected Assistant:</span>
              <span className="ml-2 font-semibold">{selectedAssistant.toUpperCase()}</span>
            </div>
            <div>
              <span className="text-zinc-400">Model:</span>
              <span className="ml-2 text-sm">
                {selectedAssistant === 'mei' 
                  ? 'gemini-2.5-flash-preview-native-audio-dialog'
                  : 'gemini-2.5-flash-exp-native-audio-thinking-dialog'}
              </span>
            </div>
            <div>
              <span className="text-zinc-400">Voice:</span>
              <span className="ml-2">{selectedAssistant === 'mei' ? 'Aoede (Female)' : 'Charon (Male)'}</span>
            </div>
          </div>
        </div>

        {/* Usage Tips */}
        <div className="bg-zinc-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Usage Tips</h2>
          <div className="space-y-2 text-sm text-zinc-300">
            <p><strong>Mei:</strong> Standard medical assistant - quick, conversational responses</p>
            <p><strong>Varys:</strong> Enhanced reasoning - better for complex cases, deeper analysis</p>
            <p className="pt-2">Try asking both the same complex medical question to see the difference!</p>
            <p>Example: "I've been having chest pain that comes with exercise but goes away when I rest"</p>
          </div>
        </div>
      </div>
    </div>
  );
}