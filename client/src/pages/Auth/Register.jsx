import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import localBodyData from '../../services/localbody.json';

const Register = () => {
  const districts = Object.keys(localBodyData);
  const [selectedDistrict, setSelectedDistrict] = useState(districts[0]);
  const [selectedType, setSelectedType] = useState('Panchayat');

  const [formData, setFormData] = useState({
    name: '', phone: '', password: '', rationCardNumber: '',
    district: districts[0], localBodyType: 'Panchayat', localBodyName: '', wardNumber: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // Helper map from Backend Enum to JSON keys
  const typeMap = {
    'Panchayat': 'panchayath',
    'Municipality': 'municipality',
    'Corporation': 'corporation'
  };

  const getAvailableBodies = () => {
    if (!selectedDistrict || !localBodyData[selectedDistrict]) return [];
    const key = typeMap[selectedType];
    return localBodyData[selectedDistrict][key] || [];
  };

  useEffect(() => {
    const bodies = getAvailableBodies();
    setFormData(prev => ({
      ...prev,
      district: selectedDistrict,
      localBodyType: selectedType,
      localBodyName: bodies.length > 0 ? bodies[0] : ''
    }));
  }, [selectedDistrict, selectedType]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      setError('Phone number must be exactly 10 digits and start with 6, 7, 8, or 9.');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }
    
    try {
      await axios.post('http://localhost:5000/api/auth/register', formData);
      setSuccess(true);
      setTimeout(() => navigate('/login/citizen'), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center border border-emerald-100">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful</h2>
          <p className="text-gray-600">Your account is pending approval by the local body secretary. You will be redirected to login shortly.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
         <div className="flex justify-center mb-2">
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              GramSeva
            </h1>
         </div>
         <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 tracking-tight">Citizen Registration</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md"><p className="text-red-700 text-sm">{error}</p></div>
            )}
            
            <div className="grid grid-cols-1 gap-y-5 gap-x-4 sm:grid-cols-2">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input required type="text" name="name" onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input required type="tel" name="phone" onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input required type="password" name="password" onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">Ration Card Number</label>
                <input type="text" name="rationCardNumber" onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
              </div>
              
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700">District</label>
                <select 
                  value={selectedDistrict} 
                  onChange={(e) => setSelectedDistrict(e.target.value)} 
                  className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                >
                  {districts.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select 
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)} 
                  className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                >
                  <option value="Panchayat">Panchayat</option>
                  <option value="Municipality">Municipality</option>
                  <option value="Corporation">Corporation</option>
                </select>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700">Local Body Name</label>
                <select 
                  name="localBodyName" 
                  value={formData.localBodyName}
                  onChange={handleChange} 
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                >
                  {getAvailableBodies().length === 0 && <option value="">No Bodies Found</option>}
                  {getAvailableBodies().map(body => (
                    <option key={body} value={body}>{body}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700">Ward Number</label>
                <input required type="text" name="wardNumber" onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
              </div>
            </div>

            <div>
              <button type="submit" disabled={loading || !formData.localBodyName} className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 ${(loading || !formData.localBodyName) ? 'opacity-70 cursor-not-allowed' : ''}`}>
                {loading ? 'Submitting...' : 'Register as Citizen'}
              </button>
            </div>
          </form>
          <div className="text-center mt-4 text-sm text-gray-600">
              Already have an account? <Link to="/login/citizen" className="font-medium text-emerald-600 hover:text-emerald-500">Login here</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
