import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import {
  AlertTriangle, X, CheckCircle, XCircle, MapPin, Shield
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const SecretaryGrievances = () => {
  const { user } = useContext(AuthContext);
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [action, setAction] = useState(null); // 'resolve' | 'decline'
  const [reason, setReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchGrievances = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/grievances');
      // Only show escalated ones, sort by priority and then date
      const priorityWeight = { 'high': 3, 'medium': 2, 'low': 1, undefined: 0 };
      
      const escalated = res.data.filter(g => g.status === 'escalated' || g.escalatedToHigher);
      escalated.sort((a, b) => {
         const pA = priorityWeight[a.priority] || 0;
         const pB = priorityWeight[b.priority] || 0;
         if (pA !== pB) return pB - pA;
         return new Date(b.createdAt) - new Date(a.createdAt);
      });
      
      setGrievances(escalated);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGrievances(); }, []);

  const closeModal = () => {
    setSelectedGrievance(null);
    setAction(null);
    setReason('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) return;
    setProcessing(true);
    try {
      await axios.put(
        `http://localhost:5000/api/grievances/${selectedGrievance._id}/secretary-action`,
        { action, reason }
      );
      setGrievances(prev => prev.filter(g => g._id !== selectedGrievance._id));
      closeModal();
    } catch (error) {
      alert('Failed to submit decision.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Grievances</h1>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
            <Shield size={14} /> Escalated grievances under {user.localBodyName}
          </p>
        </div>
        <div className="text-center px-4">
          <p className="text-xs text-orange-600 uppercase tracking-wider font-semibold">Pending Action</p>
          <p className="text-3xl font-extrabold text-orange-600">{grievances.length}</p>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      ) : grievances.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
            <CheckCircle size={32} className="text-green-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">All clear!</h3>
          <p className="mt-1 text-gray-500">No escalated grievances require your attention right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {grievances.map(g => (
            <div
              key={g._id}
              onClick={() => { setSelectedGrievance(g); setAction(null); setReason(''); }}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer flex flex-col"
            >
              {/* Image Section */}
              <div className="relative h-48 bg-gray-50 border-b border-gray-100 flex-shrink-0">
                {g.images && g.images.length > 0 ? (
                  <img 
                    src={g.images[0]} 
                    alt="Grievance" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <AlertTriangle size={32} className="mb-2 opacity-50" />
                    <span className="text-xs font-medium uppercase tracking-wider">No Image Provided</span>
                  </div>
                )}
                
                {/* Clean Date Badge */}
                <div className="absolute top-3 right-3 bg-white/95 px-2.5 py-1 rounded shadow-sm border border-gray-100">
                  <span className="text-[11px] font-semibold text-gray-600">
                    {new Date(g.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-orange-100 text-orange-700">
                    Escalated
                  </span>
                  {g.priority && (
                    <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                      g.priority === 'high' ? 'bg-red-50 text-red-700 border border-red-100' :
                      g.priority === 'medium' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                      'bg-blue-50 text-blue-700 border border-blue-100'
                    }`}>
                      {g.priority}
                    </span>
                  )}
                </div>
                
                <h3 className="text-base font-bold text-gray-900 mb-1.5 line-clamp-1">
                  {g.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-4">
                  {g.description}
                </p>

                {g.actionReason && (
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mt-auto mb-4">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Ward Note</span>
                    <span className="text-sm text-gray-700 italic line-clamp-2">"{g.actionReason}"</span>
                  </div>
                )}

                {/* Footer Section */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
                      <span className="text-xs font-bold">
                        {g.createdBy?.name ? g.createdBy.name.charAt(0).toUpperCase() : 'C'}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-gray-900">{g.createdBy?.name || 'Citizen'}</span>
                      <span className="text-[10px] text-gray-500">Ward {g.ward}</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {g.category}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Modal */}
      {selectedGrievance && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[70] flex justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-auto overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10 shadow-sm">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-gray-900">Manage Escalation</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider bg-orange-100 text-orange-800">
                  Escalated
                </span>
                {selectedGrievance.priority && (
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    selectedGrievance.priority === 'high' ? 'bg-red-100 text-red-800 border border-red-200' :
                    selectedGrievance.priority === 'medium' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                    'bg-blue-100 text-blue-800 border border-blue-200'
                  }`}>
                    {selectedGrievance.priority}
                  </span>
                )}
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1 p-6 space-y-6">
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900 mb-2">{selectedGrievance.title}</h2>
                <p className="text-gray-600 text-base leading-relaxed">{selectedGrievance.description}</p>
                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mt-4">
                  <span className="font-medium bg-gray-100 px-3 py-1 rounded-lg capitalize">Category: {selectedGrievance.category}</span>
                  <span>·</span>
                  <span>Posted by <strong>{selectedGrievance.createdBy?.name || 'Citizen'}</strong> (Ward {selectedGrievance.ward})</span>
                </div>
              </div>

              {selectedGrievance.images && selectedGrievance.images.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedGrievance.images.map((img, i) => (
                    <img key={i} src={img} alt="Evidence" className="w-full h-48 object-cover rounded-xl border border-gray-200 shadow-sm" />
                  ))}
                </div>
              )}

              {selectedGrievance.actionReason && (
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                  <span className="text-sm font-bold text-orange-800 uppercase tracking-wider block mb-1">Ward Member's Escalation Note:</span>
                  <span className="text-base text-orange-900 italic font-medium">"{selectedGrievance.actionReason}"</span>
                </div>
              )}

              {/* Decision Section */}
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Final Administrative Decision</h3>
                {!action ? (
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => setAction('resolve')}
                      className="flex-1 py-4 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                      <CheckCircle size={20} /> Mark as Fulfilled
                    </button>
                    <button
                      onClick={() => setAction('decline')}
                      className="flex-1 py-4 bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                      <XCircle size={20} /> Decline Grievance
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-4">
                    <h4 className={`font-bold flex items-center gap-2 ${action === 'resolve' ? 'text-emerald-700' : 'text-red-700'}`}>
                      {action === 'resolve'
                        ? <><CheckCircle size={18} /> Resolution Statement (Shown to Citizen)</>
                        : <><XCircle size={18} /> Decline Reason (Shown to Citizen)</>}
                    </h4>
                    <textarea
                      required rows="3" value={reason}
                      onChange={e => setReason(e.target.value)}
                      placeholder={action === 'resolve' ? "Describe the steps taken to resolve this grievance..." : "Explain why this grievance is being declined..."}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm resize-none"
                    />
                    <div className="flex gap-3">
                      <button type="button" onClick={() => setAction(null)} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                        Back
                      </button>
                      <button
                        type="submit" disabled={processing}
                        className={`flex-1 py-2 rounded-lg font-bold text-white transition-colors ${action === 'resolve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'} ${processing ? 'opacity-60 cursor-not-allowed' : ''}`}
                      >
                        {processing ? 'Processing...' : `Confirm ${action === 'resolve' ? 'Resolution' : 'Decline'}`}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecretaryGrievances;
