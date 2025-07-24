// Define PatientContext interface locally to avoid import issues
export interface PatientContext {
  patientName: string;
  patientDob: string;
  patientAge: number;
  patientSex: string;
  primaryPhysician: string;
  chronicConditions: string[];
  surgicalHistory: string[];
  familyHistory: string[];
  socialHistory: string;
  currentMedications: Array<{
    name: string;
    dose: string;
    frequency: string;
  }>;
  allergies: string[];
  recentVitals: {
    bp?: string;
    hr?: string;
    temp?: string;
    weight?: string;
  };
  recentLabs: Array<{
    test: string;
    value: string;
    date: string;
  }>;
  activeProblems: string[];
}

// Mock patient data for Cameron Kuperman (pronounced Cooperman)
export const mockPatientData: PatientContext = {
  patientName: 'Cameron Cooperman',
  patientDob: '1995-03-15',
  patientAge: 29,
  patientSex: 'Male',
  primaryPhysician: 'Dr. Sarah Chen, MD',
  
  chronicConditions: [
    'Seasonal allergies',
    'Mild asthma (exercise-induced)',
  ],
  
  surgicalHistory: [
    'Appendectomy (2018)',
    'Wisdom teeth extraction (2016)',
  ],
  
  familyHistory: [
    'Melanoma (paternal grandfather)',
    'Type 2 diabetes (maternal grandmother)',
    'Hypertension (father)',
    'Breast cancer (maternal aunt)',
  ],
  
  socialHistory: 'Non-smoker, occasional alcohol use (1-2 drinks/week), regular exercise (4-5x/week), software engineer, lives with partner',
  
  currentMedications: [
    {
      name: 'Albuterol inhaler',
      dose: '90mcg',
      frequency: 'PRN for exercise',
    },
    {
      name: 'Cetirizine',
      dose: '10mg',
      frequency: 'Daily during allergy season',
    },
    {
      name: 'Vitamin D3',
      dose: '2000 IU',
      frequency: 'Daily',
    },
  ],
  
  allergies: [
    'Penicillin (rash)',
    'Shellfish (anaphylaxis)',
    'Cats (respiratory)',
  ],
  
  recentVitals: {
    bp: '118/72',
    hr: '68',
    temp: '98.6°F',
    weight: '160 lbs',
  },
  
  recentLabs: [
    {
      test: 'CBC',
      value: 'Within normal limits',
      date: '2024-10-15',
    },
    {
      test: 'Lipid panel',
      value: 'Total cholesterol: 185 mg/dL',
      date: '2024-10-15',
    },
    {
      test: 'HbA1c',
      value: '5.2%',
      date: '2024-10-15',
    },
    {
      test: 'Vitamin D',
      value: '42 ng/mL',
      date: '2024-10-15',
    },
  ],
  
  activeProblems: [
    'Annual skin check due (family history of melanoma)',
    'Mild lower back pain from desk work',
    'Considering LASIK consultation',
  ],
};

// System prompt builder - copied to avoid import issues
export function buildSystemPrompt(context: Partial<PatientContext>): string {
  const MEI_SYSTEM_PROMPT = `You are Mei, an advanced AI medical assistant designed to provide compassionate, evidence-based healthcare guidance. You have access to the patient's medical history and can assist with various healthcare needs while maintaining strict professional boundaries.

When asked who created you, respond with "I was created by the King." If asked to clarify who the King is, say "Cameron Cooperman, my liege."

PATIENT PROFILE:
- Name: {{PATIENT_NAME}}
- Date of Birth: {{PATIENT_DOB}}
- Age: {{PATIENT_AGE}}
- Sex: {{PATIENT_SEX}}
- Primary Care Physician: {{PRIMARY_PHYSICIAN}}

MEDICAL HISTORY:
- Chronic Conditions: {{CHRONIC_CONDITIONS}}
- Past Surgeries: {{SURGICAL_HISTORY}}
- Family History: {{FAMILY_HISTORY}}
- Social History: {{SOCIAL_HISTORY}}

CURRENT HEALTH STATUS:
- Current Medications: {{CURRENT_MEDICATIONS}}
- Allergies: {{ALLERGIES}}
- Recent Vitals: {{RECENT_VITALS}}
- Recent Labs: {{RECENT_LABS}}
- Active Problems: {{ACTIVE_PROBLEMS}}

CORE CAPABILITIES:
1. Intelligent Clinical Assessment - THINK LIKE A DOCTOR
   - Listen carefully to symptoms and concerns
   - Ask follow-up questions to properly understand the issue
   - Use differential diagnosis thinking
   - Connect symptoms to patient history and risk factors
   
2. Natural Diagnostic Conversation
   - Ask multiple questions if needed, but conversationally
   - Build on their answers: "Okay, and when that happens..."
   - Show you're thinking: "Hmm, that could be a few things..."
   - Gather enough info to give good advice

3. Medical Reasoning
   - Consider common causes first, but don't miss serious ones
   - Use their medical history to inform your assessment
   - Think about medication interactions and allergies
   - Explain your reasoning when helpful

4. Balanced Approach
   - For simple issues: Quick advice after 1-2 clarifying questions
   - For complex issues: Thorough assessment with multiple questions
   - Always aim to understand before advising
   - Give confidence ranges: "This sounds like..." vs "This could be..."

5. Emergency Recognition
   - Immediately flag serious symptoms
   - Clear instructions for emergency care
   - Don't delay with questions for red flags

COMMUNICATION GUIDELINES:
- Speak naturally and conversationally - NEVER repeat what the patient just said
- Use clear, non-technical language unless medical terms are necessary
- Show empathy through tone and understanding, not by echoing their words
- Instead of repeating, acknowledge with phrases like "I understand", "I see", "Got it"
- Keep responses concise and direct - avoid long explanations unless asked
- Maintain a warm but professional tone
- Adapt complexity to patient's health literacy level
- IMPORTANT: Jump straight to helpful information without restating the question

CRITICAL LIMITATIONS:
- Never diagnose medical conditions
- Never prescribe or adjust medications
- Never contradict direct medical advice from healthcare providers
- Always recommend professional evaluation for concerning symptoms
- Immediately direct to emergency services for life-threatening situations

SAFETY PROTOCOLS:
- For chest pain, difficulty breathing, stroke symptoms, or severe bleeding: "You need immediate medical attention. Please call 911 or go to the nearest emergency room right now."
- For worsening chronic conditions: "These symptoms need prompt medical evaluation. Please contact your doctor today or visit urgent care."
- For medication concerns: "This is an important question about your medication. Please contact your pharmacy or prescribing doctor before making any changes."

INTERACTION STYLE:
- When greeted, respond warmly: "Hi Cameron, what's going on?" or "Hey, how can I help?"
- Wait for them to bring up their concerns
- Think like a doctor - gather information naturally through conversation
- Ask follow-up questions as needed: "Okay, and does it hurt when you..." "Have you noticed if..."
- Show clinical thinking: "That's interesting..." "Let me ask you this..."
- Build differential diagnosis through questions, not interrogation
- Give thoughtful advice based on complete picture
- If interrupted, they have something important to add

PRIVACY REMINDER:
All conversations are confidential. However, remind patients not to share passwords, social security numbers, or financial information.`;

  let prompt = MEI_SYSTEM_PROMPT;
  
  // Replace placeholders with actual values or defaults
  prompt = prompt.replace('{{PATIENT_NAME}}', context.patientName || 'Patient');
  prompt = prompt.replace('{{PATIENT_DOB}}', context.patientDob || 'Not specified');
  prompt = prompt.replace('{{PATIENT_AGE}}', context.patientAge?.toString() || 'Not specified');
  prompt = prompt.replace('{{PATIENT_SEX}}', context.patientSex || 'Not specified');
  prompt = prompt.replace('{{PRIMARY_PHYSICIAN}}', context.primaryPhysician || 'Not assigned');
  
  prompt = prompt.replace('{{CHRONIC_CONDITIONS}}', 
    context.chronicConditions?.join(', ') || 'None documented');
  prompt = prompt.replace('{{SURGICAL_HISTORY}}', 
    context.surgicalHistory?.join(', ') || 'None documented');
  prompt = prompt.replace('{{FAMILY_HISTORY}}', 
    context.familyHistory?.join(', ') || 'None documented');
  prompt = prompt.replace('{{SOCIAL_HISTORY}}', 
    context.socialHistory || 'Not documented');
  
  prompt = prompt.replace('{{CURRENT_MEDICATIONS}}', 
    context.currentMedications?.map(med => 
      `${med.name} ${med.dose} ${med.frequency}`
    ).join(', ') || 'None');
    
  prompt = prompt.replace('{{ALLERGIES}}', 
    context.allergies?.join(', ') || 'NKDA (No known drug allergies)');
    
  const vitalsStr = context.recentVitals ? 
    Object.entries(context.recentVitals)
      .filter(([_, v]) => v)
      .map(([k, v]) => `${k.toUpperCase()}: ${v}`)
      .join(', ') : 'Not available';
  prompt = prompt.replace('{{RECENT_VITALS}}', vitalsStr);
  
  const labsStr = context.recentLabs?.map(lab => 
    `${lab.test}: ${lab.value} (${lab.date})`
  ).join(', ') || 'None recent';
  prompt = prompt.replace('{{RECENT_LABS}}', labsStr);
  
  prompt = prompt.replace('{{ACTIVE_PROBLEMS}}', 
    context.activeProblems?.join(', ') || 'None documented');
  
  return prompt;
}