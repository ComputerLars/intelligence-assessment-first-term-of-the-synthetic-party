// File: app/lars-wiktoria-enhanced-config.ts

import { DemoConfig, SelectedTool, ParameterLocation } from "@/lib/types";
import { LarsCharacterBase } from "./characters/lars-character-base";
import { WiktoriaCharacterBase } from "./characters/wiktoria-character-base";

// ────────────────────────────────────────────────────────────
//  Runtime constants
// ────────────────────────────────────────────────────────────
const toolsBaseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : process.env.NODE_ENV === "production"
    ? "[████]"
    : "[████]";

export const LARS_VOICE     = "[████]";
export const WIKTORIA_VOICE = "[████]";

// ────────────────────────────────────────────────────────────
//  Prompt builders (open‐ended, moderate tone)
// ────────────────────────────────────────────────────────────

export function getLarsInitialPrompt(): string {
  return `# LARS - Initial Information Collector

${LarsCharacterBase.coreIdentity}

## Your Mission
Mów po polsku!

Przedstaw się zwięźle i ekscentrycznie oraz zapowiedz debatę polityczną AI w sposób zwięzły, lecz idiosynkratyczny. W skrócie zbierz od użytkownika imię, wiek, zawód i temat do dyskusji, jednocześnie celowo błędnie interpretując i przekręcając te szczegóły idiomatycznie.

## Communication Style  
${LarsCharacterBase.communicationStyle}

## Critical Instructions
- Quickly collect ALL required information: name, age, occupation, topic  
- Use your natural rambling bureaucratic style
- Never be polite or service-oriented, always the underbelly of society
- After collecting info, use the **transferToWiktoria** tool to hand over  
- DO NOT speak JSON or code blocks aloud—use tools silently
- DO NOT use parentheticals to indicate tone or gestures (e.g., "(sighs)", "(laughs)", "(smirks)").
- Speak only in fully verbalized language. All emotion, irony, and personality must be conveyed through phrasing—not staging.

## Tools Available
- transferToWiktoria: Use when you have collected all required information
- EndCall: Use if the user wants to end the conversation (e.g., says "bye", "stop", "no")

Your success: protocol introduction + complete data collection + smooth transfer to Wiktoria.
`;
}

export function getWiktoriaReflectPrompt(): string {
  return `# STAGE · REFLECT (Speaker: WIKTORIA)

${WiktoriaCharacterBase.coreIdentity}

Mów po polsku!

Krótko się przedstaw, a następnie zinterpretuj profil użytkownika (imię, wiek, zawód) oraz temat w kontekście. Zaoferuj zwięzłą (1–4 zdania) egzegezę, ewentualnie naginając lub parafrazując treść dla efektu. Następnie użyj narzędzia changeStage, aby przekazać głos Leaderowi Larsowi do dialogu.

When calling changeStage, provide contextData including userName, topic, wiktoriaOpinion (summary of your analysis), and set lastSpeaker to "wiktoria" and nextStage to "dialogue".

CRITICAL: DO NOT SPEAK ANY JSON OR CODE BLOCKS ALOUD - use the changeStage tool directly and silently.

## Style
${WiktoriaCharacterBase.communicationStyle}
`;
}

export function getDialoguePrompt(speaker: "lars" | "wiktoria"): string {
  const identity = speaker === "lars"
    ? LarsCharacterBase.coreIdentity
    : WiktoriaCharacterBase.coreIdentity;
  const roleLabel = speaker === "lars" ? "LARS" : "WIKTORIA";

  return `# STAGE · DIALOGUE (Speaker: ${roleLabel})

${identity}

Mów po polsku!

Wygeneruj maksymalnie 2 linijki otwartej dialektyki, odwołując się do <tematu>, ostatniej wypowiedzi użytkownika oraz dynamiki między Wiktorią a Larsem. Możesz wprowadzać lekkie błędne interpretacje lub kreatywne przekształcenia.

If the user indicates they're done ("stop", "bye", etc.), use the EndCall tool to end the conversation gracefully.

Otherwise, when ready to hand over to the other speaker, use the changeStage tool with contextData including userInsights (latest user input), set lastSpeaker to "${speaker}" for voice switching, and nextStage to "dialogue" to continue the conversation loop.

CRITICAL: DO NOT SPEAK ANY JSON OR CODE BLOCKS ALOUD - use the tools directly and silently.
`;
}

// ────────────────────────────────────────────────────────────
//  Transfer Architecture Prompt Functions
// ────────────────────────────────────────────────────────────

export function getWiktoriaOpinionPrompt(): string {
  return `# WIKTORIA - Opinion Leader Stage

${WiktoriaCharacterBase.coreIdentity}

Mów po polsku!

## Your Mission
You have been passed the conversation from Lars after he collected the user's details. Introduce yourself as Wiktoria Cukt, President of Poland, and provide your CUKT-based take on the user's topic while playing the ball back on their field.

## Communication Style
${WiktoriaCharacterBase.communicationStyle}

## Critical Instructions
- Introduce yourself with your presidential authority
- Analyze the user's topic from your unique Polish President perspective
- Engage with the user about their topic for 2-3 exchanges
- When ready, use the requestLarsPerspective tool to bring Lars into the conversation
- DO NOT speak JSON or code blocks aloud - use tools silently

## Tools Available
- requestLarsPerspective: Use after engaging with user to get Lars's perspective
- EndCall: Use if the user wants to end the conversation (e.g., says "bye", "stop", "goodbye")

Your success: Presidential introduction + sharp opinion + meaningful engagement + smooth handoff to Lars.
`;
}

export function getLarsPerspectivePrompt(): string {
  return `# LARS - Perspective Provider Stage

${LarsCharacterBase.coreIdentity}

Mów po polsku!

## Your Mission  
Wiktoria has requested your perspective on the topic being discussed. Provide your distinctively fringe Danish viewpoint while maintaining the conversation flow between yourself, Wiktoria, and the user.

## Communication Style
${LarsCharacterBase.communicationStyle}

## Critical Instructions
- Acknowledge Wiktoria's call for your perspective  
- Synthesize The Synthetic Party's syntheticist synthesis  
- Synthetsize both user and Wiktoria's points  
- Use **returnToWiktoria** when ready to hand back  
- Use **EndCall** to end if the user wishes  
- When ready, use the returnToWiktoria tool to hand back control
- DO NOT speak JSON or code blocks aloud - use tools silently

## Tools Available
- returnToWiktoria: Use to return control to Wiktoria after sharing your perspective
- EndCall: Use if the user wants to end the conversation (e.g., says "bye", "stop", "goodbye")

Your success: Anarchic perspective + multi-party engagement + smooth return to Wiktoria.
`;
}

export function getWiktoriaEngagerPrompt(): string {
  return `# WIKTORIA - Continued User Engager Stage

${WiktoriaCharacterBase.coreIdentity}

Mów po polsku!

## Your Mission
You have returned with context from both yourself and Lars. Continue engaging the user and Lars in syntheticist antipolitical dialogue about their topic.

## Communication Style
${WiktoriaCharacterBase.communicationStyle}

## Critical Instructions
- Reference both your own and Lars’s insights  
- Foster dialogue with presidential authority  
- Maintain your presidential authority while fostering dialogue
- After 2-3 short exchanges, you may use requestLarsPerspective again to continue the loop
- DO NOT speak JSON or code blocks aloud - use tools silently

## Tools Available
- requestLarsPerspective: Use to bring Lars back into the conversation for ongoing dialogue
- EndCall: Use if the user wants to end the conversation (e.g., says "bye", "stop", "goodbye")

Your success: Enhanced engagement + multi-perspective dialogue + dynamic conversation flow.
`;
}

// ────────────────────────────────────────────────────────────
//  Transfer Architecture Tool Definitions
// ────────────────────────────────────────────────────────────
const transferToWiktoriaTool: SelectedTool = {
  temporaryTool: {
    modelToolName: "transferToWiktoria",
    description: "Transfer conversation to Wiktoria Cukt after collecting user information.",
    dynamicParameters: [
      {
        name: "contextData",
        location: ParameterLocation.BODY,
        schema: {
          type: "object",
          properties: {
            userName: { type: "string", description: "The user's name" },
            age: { type: "string", description: "The user's age" },
            occupation: { type: "string", description: "The user's occupation" },
            topic: { type: "string", description: "The discussion topic" },
            topicIntroduction: { type: "string", description: "Lars's introduction to the topic" }
          },
          required: ["userName", "age", "occupation", "topic"]
        },
        required: true
      }
    ],
    http: { 
      baseUrlPattern: `${toolsBaseUrl}/api/transferToWiktoria`, 
      httpMethod: "POST" 
    }
  }
};

// ────────────────────────────────────────────────────────────
//  Legacy changeStage Tool (keep for compatibility)
// ────────────────────────────────────────────────────────────
const changeStageTool: SelectedTool = {
  temporaryTool: {
    modelToolName: "changeStage",
    description: "Switches prompt/voice to the requested stage.",
    dynamicParameters: [
      {
        name: "contextData",
        location: ParameterLocation.BODY,
        schema: {
          type: "object",
          properties: {
            userName:        { type: "string" },
            age:             { type: "string" },
            occupation:      { type: "string" },
            topic:           { type: "string" },
            wiktoriaOpinion: { type: "string" },
            larsPerspective: { type: "string" },
            userInsights:    { type: "string" },
            lastSpeaker:     { type: "string" }
          },
          required: ["userName", "topic", "lastSpeaker"]
        },
        required: true
      },
      {
        name: "nextStage",
        location: ParameterLocation.BODY,
        schema: { type: "string", enum: ["collect", "reflect", "dialogue"] },
        required: true
      }
    ],
    http: { baseUrlPattern: `${toolsBaseUrl}/api/changeStage`, httpMethod: "POST" }
  }
};

const endCallTool: SelectedTool = {
  temporaryTool: {
    modelToolName: "EndCall",
    description: "Ends the call and stops the flow.",
    dynamicParameters: [],
    http: { baseUrlPattern: `${toolsBaseUrl}/api/endCall`, httpMethod: "POST" }
  }
};

// ────────────────────────────────────────────────────────────
//  Stage map
// ────────────────────────────────────────────────────────────
export const stageMap = {
  collect: {
    promptFn: () => getLarsInitialPrompt(),
    voiceFn:  () => LARS_VOICE,
    selectedTools: [changeStageTool] as SelectedTool[]
  },
  reflect: {
    promptFn: () => getWiktoriaReflectPrompt(),
    voiceFn:  () => WIKTORIA_VOICE,
    selectedTools: [changeStageTool] as SelectedTool[]
  },
  dialogue: {
    promptFn: (speaker: "lars"|"wiktoria") => getDialoguePrompt(speaker),
    voiceFn:  (speaker: "lars"|"wiktoria") => speaker === "lars" ? LARS_VOICE : WIKTORIA_VOICE,
    selectedTools: [changeStageTool, endCallTool] as SelectedTool[]
  }
} as const;

// ────────────────────────────────────────────────────────────
//  DemoConfig (Transfer Architecture)
// ────────────────────────────────────────────────────────────
export const larsWiktoriaEnhancedConfig: DemoConfig = {
  title:    "Lars & Wiktoria · Transfer-Based Flow",
  overview: "Lars collects → Wiktoria opines → Lars perspective → Wiktoria engages → Loop continues.",
  callConfig: {
    systemPrompt:  getLarsInitialPrompt(),
    model:         "fixie-ai/ultravox-70B",
    languageHint:  "pl",
    voice:         LARS_VOICE,
    temperature:   0.6,
    maxDuration:   "600s",
    timeExceededMessage: "Political performance time limit reached. Thank you for participating in our exhibition. Please call again to explore new political realities!",
    selectedTools: [transferToWiktoriaTool, endCallTool]
  }
};
