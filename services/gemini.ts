import { GoogleGenAI, Type } from "@google/genai";
import { LessonContent, Question } from "../types";

// Lazy initialization to avoid top-level ReferenceError if process is undefined
let ai: GoogleGenAI | null = null;

const getAI = () => {
  if (!ai) {
    // Safe access to process.env
    const apiKey = (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : '';
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

export const generateLessonContent = async (topic: string, interests?: string[]): Promise<LessonContent> => {
  try {
    const isRevision = topic.toLowerCase().includes('revision') || topic.toLowerCase().includes('review') || topic.toLowerCase().includes('quiz');

    let promptContext = `Create a ${isRevision ? 'comprehensive revision quiz' : 'bite-sized physics lesson'} about "${topic}" for a mobile app.`;
    
    if (interests && interests.length > 0) {
      promptContext += `\n\nIMPORTANT PERSONALIZATION: The user loves ${interests.join(', ')}. 
      Please try to frame the Theory examples and Quiz Questions around these specific topics if applicable. 
      (e.g., if they like 'cars', use car acceleration examples. If 'sports', use projectile motion of balls).`;
    }

    let structureInstructions = '';

    if (isRevision) {
      structureInstructions = `
      Part 1: Theory (Hidden placeholder)
      - Title: "Unit Revision"
      - Paragraphs: ["This is a revision quiz. Get ready to test your knowledge!"]
      - Key Point: "Reviewing key concepts."
      - NO sortingGame.

      Part 2: Quiz
      - 5 multiple-choice questions that summarize the key concepts of the unit.
      - Questions should mix conceptual understanding and simple application.
      `;
    } else {
      structureInstructions = `
      Part 1: Theory
      - A fun, catchy title.
      - 2-3 short, engaging paragraphs explaining the concept simply.
      - **INTERACTIVE FORMATTING (Crucial)**: 
        1. Wrap key important terms in **double asterisks** to make them bold (e.g., "The **force** is constant").
        2. Identify 1-2 complex or interesting terms per paragraph and format them as [term||short simple definition] to create clickable interactive explanations (e.g., "The [inertia||resistance to change in motion] of the object...").
      - 1 "Key Takeaway" sentence that summarizes the most important point.
      - **SORTING ACTIVITY (Optional)**: If the topic involves classifying things (like Scalars vs Vectors, Conductors vs Insulators), provide a 'sortingGame' object.

      Part 2: Quiz
      - 3 multiple-choice questions based on the theory.
      - The questions should be conceptual or simple calculations.
      - Keep the tone encouraging.
      `;
    }

    const aiInstance = getAI();
    const response = await aiInstance.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `${promptContext}
      
      ${structureInstructions}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            theory: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                paragraphs: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING } 
                },
                keyPoint: { type: Type.STRING, description: "One sentence summary" },
                sortingGame: {
                  type: Type.OBJECT,
                  description: "Optional mini-game to sort items into categories",
                  nullable: true,
                  properties: {
                    title: { type: Type.STRING },
                    categories: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          id: { type: Type.STRING },
                          label: { type: Type.STRING },
                          color: { type: Type.STRING, description: "Tailwind color name e.g. 'blue', 'green', 'purple'" }
                        },
                        required: ["id", "label", "color"]
                      }
                    },
                    items: {
                      type: Type.ARRAY,
                      items: {
                         type: Type.OBJECT,
                         properties: {
                            id: { type: Type.STRING },
                            label: { type: Type.STRING },
                            icon: { type: Type.STRING, description: "Emoji icon" },
                            categoryId: { type: Type.STRING, description: "Must match one of the category IDs" }
                         },
                         required: ["id", "label", "icon", "categoryId"]
                      }
                    }
                  },
                  required: ["title", "categories", "items"]
                }
              },
              required: ["title", "paragraphs", "keyPoint"]
            },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  text: { type: Type.STRING },
                  options: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING },
                    description: "4 possible answers"
                  },
                  correctAnswerIndex: { type: Type.INTEGER, description: "Index (0-3) of the correct answer" },
                  explanation: { type: Type.STRING, description: "A brief, friendly explanation of why the answer is correct." }
                },
                required: ["id", "text", "options", "correctAnswerIndex", "explanation"]
              }
            }
          },
          required: ["theory", "questions"]
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from AI");
    
    const data = JSON.parse(jsonText);
    if (!data.questions) data.questions = [];

    // --- MANUAL OVERRIDES & INJECTIONS ---
    
    // Inject Internal Simulation for Distance & Displacement
    if (topic.toLowerCase().includes('distance') && topic.toLowerCase().includes('displacement')) {
      data.theory.simulationType = 'distance-displacement';
    }

    // Force remove sorting game for Speed vs Velocity or Revisions
    if ((topic.toLowerCase().includes('speed') && topic.toLowerCase().includes('velocity')) || isRevision) {
       delete data.theory.sortingGame;
    }

    // Inject specific content for Scalars & Vectors lesson
    if (topic.toLowerCase().includes('scalars') && topic.toLowerCase().includes('vectors')) {
       
       // 1. Force Inject Sorting Game (Ensures it always appears)
       data.theory.sortingGame = {
          title: "Scalar vs Vector Challenge",
          categories: [
            { id: 'scalar', label: 'Scalar (Magnitude Only)', color: 'blue' },
            { id: 'vector', label: 'Vector (Mag + Direction)', color: 'purple' }
          ],
          items: [
            { id: 'mass', label: 'Mass (kg)', icon: '⚖️', categoryId: 'scalar' },
            { id: 'dist', label: 'Distance', icon: '📏', categoryId: 'scalar' },
            { id: 'temp', label: 'Temperature', icon: '🌡️', categoryId: 'scalar' },
            { id: 'time', label: 'Time', icon: '⏱️', categoryId: 'scalar' },
            { id: 'force', label: 'Force', icon: '💪', categoryId: 'vector' },
            { id: 'vel', label: 'Velocity', icon: '🚀', categoryId: 'vector' },
            { id: 'disp', label: 'Displacement', icon: '🎯', categoryId: 'vector' }
          ]
       };

       // 2. Inject Manual Text Questions
       const textQuestions: Question[] = [
         {
           id: 'manual-txt-1',
           type: 'text',
           text: 'What is a scalar quantity? Give two examples.',
           acceptedKeywords: ['magnitude', 'size'],
           explanation: 'A scalar quantity has only magnitude (size) and no direction. Examples: Mass, Time, Temperature, Speed.'
         },
         {
           id: 'manual-txt-2',
           type: 'text',
           text: 'What is a vector quantity? Give two examples.',
           acceptedKeywords: ['direction'],
           explanation: 'A vector quantity has both magnitude and direction. Examples: Force, Velocity, Displacement, Acceleration.'
         },
         {
           id: 'manual-txt-3',
           type: 'text',
           text: 'Can a scalar quantity ever be negative? Give an example.',
           acceptedKeywords: ['yes', 'temperature', 'work', 'charge', 'potential'],
           explanation: 'Yes! Scalars like Temperature (-5°C), Work, or Electric Charge (-1C) can be negative.'
         },
         {
           id: 'manual-txt-4',
           type: 'text',
           text: 'Can a vector quantity ever be negative? Give an example.',
           acceptedKeywords: ['yes', 'direction', 'opposite'],
           explanation: 'Yes, but the negative sign in a vector usually indicates it points in the opposite direction.'
         },
         {
           id: 'manual-txt-5',
           type: 'text',
           text: 'How do you calculate the resultant of two vectors pointing in the same direction?',
           acceptedKeywords: ['add', 'sum', 'plus'],
           explanation: 'When vectors point in the same direction, you simply add their magnitudes together.'
         },
         {
           id: 'manual-txt-6',
           type: 'text',
           text: 'How do you calculate the resultant of two vectors pointing in opposite directions?',
           acceptedKeywords: ['subtract', 'minus', 'difference'],
           explanation: 'When vectors point in opposite directions, you subtract the smaller magnitude from the larger one.'
         },
         {
           id: 'manual-txt-7',
           type: 'text',
           text: 'Is "Speed" a scalar or vector quantity?',
           acceptedKeywords: ['scalar'],
           explanation: 'Speed is a scalar because it only tells you how fast you are going, not where you are going.'
         },
         {
           id: 'manual-txt-8',
           type: 'text',
           text: 'Is "Displacement" a scalar or vector quantity?',
           acceptedKeywords: ['vector'],
           explanation: 'Displacement is a vector because it measures the straight-line distance and direction from start to finish.'
         }
       ];
       
       // Shuffle the manual text questions pool
       for (let i = textQuestions.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [textQuestions[i], textQuestions[j]] = [textQuestions[j], textQuestions[i]];
       }

       // Select only 2 randomly
       const selectedTextQuestions = textQuestions.slice(0, 2);

       // Append to existing questions
       data.questions = [...data.questions, ...selectedTextQuestions];
    }

    // --- SHUFFLE QUESTIONS ---
    // Randomize the order so manual and AI questions are mixed
    for (let i = data.questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [data.questions[i], data.questions[j]] = [data.questions[j], data.questions[i]];
    }

    return data as LessonContent;
  } catch (error) {
    console.error("Failed to generate lesson content:", error);
    // Fallback data
    return {
      theory: {
        title: "Scalars vs Vectors",
        paragraphs: [
          "In physics, we measure many things. Some things, like **Time** or **Temperature**, are simple—they just have a **magnitude** (a size). These are called **Scalars**.",
          "Other things, like a [force||A push or pull on an object] or acceleration, are more complex. They have both a magnitude AND a **direction**. We call these **Vectors**.",
          "Think of it this way: The temperature is '70°F' (Scalar). But when you push a door, you have to push it 'Forward' (Vector)."
        ],
        keyPoint: "Vectors have direction (like a push); Scalars just have size (like time).",
        sortingGame: {
          title: "Sort the Quantities",
          categories: [
            { id: 'scalar', label: 'Scalar (No Direction)', color: 'blue' },
            { id: 'vector', label: 'Vector (With Direction)', color: 'purple' }
          ],
          items: [
            { id: 'temp', label: 'Temperature', icon: '🌡️', categoryId: 'scalar' },
            { id: 'mass', label: 'Mass', icon: '⚖️', categoryId: 'scalar' },
            { id: 'time', label: 'Time', icon: '⏰', categoryId: 'scalar' },
            { id: 'force', label: 'Force (Push)', icon: '✋', categoryId: 'vector' },
            { id: 'gravity', label: 'Gravity', icon: '⬇️', categoryId: 'vector' },
            { id: 'accel', label: 'Acceleration', icon: '🚀', categoryId: 'vector' }
          ]
        }
      },
      questions: [
        {
          id: 'fallback-1',
          text: 'Which of these is a Vector quantity?',
          options: ['Temperature', 'Mass', 'Force', 'Time'],
          correctAnswerIndex: 2,
          explanation: 'Force is a push or pull, which always has a specific direction.'
        },
        {
          id: 'fallback-2',
          text: 'Is "50 kg" a scalar or a vector?',
          options: ['Scalar', 'Vector', 'Neither', 'Both'],
          correctAnswerIndex: 0,
          explanation: "Mass (kg) has size but no direction, so it is a scalar."
        },
        {
          id: 'fallback-3',
          text: 'What is the main difference between Scalars and Vectors?',
          options: ['Scalars are larger', 'Vectors have direction', 'Scalars are red', 'Vectors are heavier'],
          correctAnswerIndex: 1,
          explanation: "The key difference is that Vectors include direction (like North, Down, Left)."
        }
      ]
    };
  }
};