import { HealthTopic } from './types';

interface KeywordWeight {
  keyword: string;
  weight: number;
  variations?: string[];
}

interface TopicKeywords {
  primary: KeywordWeight[];
  secondary: KeywordWeight[];
  contextual: KeywordWeight[];
}

export class HealthTopicDetector {
  private readonly topicKeywords: Record<HealthTopic, TopicKeywords> = {
    cardio: {
      primary: [
        { keyword: 'heart', weight: 1.0, variations: ['cardiac', 'cardiovascular'] },
        { keyword: 'chest', weight: 0.9, variations: ['thoracic', 'pectoral'] },
        { keyword: 'pulse', weight: 0.9, variations: ['heartbeat', 'palpitation'] },
        { keyword: 'blood pressure', weight: 0.95, variations: ['bp', 'hypertension', 'hypotension'] }
      ],
      secondary: [
        { keyword: 'pain', weight: 0.7 },
        { keyword: 'pressure', weight: 0.7 },
        { keyword: 'tight', weight: 0.6, variations: ['tightness', 'constriction'] },
        { keyword: 'rhythm', weight: 0.8, variations: ['arrhythmia', 'irregular'] }
      ],
      contextual: [
        { keyword: 'left arm', weight: 0.6 },
        { keyword: 'jaw', weight: 0.5 },
        { keyword: 'shortness', weight: 0.6 }
      ]
    },
    respiratory: {
      primary: [
        { keyword: 'breath', weight: 1.0, variations: ['breathing', 'respiratory'] },
        { keyword: 'lung', weight: 1.0, variations: ['pulmonary'] },
        { keyword: 'cough', weight: 0.9, variations: ['coughing'] },
        { keyword: 'wheeze', weight: 0.9, variations: ['wheezing'] }
      ],
      secondary: [
        { keyword: 'air', weight: 0.6 },
        { keyword: 'oxygen', weight: 0.7 },
        { keyword: 'inhale', weight: 0.7, variations: ['exhale', 'inhalation'] },
        { keyword: 'asthma', weight: 0.9 }
      ],
      contextual: [
        { keyword: 'chest', weight: 0.5 },
        { keyword: 'throat', weight: 0.5 },
        { keyword: 'mucus', weight: 0.6, variations: ['phlegm', 'sputum'] }
      ]
    },
    neural: {
      primary: [
        { keyword: 'headache', weight: 1.0, variations: ['migraine', 'cephalalgia'] },
        { keyword: 'dizzy', weight: 0.9, variations: ['dizziness', 'vertigo'] },
        { keyword: 'vision', weight: 0.8, variations: ['sight', 'visual'] },
        { keyword: 'numbness', weight: 0.9, variations: ['tingling', 'paresthesia'] }
      ],
      secondary: [
        { keyword: 'brain', weight: 0.8, variations: ['cerebral', 'neurological'] },
        { keyword: 'nerve', weight: 0.8, variations: ['neural', 'neuropathy'] },
        { keyword: 'seizure', weight: 0.9, variations: ['convulsion', 'epilepsy'] },
        { keyword: 'confusion', weight: 0.7, variations: ['disorientation'] }
      ],
      contextual: [
        { keyword: 'memory', weight: 0.6, variations: ['forget', 'cognitive'] },
        { keyword: 'balance', weight: 0.6 },
        { keyword: 'consciousness', weight: 0.7 }
      ]
    },
    digestive: {
      primary: [
        { keyword: 'stomach', weight: 1.0, variations: ['gastric', 'abdominal'] },
        { keyword: 'nausea', weight: 0.9, variations: ['nauseous', 'queasy'] },
        { keyword: 'vomit', weight: 0.9, variations: ['vomiting', 'throw up'] },
        { keyword: 'bowel', weight: 0.9, variations: ['intestine', 'intestinal'] }
      ],
      secondary: [
        { keyword: 'digest', weight: 0.8, variations: ['digestion', 'indigestion'] },
        { keyword: 'appetite', weight: 0.7 },
        { keyword: 'bloat', weight: 0.7, variations: ['bloating', 'gas'] },
        { keyword: 'diarrhea', weight: 0.8, variations: ['constipation'] }
      ],
      contextual: [
        { keyword: 'eat', weight: 0.5, variations: ['eating', 'food'] },
        { keyword: 'pain', weight: 0.5 },
        { keyword: 'cramp', weight: 0.6, variations: ['cramping'] }
      ]
    },
    mental: {
      primary: [
        { keyword: 'anxiety', weight: 1.0, variations: ['anxious', 'panic'] },
        { keyword: 'depression', weight: 1.0, variations: ['depressed', 'sad'] },
        { keyword: 'stress', weight: 0.9, variations: ['stressed', 'overwhelm'] },
        { keyword: 'mood', weight: 0.8, variations: ['emotion', 'feeling'] }
      ],
      secondary: [
        { keyword: 'sleep', weight: 0.7, variations: ['insomnia', 'tired'] },
        { keyword: 'worry', weight: 0.7, variations: ['worried', 'concern'] },
        { keyword: 'fear', weight: 0.7, variations: ['afraid', 'scared'] },
        { keyword: 'therapy', weight: 0.8, variations: ['counseling', 'psychiatry'] }
      ],
      contextual: [
        { keyword: 'think', weight: 0.5, variations: ['thought', 'mind'] },
        { keyword: 'cope', weight: 0.6, variations: ['coping', 'manage'] },
        { keyword: 'trauma', weight: 0.7 }
      ]
    },
    emergency: {
      primary: [
        { keyword: 'emergency', weight: 1.0, variations: ['urgent', 'immediate'] },
        { keyword: 'severe', weight: 1.0, variations: ['extreme', 'acute'] },
        { keyword: 'can\'t breathe', weight: 1.0 },
        { keyword: 'unconscious', weight: 1.0, variations: ['faint', 'collapse'] }
      ],
      secondary: [
        { keyword: 'bleeding', weight: 0.9, variations: ['blood', 'hemorrhage'] },
        { keyword: 'pain 10', weight: 0.9 },
        { keyword: 'worse', weight: 0.7, variations: ['worsening', 'deteriorate'] },
        { keyword: 'help', weight: 0.8, variations: ['ambulance', '911'] }
      ],
      contextual: [
        { keyword: 'sudden', weight: 0.6 },
        { keyword: 'intense', weight: 0.6 },
        { keyword: 'can\'t', weight: 0.5 }
      ]
    },
    general: {
      primary: [],
      secondary: [],
      contextual: []
    }
  };

  private recentTopics: { topic: HealthTopic; timestamp: number }[] = [];
  private readonly TOPIC_MEMORY_DURATION = 30000; // 30 seconds

  detectTopic(transcript: string): HealthTopic {
    if (!transcript) return 'general';

    const normalizedTranscript = transcript.toLowerCase();
    const topicScores = new Map<HealthTopic, number>();

    // Initialize scores
    Object.keys(this.topicKeywords).forEach(topic => {
      topicScores.set(topic as HealthTopic, 0);
    });

    // Calculate scores for each topic
    Object.entries(this.topicKeywords).forEach(([topic, keywords]) => {
      let score = 0;

      // Check primary keywords
      keywords.primary.forEach(kwObj => {
        if (this.containsKeyword(normalizedTranscript, kwObj)) {
          score += kwObj.weight * 2; // Primary keywords worth double
        }
      });

      // Check secondary keywords
      keywords.secondary.forEach(kwObj => {
        if (this.containsKeyword(normalizedTranscript, kwObj)) {
          score += kwObj.weight;
        }
      });

      // Check contextual keywords
      keywords.contextual.forEach(kwObj => {
        if (this.containsKeyword(normalizedTranscript, kwObj)) {
          score += kwObj.weight * 0.5; // Contextual worth half
        }
      });

      // Boost score based on recent topic continuity
      const recentSameTopic = this.recentTopics.filter(
        rt => rt.topic === topic && 
        Date.now() - rt.timestamp < this.TOPIC_MEMORY_DURATION
      );
      if (recentSameTopic.length > 0) {
        score *= 1.2; // 20% boost for topic continuity
      }

      topicScores.set(topic as HealthTopic, score);
    });

    // Check for emergency keywords first
    if (topicScores.get('emergency')! > 1.5) {
      this.addToRecentTopics('emergency');
      return 'emergency';
    }

    // Find highest scoring topic
    let maxScore = 0;
    let detectedTopic: HealthTopic = 'general';

    topicScores.forEach((score, topic) => {
      if (score > maxScore && topic !== 'emergency' && topic !== 'general') {
        maxScore = score;
        detectedTopic = topic;
      }
    });

    // Require minimum confidence threshold
    if (maxScore < 0.5) {
      detectedTopic = 'general';
    }

    this.addToRecentTopics(detectedTopic);
    return detectedTopic;
  }

  private containsKeyword(text: string, kwObj: KeywordWeight): boolean {
    // Check main keyword
    if (text.includes(kwObj.keyword)) return true;

    // Check variations
    if (kwObj.variations) {
      return kwObj.variations.some(variation => text.includes(variation));
    }

    return false;
  }

  private addToRecentTopics(topic: HealthTopic) {
    this.recentTopics.push({ topic, timestamp: Date.now() });
    
    // Clean old entries
    this.recentTopics = this.recentTopics.filter(
      rt => Date.now() - rt.timestamp < this.TOPIC_MEMORY_DURATION
    );
  }

  getSeverityFromTopic(topic: HealthTopic): number {
    const severityMap: Record<HealthTopic, number> = {
      general: 0,
      mental: 0.2,
      digestive: 0.3,
      respiratory: 0.5,
      neural: 0.6,
      cardio: 0.7,
      emergency: 1.0
    };

    return severityMap[topic] || 0;
  }
}