import { UserState } from '../types';
import { INITIAL_HEARTS } from '../constants';

// Keys for LocalStorage
const DB_USERS_KEY = 'physigo_users_db_v1';
const DB_SESSION_KEY = 'physigo_session_v1';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Default Avatar SVG (Simple Gray User Icon)
// Includes standard xmlns, viewbox, and a simple path for a user silhouette
const DEFAULT_AVATAR = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzlDQTNBRiI+PHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTAgM2MxLjY2IDAgMyAxLjM0IDMgM3MtMS4zNCAzLTMgMy0zLTEuMzQtMy0zIDEuMzQtMyAzLTN6bTAgMTQuMmMtMi41IDAtNC43MS0xLjI4LTYtMy4yMi4wMy0xLjk5IDQtMy4wOCA2LTMuMDggMS45OSAwIDUuOTcgMS4wOSA2IDMuMDgtMS4yOSAxLjk0LTMuNSAzLjIyLTYgMy4yMnoiLz48L3N2Zz4=";

// Helper: Get the entire DB object (Map of email -> UserState)
const getDB = (): Record<string, UserState> => {
  try {
    const raw = localStorage.getItem(DB_USERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

// Helper: Save the entire DB object
const saveDB = (db: Record<string, UserState>) => {
  localStorage.setItem(DB_USERS_KEY, JSON.stringify(db));
};

// Helper: Generate ID safely
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export const db = {
  // --- AUTH METHODS ---

  async login(email: string, password: string): Promise<UserState> {
    await delay(600); // Fake network latency
    const database = getDB();
    const user = database[email.toLowerCase()];

    if (!user) {
      throw new Error('User not found');
    }

    // In a real app, use bcrypt. Here we just compare simple strings/hashes
    // Simple mock hash check:
    const hashedPassword = btoa(password); 
    if (user.password !== hashedPassword) {
      throw new Error('Invalid password');
    }

    // Set Session
    localStorage.setItem(DB_SESSION_KEY, user.email);
    
    // Update last active
    user.isLoggedIn = true;
    user.lastActiveDate = new Date().toISOString();
    database[email.toLowerCase()] = user;
    saveDB(database);

    return user;
  },

  async signup(name: string, email: string, password: string): Promise<UserState> {
    await delay(800);
    const database = getDB();
    const cleanEmail = email.toLowerCase();

    if (database[cleanEmail]) {
      throw new Error('User already exists');
    }

    const newUser: UserState = {
      id: generateId(),
      name,
      email: cleanEmail,
      username: name.replace(/\s+/g, '').toLowerCase(),
      password: btoa(password), // Simple Base64 "hashing" for demo
      avatar: DEFAULT_AVATAR, 
      role: 'user',
      xp: 0,
      streak: 1,
      hearts: INITIAL_HEARTS,
      maxHearts: 3,
      completedLessons: [],
      currentLessonId: null,
      currentCourseId: 'mechanics',
      badges: [],
      isLoggedIn: true,
      lastActiveDate: new Date().toISOString()
    };

    database[cleanEmail] = newUser;
    saveDB(database);
    localStorage.setItem(DB_SESSION_KEY, cleanEmail);

    return newUser;
  },

  async logout(): Promise<void> {
    await delay(200);
    localStorage.removeItem(DB_SESSION_KEY);
  },

  async getSession(): Promise<UserState | null> {
    // Check if session exists
    const email = localStorage.getItem(DB_SESSION_KEY);
    if (!email) return null;

    const database = getDB();
    const user = database[email];
    if (!user) {
      // Stale session
      localStorage.removeItem(DB_SESSION_KEY);
      return null;
    }
    return user;
  },

  // --- USER DATA METHODS ---

  async updateUser(user: UserState): Promise<UserState> {
    const database = getDB();
    if (database[user.email.toLowerCase()]) {
      database[user.email.toLowerCase()] = user;
      saveDB(database);
      return user;
    }
    throw new Error('User to update not found');
  },

  async resetProgress(email: string): Promise<UserState> {
    await delay(300);
    const database = getDB();
    const user = database[email.toLowerCase()];
    if (!user) throw new Error("User not found");
    
    // Reset stats
    user.xp = 0;
    user.streak = 1;
    user.completedLessons = [];
    user.hearts = user.maxHearts;
    user.badges = [];
    user.currentLessonId = null;
    
    database[email.toLowerCase()] = user;
    saveDB(database);
    return user;
  },

  // --- LEADERBOARD METHODS ---

  async getLeaderboard(): Promise<any[]> {
    await delay(400);
    const database = getDB();
    
    // Convert DB map to array
    const realUsers = Object.values(database).map(u => ({
      id: u.id,
      name: u.name,
      xp: u.xp,
      avatar: u.avatar || DEFAULT_AVATAR,
      isUser: false // Will be overridden by client
    }));

    // Sort by XP
    return realUsers.sort((a, b) => b.xp - a.xp).slice(0, 50); // Top 50
  }
};