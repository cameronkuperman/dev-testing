'use client';

import { useState, useEffect } from 'react';
import { useGeminiVoice } from '@/app/hooks/useGeminiVoiceRealtime';
import { VoiceOrb } from '@/app/components/VoiceOrb/VoiceOrb';
import styles from './page.module.css';

export default function DrMeiPage() {
  const [selectedAssistant, setSelectedAssistant] = useState<'mei' | 'varys' | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [callStartTime, setCallStartTime] = useState<number | null>(null);

  const {
    isConnected,
    status,
    voiceActivity,
    isMuted,
    connect,
    disconnect,
    toggleMute,
  } = useGeminiVoice({
    assistantType: selectedAssistant || 'mei',
  });
  
  // Track connection state to ensure correct assistant
  useEffect(() => {
    console.log('Selected assistant:', selectedAssistant);
  }, [selectedAssistant]);

  // Update call duration
  useEffect(() => {
    if (isConnected && callStartTime) {
      const interval = setInterval(() => {
        setCallDuration(Math.floor((Date.now() - callStartTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isConnected, callStartTime]);

  const handleAssistantSelect = async (assistant: 'mei' | 'varys') => {
    setSelectedAssistant(assistant);
    setCallStartTime(Date.now());
    setTimeout(() => {
      connect();
    }, 100);
  };

  const handleEndCall = () => {
    disconnect();
    setSelectedAssistant(null);
    setCallDuration(0);
    setCallStartTime(null);
  };

  if (!selectedAssistant) {
    return (
      <div className={styles.selectionContainer}>
        <div className={styles.header}>
          <h1 className={styles.title}>Choose Your Medical Assistant</h1>
          <p className={styles.subtitle}>Select who you'd like to speak with today</p>
        </div>

        <div className={styles.assistantGrid}>
          <button
            className={`${styles.assistantCard} ${styles.mei}`}
            onClick={() => handleAssistantSelect('mei')}
          >
            <div className={styles.orbPreview}>
              <div className={styles.meiOrb} />
            </div>
            <h2 className={styles.assistantName}>Dr. Mei</h2>
            <p className={styles.assistantDescription}>
              Your compassionate medical assistant. Quick, conversational guidance for everyday health concerns.
            </p>
            <div className={styles.selectButton}>
              <span>Start Call</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 10H15M15 10L10 5M15 10L10 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          </button>

          <button
            className={`${styles.assistantCard} ${styles.varys}`}
            onClick={() => handleAssistantSelect('varys')}
          >
            <div className={styles.orbPreview}>
              <div className={styles.varysOrb} />
            </div>
            <h2 className={styles.assistantName}>Dr. Varys</h2>
            <p className={styles.assistantDescription}>
              Your analytical specialist. Deep medical reasoning for complex cases and thorough analysis.
            </p>
            <div className={styles.selectButton}>
              <span>Start Call</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 10H15M15 10L10 5M15 10L10 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          </button>
        </div>

        <div className={styles.footer}>
          <p className={styles.privacyNote}>
            🔒 Your conversations are private and secure. No medical advice is stored.
          </p>
        </div>
      </div>
    );
  }

  return (
    <VoiceOrb
      status={status}
      voiceActivity={voiceActivity}
      assistantType={selectedAssistant}
      onMute={toggleMute}
      onEndCall={handleEndCall}
      isMuted={isMuted}
      callDuration={callDuration}
    />
  );
}