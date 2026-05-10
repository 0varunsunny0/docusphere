"use client";

export interface Document {
  id: string;
  title: string;
  emoji: string;
  excerpt: string;
  content: string;
  updatedAt: string;
  updatedBy: string;
  starred: boolean;
  shared: boolean;
  inviteToken?: string;
}

export interface User {
  email: string;
  password?: string; // Optional for storage, used for mock auth
  name: string;
  streak: number;
  lastVisitDate: string; // ISO string
}

const STORAGE_KEY = "docusphere_documents";
const USER_KEY = "docusphere_user";
const DEFAULT_USER: User = {
  email: "monal@example.com",
  password: "password123",
  name: "Monal Dasari",
  streak: 1,
  lastVisitDate: new Date().toISOString(),
};

export function getAllDocuments(): Document[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function getDocumentById(id: string): Document | undefined {
  const docs = getAllDocuments();
  return docs.find((d) => d.id === id);
}
export function getDocumentByToken(token: string): Document | undefined {
  const docs = getAllDocuments();
  return docs.find((d) => d.inviteToken === token);
}

export function saveDocument(doc: Document) {
  const docs = getAllDocuments();
  const index = docs.findIndex((d) => d.id === doc.id);
  
  if (index !== -1) {
    docs[index] = { ...doc, updatedAt: new Date().toISOString() };
  } else {
    docs.unshift({ ...doc, updatedAt: new Date().toISOString() });
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
}

export function deleteDocument(id: string) {
  const docs = getAllDocuments();
  const filtered = docs.filter((d) => d.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function updateDocumentPartial(id: string, updates: Partial<Document>) {
  const docs = getAllDocuments();
  const index = docs.findIndex((d) => d.id === id);
  if (index !== -1) {
    docs[index] = { ...docs[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
  }
}

export function initializeDefaultDocs() {
  if (getAllDocuments().length === 0) {
    const welcomeDoc: Document = {
      id: "welcome",
      title: "Welcome to DocuSphere",
      emoji: "👋",
      excerpt: "Get started with your new minimalist collaborative editor.",
      content: "<h1>Welcome to DocuSphere!</h1><p>This is your personal workspace. You can write, format, and organize your ideas here.</p><h2>How to Use</h2><ul><li>Type '/' to see the slash command menu</li><li>Highlight text to see the bubble menu</li><li>Share your document from the top bar</li></ul>",
      updatedAt: new Date().toISOString(),
      updatedBy: "Monal",
      starred: true,
      shared: false,
    };
    saveDocument(welcomeDoc);
  }
}

export function getUser(): User {
  if (typeof window === "undefined") return DEFAULT_USER;
  const stored = localStorage.getItem(USER_KEY);
  if (!stored) {
    localStorage.setItem(USER_KEY, JSON.stringify(DEFAULT_USER));
    return DEFAULT_USER;
  }
  return JSON.parse(stored);
}

export function saveUser(user: User) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function authenticate(email: string, pass: string): boolean {
  if (typeof window === "undefined") return false;
  const stored = localStorage.getItem(USER_KEY);
  
  if (!stored) {
    // No user exists yet? Create one with these credentials!
    const newUser: User = {
      ...DEFAULT_USER,
      email,
      password: pass,
      name: email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1), // Capitalize first bit of email
    };
    saveUser(newUser);
    return true;
  }
  
  const user = JSON.parse(stored);
  return user.email === email && user.password === pass;
}

export function updateStreak() {
  const user = getUser();
  const now = new Date();
  const lastVisit = new Date(user.lastVisitDate);

  // Set to midnight for proper day comparison
  const todayAtNoon = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);
  const lastVisitAtNoon = new Date(lastVisit.getFullYear(), lastVisit.getMonth(), lastVisit.getDate(), 12, 0, 0);

  const diffInTime = todayAtNoon.getTime() - lastVisitAtNoon.getTime();
  const diffInDays = Math.floor(diffInTime / (1000 * 3600 * 24));

  if (diffInDays === 1) {
    // Visited yesterday, increment streak
    user.streak += 1;
    user.lastVisitDate = now.toISOString();
    saveUser(user);
  } else if (diffInDays > 1) {
    // Missed a day, reset streak
    user.streak = 1;
    user.lastVisitDate = now.toISOString();
    saveUser(user);
  } else if (diffInDays === 0) {
    // Already visited today, just update lastVisitDate to now (optional)
    // user.lastVisitDate = now.toISOString();
    // saveUser(user);
  }
}
