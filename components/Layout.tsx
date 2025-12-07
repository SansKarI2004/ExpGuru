import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User } from '../types';
import { LogOut, PlusCircle, Search, Home, User as UserIcon } from 'lucide-react';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path ? "text-blue-600 font-semibold" : "text-gray-600 hover:text-blue-500";

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                IITG
              </div>
              <span className="font-bold text-xl tracking-tight text-gray-900">Placement<span className="text-blue-600">Portal</span></span>
            </div>
          </div>
          
          {user && (
            <div className="hidden sm:flex sm:space-x-8 items-center">
              <Link to="/" className={`inline-flex items-center px-1 pt-1 text-sm ${isActive('/')}`}>
                <Home className="w-4 h-4 mr-2" />
                Home
              </Link>
              <Link to="/add-experience" className={`inline-flex items-center px-1 pt-1 text-sm ${isActive('/add-experience')}`}>
                <PlusCircle className="w-4 h-4 mr-2" />
                Share Experience
              </Link>
              <Link to="/profile" className={`inline-flex items-center px-1 pt-1 text-sm ${isActive('/profile')}`}>
                <UserIcon className="w-4 h-4 mr-2" />
                Profile
              </Link>
            </div>
          )}

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                 <div className="text-sm text-right hidden md:block">
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.branch}</p>
                 </div>
                 <button 
                  onClick={onLogout}
                  className="p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-gray-100 transition-colors"
                  title="Logout"
                 >
                   <LogOut className="w-5 h-5" />
                 </button>
              </div>
            ) : (
              <span className="text-sm text-gray-500">Exclusive for IITG Students</span>
            )}
          </div>
        </div>
      </div>
      {/* Mobile Menu */}
      {user && (
        <div className="sm:hidden border-t border-gray-100 flex justify-around p-2 bg-gray-50">
           <Link to="/" className="p-2 text-gray-600"><Home className="w-5 h-5"/></Link>
           <Link to="/add-experience" className="p-2 text-blue-600"><PlusCircle className="w-6 h-6"/></Link>
           <Link to="/profile" className="p-2 text-gray-600"><UserIcon className="w-5 h-5"/></Link>
        </div>
      )}
    </nav>
  );
};
