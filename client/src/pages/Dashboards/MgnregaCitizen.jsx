import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Pickaxe, Image as ImageIcon, MapPin, X, Trash2, CheckCircle } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const MgnregaCitizen = () => {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');

  const [showModal, setShowModal] = useState(false);
  const [posting, setPosting] = useState(false);
  const [formData, setFormData] = useState({ title: '', location: '', images: [] });

  const fetchRequests = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/mgnrega');
      setRequests(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

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
            canvas.getContext('2d').drawImage(img, 0, 0, width, height);
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

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    setPosting(true);
    try {
      await axios.post('http://localhost:5000/api/mgnrega', formData);
      setShowModal(false);
      setFormData({ title: '', location: '', images: [] });
      fetchRequests();
    } catch (err) {
      alert("Failed to submit request. Please try again.");
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this request?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/mgnrega/${id}`);
      setRequests(prev => prev.filter(r => r._id !== id));
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete request.");
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'forwarded': return 'bg-orange-100 text-orange-800';
      case 'approved': return 'bg-emerald-100 text-emerald-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const activeRequests = requests.filter(r => r.status === 'pending' || r.status === 'forwarded');
  const approvedRequests = requests.filter(r => r.status === 'approved');
  const rejectedRequests = requests.filter(r => r.status === 'rejected');
  const displayRequests = activeTab === 'active' ? activeRequests : activeTab === 'approved' ? approvedRequests : rejectedRequests;

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">MGNREGA Services</h1>
          <p className="text-gray-500 text-sm mt-1">Request work or submit land development proposals under MGNREGA.</p>
        </div>
        <button
           onClick={() => setShowModal(true)}
           className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Pickaxe size={20} />
          Create Request
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('active')}
          className={`py-3 px-6 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'active' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          My Requests
          {activeRequests.length > 0 && (
            <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-0.5 rounded-full">{activeRequests.length}</span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('approved')}
          className={`py-3 px-6 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'approved' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <CheckCircle size={16} />
          Approved
          {approvedRequests.length > 0 && (
            <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">{approvedRequests.length}</span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('rejected')}
          className={`py-3 px-6 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'rejected' ? 'border-red-500 text-red-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Rejected
          {rejectedRequests.length > 0 && (
            <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">{rejectedRequests.length}</span>
          )}
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      ) : displayRequests.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            {activeTab === 'approved'
              ? <CheckCircle size={32} className="text-gray-300" />
              : activeTab === 'rejected'
              ? <span className="text-2xl">🚫</span>
              : <Pickaxe size={32} className="text-gray-400" />}
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            {activeTab === 'approved' ? 'No Approved Requests Yet' : activeTab === 'rejected' ? 'No Rejected Requests' : 'No MGNREGA Requests'}
          </h3>
          <p className="mt-1 text-gray-500">
            {activeTab === 'approved'
              ? 'Approved requests will appear here once the Secretary reviews them.'
              : activeTab === 'rejected'
              ? 'None of your requests have been rejected.'
              : "You haven't submitted any requests yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayRequests.map(req => (
            <div key={req._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              {req.images && req.images.length > 0 ? (
                <img src={req.images[0]} alt="Work location" className="w-full h-48 object-cover" />
              ) : (
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                  <ImageIcon size={32} className="text-gray-300" />
                </div>
              )}
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${getStatusColor(req.status)}`}>
                    {req.status}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{req.title}</h3>
                <div className="flex items-center text-sm text-gray-600 mb-4 bg-gray-50 p-2 rounded-lg">
                  <MapPin size={16} className="mr-1.5 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{req.location}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  {req.reviewedBy ? (
                    <div className="text-xs text-gray-500">
                      Reviewed by: <span className="font-medium text-gray-700">{req.reviewedBy.name}</span>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 italic">Awaiting review</div>
                  )}
                  {req.status === 'pending' && (
                    <button
                      onClick={() => handleDelete(req._id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      title="Delete Request"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Request Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-emerald-50">
              <h3 className="text-lg font-bold text-emerald-900 flex items-center gap-2">
                <Pickaxe size={20} className="text-emerald-600" />
                New Request
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handlePostSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Request Title / Work Title</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="E.g. Land Levelling at Plot 45" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exact Location / Details</label>
                <textarea required rows="3" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="Provide physical address or clear landmarks" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow resize-none"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attach Area Images (Max 3)</label>
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
                <button type="submit" disabled={posting} className={`flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium shadow-sm flex justify-center items-center gap-2 ${posting ? 'opacity-70 cursor-not-allowed' : ''}`}>
                  {posting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MgnregaCitizen;
