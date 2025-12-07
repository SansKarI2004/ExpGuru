import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/Layout';
import { Wizard } from './components/Wizard';
import { Home, CompanyDetails, ExperienceView } from './components/Dashboard';
import { db } from './services/mockDb';
import { User, Branch } from './types';

// Simple Login Page Component
const Login: React.FC<{ onLogin: (email: string) => void, error: string }> = ({ onLogin, error }) => {
  const [email, setEmail] = useState('');
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-4">
             IITG
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">Sign in to Placement Portal</h2>
          <p className="mt-2 text-sm text-gray-600">Enter your IITG email to continue</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={(e) => { e.preventDefault(); onLogin(email); }}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-4 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="webmail_id@iitg.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          {error && <div className="text-red-500 text-sm text-center font-medium">{error}</div>}
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Sign in
            </button>
          </div>
        </form>
        <div className="text-center text-xs text-gray-400">
           By signing in, you agree to share placement data responsibly.
        </div>
      </div>
    </div>
  );
};

// Profile Setup Component
const ProfileSetup: React.FC<{ email: string, onComplete: (u: User) => void }> = ({ email, onComplete }) => {
  const [name, setName] = useState('');
  const [branch, setBranch] = useState<Branch>(Branch.CSE);
  const [year, setYear] = useState(2025);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      id: `u${Date.now()}`,
      email,
      name,
      branch,
      year,
      isPrivate: false
    };
    onComplete(newUser);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Complete Your Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input className="w-full border p-2 rounded mt-1" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Branch</label>
            <select className="w-full border p-2 rounded mt-1" value={branch} onChange={e => setBranch(e.target.value as Branch)}>
              {Object.values(Branch).map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Graduation Year</label>
            <input type="number" className="w-full border p-2 rounded mt-1" value={year} onChange={e => setYear(Number(e.target.value))} required />
          </div>
          <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 mt-4">Save Profile</button>
        </form>
      </div>
    </div>
  );
};

// Main App Component
const AppContent: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authStage, setAuthStage] = useState<'login' | 'setup' | 'authenticated'>('login');
  const [pendingEmail, setPendingEmail] = useState('');
  const [error, setError] = useState('');

  // Persist Auth
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setAuthStage('authenticated');
    }
  }, []);

  const handleLogin = (email: string) => {
    if (!email.endsWith('@iitg.ac.in')) {
      setError('Only @iitg.ac.in emails are allowed.');
      return;
    }
    const existingUser = db.getUser(email);
    if (existingUser) {
      setUser(existingUser);
      localStorage.setItem('currentUser', JSON.stringify(existingUser));
      setAuthStage('authenticated');
    } else {
      setPendingEmail(email);
      setAuthStage('setup');
    }
  };

  const handleProfileComplete = (newUser: User) => {
    db.createUser(newUser);
    setUser(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    setAuthStage('authenticated');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    setAuthStage('login');
    setError('');
  };

  if (authStage === 'login') return <Login onLogin={handleLogin} error={error} />;
  if (authStage === 'setup') return <ProfileSetup email={pendingEmail} onComplete={handleProfileComplete} />;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
       <Navbar user={user} onLogout={handleLogout} />
       <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/add-experience" element={user ? <Wizard user={user} /> : <Navigate to="/" />} />
            <Route path="/company/:id" element={<CompanyDetailsWrapper />} />
            <Route path="/experience/:id" element={<ExperienceViewWrapper />} />
            <Route path="/profile" element={<div className="p-8 text-center text-gray-500">Profile Settings (Coming Soon)</div>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
       </main>
       <footer className="bg-white border-t border-gray-200 mt-12 py-8">
          <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
             © {new Date().getFullYear()} IITG Placement Portal. Built for the community.
          </div>
       </footer>
    </div>
  );
};

// Wrappers to extract params (since we are inside Routes)
import { useParams } from 'react-router-dom';

const CompanyDetailsWrapper = () => {
  const { id } = useParams();
  return id ? <CompanyDetails companyId={id} /> : null;
};

const ExperienceViewWrapper = () => {
  const { id } = useParams();
  return id ? <ExperienceView experienceId={id} /> : null;
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
