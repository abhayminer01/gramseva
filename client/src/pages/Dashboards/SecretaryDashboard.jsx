import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import {
  Users, Shield, Pickaxe, AlertTriangle, CheckCircle, Clock,
  TrendingUp, FileText, XCircle, UserCheck, Activity
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
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-500 rounded-2xl shadow-lg p-8 text-white">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, white 0%, transparent 60%)' }} />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <Shield size={18} className="text-emerald-200" />
            <span className="text-emerald-200 text-sm font-medium uppercase tracking-widest">Secretary Workspace</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Welcome, {user.name}</h1>
          <p className="text-emerald-100 mt-1 text-sm">
            {user.localBodyType} of <span className="font-semibold text-white">{user.localBodyName}</span>, {user.district}
          </p>
        </div>
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10">
          <Activity size={120} strokeWidth={1} />
        </div>
      </div>

      {/* Action Needed Alert */}
      {unapprovedCitizens.length > 0 && (
        <div className="flex items-center gap-4 bg-amber-50 border border-amber-200 rounded-xl px-6 py-4 shadow-sm">
          <div className="bg-amber-100 p-2 rounded-lg">
            <UserCheck size={20} className="text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-amber-900 text-sm">Action Required</p>
            <p className="text-amber-700 text-sm">{unapprovedCitizens.length} citizen registration{unapprovedCitizens.length > 1 ? 's' : ''} awaiting your approval.</p>
          </div>
          <a href="/citizens" className="text-sm font-bold text-amber-700 hover:text-amber-900 underline underline-offset-2 whitespace-nowrap">
            Review Now →
          </a>
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

    </div>
  );
};

export default SecretaryDashboard;
