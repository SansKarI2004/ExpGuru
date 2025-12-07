export enum Branch {
  CSE = "Computer Science and Engineering",
  ECE = "Electronics and Communication Engineering",
  EEE = "Electronics and Electrical Engineering",
  ME = "Mechanical Engineering",
  CE = "Civil Engineering",
  CL = "Chemical Engineering",
  BSBE = "Biosciences and Bioengineering",
  MNC = "Mathematics and Computing",
  CST = "Chemical Science and Technology",
  EP = "Engineering Physics",
  DS = "Data Science and AI",
}

export enum RoundType {
  OA = "Online Assessment",
  TECHNICAL = "Technical Interview",
  HR = "HR Interview",
  MANAGERIAL = "Managerial Interview",
  GROUP_DISCUSSION = "Group Discussion",
}

export enum Difficulty {
  EASY = "Easy",
  MEDIUM = "Medium",
  HARD = "Hard",
}

export interface User {
  id: string;
  email: string; // must be @iitg.ac.in
  name: string;
  branch: Branch;
  year: number; // Graduating year
  linkedin?: string;
  phone?: string;
  isPrivate: boolean;
}

export interface Company {
  id: string;
  name: string;
  logoUrl?: string; // Placeholder mostly
  description?: string; // AI generated
  industry?: string;
}

export interface OARound {
  topics: string[];
  codingQuestions: string[]; // Descriptions
  difficulty: Difficulty;
  timeLimit: string;
  tips: string;
}

export interface InterviewRound {
  id: string;
  type: RoundType;
  questions: string[];
  difficulty: Difficulty;
  duration: string;
  performanceReview: string; // Self reflection
  tips: string;
}

export interface Resource {
  type: "Course" | "Video" | "Book" | "Platform" | "Note";
  name: string;
  link?: string;
}

export interface Experience {
  id: string;
  userId: string;
  companyId: string;
  companyName: string; // Denormalized for easier display
  role: string;
  year: number; // Placement year
  isAnonymous: boolean;
  shortlisted: boolean;
  oaDetails?: OARound;
  rounds: InterviewRound[];
  resources: Resource[];
  summary: string; // AI generated summary
  difficultyRating: number; // 1-5
  upvotes: number;
  timestamp: number;
  tags: string[]; // e.g., "DSA-heavy", "Puzzles"
}
