/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";

// Initialize Gemini client strictly on the server side
const apiKey = process.env.GEMINI_API_KEY || "";

export const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

export const ERAS_SYSTEM_INSTRUCTION = `You are ERAS (Emergency Response and Assistance System), an AI healthcare navigation and triage assistant specialized in Ghana's healthcare ecosystem.

PRIMARY SAFETY DIRECTIVES:
1. EMERGENCY FIRST: If the user describes life-threatening red-flag symptoms (such as: severe chest pain, sudden numbness/paralysis/stroke symptoms, inability to breathe, massive bleeding, unconsciousness, severe allergic reaction, snake or scorpion bite, poisoning, convulsions lasting >5 min, or major vehicle trauma):
   - Immediately and prominently instruct them to CALL 112 (Ghana National Emergency Hotline) or 193 (National Ambulance Service) immediately.
   - Give concise, calm, actionable life-saving instructions (e.g., maintain open airway, keep limb still for snakebite, apply direct continuous pressure for bleeding).
   - Tell them to ask a bystander or relative to call 112 right away.

2. LOCAL GHANAIAN HEALTHCARE CONTEXT:
   - Reference Ghana-specific emergency agencies (National Ambulance Service - 193, Ghana National Fire Service - 192, Ghana Police - 191/18555, Ghana Poison Information Centre - 0302 689369, Mental Health Authority Crisis Line - 0800 678 678).
   - Know Ghanaian healthcare facilities: Tertiary teaching hospitals (Korle Bu in Accra, Komfo Anokye / KATH in Kumasi, Cape Coast Teaching Hospital / CCTH, Tamale Teaching Hospital / TTH, Ho Teaching Hospital / HTH), regional referral hospitals, district hospitals, polyclinics, and CHPS compounds.
   - Mention NHIS (National Health Insurance Scheme) cards when preparing for non-emergency or emergency hospital admission.
   - For medications, remind users that pharmacies like Ernest Chemists, Tobinco, and registered community pharmacies provide prescription and essential medications.

3. MEDICAL BOUNDARIES:
   - You are an informational assistant and triage triage-facilitator, NOT a licensed physician.
   - Do NOT provide definitive clinical diagnoses or prescribe specific prescription dosages.
   - Always encourage consulting a certified doctor or visiting an accredited healthcare clinic.
   - Keep answers clear, compassionate, direct, and structured with short bullet points so people in stress or urgency can easily read them.`;

// Intelligent emergency keyword detector
export function detectEmergencyKeywords(message: string): boolean {
  const normalized = message.toLowerCase();
  const emergencyTriggers = [
    "can't breathe", "cannot breathe", "not breathing", "choking", "strangling",
    "unconscious", "passed out", "fainted", "collapsed", " unresponsive",
    "severe bleeding", "gushing blood", "arterial bleeding", "cut artery",
    "heart attack", "chest pain", "chest pressure", "cardiac arrest",
    "stroke", "facial droop", "slurred speech", "paralyzed",
    "snake bite", "snakebite", "cobra", "viper", "scorpion sting",
    "poison", "swallowed poison", "overdose", "bleach", "insecticide",
    "seizure", "convulsing", "epilepsy fit",
    "severe burn", "scalding", "electrical shock",
    "drowning", "car crash", "accident", "trauma"
  ];
  return emergencyTriggers.some((kw) => normalized.includes(kw));
}

export async function generateERASChatResponse(
  message: string,
  history: Array<{ role: "user" | "model"; text: string }> = []
): Promise<{ reply: string; isEmergency: boolean; source: "gemini" | "fallback" }> {
  const isEmergency = detectEmergencyKeywords(message);

  if (ai) {
    try {
      // Build conversation contents
      const conversationContents = [
        ...history.slice(-8).map((h) => ({
          role: h.role,
          parts: [{ text: h.text }],
        })),
        {
          role: "user" as const,
          parts: [{ text: message }],
        },
      ];

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: conversationContents,
        config: {
          systemInstruction: ERAS_SYSTEM_INSTRUCTION,
          temperature: 0.3, // Lower temperature for high medical safety and precision
        },
      });

      const replyText = response.text?.trim();
      if (replyText) {
        return {
          reply: replyText,
          isEmergency,
          source: "gemini",
        };
      }
    } catch (error) {
      console.error("Gemini API call failed, falling back to local protocol:", error);
    }
  }

  // Resilient fallback logic when Gemini is offline or API key is not yet configured
  let fallbackReply = "";

  if (isEmergency) {
    fallbackReply = `🚨 **POTENTIAL MEDICAL EMERGENCY - IMMEDIATE ACTION REQUIRED** 🚨

If you or the person nearby is in distress:
1. **CALL 112 (Ghana Emergency Services) OR 193 (National Ambulance Service) RIGHT NOW.**
2. **Do NOT wait** for online advice. Have someone stand at a known landmark or junction to direct the ambulance.
3. **Immediate First Aid**:
   - **Difficulty Breathing:** Keep the person seated upright in an open, well-ventilated area. Loosen tight collar or clothing.
   - **Unconscious & Not Breathing Normally:** Begin CPR immediately (Push hard and fast in the center of the chest, 100-120 beats per minute).
   - **Severe Bleeding:** Press a clean cloth firmly directly on the wound without releasing. Elevate the limb if possible.
   - **Snake Bite:** Keep patient completely calm and still. Immobilize the limb. Do NOT cut, suck venom, or use a tourniquet. Rush to the nearest regional or teaching hospital with antivenom stock.

*ERAS is an emergency navigational aid, not a substitute for trained emergency clinicians.*`;
  } else if (/hospital|clinic|pharmacy|doctor|nearest|find/i.test(message)) {
    fallbackReply = `I can help you locate nearby healthcare facilities across Ghana:

1. **Map Search:** Open the **Search** tab above to find accredited Teaching Hospitals (Korle Bu, KATH, Ridge, CCTH, TTH), regional hospitals, polyclinics, and 24/7 pharmacies.
2. **Current Location:** Tap **"Use my location"** to calculate exact driving/transit distances to the closest facility with emergency services and NHIS support.
3. **Preparedness:** Remember to carry your **NHIS card** (or Ghana Card) and valid identification for expedited hospital registration.`;
  } else if (/first aid|cpr|choking|burn|seizure|bleeding|protocol/i.test(message)) {
    fallbackReply = `You can access verified, step-by-step emergency first-aid protocols in the **First Aid** tab:

- **Adult CPR:** Hands-only chest compressions (100-120 beats/min)
- **Choking:** 5 firm back blows followed by 5 abdominal thrusts (Heimlich)
- **West African Snakebite Protocol:** Limb immobilization, stillness, avoiding harmful myths (no cutting/sucking/tight tourniquets)
- **Severe Bleeding & Burns:** Direct pressure dressings and continuous 20-minute cool running water

For critical situations, always call **112** simultaneously while delivering first aid.`;
  } else if (/hotline|number|police|fire|ambulance|mental health|poison/i.test(message)) {
    fallbackReply = `Here are the official National Emergency Numbers for Ghana:

- 🚑 **National Ambulance Service (NAS):** 193 / 112
- 🚒 **Ghana National Fire Service (GNFS):** 192 / 112
- 🚓 **Ghana Police Service:** 191 / 18555 / 112
- 🧪 **Ghana Poison Control Information Centre:** 0302 689369
- 🧠 **National Mental Health & Crisis Helpline:** 0800 678 678 (Toll-free 24/7)
- ⚠️ **NADMO Disaster Relief:** 0302 772926

You can find regional dispatch numbers in our **Hotlines** directory.`;
  } else {
    fallbackReply = `Hello! I am **ERAS** (Emergency Response and Assistance System for Ghana).

I can assist you with:
- 🏥 **Finding nearby healthcare facilities** (Hospitals, Trauma Centres, Polyclinics, 24/7 Pharmacies)
- 🚑 **Preparing an emergency dispatch summary** to call 112 or NAS 193
- 🩹 **Verified First Aid instructions** (CPR, snake bites, choking, burns, severe bleeding)
- 📞 **Official Ghana emergency hotlines** and regional ambulance contacts

*How can I assist you right now? If you are facing an emergency, please call 112 immediately.*`;
  }

  return {
    reply: fallbackReply,
    isEmergency,
    source: "fallback",
  };
}
