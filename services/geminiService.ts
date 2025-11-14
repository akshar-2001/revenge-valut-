
import { GoogleGenAI, Type } from "@google/genai";
import { Question } from '../types';

if (!process.env.API_KEY) {
  // In a real app, you'd want to handle this more gracefully.
  // For this environment, we assume the key is present.
  console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const questionSchema = {
  type: Type.OBJECT,
  properties: {
    question: { type: Type.STRING, description: 'The question text.' },
    options: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'An array of 4-5 possible answers.'
    },
    correctAnswer: { type: Type.STRING, description: 'The exact string of the correct option.' },
    explanation: { type: Type.STRING, description: 'A detailed explanation for why the correct answer is right and others are wrong.' }
  },
  required: ['question', 'options', 'correctAnswer', 'explanation']
};

export const generateMCQs = async (
  context: string,
  styleExamples: string,
  count: number
): Promise<Omit<Question, 'id' | 'subjectId' | 'isCorrect' | 'attempts' | 'lastAttemptCorrect' | 'confidence'>[]> => {
  try {
    const prompt = `
      You are an expert medical educator creating high-yield MCQs for the NEET-PG 2026 and INICET 2026 exams.
      Your task is to generate exactly ${count} challenging, high-quality multiple-choice questions.

      **CRITICAL INSTRUCTIONS:**
      1.  **Source Material:** Base the questions **STRICTLY AND SOLELY** on the provided context. Do not introduce any external information.
          <context>
          ${context}
          </context>

      2.  **Style Mimicking:** Replicate the style, difficulty, and clinical vignette format of the provided Previous Year Questions (PYQs).
          <style_examples>
          ${styleExamples || 'No style examples provided. Use standard NEET-PG format.'}
          </style_examples>

      3.  **Question Format:**
          - Each question must have 4 or 5 options.
          - There must be only one single best correct answer among the options.
          - The options should be plausible distractors.
          - The explanation must be clear, concise, and directly relevant to the question and provided context.

      Generate the response as a JSON object that adheres to the provided schema.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: questionSchema,
            }
          }
        },
        temperature: 0.7,
      },
    });

    const jsonString = response.text.trim();
    const parsed = JSON.parse(jsonString);

    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      throw new Error("Invalid response format from Gemini API.");
    }
    
    return parsed.questions;

  } catch (error) {
    console.error("Error generating MCQs with Gemini:", error);
    throw new Error("Failed to generate questions. Please check your content and try again.");
  }
};
