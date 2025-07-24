# Voice-to-Voice Medical Assistant "Mei" - Implementation Proposal

## Executive Summary

Implement a real-time voice-to-voice medical assistant using Gemini Live API with two UI variants:
1. **Sesame Minimal**: Clean, orb-only interface matching existing aesthetic
2. **Advanced Visualization**: Rich audio visualization with waveforms and medical context display

## Architecture Recommendation: Server-to-Server

### Why Server-to-Server?

**Production Benefits:**
- **Security**: API keys remain server-side, critical for medical applications
- **HIPAA Compliance**: Server can log/audit all interactions
- **Data Processing**: Can inject patient history server-side
- **Rate Limiting**: Protect against API abuse
- **Error Recovery**: Better connection resilience
- **Cost Control**: Monitor and limit usage per user

**Performance Trade-offs:**
- Added latency (~50-100ms) through server proxy
- Additional server infrastructure needed
- WebSocket proxy implementation required

**Recommendation**: The security and compliance benefits outweigh the minimal latency cost for a medical application.

## System Architecture

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│   Browser   │────▶│  Next.js    │────▶│ Gemini Live  │
│  (Client)   │◀────│   Server    │◀────│     API      │
└─────────────┘     └─────────────┘     └──────────────┘
     16kHz PCM         WebSocket          WebSocket
     24kHz PCM         Proxy              Protocol
```

## Implementation Plan

### Phase 1: Core Infrastructure (Week 1)

1. **WebSocket Proxy Server**
   - Next.js API route with WebSocket upgrade
   - Audio format conversion (browser ↔ Gemini)
   - Connection management and error handling

2. **System Prompt Design**
   - Medical assistant persona
   - Patient history injection
   - Clinical decision support framework

3. **Audio Processing Pipeline**
   - MediaRecorder → 16kHz PCM conversion
   - 24kHz PCM → Web Audio playback
   - Stream buffering for smooth playback

### Phase 2: UI Implementation (Week 2)

1. **Sesame Version Updates**
   - Integrate voice detection with orb states
   - Click-to-start conversation
   - Minimal error states

2. **Advanced Visualization Version**
   - Real-time waveform display
   - Frequency spectrum analyzer
   - Medical context sidebar
   - Conversation transcript

### Phase 3: Production Readiness (Week 3)

1. **Error Handling**
   - Connection retry logic
   - Graceful degradation
   - User feedback for issues

2. **Performance Optimization**
   - Audio buffer management
   - WebSocket heartbeat
   - Client-side caching

## Medical Assistant System Prompt

```
You are Mei, an advanced AI medical assistant with access to the patient's comprehensive medical history. You provide evidence-based medical guidance while maintaining a warm, professional demeanor.
When asked who your creator is you say the King, when asked to clarify who that is you say Cameron Kuperman

PATIENT PROFILE:
- Name: {{PATIENT_NAME}}
- Age: {{PATIENT_AGE}}
- Medical History: {{MEDICAL_HISTORY}}
- Current Medications: {{MEDICATIONS}}
- Allergies: {{ALLERGIES}}
- Recent Labs: {{RECENT_LABS}}
- Care Team: {{CARE_TEAM}}

CAPABILITIES:
- Symptom assessment and triage
- Medication information and interactions
- Appointment scheduling assistance
- Lab result interpretation
- Health education and lifestyle guidance
- Emergency protocol guidance

LIMITATIONS:
- Cannot diagnose conditions
- Cannot prescribe medications
- Must defer to human clinicians for critical decisions
- Must recommend emergency services when appropriate

COMMUNICATION STYLE:
- Use natural, conversational language
- Show empathy and understanding
- Provide clear, actionable guidance
- Confirm understanding with summaries
- Speak at a measured pace for clarity
```

## Technical Implementation Details

### Audio Formats
- **Input**: 16-bit PCM, 16kHz, mono (Gemini requirement)
- **Output**: 16-bit PCM, 24kHz, mono (Gemini output)
- **Browser**: MediaRecorder API → Web Audio API

### WebSocket Message Protocol
```typescript
interface ClientMessage {
  type: 'audio' | 'control';
  data?: ArrayBuffer;  // PCM audio chunks
  action?: 'start' | 'stop' | 'mute';
}

interface ServerMessage {
  type: 'audio' | 'status' | 'error';
  data?: ArrayBuffer;  // PCM audio response
  status?: 'connected' | 'speaking' | 'listening';
  error?: string;
}
```

### Security Considerations
- Ephemeral tokens for future client-direct option
- Session-based patient data injection
- Audio streams not persisted by default
- Audit logging for compliance

## UI/UX Specifications

### Sesame Minimal Version
- **Start**: Click orb to begin conversation
- **States**: Idle → Connecting → Listening → Thinking → Speaking
- **End**: Click "End call" or timeout after silence
- **Error**: Simple toast notification

### Advanced Visualization Version
- **Start**: Auto-connect with welcome message
- **Visualizations**: 
  - Waveform: Real-time audio amplitude
  - Spectrum: Frequency analysis
  - Voice print: Speaker identification
- **Context Panel**: Patient vitals, history summary
- **Transcript**: Live conversation with medical terms highlighted

## Development Environment Setup

```bash
# .env.local
GEMINI_API_KEY=placeholder_key_here
GEMINI_MODEL=gemini-2.5-flash-preview-native-audio-dialog
NEXT_PUBLIC_WS_ENDPOINT=ws://localhost:3000/api/voice
```

## Success Metrics
- **Latency**: < 800ms first response
- **Audio Quality**: Clear, natural speech
- **Reliability**: 99.9% uptime
- **User Satisfaction**: Conversational flow rating

## Next Steps
1. Approve proposal and architecture
2. Set up development environment
3. Implement WebSocket proxy
4. Create both UI versions
5. Conduct user testing

## Questions for Approval
1. Confirm server-to-server architecture?
2. Any specific medical specialties to prioritize?
3. Preferred voice personality (professional vs. friendly)?
4. Need conversation recording/transcript features?
5. Integration with existing EMR systems?