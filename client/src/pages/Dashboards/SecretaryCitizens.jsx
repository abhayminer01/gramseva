import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserCheck, Users, MapPin, X, CheckCircle, XCircle } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const SecretaryCitizens = () => {
  const { user } = useContext(AuthContext);
  const [unapprovedCitizens, setUnapprovedCitizens] = useState([]);
  const [approvedCitizens, setApprovedCitizens] = useState([]);
  const [approving, setApproving] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');

  const fetchData = async () => {
    try {
      const [unapprovedRes, approvedRes] = await Promise.all([
        axios.get('http://localhost:5000/api/auth/unapproved'),
        axios.get('http://localhost:5000/api/auth/approved'),
      ]);
      setUnapprovedCitizens(unapprovedRes.data);
      setApprovedCitizens(approvedRes.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleApprove = async (id) => {
    setApproving(id);
    try {
      await axios.put(`http://localhost:5000/api/auth/approve/${id}`);
      fetchData();
    } catch (error) {
      console.error('Failed to approve citizen', error);
    } finally {
      setApproving(null);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject this citizen request?')) return;
    setApproving(id);
    try {
      await axios.put(`http://localhost:5000/api/auth/reject/${id}`);
      fetchData();
    } catch (error) {
      console.error('Failed to reject citizen', error);
    } finally {
      setApproving(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Citizen Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage citizen registrations under {user.localBodyName}</p>
        </div>
        <div className="flex gap-6">
          <div className="text-center">
            <p className="text-xs text-yellow-600 uppercase tracking-wider font-semibold">Awaiting</p>
            <p className="text-2xl font-bold text-yellow-600">{unapprovedCitizens.length}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-emerald-600 uppercase tracking-wider font-semibold">Active</p>
            <p className="text-2xl font-bold text-emerald-600">{approvedCitizens.length}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('pending')}
          className={`py-3 px-6 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'pending' ? 'border-yellow-500 text-yellow-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <UserCheck size={16} />
          Pending Approvals
          {unapprovedCitizens.length > 0 && (
            <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-0.5 rounded-full">{unapprovedCitizens.length}</span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('directory')}
          className={`py-3 px-6 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'directory' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <Users size={16} />
          Citizens Directory
          <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">{approvedCitizens.length}</span>
        </button>
      </div>

      {/* Pending Approvals Tab */}
      {activeTab === 'pending' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {unapprovedCitizens.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                <CheckCircle size={32} className="text-emerald-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
              <p className="mt-1 text-gray-500">No pending citizen registrations to review.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Citizen Details</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Ration Card</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {unapprovedCitizens.map(citizen => (
                    <tr key={citizen._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-700 font-bold uppercase text-sm">
                            {citizen.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{citizen.name}</div>
                            <div className="text-sm text-gray-500">{citizen.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-gray-700">{citizen.rationCardNumber || '—'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <MapPin size={14} className="text-gray-400 mr-1" />
                          {citizen.district} / {citizen.localBodyName}
                        </div>
                        {citizen.wardNumber && <div className="text-xs text-gray-500 ml-4 mt-1">Ward {citizen.wardNumber}</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleReject(citizen._id)}
                            disabled={approving === citizen._id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-red-200 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-50 transition-colors"
                          >
                            <XCircle size={14} /> Reject
                          </button>
                          <button
                            onClick={() => handleApprove(citizen._id)}
                            disabled={approving === citizen._id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-transparent rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                          >
                            <CheckCircle size={14} /> {approving === citizen._id ? 'Processing...' : 'Approve'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Directory Tab */}
      {activeTab === 'directory' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {approvedCitizens.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Users size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No citizens yet</h3>
              <p className="mt-1 text-gray-500">Approved citizens will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Citizen</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Ration Card</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Ward</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {approvedCitizens.map(citizen => (
                    <tr key={citizen._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold uppercase text-sm">
                            {citizen.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{citizen.name}</div>
                            <div className="text-sm text-gray-500">{citizen.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-gray-700">{citizen.rationCardNumber || '—'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {citizen.wardNumber
                          ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800">Ward {citizen.wardNumber}</span>
                          : <span className="text-sm text-gray-400 italic">Unassigned</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block"></span>
                          Active Member
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SecretaryCitizens;
