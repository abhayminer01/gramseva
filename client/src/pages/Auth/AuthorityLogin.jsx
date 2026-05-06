import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

const AuthorityLogin = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError('Phone number must be exactly 10 digits and start with 6, 7, 8, or 9.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }
    
    // Passing 'auth' to login type
    const res = await login(phone, password, 'auth');
    setLoading(false);
    
    if (res.success) {
      navigate('/');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border-t-4 border-blue-600">
        <div>
          <div className="flex justify-center mb-2">
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              GramSeva
            </h1>
          </div>
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <ShieldAlert className="text-blue-600 w-8 h-8" />
            </div>
          </div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
            Authority Access
          </h2>
          <p className="mt-2 text-center text-sm text-gray-500 font-medium uppercase tracking-wider">
            Ward Member / Secretary / Higher Auth
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Official ID (Phone)</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                className="appearance-none relative block w-full px-3 py-2.5 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow"
                placeholder="Enter 10-digit number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none relative block w-full px-3 py-2.5 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors shadow-md ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Authenticating...' : 'Secure Login'}
            </button>
          </div>
          <div className="text-center mt-4">
             <p className="text-sm text-gray-500">
               Are you a Citizen? <Link to="/login/citizen" className="underline hover:text-emerald-600">Citizen Login</Link>
             </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthorityLogin;
