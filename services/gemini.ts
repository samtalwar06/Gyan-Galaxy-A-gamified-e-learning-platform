
import { GoogleGenAI, Type } from "@google/genai";
import { AgeGroup, Subject, Lesson } from '../types';

// Safe access to API Key
const getApiKey = () => {
  try {
    return (typeof process !== 'undefined' && process.env && process.env.API_KEY) ? process.env.API_KEY : '';
  } catch (e) {
    return '';
  }
};

const SYSTEM_INSTRUCTION = `You are "Gyan Galaxy", a friendly, encouraging, and educational AI tutor for underprivileged children in India. 
Your language should be simple, culturally relevant, and inspiring. 
Always output strictly formatted JSON when requested.`;

// --- ROBUST FALLBACK DATABASE ---
// This ensures that even without AI, we have age-appropriate, varied content.

const JUNIOR_MATH_LESSONS: Lesson[] = [
  {
    id: 'math-jun-1', subject: Subject.MATH, difficulty: 'Easy', title: 'Fun with Numbers!',
    content: "Math is all around us! \n\nWhen you count your fingers, that is math. If you have 2 apples and get 1 more, you have 3 apples! \n\nLet's practice counting together. It is as easy as 1, 2, 3!",
    xpReward: 50, coinReward: 10,
    quizQuestions: [
      { question: "If you have 2 chocolates and eat 1, how many are left?", options: ["Zero", "One", "Three", "Five"], correctAnswer: 1, explanation: "2 minus 1 is 1. You have one left!" },
      { question: "Which number comes after 9?", options: ["8", "10", "7", "6"], correctAnswer: 1, explanation: "After 9 comes the big number 10!" },
      { question: "What shape is a round ball?", options: ["Square", "Triangle", "Circle", "Star"], correctAnswer: 2, explanation: "A ball is round like a Circle!" }
    ]
  },
  {
    id: 'math-jun-2', subject: Subject.MATH, difficulty: 'Easy', title: 'Adding Things Up',
    content: "Addition means putting things together. \n\nImagine you have 3 red cars and 2 blue cars. If you put them in one line, how many cars do you have? \n\n3 + 2 = 5 cars! Great job!",
    xpReward: 50, coinReward: 10,
    quizQuestions: [
      { question: "What is 1 + 1?", options: ["11", "2", "3", "0"], correctAnswer: 1, explanation: "One plus one makes Two!" },
      { question: "You have 5 fingers on one hand. How many on two hands?", options: ["5", "8", "10", "20"], correctAnswer: 2, explanation: "5 + 5 = 10 fingers!" }
    ]
  }
];

const SENIOR_MATH_LESSONS: Lesson[] = [
  {
    id: 'math-sen-1', subject: Subject.MATH, difficulty: 'Medium', title: 'Multiplication Magic',
    content: "Multiplication is just fast addition! \n\nInstead of saying 2 + 2 + 2, we can say 2 x 3. \n\nIt helps us count big groups of things quickly. If you have 4 boxes and each has 2 toys, you have 4 x 2 = 8 toys!",
    xpReward: 70, coinReward: 20,
    quizQuestions: [
      { question: "What is 5 x 3?", options: ["10", "15", "8", "20"], correctAnswer: 1, explanation: "5 three times is 5, 10, 15." },
      { question: "If a spider has 8 legs, how many legs do 2 spiders have?", options: ["10", "12", "16", "14"], correctAnswer: 2, explanation: "8 x 2 = 16 legs!" },
      { question: "Which number is even?", options: ["3", "7", "12", "9"], correctAnswer: 2, explanation: "Even numbers can be divided by 2. 12 is even." }
    ]
  },
  {
    id: 'math-sen-2', subject: Subject.MATH, difficulty: 'Hard', title: 'Fractions in Action',
    content: "Fractions tell us about parts of a whole. \n\nIf you cut a pizza into 4 slices and eat 1, you ate 1/4 of the pizza! \n\nThe top number (Numerator) is how many parts you have. The bottom (Denominator) is how many parts make the whole.",
    xpReward: 80, coinReward: 25,
    quizQuestions: [
      { question: "What is half of 100?", options: ["25", "40", "50", "60"], correctAnswer: 2, explanation: "Half means dividing by 2. 100 / 2 = 50." },
      { question: "Which fraction is bigger: 1/2 or 1/4?", options: ["1/2", "1/4", "Equal", "None"], correctAnswer: 0, explanation: "1/2 is a bigger piece than 1/4." }
    ]
  }
];

const JUNIOR_ENGLISH_LESSONS: Lesson[] = [
  {
    id: 'eng-jun-1', subject: Subject.ENGLISH, difficulty: 'Easy', title: 'Magic Words',
    content: "Polite words make everyone happy! \n\n'Please' asks for help nicely. 'Thank you' shows we are happy. 'Sorry' fixes mistakes. \n\nUse these words every day to be a superstar!",
    xpReward: 50, coinReward: 10,
    quizQuestions: [
      { question: "What do you say when you get a gift?", options: ["Sorry", "Thank you", "No", "Bye"], correctAnswer: 1, explanation: "Always say Thank You for gifts!" },
      { question: "What is the opposite of 'Up'?", options: ["Left", "Down", "Right", "Sky"], correctAnswer: 1, explanation: "The opposite of Up is Down." }
    ]
  }
];

const SENIOR_ENGLISH_LESSONS: Lesson[] = [
  {
    id: 'eng-sen-1', subject: Subject.ENGLISH, difficulty: 'Medium', title: 'Super Sentences',
    content: "A full sentence has a Subject (who) and a Verb (action). \n\n'The dog runs.' \n\nTo make it better, add Adjectives (describing words). \n\n'The *fast* dog runs *quickly*.' Now that is a super sentence!",
    xpReward: 70, coinReward: 20,
    quizQuestions: [
      { question: "Find the Verb: 'The cat sleeps on the mat.'", options: ["Cat", "Sleeps", "Mat", "On"], correctAnswer: 1, explanation: "Sleeps is the action word." },
      { question: "Which word is an Adjective?", options: ["Run", "Blue", "Boy", "Eat"], correctAnswer: 1, explanation: "Blue describes a color, so it is an adjective." },
      { question: "What is the past tense of 'Go'?", options: ["Goed", "Gone", "Went", "Going"], correctAnswer: 2, explanation: "Yesterday, I 'went' to the park." }
    ]
  }
];

// Combine into a master database
const FALLBACK_DATABASE: Record<Subject, Record<AgeGroup, Lesson[]>> = {
  [Subject.MATH]: {
    [AgeGroup.JUNIOR]: JUNIOR_MATH_LESSONS,
    [AgeGroup.SENIOR]: SENIOR_MATH_LESSONS
  },
  [Subject.ENGLISH]: {
    [AgeGroup.JUNIOR]: JUNIOR_ENGLISH_LESSONS,
    [AgeGroup.SENIOR]: SENIOR_ENGLISH_LESSONS
  },
  [Subject.EVS]: {
    [AgeGroup.JUNIOR]: [
       {
         id: 'evs-jun-1', subject: Subject.EVS, difficulty: 'Easy', title: 'Our Green Friends', 
         content: "Plants are living things! They need sunlight and water to grow.", xpReward: 50, coinReward: 10,
         quizQuestions: [{question: "What do plants need?", options: ["Pizza", "Sun & Water", "Toys", "Milk"], correctAnswer: 1, explanation: "Plants drink water and eat sunlight!"}]
       }
    ],
    [AgeGroup.SENIOR]: [
       {
         id: 'evs-sen-1', subject: Subject.EVS, difficulty: 'Medium', title: 'The Water Cycle', 
         content: "Water never disappears, it travels! \n\nEvaporation: Sun turns water to vapor. \nCondensation: Vapor makes clouds. \nPrecipitation: Rain falls down!", xpReward: 70, coinReward: 20,
         quizQuestions: [{question: "What is rain called?", options: ["Evaporation", "Precipitation", "Condensation", "Magic"], correctAnswer: 1, explanation: "Rain falling is Precipitation."}]
       }
    ]
  },
  [Subject.MORAL]: {
    [AgeGroup.JUNIOR]: [{id: 'mor-jun', subject: Subject.MORAL, difficulty: 'Easy', title: 'Sharing', content: "Sharing toys makes playing more fun.", xpReward: 50, coinReward: 10, quizQuestions: [{question: "Friend wants your toy. You...", options: ["Hide it", "Share it", "Cry", "Run"], correctAnswer: 1, explanation: "Sharing is caring!"}]}],
    [AgeGroup.SENIOR]: [{id: 'mor-sen', subject: Subject.MORAL, difficulty: 'Medium', title: 'Honesty', content: "Honesty means telling the truth even when it is hard.", xpReward: 70, coinReward: 20, quizQuestions: [{question: "You broke a vase. You should...", options: ["Hide pieces", "Blame cat", "Tell parents", "Run away"], correctAnswer: 2, explanation: "Admitting mistakes shows courage."}]}]
  },
  [Subject.LIFE]: {
    [AgeGroup.JUNIOR]: [{id: 'life-jun', subject: Subject.LIFE, difficulty: 'Easy', title: 'Safe Touch', content: "Your body belongs to you. If someone touches you and you don't like it, say NO loudly and run to tell a trusted adult.", xpReward: 50, coinReward: 10, quizQuestions: [{question: "Who can you trust?", options: ["Strangers", "Parents/Teachers", "Nobody", "TV"], correctAnswer: 1, explanation: "Parents and teachers keep us safe."}]}],
    [AgeGroup.SENIOR]: [{id: 'life-sen', subject: Subject.LIFE, difficulty: 'Medium', title: 'Saving Money', content: "Needs vs Wants. \n\nNeed: Food, Water, School. \nWant: Toys, Candy. \n\nSpend on Needs first, save for Wants!", xpReward: 70, coinReward: 20, quizQuestions: [{question: "Which is a Need?", options: ["Video Game", "Healthy Food", "Candy", "Movie"], correctAnswer: 1, explanation: "Food keeps us alive."}]}]
  }
};

export const GeminiService = {
  /**
   * Returns a RANDOM fallback lesson appropriate for the age group.
   */
  getFallbackLesson(subject: Subject, ageGroup: AgeGroup): Lesson {
    // 1. Try to find lessons for specific Subject + Age
    let pool = FALLBACK_DATABASE[subject]?.[ageGroup];
    
    // 2. Fallback to Junior Math if completely missing
    if (!pool || pool.length === 0) {
      pool = JUNIOR_MATH_LESSONS;
    }

    // 3. Pick a random lesson from the pool to ensure variety
    const randomIndex = Math.floor(Math.random() * pool.length);
    // Deep copy to prevent mutation issues
    return JSON.parse(JSON.stringify(pool[randomIndex]));
  },

  /**
   * Generates a lesson with explicit difficulty scaling.
   */
  async generateLesson(subject: Subject, ageGroup: AgeGroup, topic?: string): Promise<Lesson> {
    const apiKey = getApiKey();
    
    // Immediate fallback if no key
    if (!apiKey) {
       console.warn("No API Key found, using fallback.");
       return this.getFallbackLesson(subject, ageGroup);
    }

    // Dynamic prompt engineering based on Age Group
    let difficultyInstruction = "";
    if (ageGroup === AgeGroup.JUNIOR) {
      difficultyInstruction = `
        Target Audience: Child aged 5-8 years.
        Tone: Very playful, simple sentences, use emojis.
        Difficulty: Easy. Focus on basics (e.g., counting, identifying, simple words).
        Quiz: 3 options per question.
      `;
    } else {
      difficultyInstruction = `
        Target Audience: Child aged 8-12 years.
        Tone: Encouraging but educational. Use compound sentences.
        Difficulty: Moderate to Hard. Focus on logic, application, and deeper understanding.
        Quiz: 4 options per question. Questions should require thinking, not just recall.
      `;
    }

    const prompt = `
      Create a unique interactive lesson about ${subject}.
      Topic: ${topic || 'A random interesting topic suitable for the age group'}.
      ${difficultyInstruction}
      
      Return valid JSON with the following schema:
      {
        "title": "Fun Title",
        "content": "A 3-paragraph explanation. Use markdown for bolding key terms.",
        "xpReward": 50,
        "coinReward": 20,
        "quizQuestions": [
          {
            "question": "Question text?",
            "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
            "correctAnswer": 0, // index
            "explanation": "Why it is correct."
          }
        ]
      }
    `;

    try {
      const ai = new GoogleGenAI({ apiKey });
      
      // Timeout after 10 seconds
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Request timed out")), 10000)
      );

      const fetchPromise = ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              content: { type: Type.STRING },
              xpReward: { type: Type.INTEGER },
              coinReward: { type: Type.INTEGER },
              quizQuestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctAnswer: { type: Type.INTEGER },
                    explanation: { type: Type.STRING }
                  }
                }
              }
            }
          }
        }
      });

      const response: any = await Promise.race([fetchPromise, timeoutPromise]);
      const text = response.text;
      if (!text) throw new Error("No content generated");
      
      const data = JSON.parse(text);
      
      // Validation
      if (!data.quizQuestions || !Array.isArray(data.quizQuestions) || data.quizQuestions.length === 0) {
        throw new Error("Generated lesson missing questions");
      }

      return {
        id: Date.now().toString(),
        subject,
        difficulty: ageGroup === AgeGroup.SENIOR ? 'Medium' : 'Easy',
        title: (data.title && typeof data.title === 'string') ? data.title : `${subject} Lesson`,
        content: (data.content && typeof data.content === 'string') ? data.content : "Let's learn something new!",
        xpReward: typeof data.xpReward === 'number' ? data.xpReward : 50,
        coinReward: typeof data.coinReward === 'number' ? data.coinReward : 10,
        quizQuestions: data.quizQuestions
      };

    } catch (error) {
      console.warn(`Gemini Generation Error for ${subject}:`, error);
      // Pass ageGroup to fallback
      return this.getFallbackLesson(subject, ageGroup);
    }
  },

  async evaluatePronunciation(targetPhrase: string, spokenText: string): Promise<{ score: number; feedback: string }> {
    const apiKey = getApiKey();
    const prompt = `Compare Target: "${targetPhrase}" with Spoken: "${spokenText}". Rate 0-100. One sentence feedback. JSON output.`;

    try {
      if (!apiKey) throw new Error("API Key missing");
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      return JSON.parse(response.text || '{}');
    } catch (e) {
      const dist = Math.abs(targetPhrase.length - spokenText.length);
      const score = dist < 5 ? 85 : 50;
      return { score, feedback: score > 80 ? "Great job!" : "Keep practicing!" };
    }
  },

  async generateCodingPuzzle(ageGroup: AgeGroup): Promise<{ goal: string, hint: string }> {
     // Simplified implementation for brevity, assuming standard fallback behavior
     return { goal: "Help the robot reach the battery!", hint: "Use logic blocks." };
  }
};
