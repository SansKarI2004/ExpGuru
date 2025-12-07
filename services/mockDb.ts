import { User, Company, Experience, Branch, Difficulty, RoundType } from '../types';

// Initial Seed Data
const MOCK_COMPANIES: Company[] = [
  { id: 'c1', name: 'Google', industry: 'Tech', description: 'Search engine giant.' },
  { id: 'c2', name: 'Microsoft', industry: 'Tech', description: 'Software and cloud computing.' },
  { id: 'c3', name: 'Uber', industry: 'Tech', description: 'Ride-sharing and logistics.' },
  { id: 'c4', name: 'Goldman Sachs', industry: 'Finance', description: 'Investment banking.' },
  { id: 'c5', name: 'Flipkart', industry: 'E-commerce', description: 'Indian e-commerce company.' },
];

const MOCK_USERS: User[] = [
  {
    id: 'u1',
    email: 'senior.dev@iitg.ac.in',
    name: 'Rahul Sharma',
    branch: Branch.CSE,
    year: 2024,
    isPrivate: false,
    linkedin: 'linkedin.com/in/rahul-mock'
  },
  {
    id: 'u2',
    email: 'jane.doe@iitg.ac.in',
    name: 'Jane Doe',
    branch: Branch.MNC,
    year: 2024,
    isPrivate: true
  }
];

const MOCK_EXPERIENCES: Experience[] = [
  {
    id: 'e1',
    userId: 'u1',
    companyId: 'c1',
    companyName: 'Google',
    role: 'Software Engineer',
    year: 2024,
    isAnonymous: false,
    shortlisted: true,
    oaDetails: {
      topics: ['Dynamic Programming', 'Graph'],
      codingQuestions: ['Find max path sum in grid', 'Edit distance variation'],
      difficulty: Difficulty.HARD,
      timeLimit: '90 mins',
      tips: 'Focus on standard DP patterns.'
    },
    rounds: [
      {
        id: 'r1',
        type: RoundType.TECHNICAL,
        questions: ['Invert binary tree', 'System design for URL shortener'],
        difficulty: Difficulty.MEDIUM,
        duration: '45 mins',
        performanceReview: 'Did well on algo, stumbled a bit on design.',
        tips: 'Clarify constraints early.'
      }
    ],
    resources: [{ type: 'Platform', name: 'LeetCode', link: 'https://leetcode.com' }],
    summary: 'Challenging but fair process. Strong emphasis on DSA fundamentals.',
    difficultyRating: 4,
    upvotes: 12,
    timestamp: Date.now() - 10000000,
    tags: ['DSA-heavy', 'System Design']
  },
  {
    id: 'e2',
    userId: 'u2',
    companyId: 'c2',
    companyName: 'Microsoft',
    role: 'SDE 1',
    year: 2024,
    isAnonymous: true,
    shortlisted: true,
    oaDetails: {
      topics: ['Arrays', 'Strings'],
      codingQuestions: ['Min swaps to palindrome', 'Count good nodes'],
      difficulty: Difficulty.MEDIUM,
      timeLimit: '60 mins',
      tips: 'Speed is key.'
    },
    rounds: [
      {
        id: 'r2',
        type: RoundType.TECHNICAL,
        questions: ['Detect cycle in linked list', 'OS concepts: Paging'],
        difficulty: Difficulty.EASY,
        duration: '45 mins',
        performanceReview: 'Smooth interview.',
        tips: 'Brush up on CS fundamentals.'
      }
    ],
    resources: [],
    summary: 'Standard Microsoft process. 3 rounds of coding + CS fundamentals.',
    difficultyRating: 3,
    upvotes: 8,
    timestamp: Date.now() - 5000000,
    tags: ['CS Fundamentals', 'Easy-Medium']
  }
];

// Local Storage Helper
const load = <T,>(key: string, defaultVal: T): T => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultVal;
};

const save = (key: string, val: any) => {
  localStorage.setItem(key, JSON.stringify(val));
};

// Service Class
class MockDbService {
  private users: User[];
  private companies: Company[];
  private experiences: Experience[];

  constructor() {
    this.users = load('users', MOCK_USERS);
    this.companies = load('companies', MOCK_COMPANIES);
    this.experiences = load('experiences', MOCK_EXPERIENCES);
  }

  // User Methods
  getUser(email: string): User | undefined {
    return this.users.find(u => u.email === email);
  }

  getUserById(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }

  createUser(user: User): User {
    this.users.push(user);
    save('users', this.users);
    return user;
  }

  updateUser(user: User): User {
    this.users = this.users.map(u => u.id === user.id ? user : u);
    save('users', this.users);
    return user;
  }

  // Company Methods
  getCompanies(): Company[] {
    return this.companies;
  }

  getCompany(id: string): Company | undefined {
    return this.companies.find(c => c.id === id);
  }

  createCompany(name: string): Company {
    const newCompany: Company = {
      id: `c${Date.now()}`,
      name,
      description: 'New company added by student.',
      industry: 'Unknown'
    };
    this.companies.push(newCompany);
    save('companies', this.companies);
    return newCompany;
  }

  // Experience Methods
  getExperiences(companyId?: string): Experience[] {
    if (companyId) {
      return this.experiences.filter(e => e.companyId === companyId);
    }
    return this.experiences;
  }

  getExperienceById(id: string): Experience | undefined {
    return this.experiences.find(e => e.id === id);
  }

  addExperience(exp: Experience): Experience {
    this.experiences.push(exp);
    save('experiences', this.experiences);
    return exp;
  }

  getTrendingCompanies(): { company: Company, count: number }[] {
    const counts: Record<string, number> = {};
    this.experiences.forEach(e => {
      counts[e.companyId] = (counts[e.companyId] || 0) + 1;
    });
    
    return Object.entries(counts)
      .map(([id, count]) => ({
        company: this.companies.find(c => c.id === id)!,
        count
      }))
      .filter(x => x.company !== undefined)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  toggleUpvote(expId: string): Experience | undefined {
      const exp = this.experiences.find(e => e.id === expId);
      if(exp) {
          exp.upvotes += 1; // Simplified logic, real app would track user upvotes
          save('experiences', this.experiences);
      }
      return exp;
  }
}

export const db = new MockDbService();
