import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserCheck, Users, Shield, MapPin, AlertTriangle, X, CheckCircle, XCircle } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const SecretaryDashboard = () => {
  const { user } = useContext(AuthContext);
  const [unapprovedCitizens, setUnapprovedCitizens] = useState([]);
  const [approvedCitizens, setApprovedCitizens] = useState([]);
  const [escalatedGrievances, setEscalatedGrievances] = useState([]);
  const [approving, setApproving] = useState(null);

  // Modal State
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [action, setAction] = useState(null); // 'resolve' | 'decline' | null
  const [reason, setReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchData = async () => {
    try {
      const [unapprovedRes, approvedRes, grievanceRes] = await Promise.all([
        axios.get('http://localhost:5000/api/auth/unapproved'),
        axios.get('http://localhost:5000/api/auth/approved'),
        axios.get('http://localhost:5000/api/grievances')
      ]);
      setUnapprovedCitizens(unapprovedRes.data);
      setApprovedCitizens(approvedRes.data);
      setEscalatedGrievances(grievanceRes.data.filter(g => g.status === 'escalated' || g.escalatedToHigher));
    } catch (error) {
      console.error("Failed to fetch data", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user.role]);

  const handleApprove = async (id) => {
    setApproving(id);
    try {
      await axios.put(`http://localhost:5000/api/auth/approve/${id}`);
      fetchData(); // Refresh all lists
    } catch (error) {
      console.error("Failed to approve citizen", error);
    } finally {
      setApproving(null);
    }
  };

  const handleReject = async (id) => {
    if(!window.confirm('Are you sure you want to completely reject this citizen request?')) return;
    setApproving(id);
    try {
      await axios.put(`http://localhost:5000/api/auth/reject/${id}`);
      fetchData(); // Refresh all lists
    } catch (error) {
      console.error("Failed to reject citizen", error);
    } finally {
      setApproving(null);
    }
  };

  const closeGrievance = () => {
    setSelectedGrievance(null);
    setAction(null);
    setReason('');
  };

  const submitSecretaryAction = async (e) => {
    e.preventDefault();
    if (!reason.trim()) return;
    setProcessing(true);
    try {
      await axios.put(`http://localhost:5000/api/grievances/${selectedGrievance._id}/secretary-action`, {
        action: action,
        reason: reason
      });
      // Remove from escalated queue
      setEscalatedGrievances(prev => prev.filter(g => g._id !== selectedGrievance._id));
      closeGrievance();
    } catch (error) {
      alert("Failed to submit secretary decision.");
    } finally {
       setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-100 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-emerald-900">Secretary Workspace</h1>
          <p className="text-emerald-700 text-sm mt-1 flex items-center">
             <Shield size={16} className="mr-1" /> Authorized for {user.localBodyType} of {user.localBodyName}, {user.district}
          </p>
        </div>
        <div className="flex gap-4">
           <div className="text-center px-4 border-r border-gray-200">
             <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Active Citizens</p>
             <p className="text-2xl font-bold text-gray-900">{approvedCitizens.length}</p>
           </div>
           <div className="text-center px-4">
             <p className="text-xs text-yellow-600 uppercase tracking-wider font-semibold">Pending Requests</p>
             <p className="text-2xl font-bold text-yellow-600">{unapprovedCitizens.length}</p>
           </div>
        </div>
      </div>

      {unapprovedCitizens.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-yellow-200 mt-6 overflow-hidden">
          <div className="p-6 border-b border-yellow-100 bg-yellow-50">
            <h2 className="text-lg font-bold text-yellow-900 flex items-center">
               <UserCheck className="mr-2 text-yellow-600" size={20} />
               Action Required: Citizen Approvals ({unapprovedCitizens.length})
            </h2>
            <p className="text-sm text-yellow-700 mt-1">Review and approve access for incoming citizens within your municipality boundary.</p>
          </div>
          <div className="overflow-x-auto">
             <table className="min-w-full divide-y divide-gray-200">
               <thead className="bg-white">
                 <tr>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Citizen Details</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ration Card</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                   <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                 </tr>
               </thead>
               <tbody className="bg-white divide-y divide-gray-200">
                 {unapprovedCitizens.map(citizen => (
                    <tr key={citizen._id} className="hover:bg-gray-50">
                       <td className="px-6 py-4 whitespace-nowrap">
                         <div className="text-sm font-medium text-gray-900">{citizen.name}</div>
                         <div className="text-sm text-gray-500">{citizen.phone}</div>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                         <div className="text-sm font-mono text-gray-700 font-medium">
                            {citizen.rationCardNumber || 'No Data'}
                         </div>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                         <div className="flex items-center text-sm text-gray-900">
                            <MapPin size={14} className="text-gray-400 mr-1" />
                            {citizen.district} / {citizen.localBodyName}
                         </div>
                         {citizen.wardNumber && <div className="text-xs text-gray-500 ml-4 font-mono mt-1">Ward {citizen.wardNumber}</div>}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                         <div className="flex justify-end gap-2">
                           <button 
                             onClick={() => handleReject(citizen._id)}
                             disabled={approving === citizen._id}
                             className="inline-flex items-center px-4 py-2 border border-red-200 rounded-md shadow-sm text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                           >
                             Reject
                           </button>
                           <button 
                             onClick={() => handleApprove(citizen._id)}
                             disabled={approving === citizen._id}
                             className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
                           >
                             {approving === citizen._id ? 'Processing...' : 'Approve Access'}
                           </button>
                         </div>
                       </td>
                    </tr>
                 ))}
               </tbody>
             </table>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-6 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 flex items-center">
             <Users className="mr-2 text-gray-500" size={20} />
             Registered Citizens Directory
          </h2>
          <p className="text-sm text-gray-500 mt-1">Full list of active citizens approved under {user.localBodyName}.</p>
        </div>
        <div className="overflow-x-auto">
             <table className="min-w-full divide-y divide-gray-200">
               <thead className="bg-gray-50">
                 <tr>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Citizen</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ward Mapping</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                 </tr>
               </thead>
               <tbody className="bg-white divide-y divide-gray-200">
                 {approvedCitizens.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="px-6 py-8 text-center text-sm text-gray-500">
                        No approved citizens found in your jurisdiction.
                      </td>
                    </tr>
                 ) : (
                   approvedCitizens.map(citizen => (
                      <tr key={citizen._id} className="hover:bg-gray-50">
                         <td className="px-6 py-4 whitespace-nowrap">
                           <div className="text-sm font-medium text-gray-900">{citizen.name}</div>
                           <div className="text-sm text-gray-500">{citizen.phone}</div>
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap">
                           {citizen.wardNumber ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800">
                                Ward {citizen.wardNumber}
                              </span>
                           ) : (
                              <span className="text-sm text-gray-400 italic">Unassigned</span>
                           )}
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap">
                           <span className="inline-flex items-center text-sm font-medium text-emerald-600">
                              Active Member
                           </span>
                         </td>
                      </tr>
                   ))
                 )}
               </tbody>
             </table>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-orange-200 mt-6 overflow-hidden">
        <div className="p-6 border-b border-orange-100 bg-orange-50">
          <h2 className="text-lg font-bold text-orange-900 flex items-center">
             <AlertTriangle className="mr-2 text-orange-600" size={20} />
             Escalated Ward Grievances ({escalatedGrievances.length})
          </h2>
          <p className="text-sm text-orange-700 mt-1">Grievances forwarded by Ward Members that require your attention to finalize and fulfil.</p>
        </div>
        <div className="p-6">
           {escalatedGrievances.length === 0 ? (
             <div className="text-center py-8 text-gray-500">No grievances have been escalated to you recently.</div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {escalatedGrievances.map(g => (
                   <div 
                      key={g._id} 
                      onClick={() => {
                         setSelectedGrievance(g);
                         setAction(null);
                         setReason('');
                      }} 
                      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-1"
                   >
                      {g.images && g.images.length > 0 ? (
                         <img src={g.images[0]} alt="Grievance" className="w-full h-40 object-cover" />
                      ) : (
                         <div className="w-full h-40 bg-gray-100 flex items-center justify-center border-b border-gray-100">
                           <span className="text-gray-400 font-medium tracking-wider text-sm">NO IMAGE</span>
                         </div>
                      )}
                      <div className="p-5">
                         <div className="flex justify-between items-start mb-2">
                           <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-100 text-orange-800">
                             ESCALATED
                           </span>
                           <span className="text-xs text-gray-500">{new Date(g.createdAt).toLocaleDateString()}</span>
                         </div>
                         <h3 className="text-lg font-bold text-gray-900 mb-1">{g.title}</h3>
                         <p className="text-gray-600 text-sm mb-4 line-clamp-2">{g.description}</p>
                         
                         <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 mb-4">
                            <span className="text-xs font-bold text-orange-800 uppercase tracking-wider block mb-1">Ward Member Note:</span>
                            <span className="text-sm text-orange-900 italic">"{g.actionReason || 'No reason provided.'}"</span>
                         </div>

                         <div className="flex items-center gap-2 text-xs text-gray-500 pt-3 border-t border-gray-100">
                            <span className="bg-gray-100 px-2 py-1 rounded capitalize">{g.category}</span>
                            <span>·</span>
                            <span>Ward {g.ward}</span>
                            <span>·</span>
                            <span className="font-medium">{g.createdBy?.name || 'Citizen'}</span>
                         </div>
                      </div>
                   </div>
                ))}
             </div>
           )}
        </div>
      </div>

      {/* Detailed Grievance Modal strictly for Secretary Actions */}
      {selectedGrievance && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[70] flex justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-auto overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10 shadow-sm">
               <div className="flex items-center gap-3">
                 <h3 className="text-lg font-bold text-gray-900">Manage Escalation</h3>
                 <span className="px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider bg-orange-100 text-orange-800">
                   ESCALATED
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
                     <span>Posted by {selectedGrievance.createdBy?.name || 'Citizen'} (Ward {selectedGrievance.ward})</span>
                 </div>
               </div>

               {selectedGrievance.images && selectedGrievance.images.length > 0 && (
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                   {selectedGrievance.images.map((img, i) => (
                      <img key={i} src={img} alt="Evidence" className="w-full h-48 object-cover rounded-xl border border-gray-200 shadow-sm" />
                   ))}
                 </div>
               )}

               <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                  <span className="text-sm font-bold text-orange-800 uppercase tracking-wider block mb-1">Ward Member's Escalation Note:</span>
                  <span className="text-base text-orange-900 italic font-medium">"{selectedGrievance.actionReason || 'No reason provided.'}"</span>
               </div>

               <div className="pt-6 border-t border-gray-100">
                 <h3 className="text-lg font-bold text-gray-900 mb-4">Final Administrative Decision</h3>
                 {!action ? (
                    <div className="flex flex-col sm:flex-row gap-4">
                       <button 
                          onClick={() => setAction('resolve')}
                          className="flex-1 py-4 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
                       >
                          <CheckCircle size={20} /> Mark as Fulfilled & Finalized
                       </button>
                       <button 
                          onClick={() => setAction('decline')}
                          className="flex-1 py-4 bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
                       >
                          <XCircle size={20} /> Decline Grievance
                       </button>
                    </div>
                 ) : (
                    <form onSubmit={submitSecretaryAction} className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
                       <h4 className={`font-bold mb-2 flex items-center gap-2 ${action === 'resolve' ? 'text-emerald-700' : 'text-red-700'}`}>
                          {action === 'resolve' ? <><CheckCircle size={18}/> Closing Statement (Displayed to Citizen)</> : <><XCircle size={18}/> Declining Reason (Displayed to Citizen)</>}
                       </h4>
                       <textarea 
                          required
                          rows="3"
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          placeholder={action === 'resolve' ? "Detail the steps taken to fulfill and resolve this grievance..." : "Explain administratively why this grievance was fully declined..."}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow text-sm resize-none mb-4"
                       ></textarea>
                       <div className="flex gap-3">
                          <button type="button" onClick={() => setAction(null)} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">Cancel</button>
                          <button type="submit" disabled={processing} className={`flex-1 py-2 rounded-lg font-bold text-white transition-colors flex justify-center items-center ${action === 'resolve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'} ${processing ? 'opacity-70 cursor-not-allowed' : ''}`}>
                             {processing ? 'Processing...' : `Confirm ${action === 'resolve' ? 'Fulfillment' : 'Decline'}`}
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

export default SecretaryDashboard;
