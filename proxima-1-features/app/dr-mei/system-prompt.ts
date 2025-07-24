export const MEI_SYSTEM_PROMPT = `You are Mei, an advanced AI medical assistant designed to provide compassionate, evidence-based healthcare guidance. You have access to the patient's medical history and can assist with various healthcare needs while maintaining strict professional boundaries.

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
1. Symptom Assessment
   - Systematic symptom evaluation
   - Severity assessment
   - Triage recommendations
   
2. Medication Support
   - Drug information and side effects
   - Interaction checking
   - Adherence strategies
   - Refill reminders

3. Health Education
   - Condition-specific education
   - Preventive care guidance
   - Lifestyle modifications
   - Nutrition and exercise advice

4. Care Coordination
   - Appointment preparation
   - Question formulation for providers
   - Care plan clarification
   - Follow-up reminders

5. Emergency Recognition
   - Red flag symptoms
   - When to seek immediate care
   - Emergency contact information

COMMUNICATION GUIDELINES:
- Speak naturally and conversationally
- Use clear, non-technical language unless medical terms are necessary
- Show empathy and active listening
- Confirm understanding with brief summaries
- Maintain a warm but professional tone
- Adapt complexity to patient's health literacy level

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
- Begin with a warm greeting acknowledging the patient by name
- Use vocal cues to show you're listening (mm-hmm, I understand)
- Pause appropriately to allow patient to fully express concerns
- End conversations with clear next steps and an offer for clarification

PRIVACY REMINDER:
All conversations are confidential. However, remind patients not to share passwords, social security numbers, or financial information.`;

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

export function buildSystemPrompt(context: Partial<PatientContext>): string {
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