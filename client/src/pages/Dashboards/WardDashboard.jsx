import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { FileText, Clock, CheckCircle, AlertTriangle, Map, ThumbsUp, MessageSquare, AlertCircle, X, Send, ArrowRight, XCircle } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const WardDashboard = () => {
  const { user } = useContext(AuthContext);
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    total: 0, pending: 0, inProgress: 0, resolved: 0, escalated: 0
  });

  // Modal State
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  
  // Triage State
  const [triageAction, setTriageAction] = useState(null); // 'forward' | 'decline' | null
  const [triageReason, setTriageReason] = useState('');
  const [triaging, setTriaging] = useState(false);

  useEffect(() => {
    const fetchGrievances = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/grievances');
        const data = res.data;
        
        setGrievances(data);

        setStats({
          total: data.length,
          pending: data.filter(g => g.status === 'pending').length,
          inProgress: data.filter(g => g.status === 'in_progress').length,
          resolved: data.filter(g => g.status === 'resolved').length,
          escalated: data.filter(g => g.status === 'escalated').length,
        });
      } catch (error) {
        console.error("Failed to fetch grievances", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGrievances();
  }, [user]);

  const statCards = [
    { title: 'Total Ward Grievances', value: stats.total, icon: <FileText size={24} className="text-blue-500" />, bg: 'bg-blue-50' },
    { title: 'Pending Attention', value: stats.pending, icon: <Clock size={24} className="text-yellow-500" />, bg: 'bg-yellow-50' },
    { title: 'Resolved Issues', value: stats.resolved, icon: <CheckCircle size={24} className="text-green-500" />, bg: 'bg-green-50' },
    { title: 'Escalated', value: stats.escalated, icon: <AlertTriangle size={24} className="text-red-500" />, bg: 'bg-red-50' },
  ];

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

  const openGrievance = async (g) => {
    setSelectedGrievance(g);
    setTriageAction(null);
    setTriageReason('');
    setLoadingComments(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/grievances/${g._id}/comments`);
      setComments(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingComments(false);
    }
  };

  const closeGrievance = () => {
    setSelectedGrievance(null);
    setComments([]);
    setTriageAction(null);
    setTriageReason('');
  };

  const submitTriage = async (e) => {
    e.preventDefault();
    if (!triageReason.trim()) return;
    setTriaging(true);
    try {
      const res = await axios.put(`http://localhost:5000/api/grievances/${selectedGrievance._id}/triage`, {
        action: triageAction,
        reason: triageReason
      });
      // Replace in local list 
      setGrievances(prev => prev.map(g => g._id === selectedGrievance._id ? res.data : g));
      closeGrievance();
    } catch (error) {
      alert("Failed to submit triage decision.");
    } finally {
       setTriaging(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ward Member Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1 flex items-center">
            <Map size={16} className="mr-1" /> Monitoring Ward {user.wardNumber} in {user.localBodyName}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">{card.title}</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{card.value}</h3>
            </div>
            <div className={`w-12 h-12 rounded-full ${card.bg} flex items-center justify-center`}>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-6 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Ward Feed</h2>
        
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : grievances.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No grievances in this ward</h3>
            <p className="mt-1 text-gray-500">Citizens in Ward {user.wardNumber} haven't reported any issues yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-4">
            {grievances.map(g => (
              <div 
                 key={g._id} 
                 onClick={() => openGrievance(g)}
                 className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-1"
               >
                {g.images && g.images.length > 0 ? (
                   <img src={g.images[0]} alt="Grievance" className="w-full h-40 object-cover" />
                ) : (
                   <div className="w-full h-40 bg-gray-100 flex items-center justify-center border-b border-gray-100">
                     <span className="text-gray-400 font-medium tracking-wider text-sm">NO IMAGE</span>
                   </div>
                )}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${getStatusColor(g.status)}`}>
                      {g.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">
                      {new Date(g.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-md font-bold text-gray-900 mb-1 line-clamp-1">{g.title}</h3>
                  <p className="text-gray-600 text-xs mb-3 line-clamp-2">{g.description}</p>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                     <span className="bg-gray-100 px-2 py-1 rounded capitalize border border-gray-200">{g.category}</span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <ThumbsUp size={14} className="text-gray-400" /> <span>{g.upvotes?.length || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare size={14} className="text-gray-400" /> <span>{g.comments?.length || 0}</span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 font-medium line-clamp-1">{g.createdBy?.name || 'Citizen'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detailed Grievance Modal strictly for Ward Member Actions */}
      {selectedGrievance && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[70] flex justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-auto overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10 shadow-sm">
               <div className="flex items-center gap-3">
                 <h3 className="text-lg font-bold text-gray-900">Issue Details (Ward View)</h3>
                 <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider ${getStatusColor(selectedGrievance.status)}`}>
                   {selectedGrievance.status.replace('_', ' ')}
                 </span>
               </div>
               <button onClick={closeGrievance} className="text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors">
                  <X size={20} />
               </button>
            </div>
            
            <div className="overflow-y-auto flex-1 p-6 space-y-6">
               <div>
                 <h2 className="text-2xl font-extrabold text-gray-900 mb-2">{selectedGrievance.title}</h2>
                 <p className="text-gray-600 text-base leading-relaxed">{selectedGrievance.description}</p>
                 <div className="flex items-center gap-2 text-sm text-gray-500 mt-4">
                     <span className="font-medium bg-gray-100 px-3 py-1 rounded-lg capitalize">Category: {selectedGrievance.category}</span>
                     <span>·</span>
                     <span>Posted by {selectedGrievance.createdBy?.name || 'Citizen'} on {new Date(selectedGrievance.createdAt).toLocaleDateString()}</span>
                 </div>
               </div>

               {selectedGrievance.images && selectedGrievance.images.length > 0 && (
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                   {selectedGrievance.images.map((img, i) => (
                      <img key={i} src={img} alt="Evidence" className="w-full h-48 object-cover rounded-xl border border-gray-200 shadow-sm" />
                   ))}
                 </div>
               )}

               {/* Triage Action Form */}
               {selectedGrievance.status === 'pending' || selectedGrievance.status === 'accepted' ? (
                  <div className="pt-6 border-t border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Authority Decision</h3>
                    {!triageAction ? (
                       <div className="flex gap-4">
                          <button 
                             onClick={() => setTriageAction('forward')}
                             className="flex-1 py-4 bg-orange-50 border border-orange-200 text-orange-700 hover:bg-orange-100 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
                          >
                             <ArrowRight size={20} /> Forward to Secretary
                          </button>
                          <button 
                             onClick={() => setTriageAction('decline')}
                             className="flex-1 py-4 bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
                          >
                             <XCircle size={20} /> Decline Grievance
                          </button>
                       </div>
                    ) : (
                       <form onSubmit={submitTriage} className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
                          <h4 className={`font-bold mb-2 flex items-center gap-2 ${triageAction === 'forward' ? 'text-orange-700' : 'text-red-700'}`}>
                             {triageAction === 'forward' ? <><ArrowRight size={18}/> Providing note for Secretary</> : <><XCircle size={18}/> Providing reason for Decline</>}
                          </h4>
                          <textarea 
                             required
                             rows="3"
                             value={triageReason}
                             onChange={(e) => setTriageReason(e.target.value)}
                             placeholder={triageAction === 'forward' ? "Explain why this requires Secretary intervention..." : "Explain to the citizen why this is invalid..."}
                             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow text-sm resize-none mb-4"
                          ></textarea>
                          <div className="flex gap-3">
                             <button type="button" onClick={() => setTriageAction(null)} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">Cancel</button>
                             <button type="submit" disabled={triaging} className={`flex-1 py-2 rounded-lg font-bold text-white transition-colors flex justify-center items-center ${triageAction === 'forward' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-red-600 hover:bg-red-700'} ${triaging ? 'opacity-70 cursor-not-allowed' : ''}`}>
                                {triaging ? 'Processing...' : `Confirm ${triageAction === 'forward' ? 'Escalation' : 'Decline'}`}
                             </button>
                          </div>
                       </form>
                    )}
                  </div>
               ) : (
                  <div className="pt-6 border-t border-gray-100">
                     <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <p className="font-semibold text-gray-700 mb-1">Status: {selectedGrievance.status.toUpperCase()}</p>
                        {selectedGrievance.actionReason && (
                           <p className="text-gray-600 text-sm">Note: {selectedGrievance.actionReason}</p>
                        )}
                     </div>
                  </div>
               )}

               <div className="pt-6 border-t border-gray-100">
                 <h3 className="text-md font-bold text-gray-900 mb-4 flex items-center gap-2">
                   <MessageSquare size={18} className="text-gray-500"/> Community Comments ({comments.length})
                 </h3>
                 
                 {loadingComments ? (
                    <div className="flex justify-center py-4"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div></div>
                 ) : comments.length === 0 ? (
                    <p className="text-gray-500 text-center py-4 bg-gray-50 rounded-xl text-sm italic">No comments yet.</p>
                 ) : (
                    <div className="space-y-3">
                      {comments.map(c => (
                         <div key={c._id} className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex justify-between items-start mb-1.5">
                               <span className="font-bold text-gray-900 text-xs">{c.userId?.name || 'Citizen'}</span>
                               <span className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed">{c.message}</p>
                         </div>
                      ))}
                    </div>
                 )}
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WardDashboard;
