import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Building, ShieldCheck, Activity, UserCog, Edit, X, Trash2 } from 'lucide-react';
import localBodyData from '../../services/localbody.json';

const AdminDashboard = () => {
  const districts = Object.keys(localBodyData);
  const [selectedDistrict, setSelectedDistrict] = useState(districts[0]);
  const [selectedType, setSelectedType] = useState('Panchayat');
  const [activeTab, setActiveTab] = useState('manage');

  const [stats, setStats] = useState({ users: 0, grievances: 0, bodies: 0, active: 0 });
  const [allUsers, setAllUsers] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '', phone: '', password: '', role: 'ward_member', localBodyName: '',
    district: districts[0], localBodyType: 'Panchayat', wardNumber: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Edit Modals State
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', phone: '', password: '' });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileFormData, setProfileFormData] = useState({ name: '', password: '' });

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/auth/admin/users');
      setAllUsers(res.data);
      setStats(prev => ({ ...prev, users: res.data.length }));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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

  // Create Authority
  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const submitData = { ...formData };
      if (submitData.role === 'higher_authority') {
         submitData.district = 'System Base';
         submitData.localBodyType = 'System';
         submitData.localBodyName = 'State';
         submitData.wardNumber = '';
      }

      await axios.post('http://localhost:5000/api/auth/admin/create-authority', submitData);
      setSuccess(`Authority account created successfully! User can login with provided password.`);
      setFormData({
        name: '', phone: '', password: '', role: 'ward_member', localBodyName: getAvailableBodies()[0] || '',
        district: selectedDistrict, localBodyType: selectedType, wardNumber: ''
      });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  // Edit User Handlers
  const openEditModal = (user) => {
    setEditingUser(user);
    setEditFormData({ name: user.name, phone: user.phone, password: '' });
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/auth/admin/users/${editingUser._id}`, editFormData);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  const handleDeleteAccount = async (userId) => {
    if (!window.confirm("Are you absolutely sure you want to permanently delete this authority account?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/auth/admin/users/${userId}`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete account');
    }
  };

  // Admin Profile Handlers
  const handleProfileChange = (e) => {
    setProfileFormData({ ...profileFormData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      // Find the admin user ID from the active users list to self-edit
      const adminUser = allUsers.find(u => u.role === 'admin');
      if (!adminUser) return alert("Admin record not found");

      await axios.put(`http://localhost:5000/api/auth/admin/users/${adminUser._id}`, profileFormData);
      setShowProfileModal(false);
      setProfileFormData({ name: '', password: '' });
      fetchUsers();
      alert("Admin profile updated successfully!");
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'higher_authority': return 'bg-purple-100 text-purple-800';
      case 'secretary': return 'bg-emerald-100 text-emerald-800';
      case 'ward_member': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 relative">
      
      {/* Header Area with Admin Profile Button */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Control Center</h1>
          <p className="text-gray-500 text-sm mt-1">Manage global system operations and authority users.</p>
        </div>
        <button 
          onClick={() => {
             const adminUser = allUsers.find(u => u.role === 'admin');
             if(adminUser) setProfileFormData({ name: adminUser.name, password: '' });
             setShowProfileModal(true);
          }}
          className="flex items-center space-x-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
        >
          <UserCog size={18} />
          <span className="font-medium text-sm">Admin Profile</span>
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
            <Users className="text-blue-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.users || allUsers.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-gray-500">Active Grievances</h3>
            <Activity className="text-emerald-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.grievances}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-gray-500">Local Bodies</h3>
            <Building className="text-purple-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.bodies}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-gray-500">System Status</h3>
            <ShieldCheck className="text-green-500" size={20} />
          </div>
          <p className="text-xl font-bold text-green-600">Healthy</p>
        </div>
      </div>

      {/* Admin Section Tabs */}
      <div className="flex border-b border-gray-200 mt-6 md:mt-8">
         <button 
           onClick={() => setActiveTab('manage')} 
           className={`py-3 px-6 font-bold text-sm border-b-2 transition-colors flex-1 sm:flex-none ${activeTab === 'manage' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
         >
           Manage System Users
         </button>
         <button 
           onClick={() => setActiveTab('create')} 
           className={`py-3 px-6 font-bold text-sm border-b-2 transition-colors flex-1 sm:flex-none ${activeTab === 'create' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
         >
           Create Authority Account
         </button>
      </div>

      <div className="mt-6">
        {/* Create User Form Tab */}
        {activeTab === 'create' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 max-w-4xl">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Create Authority Account</h2>
          
          {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md border-l-4 border-red-500">{error}</div>}
          {success && <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-md border-l-4 border-green-500">{success}</div>}

          <form className="space-y-4" onSubmit={handleCreateAccount}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input required type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input required type="password" name="password" value={formData.password} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <select required name="role" value={formData.role} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                <option value="ward_member">Ward Member</option>
                <option value="secretary">Secretary</option>
                <option value="higher_authority">Higher Authority</option>
              </select>
            </div>
            
            {formData.role !== 'higher_authority' && (
              <>
                <div>
                   <label className="block text-sm font-medium text-gray-700">District</label>
                   <select 
                      value={selectedDistrict} 
                      onChange={(e) => setSelectedDistrict(e.target.value)} 
                      className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      {districts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="block text-sm font-medium text-gray-700">Type</label>
                     <select 
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)} 
                        className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="Panchayat">Panchayat</option>
                        <option value="Municipality">Municipality</option>
                        <option value="Corporation">Corporation</option>
                     </select>
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700">Local Body Name</label>
                     <select 
                        name="localBodyName" 
                        value={formData.localBodyName}
                        onChange={handleChange} 
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        {getAvailableBodies().length === 0 && <option value="">No Bodies Found</option>}
                        {getAvailableBodies().map(body => (
                          <option key={body} value={body}>{body}</option>
                        ))}
                      </select>
                  </div>
                </div>
                {formData.role === 'ward_member' && (
                  <div>
                     <label className="block text-sm font-medium text-gray-700">Ward Number</label>
                     <input required type="text" name="wardNumber" value={formData.wardNumber} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                  </div>
                )}
              </>
            )}

            <div className="pt-2">
              <button type="submit" disabled={loading} className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors shadow-sm ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                {loading ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
        )}

        {/* Manage Users Tab */}
        {activeTab === 'manage' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[700px]">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Registered System Accounts</h2>
              <p className="text-sm text-gray-500 mt-1">Manage all administrative members from various local bodies including Ward Members, Secretaries, and Higher Authorities.</p>
            </div>
          </div>
          <div className="overflow-y-auto flex-1 p-0">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User Details</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Assigned Role</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Governing Location</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Administrative Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allUsers.map(user => (
                  <tr key={user._id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center text-slate-700 font-bold uppercase shadow-sm">
                          {user.name.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-900">{user.name}</div>
                          <div className="text-sm font-medium text-gray-500">{user.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full capitalize shadow-sm border border-white/50 ${getRoleBadgeColor(user.role)}`}>
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{user.localBodyName} <span className="text-gray-400 font-normal">({user.localBodyType})</span></div>
                      <div className="text-sm font-medium text-gray-500">{user.district} {user.wardNumber ? <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded ml-1 border border-blue-100">Ward {user.wardNumber}</span> : ''}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {user.role !== 'admin' && (
                        <div className="flex justify-end gap-2">
                           <button 
                             onClick={() => openEditModal(user)}
                             className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all px-4 py-2 rounded-lg text-sm font-medium shadow-sm"
                           >
                             <Edit size={16} /> Manage
                           </button>
                           <button 
                             onClick={() => handleDeleteAccount(user._id)}
                             className="inline-flex items-center justify-center bg-white border border-red-100 text-red-500 hover:text-white hover:bg-red-500 transition-all p-2 rounded-lg shadow-sm"
                             title="Delete Authority Account"
                           >
                             <Trash2 size={16} />
                           </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                 <h3 className="text-lg font-bold text-gray-900">Edit User Account</h3>
                 <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-gray-600">
                    <X size={20} />
                 </button>
              </div>
              <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                 <div className="bg-blue-50 p-3 rounded-lg mb-4 flex items-center">
                    <div className="text-sm">
                       <span className="font-semibold text-blue-900">Editing: </span>
                       <span className="text-blue-800">{editingUser.name} ({editingUser.role.replace('_', ' ')})</span>
                    </div>
                 </div>
                 
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input required type="text" name="name" value={editFormData.name} onChange={handleEditChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input required type="tel" name="phone" value={editFormData.phone} onChange={handleEditChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password <span className="text-gray-400 font-normal">(Leave blank to keep current)</span></label>
                    <input type="password" name="password" value={editFormData.password} onChange={handleEditChange} placeholder="••••••••" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" />
                 </div>
                 
                 <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setEditingUser(null)} className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">Cancel</button>
                    <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm">Save Changes</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* Admin Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-slate-900 border-b-0 text-white">
                 <h3 className="text-lg font-bold flex items-center gap-2"><UserCog size={20} className="text-blue-400" /> Super Admin Profile</h3>
                 <button onClick={() => setShowProfileModal(false)} className="text-slate-400 hover:text-white transition-colors">
                    <X size={20} />
                 </button>
              </div>
              <form onSubmit={handleProfileSubmit} className="p-6 space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                    <input required type="text" name="name" value={profileFormData.name} onChange={handleProfileChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-shadow" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Update Master Password <span className="text-gray-400 font-normal">(Leave blank to keep)</span></label>
                    <input type="password" name="password" value={profileFormData.password} onChange={handleProfileChange} placeholder="••••••••" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-shadow" />
                 </div>
                 
                 <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setShowProfileModal(false)} className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">Cancel</button>
                    <button type="submit" className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium shadow-sm">Secure Update</button>
                 </div>
              </form>
           </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
