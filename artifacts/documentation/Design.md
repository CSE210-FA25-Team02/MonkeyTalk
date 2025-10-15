# MonkeyTalk - System Design

## Overview

MonkeyTalk is a web application that translates between natural language text and emoji expressions using Google Gemini AI.

## High-Level System Flow

```
MONKEYTALK SYSTEM FLOW
─────────────────────────────────────────────────────────────

┌─────────────────────────────────────────┐
│              USER INTERFACE             │
│                                         │
│  ┌─────────────────────────────────────┐│
│  │        Switch Mode                  ││
│  │    Text-to-Emoji ↔ Emoji-to-Text    ││
│  └─────────────────────────────────────┘│
│                    │                    │
│                    ▼                    │
│  ┌─────────────────────────────────────┐│
│  │         User Input                  ││
│  │      Text or Emoji Sequence         ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│         INTERNAL API CALL               │
│                                         │
│  ┌─────────────────────────────────────┐│
│  │        Call Google Gemini API       ││
│  │  - API Key Authentication           ││
│  │  - Prepare Prompt with User Input   ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│         GEMINI API PROCESSING           │
│                                         │
│  ┌─────────────────────────────────────┐│
│  │    AI Processing & Response         ││
│  │    - Generate Translation           ││
│  │    - Return Emoji/Text Result       ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│         RESPONSE RETURNED               │
│                                         │
│  ┌─────────────────────────────────────┐│
│  │    Process & Display Output         ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘

Flow Steps:
1. User switches mode and enters input
2. System creates translation request
3. Internal API call to Google Gemini
4. Gemini processes and returns response
5. Response displayed to user
```