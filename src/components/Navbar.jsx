import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MapPin, User, LogOut, LayoutDashboard, Menu, X, Home, BarChart3 } from 'lucide-react';

const Navbar = () => {
  const { user, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isAdmin = userProfile?.role === 'admin';

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white/80 backdrop-blur-lg shadow-soft border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2.5 rounded-xl shadow-lg group-hover:shadow-glow transition-all duration-300 group-hover:scale-110">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold gradient-text">ParkPass</span>
              <div className="text-xs text-gray-500 -mt-1">Smart Parking</div>
            </div>
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-2">
            {user ? (
              <>
                {/* Navigation Links */}
                {!isAdmin && (
                  <Link
                    to="/"
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                      isActive('/') 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Home className="h-4 w-4" />
                    Find Parking
                  </Link>
                )}
                
                <Link
                  to={isAdmin ? '/admin' : '/dashboard'}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                    isActive(isAdmin ? '/admin' : '/dashboard')
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  {isAdmin ? 'Admin Panel' : 'Dashboard'}
                </Link>

                {isAdmin && (
                  <Link
                    to="/analytics"
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                      isActive('/analytics')
                        ? 'bg-blue-50 text-blue-600' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <BarChart3 className="h-4 w-4" />
                    Analytics
                  </Link>
                )}

                {/* User Menu */}
                <div className="flex items-center gap-3 pl-3 ml-3 border-l-2 border-gray-200">
                  <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-50">
                    <div className="h-9 w-9 bg-gradient-to-br from-blue-600 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div className="hidden lg:block">
                      <div className="text-sm font-bold text-gray-900">
                        {userProfile?.displayName || user.email?.split('@')[0]}
                      </div>
                      <div className="text-xs text-gray-500">
                        {isAdmin ? 'Administrator' : 'User'}
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-300 font-medium"
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden xl:inline">Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <Link 
                to="/login" 
                className="btn-primary"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 animate-slide-in-up">
            {user ? (
              <div className="space-y-2">
                {!isAdmin && (
                  <Link
                    to="/"
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                      isActive('/') 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Home className="h-5 w-5" />
                    Find Parking
                  </Link>
                )}
                
                <Link
                  to={isAdmin ? '/admin' : '/dashboard'}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                    isActive(isAdmin ? '/admin' : '/dashboard')
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <LayoutDashboard className="h-5 w-5" />
                  {isAdmin ? 'Admin Panel' : 'Dashboard'}
                </Link>

                {isAdmin && (
                  <Link
                    to="/analytics"
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                      isActive('/analytics')
                        ? 'bg-blue-50 text-blue-600' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <BarChart3 className="h-5 w-5" />
                    Analytics
                  </Link>
                )}
                
                <div className="pt-3 mt-3 border-t border-gray-200">
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl mb-2">
                    <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-green-600 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">
                        {userProfile?.displayName || user.email?.split('@')[0]}
                      </div>
                      <div className="text-xs text-gray-500">
                        {isAdmin ? 'Administrator' : 'User'}
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all font-medium"
                  >
                    <LogOut className="h-5 w-5" />
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="block btn-primary text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;