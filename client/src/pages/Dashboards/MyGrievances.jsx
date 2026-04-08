import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Trash2, AlertCircle, MessageSquare, ThumbsUp } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const MyGrievances = () => {
  const { user } = useContext(AuthContext);
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGrievances = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/grievances');
      // Filter locally to only show grievances created by the authenticated user
      const myItems = res.data.filter(g => g.createdBy._id === user._id);
      setGrievances(myItems);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrievances();
  }, [user._id]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this grievance? This action cannot be undone.")) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/grievances/${id}`);
      setGrievances(prev => prev.filter(g => g._id !== id));
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete grievance.");
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'escalated': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">My Grievances</h1>
        <p className="text-gray-500 text-sm mt-1">Track and manage the progress of the issues you have reported.</p>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      ) : grievances.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No reported issues</h3>
          <p className="mt-1 text-gray-500">You haven't posted any grievances yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {grievances.map(g => (
            <div key={g._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow relative group">
              {g.images && g.images.length > 0 ? (
                 <img src={g.images[0]} alt="Grievance" className="w-full h-48 object-cover" />
              ) : (
                 <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                   <span className="text-gray-400 font-medium tracking-wider">NO IMAGE</span>
                 </div>
              )}
              
              <div className="absolute top-3 right-3">
                <button
                   onClick={() => handleDelete(g._id)}
                   disabled={g.status !== 'pending'}
                   title={g.status !== 'pending' ? "You can't modify once authority has responded" : "Delete Issue"}
                   className={`p-2 rounded-full focus:outline-none transition-colors shadow-sm ${
                     g.status === 'pending' 
                        ? 'bg-red-500 text-white hover:bg-red-600' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-80'
                   }`}
                >
                   <Trash2 size={16} />
                </button>
              </div>

              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${getStatusColor(g.status)}`}>
                    {g.status.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    {new Date(g.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">{g.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{g.description}</p>
                
                {g.status === 'rejected' && g.actionReason && (
                   <div className="bg-red-50 p-2.5 rounded-lg border border-red-100 mb-4">
                      <span className="text-red-800 text-xs font-bold uppercase tracking-wider block mb-0.5">Declined Reason:</span>
                      <span className="text-red-900 text-xs italic">{g.actionReason}</span>
                   </div>
                )}
                {g.status === 'resolved' && g.actionReason && (
                   <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-100 mb-4">
                      <span className="text-emerald-800 text-xs font-bold uppercase tracking-wider block mb-0.5">Administrative Resolution:</span>
                      <span className="text-emerald-900 text-xs italic">{g.actionReason}</span>
                   </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                     <span className="flex items-center gap-1"><ThumbsUp size={14}/> {g.upvotes?.length || 0}</span>
                     <span className="flex items-center gap-1"><MessageSquare size={14}/> {g.comments?.length || 0}</span>
                  </div>
                  <span className="text-xs font-medium bg-gray-100 px-2 py-1 rounded capitalize">{g.category}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyGrievances;
