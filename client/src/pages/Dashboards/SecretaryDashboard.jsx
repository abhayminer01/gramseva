import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import {
  Users, Shield, Pickaxe, AlertTriangle, CheckCircle, Clock,
  TrendingUp, FileText, XCircle, UserCheck, Activity, Megaphone, X
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const StatCard = ({ icon, label, value, color, bg, border, sub }) => (
  <div className={`bg-white rounded-xl border ${border} shadow-sm p-6 flex items-start gap-4 hover:shadow-md transition-shadow`}>
    <div className={`${bg} p-3 rounded-xl flex-shrink-0`}>
      {React.cloneElement(icon, { size: 24, className: color })}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className={`text-3xl font-extrabold mt-1 ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  </div>
);

const SecretaryDashboard = () => {
  const { user } = useContext(AuthContext);

  const [unapprovedCitizens, setUnapprovedCitizens] = useState([]);
  const [approvedCitizens, setApprovedCitizens] = useState([]);
  const [escalatedGrievances, setEscalatedGrievances] = useState([]);
  const [mgnregaRequests, setMgnregaRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAnnounceModal, setShowAnnounceModal] = useState(false);
  const [announceForm, setAnnounceForm] = useState({ title: '', content: '', type: 'announcement', targetAudience: 'all' });
  const [postingAnnounce, setPostingAnnounce] = useState(false);

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    setPostingAnnounce(true);
    try {
      await axios.post('http://localhost:5000/api/announcements', announceForm);
      setShowAnnounceModal(false);
      setAnnounceForm({ title: '', content: '', type: 'announcement', targetAudience: 'all' });
      alert("Announcement published successfully!");
    } catch (err) {
      alert("Failed to publish announcement");
    } finally {
      setPostingAnnounce(false);
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [unapprovedRes, approvedRes, grievanceRes, mgnregaRes] = await Promise.all([
          axios.get('http://localhost:5000/api/auth/unapproved'),
          axios.get('http://localhost:5000/api/auth/approved'),
          axios.get('http://localhost:5000/api/grievances'),
          axios.get('http://localhost:5000/api/mgnrega'),
        ]);
        setUnapprovedCitizens(unapprovedRes.data);
        setApprovedCitizens(approvedRes.data);
        setEscalatedGrievances(grievanceRes.data.filter(g => g.status === 'escalated' || g.escalatedToHigher));
        setMgnregaRequests(mgnregaRes.data);
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const pendingMgnrega = mgnregaRequests.filter(r => r.status === 'pending').length;
  const approvedMgnrega = mgnregaRequests.filter(r => r.status === 'approved').length;
  const rejectedMgnrega = mgnregaRequests.filter(r => r.status === 'rejected').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-500 rounded-3xl shadow-lg p-6 sm:p-10 text-white">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, white 0%, transparent 60%)' }} />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-emerald-200" />
              <span className="text-emerald-200 text-[10px] font-bold uppercase tracking-[0.2em]">Administrative Suite</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Welcome, {user.name}</h1>
            <p className="text-emerald-50/80 text-sm sm:text-base font-medium max-w-lg">
              Authorized Secretary of <span className="text-white font-bold underline decoration-emerald-400 underline-offset-4">{user.localBodyName}</span>. Manage community growth and requests.
            </p>
          </div>
          <button 
             onClick={() => setShowAnnounceModal(true)}
             className="w-full lg:w-auto inline-flex items-center justify-center gap-2 bg-white text-emerald-700 px-6 py-4 rounded-2xl font-bold transition-all shadow-xl hover:bg-emerald-50 active:scale-95"
          >
            <Megaphone size={20} />
            Publish Alert
          </button>
        </div>
        <div className="absolute right-8 bottom-0 translate-y-1/3 opacity-10 hidden lg:block">
          <Activity size={180} strokeWidth={1} />
        </div>
      </div>

      {/* Action Needed Alert */}
      {unapprovedCitizens.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-amber-50 border border-amber-200 rounded-2xl px-6 py-5 shadow-sm">
          <div className="bg-amber-100 p-3 rounded-xl">
            <UserCheck size={24} className="text-amber-600" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="font-bold text-amber-900 text-sm">Action Required</p>
            <p className="text-amber-700 text-xs sm:text-sm mt-0.5">{unapprovedCitizens.length} citizen registration{unapprovedCitizens.length > 1 ? 's' : ''} awaiting your approval.</p>
          </div>
          <Link to="/citizens" className="w-full sm:w-auto text-center px-6 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-bold shadow-md shadow-amber-200">
            Review Now
          </Link>
        </div>
      )}

      {/* KPI Grid */}
      <div>
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Citizen Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Users />}
            label="Active Citizens"
            value={approvedCitizens.length}
            color="text-emerald-600"
            bg="bg-emerald-50"
            border="border-emerald-100"
            sub="Registered & approved"
          />
          <StatCard
            icon={<UserCheck />}
            label="Awaiting Approval"
            value={unapprovedCitizens.length}
            color="text-amber-600"
            bg="bg-amber-50"
            border="border-amber-100"
            sub="New registrations"
          />
          <StatCard
            icon={<AlertTriangle />}
            label="Escalated Grievances"
            value={escalatedGrievances.length}
            color="text-orange-600"
            bg="bg-orange-50"
            border="border-orange-100"
            sub="Forwarded by Ward Members"
          />
          <StatCard
            icon={<FileText />}
            label="MGNREGA Requests"
            value={mgnregaRequests.length}
            color="text-blue-600"
            bg="bg-blue-50"
            border="border-blue-100"
            sub="Total submitted"
          />
        </div>
      </div>

      {/* MGNREGA Breakdown */}
      <div>
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">MGNREGA Breakdown</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            icon={<Clock />}
            label="Pending Review"
            value={pendingMgnrega}
            color="text-yellow-600"
            bg="bg-yellow-50"
            border="border-yellow-100"
          />
          <StatCard
            icon={<CheckCircle />}
            label="Approved"
            value={approvedMgnrega}
            color="text-emerald-600"
            bg="bg-emerald-50"
            border="border-emerald-100"
          />
          <StatCard
            icon={<XCircle />}
            label="Rejected"
            value={rejectedMgnrega}
            color="text-red-600"
            bg="bg-red-50"
            border="border-red-100"
          />
        </div>
      </div>

      {/* Recent Escalated Grievances preview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Recent Escalations</h2>
          <a href="/grievances" className="text-sm font-semibold text-emerald-600 hover:text-emerald-800 transition-colors">
            View All →
          </a>
        </div>
        {escalatedGrievances.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm">
            <TrendingUp size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm">No escalated grievances at this time.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-orange-100 shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-100">
              {escalatedGrievances.slice(0, 5).map(g => (
                <div key={g._id} className="flex items-center gap-4 px-6 py-4 hover:bg-orange-50 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{g.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Ward {g.ward} · {g.createdBy?.name || 'Citizen'} · {new Date(g.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-orange-100 text-orange-800 whitespace-nowrap">
                    Escalated
                  </span>
                </div>
              ))}
            </div>
            {escalatedGrievances.length > 5 && (
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-center">
                <a href="/grievances" className="text-sm text-emerald-600 font-semibold hover:text-emerald-800">
                  +{escalatedGrievances.length - 5} more — View all grievances
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {showAnnounceModal && (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
               <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Megaphone size={18} className="text-emerald-600"/> New Announcement</h3>
                  <button onClick={() => setShowAnnounceModal(false)} className="text-gray-400 hover:text-gray-600">
                     <X size={20} />
                  </button>
               </div>
               <form onSubmit={handlePostAnnouncement} className="p-6 space-y-4">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                     <input required type="text" value={announceForm.title} onChange={e => setAnnounceForm({...announceForm, title: e.target.value})} placeholder="E.g. Water supply interruption" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow" />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                     <select value={announceForm.type} onChange={e => setAnnounceForm({...announceForm, type: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow">
                        <option value="announcement">General Announcement</option>
                        <option value="notification">Critical Notification</option>
                     </select>
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                     <select value={announceForm.targetAudience} onChange={e => setAnnounceForm({...announceForm, targetAudience: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow">
                        <option value="all">Entire Local Body (All Wards)</option>
                        <option value="ward_specific">Specific Ward (Type Below)</option>
                     </select>
                     {announceForm.targetAudience !== 'all' && (
                        <input required type="text" onChange={e => setAnnounceForm({...announceForm, targetAudience: e.target.value})} placeholder="Ward Number" className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow" />
                     )}
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Message Content</label>
                     <textarea required rows="4" value={announceForm.content} onChange={e => setAnnounceForm({...announceForm, content: e.target.value})} placeholder="Provide details here. This message will auto-expire after 10 days." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow resize-none"></textarea>
                  </div>
                  
                  <div className="pt-4 flex gap-3">
                     <button type="button" onClick={() => setShowAnnounceModal(false)} className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">Cancel</button>
                     <button type="submit" disabled={postingAnnounce} className={`flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium shadow-sm ${postingAnnounce ? 'opacity-70 cursor-not-allowed' : ''}`}>
                         {postingAnnounce ? 'Publishing...' : 'Publish'}
                     </button>
                  </div>
               </form>
            </div>
         </div>
      )}

    </div>
  );
};

export default SecretaryDashboard;
