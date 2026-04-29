import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { FileText, Clock, CheckCircle, AlertTriangle, Building, ShieldCheck } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const HigherAuthorityDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    total: 0, pending: 0, inProgress: 0, resolved: 0, escalated: 0
  });

  const [escalatedGrievances, setEscalatedGrievances] = useState([]);
  const [escalatedMgnrega, setEscalatedMgnrega] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [grievanceRes, mgnregaRes] = await Promise.all([
           axios.get('http://localhost:5000/api/grievances'),
           axios.get('http://localhost:5000/api/mgnrega')
        ]);
        
        const gData = grievanceRes.data;
        const mData = mgnregaRes.data;

        // Escalated Grievances
        const eGrievances = gData.filter(g => g.status === 'escalated' || g.escalatedToHigher);
        setEscalatedGrievances(eGrievances);

        // Auto-escalated MGNREGA requests (pending > 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const eMgnrega = mData.filter(r => r.status === 'pending' && new Date(r.createdAt) < sevenDaysAgo);
        setEscalatedMgnrega(eMgnrega);

        setStats({
          total: gData.length,
          pending: gData.filter(g => g.status === 'pending').length,
          inProgress: gData.filter(g => g.status === 'in_progress').length,
          resolved: gData.filter(g => g.status === 'resolved').length,
          escalated: eGrievances.length,
        });
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { title: 'Total System Grievances', value: stats.total, icon: <FileText size={24} className="text-purple-500" />, bg: 'bg-purple-50' },
    { title: 'System-wide Escalations', value: stats.escalated, icon: <AlertTriangle size={24} className="text-red-500" />, bg: 'bg-red-50' },
    { title: 'Global Resolution Rate', value: stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) + '%' : '0%', icon: <CheckCircle size={24} className="text-emerald-500" />, bg: 'bg-emerald-50' },
    { title: 'Active Local Bodies', value: 142, icon: <Building size={24} className="text-blue-500" />, bg: 'bg-blue-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-purple-900 text-white p-6 rounded-xl shadow-md border border-purple-800 mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">State Command Center</h1>
          <p className="text-purple-200 text-sm mt-1 flex items-center">
            <ShieldCheck size={16} className="mr-1" /> Higher Authority System Oversight
          </p>
        </div>
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

      {loading ? (
         <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-b-2 border-purple-600 rounded-full"></div></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-6 p-6">
             <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><AlertTriangle size={20} className="text-red-500"/> Escalated Grievances</h2>
             {escalatedGrievances.length === 0 ? (
               <p className="text-gray-500 italic text-sm text-center py-8">No escalated grievances.</p>
             ) : (
               <div className="space-y-4">
                  {escalatedGrievances.map(g => (
                     <div key={g._id} className="border border-red-100 bg-red-50/30 p-4 rounded-xl">
                        <div className="flex justify-between items-start mb-1">
                           <span className="font-bold text-gray-900 text-sm line-clamp-1">{g.title}</span>
                           <span className="text-xs text-gray-500 whitespace-nowrap">{new Date(g.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-gray-600 mb-2"><strong>Category:</strong> {g.category} {g.priority && <span className="ml-1 uppercase text-red-600 font-bold">({g.priority} P)</span>}</p>
                        <div className="bg-white p-2 rounded-lg border border-red-50 text-xs">
                           <p className="font-semibold text-gray-700">Local Body Breakdown:</p>
                           <p className="text-gray-500">District: {g.district}</p>
                           <p className="text-gray-500">{g.localBodyType}: {g.localBodyName} (Ward {g.ward || 'N/A'})</p>
                           {g.actionReason && <p className="text-red-700 mt-1"><i>Note: {g.actionReason}</i></p>}
                        </div>
                     </div>
                  ))}
               </div>
             )}
           </div>

           <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-6 p-6">
             <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Clock size={20} className="text-orange-500"/> SLA Breached MGNREGA (&gt;7 Days)</h2>
             {escalatedMgnrega.length === 0 ? (
               <p className="text-gray-500 italic text-sm text-center py-8">No SLA breached applications.</p>
             ) : (
               <div className="space-y-4">
                  {escalatedMgnrega.map(m => (
                     <div key={m._id} className="border border-orange-100 bg-orange-50/30 p-4 rounded-xl">
                        <div className="flex justify-between items-start mb-1">
                           <span className="font-bold text-gray-900 text-sm line-clamp-1">{m.title}</span>
                           <span className="text-xs text-gray-500 whitespace-nowrap">{new Date(m.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-gray-600 mb-2"><strong>Applicant:</strong> {m.citizenId?.name || 'Unknown'}</p>
                        <div className="bg-white p-2 rounded-lg border border-orange-50 text-xs">
                           <p className="font-semibold text-gray-700">Responsibility Area:</p>
                           <p className="text-gray-500">District: {m.district}</p>
                           <p className="text-gray-500">{m.localBodyType}: {m.localBodyName} (Ward {m.wardNumber || 'N/A'})</p>
                        </div>
                     </div>
                  ))}
               </div>
             )}
           </div>
        </div>
      )}
    </div>
  );
};

export default HigherAuthorityDashboard;
