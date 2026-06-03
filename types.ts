
export interface Question {
  id: string;
  type?: 'multiple-choice' | 'text'; // Defaults to multiple-choice
  text: string;
  options?: string[]; // Optional for text questions
  correctAnswerIndex?: number; // Optional for text questions
  acceptedKeywords?: string[]; // For text questions: keywords required for a correct answer
  explanation: string;
}

export interface SortingCategory {
  id: string;
  label: string;
  color: string; // Tailwind color class suffix e.g. 'blue'
}

export interface SortingItem {
  id: string;
  label: string;
  icon: string;
  categoryId: string; // The correct category ID
}

export interface SortingGame {
  title: string;
  categories: SortingCategory[];
  items: SortingItem[];
}

export interface TheorySection {
  title: string;
  paragraphs: string[];
  keyPoint: string;
  sortingGame?: SortingGame; // Optional interactive module
  simulationUrl?: string; // Optional embedded simulation URL (External)
  simulationType?: 'distance-displacement' | 'none'; // Internal custom simulation
}

export interface LessonContent {
  theory: TheorySection;
  questions: Question[];
}

export interface Lesson {
  id: string;
  title: string;
  topic: string;
  description: string;
  icon: string;
  color: string;
  locked: boolean;
  completed: boolean;
  stars: number;
}

export interface Unit {
  id: string;
  title: string;
  description: string;
  color: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  icon: string;
  description: string;
  units: Unit[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (user: UserState) => boolean;
}

export interface UserPreferences {
  interests: string[];
  confidence: 'high' | 'medium' | 'low' | 'unknown';
  goal: 'school' | 'exam' | 'fun' | 'world';
}

export interface UserState {
  id: string; // Unique ID
  name: string;
  email: string;
  username?: string; // Optional handle
  password?: string; // Hashed/Stored password
  avatar: string; // Emoji or URL
  role: 'user' | 'admin';
  
  // Progress
  xp: number;
  streak: number;
  hearts: number;
  maxHearts: number;
  completedLessons: string[];
  currentLessonId: string | null;
  currentCourseId: string;
  badges: string[]; // List of badge IDs earned
  
  preferences?: UserPreferences; // Personalization settings

  isLoggedIn: boolean;
  lastActiveDate?: string; // ISO Date string for streak calc
}

export type Tab = 'learn' | 'leaderboard' | 'profile';