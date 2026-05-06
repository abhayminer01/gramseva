import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { PlusCircle, Search, ThumbsUp, MessageSquare, AlertCircle, X, Send, Megaphone } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const CitizenDashboard = () => {
  const { user } = useContext(AuthContext);
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('active');

  const [showModal, setShowModal] = useState(false);
  const [posting, setPosting] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', category: 'water', images: [] });

  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files).slice(0, 3);
    const promises = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            const max = 800;

            if (width > height) {
              if (width > max) { height *= max / width; width = max; }
            } else {
              if (height > max) { width *= max / height; height = max; }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.6));
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      });
    });
    Promise.all(promises).then(base64Images => {
      setFormData(prev => ({ ...prev, images: base64Images }));
    });
  };

  const fetchGrievances = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/grievances');
      setGrievances(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrievances();
  }, []);

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

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    setPosting(true);
    try {
      await axios.post('http://localhost:5000/api/grievances', formData);
      setShowModal(false);
      setFormData({ title: '', description: '', category: 'water', images: [] });
      fetchGrievances();
    } catch(err) {
      alert("Failed to submit grievance. Please try again.");
    } finally {
      setPosting(false);
    }
  };

  const openGrievance = async (g) => {
    setSelectedGrievance(g);
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
    setNewComment('');
  };

  const handleUpvote = async (id, e) => {
    if(e) e.stopPropagation();
    try {
      const res = await axios.post(`http://localhost:5000/api/grievances/${id}/upvote`);
      setGrievances(prev => prev.map(g => g._id === id ? res.data : g));
      if (selectedGrievance && selectedGrievance._id === id) {
        setSelectedGrievance(res.data);
      }
    } catch (error) {
      console.error("Failed to upvote", error);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if(!newComment.trim()) return;
    try {
       const res = await axios.post(`http://localhost:5000/api/grievances/${selectedGrievance._id}/comments`, { message: newComment });
       const resAll = await axios.get(`http://localhost:5000/api/grievances/${selectedGrievance._id}/comments`);
       setComments(resAll.data);
       setNewComment('');
       setGrievances(prev => prev.map(g => g._id === selectedGrievance._id ? {...g, comments: [...(g.comments || []), res.data._id]} : g));
    } catch (error) {
       console.error("Failed to post comment", error);
    }
  };

  const activeGrievances = grievances.filter(g => !['resolved', 'escalated', 'rejected'].includes(g.status));
  const fulfilledGrievances = grievances.filter(g => ['resolved', 'escalated', 'rejected'].includes(g.status));

  const displayGrievances = (activeTab === 'active' ? activeGrievances : fulfilledGrievances)
    .filter(g => filter === 'all' || g.category === filter);

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="w-full sm:w-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Ward Grievances</h1>
          <p className="text-gray-500 text-sm mt-1">Report issues localized to your ward.</p>
        </div>
        <button 
           onClick={() => setShowModal(true)}
           className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-200 active:scale-95"
        >
          <PlusCircle size={20} />
          Report Issue
        </button>
      </div>

      <div className="flex border-b border-gray-200 mt-2 mb-2">
         <button onClick={() => setActiveTab('active')} className={`py-3 px-6 font-bold text-sm border-b-2 transition-colors flex-1 sm:flex-none ${activeTab === 'active' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Active Issues</button>
         <button onClick={() => setActiveTab('fulfilled')} className={`py-3 px-6 font-bold text-sm border-b-2 transition-colors flex-1 sm:flex-none ${activeTab === 'fulfilled' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Fulfilled & Handled</button>
      </div>

      <div className="bg-white p-3 sm:p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-4 justify-between items-center">
        <div className="relative w-full lg:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm outline-none transition-shadow"
            placeholder="Search grievances..."
          />
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <span className="text-sm text-gray-500 font-bold hidden sm:block whitespace-nowrap">Filter By:</span>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full lg:w-auto bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 py-3 pl-3 pr-10 outline-none appearance-none font-bold text-gray-700"
          >
            <option value="all">All Categories</option>
            <option value="water">Water Supply</option>
            <option value="road">Roads</option>
            <option value="electricity">Electricity</option>
            <option value="waste">Waste</option>
            <option value="other">Other Issues</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      ) : displayGrievances.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No grievances found</h3>
          <p className="mt-1 text-gray-500">There are no {activeTab} issues matching your current filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayGrievances.map(g => (
            <div 
              key={g._id} 
              onClick={() => openGrievance(g)}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-1"
            >
              {g.images && g.images.length > 0 ? (
                 <img src={g.images[0]} alt="Grievance" className="w-full h-48 object-cover" />
              ) : (
                 <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                   <span className="text-gray-400 font-medium tracking-wider">NO IMAGE</span>
                 </div>
              )}
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${getStatusColor(g.status)}`}>
                    {g.status.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(g.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">{g.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{g.description}</p>
                
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                   <span className="bg-gray-100 px-2 py-1 rounded-md capitalize">{g.category}</span>
                   <span>·</span>
                   <span>Ward {g.ward}</span>
                </div>

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
                
                {g.status === 'escalated' && (
                   <div className="bg-orange-50 p-2.5 rounded-lg border border-orange-100 mb-4">
                      <span className="text-orange-800 text-xs font-bold uppercase tracking-wider block mb-0.5">Escalated:</span>
                      <span className="text-orange-900 text-xs italic">Forwarded to Municipal Secretary</span>
                   </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <button 
                       onClick={(e) => handleUpvote(g._id, e)} 
                       className={`flex items-center gap-1.5 transition-colors ${g.upvotes?.includes(user?._id) ? 'text-emerald-600' : 'hover:text-emerald-600'}`}
                    >
                      <ThumbsUp size={16} fill={g.upvotes?.includes(user?._id) ? "currentColor" : "none"} /> <span>{g.upvotes?.length || 0}</span>
                    </button>
                    <span className="text-gray-300">|</span>
                    <button className="flex items-center gap-1.5 transition-colors hover:text-blue-600">
                      <MessageSquare size={16} /> <span>{g.comments?.length || 0}</span>
                    </button>
                  </div>
                  <span className="text-xs text-gray-500 font-medium line-clamp-1">{g.createdBy?.name || 'Citizen'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detailed Grievance Modal */}
      {selectedGrievance && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[70] flex justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-auto overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10 shadow-sm">
               <div className="flex items-center gap-3">
                 <h3 className="text-lg font-bold text-gray-900">Issue Details</h3>
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

               <div className="flex gap-4 pt-4 border-t border-gray-100">
                  <button 
                     onClick={(e) => handleUpvote(selectedGrievance._id, e)}
                     disabled={selectedGrievance.createdBy?._id === user?._id}
                     className={`flex-1 py-3 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all ${
                       selectedGrievance.createdBy?._id === user?._id
                       ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                       : selectedGrievance.upvotes?.includes(user?._id) 
                       ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                       : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                     }`}
                  >
                    <ThumbsUp size={20} fill={selectedGrievance.upvotes?.includes(user?._id) ? "currentColor" : "none"} /> 
                    {selectedGrievance.upvotes?.includes(user?._id) ? 'Upvoted' : 'Upvote Issue'} ({selectedGrievance.upvotes?.length || 0})
                  </button>
               </div>

               <div className="pt-6 border-t border-gray-100">
                 <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                   <MessageSquare size={20} className="text-blue-500"/> Community Comments ({comments.length})
                 </h3>
                 
                 {loadingComments ? (
                    <div className="flex justify-center py-6"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div></div>
                 ) : comments.length === 0 ? (
                    <p className="text-gray-500 text-center py-6 bg-gray-50 rounded-xl italic">No comments yet. Be the first to discuss this issue!</p>
                 ) : (
                    <div className="space-y-4">
                      {comments.map(c => (
                         <div key={c._id} className="bg-gray-50 p-4 rounded-xl">
                            <div className="flex justify-between items-start mb-2">
                               <span className="font-bold text-gray-900 text-sm">{c.userId?.name || 'Citizen'}</span>
                               <span className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed">{c.message}</p>
                         </div>
                      ))}
                    </div>
                 )}
               </div>
            </div>

            <div className="p-4 bg-white border-t border-gray-200 sticky bottom-0 z-10">
               {selectedGrievance.createdBy?._id === user?._id ? (
                  <div className="flex justify-center items-center p-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-400 text-sm font-medium">
                     You cannot vote or comment on your own grievance.
                  </div>
               ) : (
                 <form onSubmit={handlePostComment} className="flex gap-3">
                    <input 
                       type="text" 
                       value={newComment}
                       onChange={e => setNewComment(e.target.value)}
                       placeholder="Write a comment..." 
                       className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow text-sm"
                    />
                    <button 
                       type="submit" 
                       disabled={!newComment.trim()}
                       className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-sm"
                    >
                       <Send size={18} /> Send
                    </button>
                 </form>
               )}
            </div>

          </div>
        </div>
      )}

      {/* Report Grievance Modal */}
      {showModal && (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
               <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                  <h3 className="text-lg font-bold text-gray-900">Report Local Issue</h3>
                  <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                     <X size={20} />
                  </button>
               </div>
               <form onSubmit={handlePostSubmit} className="p-6 space-y-4">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Issue Title</label>
                     <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="E.g. Broken pipeline on Main St" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow" />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                     <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow">
                        <option value="water">Water Supply</option>
                        <option value="electricity">Electricity</option>
                        <option value="road">Road & Infrastructure</option>
                        <option value="waste">Waste Management</option>
                        <option value="other">Other</option>
                     </select>
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Description</label>
                     <textarea required rows="4" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Describe the issue, location details, etc." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow resize-none"></textarea>
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Attach Images (Max 3)</label>
                     <input type="file" multiple accept="image/*" onChange={handleImageUpload} disabled={posting} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" />
                     {formData.images && formData.images.length > 0 && (
                        <div className="flex gap-2 mt-3">
                           {formData.images.map((img, i) => (
                              <img key={i} src={img} alt="Preview" className="h-16 w-16 object-cover rounded shadow-sm border border-gray-200" />
                           ))}
                        </div>
                     )}
                  </div>
                  
                  <div className="pt-4 flex gap-3">
                     <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">Cancel</button>
                     <button type="submit" disabled={posting} className={`flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium shadow-sm ${posting ? 'opacity-70 cursor-not-allowed' : ''}`}>
                         {posting ? 'Posting...' : 'Submit Issue'}
                     </button>
                  </div>
               </form>
            </div>
         </div>
      )}
    </div>
  );
};

export default CitizenDashboard;
