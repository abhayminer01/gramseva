import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { FileText, Clock, CheckCircle, AlertTriangle, Building, ShieldCheck } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const HigherAuthorityDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    total: 0, pending: 0, inProgress: 0, resolved: 0, escalated: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/grievances');
        const data = res.data;
        // High level overview sees everything
        setStats({
          total: data.length,
          pending: data.filter(g => g.status === 'pending').length,
          inProgress: data.filter(g => g.status === 'in_progress').length,
          resolved: data.filter(g => g.status === 'resolved').length,
          escalated: data.filter(g => g.status === 'escalated').length,
        });
      } catch (error) {
        console.error("Failed to fetch stats", error);
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-6 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Critical Escalations</h2>
        <div className="text-center text-gray-500 py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          Escalated grid will automatically pull systemic failures over SLA limits here.
        </div>
      </div>
    </div>
  );
};

export default HigherAuthorityDashboard;
