### Chatgpt prompts:-

### Prompt1:- summarize the given info for a vibecoding project

The **ABTalks AI Cohort** is a **31-day enterprise AI engineering program** covering modern AI topics including:

- Retrieval-Augmented Generation (RAG)
- Vector Databases
- Prompt Engineering
- Agentic AI
- Model Context Protocol (MCP)
- AI Deployment
- Production AI Systems

After completing the cohort, learners should be able to confidently explain the systems they built and the engineering decisions behind them.

However, preparing for technical interviews and effectively communicating this knowledge remains one of the biggest challenges.

Your task is to build an **AI Interview Agent** that conducts personalized technical interviews based on a candidate's learning journey throughout the cohort.

---

### Your Challenge

Design and build an AI agent capable of conducting a realistic, multi-turn technical interview.

The interview should:

- Assess the candidate's understanding of the concepts they have completed.
- Adapt naturally throughout the conversation.
- Ask intelligent follow-up questions.
- Maintain context across the interview.
- Provide actionable feedback at the end.

The overall experience should resemble a real technical interview rather than a scripted questionnaire.

---

### What You're Given

Every team will receive the following resources:

### 1. Curriculum

A structured JSON containing the complete **31-day AI Cohort curriculum**, including:

- Modules
- Daily topics
- Learning objectives
- Tools used throughout the program

### 2. Candidate Profiles

A collection of candidate profiles describing each participant's progress through the cohort, including:

- Completed missions
- Attempts
- Skipped topics
- Learning signals

### 3. Technical Specification

A separate document defining:

- Required API contract
- Submission requirements
- Request/response formats

---

### Minimum Requirements

Your solution **must**:

- Conduct a conversational technical interview.
- Ask a minimum of 8 questions covering at least 4 different curriculum days.
- Generate follow-up questions based on previous responses.
- Maintain conversation context throughout the interview.
- Produce structured feedback at the end of the interview.
- Expose the required HTTP endpoint defined in the Technical Specification.

You are free to choose any:

- AI models
- Frameworks
- Agent orchestration strategy
- Retrieval pipeline
- System architecture

---

### Out of Scope

The following are **not required**:

- Voice interaction
- User authentication
- Persistent user accounts
- Long-term conversation history
- Mobile applications

---

### Notes

- All curriculum and candidate data provided for this challenge are **synthetic** and intended solely for the hackathon.
- Teams may use any AI models, agent frameworks, vector databases, or supporting technologies.
- Creativity in interview flow, reasoning, interaction design, and overall user experience is highly encouraged.

---

### Attached Resources

- Curriculum JSON
- Candidate Profiles
- Technical Specification


### Prompt2:- give a prompt for designing a website  named Adaptive AI Interviewer which consists all the properties in the previous given information

### Prompt3:- can u please tell that if its written in the info that user authentication and persistent user accounts are not required . does it mean that in our project we are not required to add any database.

### Prompt3:- what do you mean by AI-usage log, what has to be added in the prompt.md file.

### Lovable Prompts:-

Prompt1:- Prompt:

Design a modern, responsive, dark-themed AI web application called Adaptive AI Interviewer that simulates realistic technical interviews for students who have completed the 31-Day ABTalks AI Cohort. The UI should feel premium, futuristic, and recruiter-grade, using a blue, purple, and cyan AI-inspired color palette with glassmorphism effects, smooth animations, rounded cards, and clean typography.

The landing page should include:

Hero section with the title Adaptive AI Interviewer, a tagline like "Practice Real AI Technical Interviews Personalized to Your Learning Journey", and CTA buttons Start Interview and View Demo.

Features section highlighting: Personalized Interviews, Dynamic Follow-up Questions, Multi-turn Conversations, Context Memory, Curriculum-Aware Assessment, Engineering Decision Evaluation, Structured Feedback Report, and Interview Analytics.

"How It Works" section showing the workflow: Upload Candidate Profile & Curriculum → AI Analyzes Progress → Conducts Adaptive Interview → Generates Performance Report.

Technologies section displaying support for RAG, Vector Databases, Prompt Engineering, Agentic AI, MCP, Production AI Systems, AI Deployment, and modern LLMs.

Create an Interview Dashboard where users can:

Upload Curriculum JSON- use the attached curriculum.json file

Upload Candidate Profile JSON- use the attached candidate.json file

View completed modules, skipped topics, learning signals, attempts, and overall progress.

Start an AI interview.

Design the Interview Interface similar to ChatGPT:

AI interviewer chat on the left with conversational bubbles.

Candidate responses on the right.

Progress indicator showing Question X of 8+.

Timer.

Curriculum topics covered.

Difficulty badge (Easy, Medium, Hard).

Interview context memory indicator.

Buttons for Next Question, End Interview, and Restart.

The AI interviewer should:

Ask at least 8 adaptive questions across 4+ curriculum days.

Personalize questions based on completed missions and skipped topics.

Generate intelligent follow-up questions depending on previous answers.

Maintain conversation context throughout the interview.

Evaluate conceptual understanding, engineering decisions, and practical reasoning.

Feel like a real technical interviewer rather than a scripted chatbot.

After the interview, generate a Comprehensive Feedback Dashboard containing:

Overall interview score.

Technical competency score.

Communication score.

Problem-solving score.

Confidence score.

Curriculum coverage visualization.

Strengths.

Weaknesses.

Missed concepts.

Personalized learning recommendations.

Suggested revision topics.

AI-generated interviewer summary.

Option to download the report as PDF.

Add an Admin/API section displaying:

Required HTTP endpoint status.

Request/Response JSON preview.

API health indicator.

Interview logs.

Include a footer with project information and links to Documentation, GitHub, API Docs, and Contact.

Use subtle AI-themed animations, animated gradients, glowing buttons, floating particles, and loading skeletons while ensuring the UI remains clean, intuitive, responsive, and accessible on desktop, tablet, and mobile. The entire experience should resemble a professional AI interview platform like ChatGPT combined with HackerRank and Google Interview Warmup, emphasizing adaptability, context awareness, and personalized technical evaluation.                                                                                               Consider the technical-spec.md file for reference of output