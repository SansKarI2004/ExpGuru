import React, { useState, useEffect } from 'react';
import { Company, Experience, User } from '../types';
import { db } from '../services/mockDb';
import { generateCompanyInsight } from '../services/geminiService';
import { Link, useNavigate } from 'react-router-dom';
import { Search, TrendingUp, Filter, ThumbsUp, User as UserIcon, Building2, Sparkles, BookOpen } from 'lucide-react';

// --- Sub-components ---

const CompanyCard: React.FC<{ company: Company; count: number }> = ({ company, count }) => {
  return (
    <Link to={`/company/${company.id}`} className="block group">
      <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all duration-200 hover:border-blue-300 h-full">
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 font-bold text-xl">
             {company.name[0]}
          </div>
          <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            {count} Exp
          </span>
        </div>
        <h3 className="mt-4 text-lg font-bold text-gray-900 group-hover:text-blue-600">{company.name}</h3>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{company.description}</p>
        <div className="mt-4 flex items-center text-xs text-gray-400 font-medium">
          <TrendingUp className="w-3 h-3 mr-1" /> Trending in {company.industry}
        </div>
      </div>
    </Link>
  );
};

const ExperienceCard: React.FC<{ experience: Experience }> = ({ experience }) => {
  const user = db.getUserById(experience.userId);
  const formattedDate = new Date(experience.timestamp).toLocaleDateString();

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{experience.role} @ {experience.companyName}</h3>
          <div className="flex items-center gap-2 mt-1">
             <span className={`text-xs px-2 py-1 rounded-full font-medium ${experience.shortlisted ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {experience.shortlisted ? 'Shortlisted' : 'Not Shortlisted'}
             </span>
             <span className="text-xs text-gray-500">• {experience.year}</span>
             <span className="text-xs text-gray-500">• Difficulty: {experience.difficultyRating}/5</span>
          </div>
        </div>
        <div className="text-right">
           <Link to={`/experience/${experience.id}`} className="text-blue-600 text-sm font-semibold hover:underline">
             View Details
           </Link>
        </div>
      </div>
      
      <p className="text-gray-600 text-sm line-clamp-3 mb-4 bg-gray-50 p-3 rounded-lg italic">
        "{experience.summary}"
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
             {experience.isAnonymous ? '?' : user?.name[0]}
           </div>
           <div className="flex flex-col">
             <span className="text-xs font-semibold text-gray-900">
               {experience.isAnonymous ? 'Anonymous Senior' : user?.name}
             </span>
             <span className="text-[10px] text-gray-500">
               {user?.branch} • {user?.year}
             </span>
           </div>
        </div>
        <button className="flex items-center text-gray-500 text-sm hover:text-blue-600 transition-colors">
          <ThumbsUp className="w-4 h-4 mr-1" /> {experience.upvotes}
        </button>
      </div>
    </div>
  );
};

// --- Main Pages ---

export const Home: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const companies = db.getCompanies();
  const trending = db.getTrendingCompanies();
  
  const filteredCompanies = companies.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-10">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl tracking-tight">
          Master Your <span className="text-blue-600">Placements</span>
        </h1>
        <p className="max-w-2xl mx-auto text-xl text-gray-500">
          Access hundreds of interview experiences, OA questions, and preparation strategies shared by IITG seniors.
        </p>
        <div className="max-w-xl mx-auto mt-8 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-full leading-5 bg-white shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Search for companies, roles, or seniors..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Trending Section */}
      {!searchTerm && (
        <section>
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Trending Companies</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trending.map((item, idx) => (
              <CompanyCard key={idx} company={item.company} count={item.count} />
            ))}
          </div>
        </section>
      )}

      {/* All Companies */}
      <section>
         <h2 className="text-2xl font-bold text-gray-900 mb-6">All Companies</h2>
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredCompanies.map(c => {
               const count = db.getExperiences(c.id).length;
               return <CompanyCard key={c.id} company={c} count={count} />
            })}
         </div>
      </section>
    </div>
  );
};

export const CompanyDetails: React.FC<{ companyId: string }> = ({ companyId }) => {
  const company = db.getCompany(companyId);
  const experiences = db.getExperiences(companyId);
  const [insight, setInsight] = useState<string>('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if(company) {
       // Only generate if we have experiences
       if (experiences.length > 0) {
           setGenerating(true);
           generateCompanyInsight(company.name, experiences).then(res => {
               setInsight(res);
               setGenerating(false);
           });
       }
    }
  }, [companyId]);

  if (!company) return <div>Company not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8">
         <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-2xl font-bold text-gray-600">
               {company.name[0]}
            </div>
            <div>
               <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
               <p className="text-gray-500">{company.industry}</p>
            </div>
         </div>
         
         {/* AI Insight Box */}
         <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
            <h3 className="font-bold text-blue-900 flex items-center gap-2 mb-3">
               <Sparkles className="w-5 h-5 text-blue-600" /> 
               AI Junior Prep-Path
            </h3>
            {generating ? (
                <div className="space-y-2 animate-pulse">
                    <div className="h-2 bg-blue-200 rounded w-3/4"></div>
                    <div className="h-2 bg-blue-200 rounded w-1/2"></div>
                </div>
            ) : (
                <div className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">
                   {insight || "No enough data to generate insights yet."}
                </div>
            )}
         </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-6">Experiences ({experiences.length})</h2>
      <div className="grid gap-6">
         {experiences.map(exp => <ExperienceCard key={exp.id} experience={exp} />)}
      </div>
    </div>
  );
};

export const ExperienceView: React.FC<{ experienceId: string }> = ({ experienceId }) => {
  const exp = db.getExperienceById(experienceId);
  if (!exp) return <div>Experience not found</div>;
  const user = db.getUserById(exp.userId);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-gray-100">
           <div className="flex justify-between items-start">
              <div>
                 <h1 className="text-3xl font-bold text-gray-900">{exp.role}</h1>
                 <h2 className="text-xl text-gray-600 font-medium mt-1">{exp.companyName}</h2>
                 <div className="flex gap-2 mt-4">
                    {exp.tags.map(t => <span key={t} className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600 font-medium">{t}</span>)}
                 </div>
              </div>
              <div className="text-right">
                 <div className="text-sm text-gray-500">Shared by</div>
                 <div className="font-medium text-gray-900">{exp.isAnonymous ? 'Anonymous' : user?.name}</div>
                 <div className="text-xs text-gray-400">{user?.branch}, {user?.year}</div>
              </div>
           </div>
        </div>

        <div className="p-8 space-y-10">
           {/* OA */}
           <section>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                 <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">1</span>
                 Online Assessment
              </h3>
              {exp.oaDetails ? (
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 space-y-4">
                      <div className="flex gap-4 text-sm mb-2">
                         <span className="font-semibold text-gray-700">Difficulty: {exp.oaDetails.difficulty}</span>
                         <span className="text-gray-400">|</span>
                         <span className="font-semibold text-gray-700">Time: {exp.oaDetails.timeLimit}</span>
                      </div>
                      <div>
                         <h4 className="font-medium text-gray-900 text-sm">Topics</h4>
                         <p className="text-gray-600">{exp.oaDetails.topics.join(', ')}</p>
                      </div>
                      <div>
                         <h4 className="font-medium text-gray-900 text-sm">Questions</h4>
                         <ul className="list-disc list-inside text-gray-600">
                            {exp.oaDetails.codingQuestions.map((q, i) => <li key={i}>{q}</li>)}
                         </ul>
                      </div>
                  </div>
              ) : (
                  <p className="text-gray-500 italic">No OA details provided (Direct interview or skipped).</p>
              )}
           </section>

           {/* Interviews */}
           <section>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                 <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">2</span>
                 Interview Rounds
              </h3>
              <div className="space-y-4">
                 {exp.rounds.map((round, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-xl p-6">
                       <div className="flex justify-between mb-2">
                          <h4 className="font-bold text-gray-900">{round.type}</h4>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{round.duration}</span>
                       </div>
                       <div className="space-y-3 mt-4">
                          <div>
                             <h5 className="text-sm font-medium text-gray-700">Questions Asked:</h5>
                             <ul className="list-disc list-inside text-gray-600 text-sm mt-1">
                                {round.questions.map((q, i) => <li key={i}>{q}</li>)}
                             </ul>
                          </div>
                          {round.tips && (
                             <div className="bg-yellow-50 p-3 rounded-lg text-sm text-yellow-800">
                                <strong>Tip:</strong> {round.tips}
                             </div>
                          )}
                       </div>
                    </div>
                 ))}
              </div>
           </section>

           {/* Resources */}
           {exp.resources.length > 0 && (
               <section>
                   <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">3</span>
                      Resources Used
                   </h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {exp.resources.map((res, i) => (
                         <div key={i} className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
                            <BookOpen className="w-4 h-4 text-gray-400 mr-3" />
                            <div>
                               <div className="font-medium text-gray-900">{res.name}</div>
                               <div className="text-xs text-gray-500">{res.type}</div>
                            </div>
                            {res.link && <a href={res.link} target="_blank" rel="noreferrer" className="ml-auto text-blue-600 text-xs hover:underline">View</a>}
                         </div>
                      ))}
                   </div>
               </section>
           )}
        </div>
      </div>
    </div>
  );
};
