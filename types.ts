
export enum UserRole {
  PARENT = 'PARENT',
  CHILD = 'CHILD'
}

export enum AgeGroup {
  JUNIOR = '5-8',
  SENIOR = '8-12'
}

export enum Subject {
  MATH = 'Mathematics',
  ENGLISH = 'English',
  EVS = 'EVS',
  MORAL = 'Moral Ed',
  LIFE = 'Life Skills'
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  dateUnlocked?: string;
}

export interface Profile {
  id: string;
  parentId?: string; // Link to parent
  name: string;
  avatar: string;
  age: number;
  ageGroup: AgeGroup;
  favoriteSubject: Subject;
  coins: number;
  xp: number;
  streak: number;
  completedLessons: string[];
  achievements: Achievement[];
  inventory: string[]; // Shop items owned
  
  // Parental Controls
  dailyTimeLimit: number; // in minutes
  usageToday: number; // in minutes
  lastUsageDate: string; // YYYY-MM-DD
}

export interface ParentAccount {
  id: string;
  name: string;
  pin: string;
  childrenIds: string[];
}

export interface Lesson {
  id: string;
  subject: Subject;
  title: string;
  content: string; // Markdown or plain text
  difficulty: 'Easy' | 'Medium' | 'Hard';
  xpReward: number;
  coinReward: number;
  quizQuestions: QuizQuestion[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number; // Index
  explanation: string;
}

export interface ParentStats {
  totalTimeSpent: number; // minutes
  subjectsProgress: Record<Subject, number>; // 0-100
  recentActivity: { date: string; activity: string }[];
}

// Shop Items
export interface ShopItem {
  id: string;
  name: string;
  cost: number;
  icon: string;
  type: 'avatar' | 'sticker' | 'certificate';
}

// Navigation
export enum Screen {
  SPLASH,
  PARENT_SELECT,
  PROFILE_SELECT,
  CREATE_PROFILE,
  PARENT_AUTH,
  PARENT_DASHBOARD,
  CHILD_DASHBOARD,
  SUBJECT_SELECT,
  ACHIEVEMENTS,
  PROFILE_SETTINGS,
  LESSON_PLAYER,
  SPEAKING_COACH,
  MINI_SHOP,
  CODING_PUZZLE,
  TIME_LIMIT_REACHED // Added
}
