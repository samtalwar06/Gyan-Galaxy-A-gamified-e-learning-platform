
import { AgeGroup, Achievement, ShopItem, Subject, Profile, ParentAccount } from './types';

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: '1', title: 'First Steps', description: 'Complete your first lesson', icon: '🌱', unlocked: false },
  { id: '2', title: 'Math Whiz', description: 'Score 100% in a Math quiz', icon: '🧮', unlocked: false },
  { id: '3', title: 'Big Saver', description: 'Save 100 coins', icon: 'piggy-bank', unlocked: false },
  { id: '4', title: 'Word Smith', description: 'Complete a speaking challenge', icon: '🗣️', unlocked: false },
  { id: '5', title: 'Code Breaker', description: 'Solve a logic puzzle', icon: '🧩', unlocked: false },
];

export const MOCK_PARENTS: ParentAccount[] = [
  {
    id: 'fam1',
    name: 'Sharma Family',
    pin: '1234',
    childrenIds: ['p1', 'p2']
  },
  {
    id: 'fam2',
    name: 'Verma Family',
    pin: '0000',
    childrenIds: []
  }
];

export const MOCK_PROFILES: Profile[] = [
  {
    id: 'p1',
    parentId: 'fam1',
    name: 'Aarav',
    avatar: 'https://picsum.photos/seed/aarav/150/150',
    age: 7,
    ageGroup: AgeGroup.JUNIOR,
    favoriteSubject: Subject.MATH,
    coins: 45,
    xp: 120,
    streak: 3,
    completedLessons: [],
    achievements: INITIAL_ACHIEVEMENTS,
    inventory: [],
    dailyTimeLimit: 60,
    usageToday: 45,
    lastUsageDate: new Date().toISOString().split('T')[0]
  },
  {
    id: 'p2',
    parentId: 'fam1',
    name: 'Diya',
    avatar: 'https://picsum.photos/seed/diya/150/150',
    age: 10,
    ageGroup: AgeGroup.SENIOR,
    favoriteSubject: Subject.ENGLISH,
    coins: 150,
    xp: 450,
    streak: 12,
    completedLessons: ['l1', 'l2'],
    achievements: INITIAL_ACHIEVEMENTS.map(a => ({...a, unlocked: Math.random() > 0.8})),
    inventory: ['sticker_star'],
    dailyTimeLimit: 30, // Strict limit for testing
    usageToday: 10,
    lastUsageDate: new Date().toISOString().split('T')[0]
  }
];

export const SHOP_ITEMS: ShopItem[] = [
  { id: 'sticker_star', name: 'Golden Star', cost: 50, icon: '⭐', type: 'sticker' },
  { id: 'avatar_robot', name: 'Robot Avatar', cost: 200, icon: '🤖', type: 'avatar' },
  { id: 'cert_math', name: 'Math Certificate', cost: 500, icon: '📜', type: 'certificate' },
  { id: 'sticker_rocket', name: 'Rocket Sticker', cost: 75, icon: '🚀', type: 'sticker' },
  { id: 'avatar_cat', name: 'Cool Cat', cost: 200, icon: '🐱', type: 'avatar' },
];

export const SUBJECTS_CONFIG = [
  { id: Subject.MATH, icon: '🧮', color: 'bg-blue-500' },
  { id: Subject.ENGLISH, icon: '📚', color: 'bg-green-500' },
  { id: Subject.EVS, icon: '🌍', color: 'bg-emerald-500' },
  { id: Subject.MORAL, icon: '🤝', color: 'bg-purple-500' },
  { id: Subject.LIFE, icon: '💡', color: 'bg-orange-500' },
];
