# Voice UI Mockups

## Sesame Minimal Version

```
┌────────────────────────────────────────────┐
│                                            │
│            Maya 00:45                      │
│            by sesame          [Log in]     │
│                                            │
│                                            │
│                                            │
│               ┌──────────┐                 │
│               │          │                 │
│               │    Orb   │                 │
│               │          │                 │
│               └──────────┘                 │
│                                            │
│                                            │
│                                            │
│        [🎙️ Mute]    [📞 End call]         │
│                                            │
└────────────────────────────────────────────┘

States:
- Gray: Idle/Waiting
- Purple: Listening
- Blue: Thinking
- Pink: Speaking
```

## Advanced Visualization Version

```
┌─────────────────────────────────────────────────────────┐
│  Mei - Medical Voice Assistant                     00:45 │
├─────────────────┬───────────────────────────────────────┤
│                 │ Patient: John Doe                      │
│   Waveform      │ Age: 45 | Hypertension, Diabetes      │
│  ╱╲    ╱╲  ╱╲   │                                        │
│ ╱  ╲╱╲╱  ╲╱  ╲  │ Current Medications:                   │
│                 │ • Metformin 1000mg BID                 │
│─────────────────│ • Lisinopril 10mg QD                   │
│                 │                                        │
│   Frequency     │ Recent Vitals:                         │
│   ████▄▄▄       │ BP: 135/85 | HR: 72                    │
│   ████████▄     │ Weight: 185 lbs                        │
│                 │                                        │
├─────────────────┴───────────────────────────────────────┤
│                                                          │
│                    ┌────────────┐                        │
│                    │            │                        │
│                    │ Voice Orb  │                        │
│                    │            │                        │
│                    └────────────┘                        │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ Transcript:                                              │
│ You: "I've been feeling dizzy when I stand up"          │
│ Mei: "I understand you're experiencing dizziness when    │
│      standing. This could be related to your blood       │
│      pressure medication. When did this start?"          │
├──────────────────────────────────────────────────────────┤
│ [🎙️ Mute] [📊 Vitals] [📝 Notes] [⚡ Emergency] [End]    │
└──────────────────────────────────────────────────────────┘

Features:
- Real-time audio waveform
- Frequency spectrum analyzer  
- Patient context sidebar
- Live transcript with medical term highlighting
- Quick action buttons
```

## Visual Design Specifications

### Color Palette
- **Background**: #F9FAFB (gray-50)
- **Listening**: #A855F7 (purple-500)
- **Thinking**: #3B82F6 (blue-500)
- **Speaking**: #EC4899 (pink-500)
- **Idle**: #9CA3AF (gray-400)
- **Emergency**: #EF4444 (red-500)

### Animations
- **Orb Pulse**: Subtle scale animation (1.0 → 1.02)
- **Glow Effect**: Soft blur with 30% opacity
- **Waveform**: 60fps smooth animation
- **Transitions**: 300ms ease-in-out

### Typography
- **Headers**: System font, 24px, medium weight
- **Body**: System font, 16px, regular weight
- **Transcript**: Monospace for medical terms
- **Metadata**: 14px, gray-600