import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Pickaxe, Shield, MapPin, X, CheckCircle, XCircle, Clock } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const MgnregaSecretary = () => {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  // Modal State
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [processing, setProcessing] = useState(false);

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

  const closeRequest = () => {
    setSelectedRequest(null);
  };

  const submitAction = async (status) => {
    setProcessing(true);
    try {
      await axios.put(`http://localhost:5000/api/mgnrega/${selectedRequest._id}`, { status });
      fetchRequests();
      closeRequest();
    } catch (error) {
      alert("Failed to update status.");
    } finally {
      setProcessing(false);
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const approvedRequests = requests.filter(r => r.status === 'approved');
  const displayRequests = activeTab === 'pending' ? pendingRequests : approvedRequests;

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-100 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-emerald-900 flex items-center gap-2">
            <Pickaxe size={28} className="text-emerald-600" />
            MGNREGA Administration
          </h1>
          <p className="text-emerald-700 text-sm mt-1 flex items-center">
            <Shield size={16} className="mr-1" /> Authorized for {user.localBodyName} ({user.localBodyType})
          </p>
        </div>
        <div className="flex gap-6">
          <div className="text-center">
            <p className="text-xs text-yellow-600 uppercase tracking-wider font-semibold">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{pendingRequests.length}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-emerald-600 uppercase tracking-wider font-semibold">Approved</p>
            <p className="text-2xl font-bold text-emerald-600">{approvedRequests.length}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('pending')}
          className={`py-3 px-6 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'pending' ? 'border-yellow-500 text-yellow-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <Clock size={16} />
          Pending Requests
          {pendingRequests.length > 0 && (
            <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-0.5 rounded-full">{pendingRequests.length}</span>
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
              : <Pickaxe size={32} className="text-gray-400" />}
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            {activeTab === 'approved' ? 'No Approved Requests' : 'No Pending Requests'}
          </h3>
          <p className="mt-1 text-gray-500">
            {activeTab === 'approved'
              ? 'Approved requests will appear here once you approve citizen submissions.'
              : 'There are no pending MGNREGA requests in your jurisdiction.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayRequests.map(req => (
            <div
              key={req._id}
              onClick={() => activeTab === 'pending' ? setSelectedRequest(req) : null}
              className={`bg-white rounded-xl shadow-sm overflow-hidden transition-all ${
                activeTab === 'pending'
                  ? 'border border-yellow-200 hover:shadow-lg cursor-pointer transform hover:-translate-y-1'
                  : 'border border-emerald-200'
              }`}
            >
              {req.images && req.images.length > 0 ? (
                <img src={req.images[0]} alt="Request Location" className="w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-40 bg-gray-100 flex items-center justify-center border-b border-gray-100">
                  <span className="text-gray-400 font-medium tracking-wider text-sm">NO IMAGE</span>
                </div>
              )}
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  {activeTab === 'pending' ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-yellow-100 text-yellow-800 flex items-center gap-1">
                      <Clock size={12} /> PENDING
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <CheckCircle size={12} /> APPROVED
                    </span>
                  )}
                  <span className="text-xs text-gray-500">{new Date(req.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">{req.title}</h3>
                <div className="flex items-center text-sm text-gray-600 mb-4 bg-gray-50 p-2 rounded-lg truncate">
                  <MapPin size={16} className="mr-1.5 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{req.location}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 pt-3 border-t border-gray-100">
                  <span className="font-medium">{req.citizenId?.name || 'Citizen'}</span>
                  <span>·</span>
                  <span>{req.citizenId?.phone || 'No Phone'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal (only for pending) */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[70] flex justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-auto overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10 shadow-sm">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-gray-900">Review Request</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider bg-yellow-100 text-yellow-800">
                  PENDING
                </span>
              </div>
              <button onClick={closeRequest} className="text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6 space-y-6">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Applicant</h4>
                <p className="text-lg font-bold text-gray-900">{selectedRequest.citizenId?.name}</p>
                <p className="text-sm text-gray-500">{selectedRequest.citizenId?.phone} | Ration Card: {selectedRequest.citizenId?.rationCardNumber || 'N/A'}</p>
              </div>

              <div>
                <h2 className="text-2xl font-extrabold text-gray-900 mb-2">{selectedRequest.title}</h2>
                <div className="flex items-center text-base text-gray-700 mt-2 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                  <MapPin size={18} className="mr-2 text-emerald-600 flex-shrink-0" />
                  {selectedRequest.location}
                </div>
              </div>

              {selectedRequest.images && selectedRequest.images.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedRequest.images.map((img, i) => (
                    <img key={i} src={img} alt="Evidence" className="w-full h-48 object-cover rounded-xl border border-gray-200 shadow-sm" />
                  ))}
                </div>
              )}

              <div className="pt-6 border-t border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Secretary Action</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => submitAction('approved')}
                    disabled={processing}
                    className="flex-1 py-4 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-50"
                  >
                    <CheckCircle size={20} /> Approve Request
                  </button>
                  <button
                    onClick={() => submitAction('rejected')}
                    disabled={processing}
                    className="flex-1 py-4 bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-50"
                  >
                    <XCircle size={20} /> Reject Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MgnregaSecretary;
