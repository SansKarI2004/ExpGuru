import React, { useState, useEffect } from 'react';
import { User, Experience, RoundType, Difficulty, Company, InterviewRound, Resource, OARound } from '../types';
import { db } from '../services/mockDb';
import { generateExperienceSummary } from '../services/geminiService';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Plus, Trash2, Save, Wand2, CheckCircle2 } from 'lucide-react';

interface WizardProps {
  user: User;
}

const STEPS = ["Company", "Online Assessment", "Status", "Interviews", "Resources", "Summary"];

export const Wizard: React.FC<WizardProps> = ({ user }) => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  
  // Form State
  const [companyId, setCompanyId] = useState('');
  const [newCompanyName, setNewCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [oaDetails, setOaDetails] = useState<OARound>({
    topics: [],
    codingQuestions: [''],
    difficulty: Difficulty.MEDIUM,
    timeLimit: '',
    tips: ''
  });
  const [shortlisted, setShortlisted] = useState(true);
  const [rounds, setRounds] = useState<InterviewRound[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [summary, setSummary] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [difficultyRating, setDifficultyRating] = useState(3);
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    setCompanies(db.getCompanies());
  }, []);

  const handleNext = async () => {
    if (activeStep === STEPS.length - 1) {
      await handleSubmit();
    } else {
      // Logic to auto-generate summary before the last step
      if (activeStep === 4) { 
        setLoading(true);
        const tempExp: Partial<Experience> = {
          companyName: companyId === 'new' ? newCompanyName : companies.find(c => c.id === companyId)?.name || '',
          role,
          oaDetails,
          rounds,
          shortlisted,
        };
        const genSummary = await generateExperienceSummary(tempExp);
        setSummary(genSummary);
        setLoading(false);
      }
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => setActiveStep(prev => prev - 1);

  const handleSubmit = async () => {
    setLoading(true);
    let finalCompanyId = companyId;
    let finalCompanyName = "";

    if (companyId === 'new') {
      const newCo = db.createCompany(newCompanyName);
      finalCompanyId = newCo.id;
      finalCompanyName = newCo.name;
    } else {
      finalCompanyName = companies.find(c => c.id === companyId)?.name || "";
    }

    const newExperience: Experience = {
      id: `exp${Date.now()}`,
      userId: user.id,
      companyId: finalCompanyId,
      companyName: finalCompanyName,
      role,
      year,
      isAnonymous,
      shortlisted,
      oaDetails: shortlisted ? oaDetails : undefined,
      rounds,
      resources,
      summary,
      difficultyRating,
      upvotes: 0,
      timestamp: Date.now(),
      tags
    };

    db.addExperience(newExperience);
    setLoading(false);
    navigate('/');
  };

  // Sub-components for steps
  const renderStepContent = () => {
    switch(activeStep) {
      case 0: // Company
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Company</label>
              <select 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 border"
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
              >
                <option value="">Select a Company</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                <option value="new">+ Add New Company</option>
              </select>
            </div>
            {companyId === 'new' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Company Name</label>
                <input 
                  type="text" 
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 border"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                />
              </div>
            )}
            <div>
               <label className="block text-sm font-medium text-gray-700">Role Applied For</label>
               <input 
                  type="text"
                  placeholder="e.g. SDE 1, Data Analyst" 
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 border"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                />
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-700">Year</label>
               <input 
                  type="number"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 border"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                />
            </div>
          </div>
        );
      case 1: // OA
        return (
          <div className="space-y-6">
             <h3 className="text-lg font-medium">Online Assessment Details</h3>
             <div>
               <label className="block text-sm font-medium text-gray-700">Difficulty</label>
               <select 
                 className="mt-1 block w-full border p-2 rounded"
                 value={oaDetails.difficulty}
                 onChange={e => setOaDetails({...oaDetails, difficulty: e.target.value as Difficulty})}
               >
                 {Object.values(Difficulty).map(d => <option key={d} value={d}>{d}</option>)}
               </select>
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">Topics (comma separated)</label>
                <input 
                  type="text"
                  className="mt-1 block w-full border p-2 rounded"
                  value={oaDetails.topics.join(', ')}
                  onChange={e => setOaDetails({...oaDetails, topics: e.target.value.split(',').map(s => s.trim())})}
                  placeholder="DP, Graphs, Trees..."
                />
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-700">Questions Description</label>
               <textarea 
                  className="mt-1 block w-full border p-2 rounded h-24"
                  value={oaDetails.codingQuestions[0]}
                  onChange={e => setOaDetails({...oaDetails, codingQuestions: [e.target.value]})}
                  placeholder="Briefly describe the coding problems..."
               />
             </div>
          </div>
        );
      case 2: // Status
        return (
          <div className="space-y-6 text-center py-10">
            <h3 className="text-xl font-medium">Were you shortlisted for interviews?</h3>
            <div className="flex justify-center gap-4 mt-4">
              <button 
                onClick={() => setShortlisted(true)}
                className={`px-6 py-3 rounded-lg border-2 ${shortlisted ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200'}`}
              >
                Yes, I was shortlisted
              </button>
              <button 
                onClick={() => setShortlisted(false)}
                className={`px-6 py-3 rounded-lg border-2 ${!shortlisted ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200'}`}
              >
                No, rejected after OA
              </button>
            </div>
          </div>
        );
      case 3: // Interviews
        if (!shortlisted) return <div className="text-center py-10 text-gray-500">Skipped (Not shortlisted)</div>;
        return (
          <div className="space-y-6">
            {rounds.map((round, idx) => (
              <div key={round.id} className="border p-4 rounded-lg bg-gray-50 relative">
                <button 
                  onClick={() => setRounds(rounds.filter((_, i) => i !== idx))}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <h4 className="font-medium mb-2">Round {idx + 1}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <select 
                    className="border p-2 rounded"
                    value={round.type}
                    onChange={e => {
                      const newRounds = [...rounds];
                      newRounds[idx].type = e.target.value as RoundType;
                      setRounds(newRounds);
                    }}
                  >
                    {Object.values(RoundType).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <select 
                     className="border p-2 rounded"
                     value={round.difficulty}
                     onChange={e => {
                       const newRounds = [...rounds];
                       newRounds[idx].difficulty = e.target.value as Difficulty;
                       setRounds(newRounds);
                     }}
                  >
                     {Object.values(Difficulty).map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <textarea 
                  className="w-full mt-2 border p-2 rounded"
                  placeholder="Questions asked..."
                  value={round.questions.join('\n')}
                  onChange={e => {
                    const newRounds = [...rounds];
                    newRounds[idx].questions = e.target.value.split('\n');
                    setRounds(newRounds);
                  }}
                />
                <input 
                  type="text"
                  className="w-full mt-2 border p-2 rounded"
                  placeholder="Your performance review / Tips"
                  value={round.tips}
                  onChange={e => {
                    const newRounds = [...rounds];
                    newRounds[idx].tips = e.target.value;
                    setRounds(newRounds);
                  }}
                />
              </div>
            ))}
            <button 
              onClick={() => setRounds([...rounds, {
                id: `r${Date.now()}`,
                type: RoundType.TECHNICAL,
                questions: [],
                difficulty: Difficulty.MEDIUM,
                duration: '45 mins',
                performanceReview: '',
                tips: ''
              }])}
              className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg hover:border-blue-500 hover:text-blue-500 flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5"/> Add Round
            </button>
          </div>
        );
      case 4: // Resources
        return (
          <div className="space-y-4">
             {resources.map((res, idx) => (
               <div key={idx} className="flex gap-2">
                 <select 
                    className="border p-2 rounded"
                    value={res.type}
                    onChange={e => {
                      const newRes = [...resources];
                      newRes[idx].type = e.target.value as any;
                      setResources(newRes);
                    }}
                 >
                   {['Course', 'Video', 'Book', 'Platform', 'Note'].map(t => <option key={t} value={t}>{t}</option>)}
                 </select>
                 <input 
                    className="flex-1 border p-2 rounded"
                    placeholder="Name / Title"
                    value={res.name}
                    onChange={e => {
                      const newRes = [...resources];
                      newRes[idx].name = e.target.value;
                      setResources(newRes);
                    }}
                 />
                  <input 
                    className="flex-1 border p-2 rounded"
                    placeholder="Link (Optional)"
                    value={res.link || ''}
                    onChange={e => {
                      const newRes = [...resources];
                      newRes[idx].link = e.target.value;
                      setResources(newRes);
                    }}
                 />
                 <button onClick={() => setResources(resources.filter((_, i) => i !== idx))} className="text-red-500"><Trash2 className="w-4 h-4"/></button>
               </div>
             ))}
             <button 
                onClick={() => setResources([...resources, { type: 'Platform', name: '' }])}
                className="text-blue-600 font-medium text-sm flex items-center gap-1"
             >
               <Plus className="w-4 h-4"/> Add Resource
             </button>
          </div>
        );
      case 5: // Summary
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="flex justify-between items-center mb-2">
                 <h4 className="font-semibold text-blue-900 flex items-center gap-2">
                   <Wand2 className="w-4 h-4" /> AI Generated Summary
                 </h4>
                 {loading && <span className="text-xs text-blue-500 animate-pulse">Generating...</span>}
              </div>
              <textarea 
                className="w-full bg-white border p-3 rounded-md text-sm text-gray-700 h-32"
                value={summary}
                onChange={e => setSummary(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-4">
               <label className="flex items-center gap-2 cursor-pointer">
                 <input 
                    type="checkbox" 
                    checked={isAnonymous} 
                    onChange={e => setIsAnonymous(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-gray-700 text-sm">Post Anonymously</span>
               </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Tags (comma separated)</label>
              <input 
                  type="text"
                  className="mt-1 block w-full border p-2 rounded"
                  value={tags.join(', ')}
                  onChange={e => setTags(e.target.value.split(',').map(s => s.trim()))}
                  placeholder="Puzzle-heavy, Resume-based, etc."
               />
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="font-semibold text-gray-800">Share Experience</h2>
        <span className="text-xs font-medium text-gray-500">Step {activeStep + 1} of {STEPS.length}</span>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 h-1.5">
        <div 
          className="bg-blue-600 h-1.5 transition-all duration-300" 
          style={{ width: `${((activeStep + 1) / STEPS.length) * 100}%` }}
        ></div>
      </div>

      <div className="p-6 min-h-[400px]">
        <h2 className="text-xl font-bold text-gray-900 mb-6">{STEPS[activeStep]}</h2>
        {renderStepContent()}
      </div>

      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
        <button 
          onClick={handleBack} 
          disabled={activeStep === 0}
          className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium ${activeStep === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-200'}`}
        >
          <ChevronLeft className="w-4 h-4 mr-1"/> Back
        </button>
        <button 
          onClick={handleNext}
          disabled={(activeStep === 0 && !companyId) || loading}
          className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
        >
          {loading ? 'Processing...' : activeStep === STEPS.length - 1 ? 'Publish' : 'Next'}
          {activeStep !== STEPS.length - 1 && <ChevronRight className="w-4 h-4 ml-1"/>}
          {activeStep === STEPS.length - 1 && !loading && <CheckCircle2 className="w-4 h-4 ml-1"/>}
        </button>
      </div>
    </div>
  );
};
