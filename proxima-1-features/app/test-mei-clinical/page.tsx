'use client';

import { useGeminiVoice } from '@/app/hooks/useGeminiVoiceRealtime';
import { useEffect, useState } from 'react';

export default function TestMeiClinical() {
  const {
    isConnected,
    status,
    connect,
    disconnect,
    voiceActivity,
  } = useGeminiVoice();

  const [testScenarios, setTestScenarios] = useState([
    { name: 'Headache', passed: false },
    { name: 'Back pain', passed: false },
    { name: 'Interruption test', passed: false },
    { name: 'Proactive health', passed: false },
    { name: 'Clinical reasoning', passed: false },
  ]);

  const testInstructions = {
    'Headache': 'Say "I have a headache" - Mei should ask follow-up questions about location, duration, severity',
    'Back pain': 'Say "My back hurts" - Mei should ask about specific location and what makes it worse',
    'Interruption test': 'Let Mei start speaking, then interrupt - she should stop immediately',
    'Proactive health': 'Say "Hi Mei" - she should greet you AND remind about overdue screenings',
    'Clinical reasoning': 'Describe any symptom - Mei should connect it to your medical history',
  };

  const markTestPassed = (testName: string) => {
    setTestScenarios(prev => 
      prev.map(test => 
        test.name === testName ? { ...test, passed: true } : test
      )
    );
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Mei Clinical Excellence Test Suite</h1>
      
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Connection Status */}
        <div className="bg-zinc-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
          <div className="flex items-center gap-4">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
            <span className="text-zinc-400">Status: {status}</span>
            <div className="ml-auto">
              {!isConnected ? (
                <button
                  onClick={connect}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
                >
                  Connect to Mei
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
          
          {/* Voice Activity Indicator */}
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

        {/* Test Scenarios */}
        <div className="bg-zinc-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Clinical Test Scenarios</h2>
          <div className="space-y-4">
            {testScenarios.map((test) => (
              <div key={test.name} className="bg-zinc-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{test.name}</h3>
                  <button
                    onClick={() => markTestPassed(test.name)}
                    className={`px-3 py-1 rounded text-sm ${
                      test.passed
                        ? 'bg-green-600 text-white'
                        : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'
                    }`}
                  >
                    {test.passed ? '✓ Passed' : 'Mark as Passed'}
                  </button>
                </div>
                <p className="text-sm text-zinc-400">
                  {testInstructions[test.name as keyof typeof testInstructions]}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Expected Behaviors */}
        <div className="bg-zinc-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Expected Behaviors</h2>
          <ul className="space-y-2 text-sm text-zinc-300">
            <li>✓ Mei asks 1-2 targeted follow-up questions for symptoms</li>
            <li>✓ She never repeats what you just said</li>
            <li>✓ Interruption happens within ~100-200ms when you start speaking</li>
            <li>✓ Proactive health suggestions based on your history (melanoma screening)</li>
            <li>✓ Responses are concise but can be longer when medically important</li>
            <li>✓ Natural conversation flow like talking to a knowledgeable doctor</li>
            <li>✓ Connects symptoms to your medical history (asthma, allergies, etc.)</li>
          </ul>
        </div>

        {/* Test Results */}
        <div className="bg-zinc-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Overall Results</h2>
          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold">
              {testScenarios.filter(t => t.passed).length} / {testScenarios.length}
            </div>
            <div className="text-zinc-400">tests passed</div>
          </div>
          {testScenarios.every(t => t.passed) && (
            <div className="mt-4 text-green-500 font-semibold">
              ✓ All tests passed! Mei is performing like a great clinician.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}