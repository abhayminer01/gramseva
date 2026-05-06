import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Megaphone, Plus, Trash2, Edit2, Clock, MapPin, X, AlertCircle } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const Announcements = () => {
  const { user } = useContext(AuthContext);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [posting, setPosting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'announcement',
    targetAudience: user?.role === 'ward_member' ? user.wardNumber : 'all'
  });

  const fetchAnnouncements = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/announcements');
      setAnnouncements(res.data);
    } catch (err) {
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handlePost = async (e) => {
    e.preventDefault();
    setPosting(true);
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/announcements/${editingId}`, formData);
      } else {
        await axios.post('http://localhost:5000/api/announcements', formData);
      }
      setShowModal(false);
      setEditingId(null);
      setFormData({ title: '', content: '', type: 'announcement', targetAudience: user?.role === 'ward_member' ? user.wardNumber : 'all' });
      fetchAnnouncements();
    } catch (err) {
      alert(`Failed to ${editingId ? 'update' : 'post'} announcement`);
    } finally {
      setPosting(false);
    }
  };

  const handleEdit = (ann) => {
    setFormData({
      title: ann.title,
      content: ann.content,
      type: ann.type,
      targetAudience: ann.targetAudience
    });
    setEditingId(ann._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/announcements/${id}`);
      fetchAnnouncements();
    } catch (err) {
      alert('Failed to delete announcement');
    }
  };

  const isAuthority = user.role === 'secretary' || user.role === 'ward_member' || user.role === 'higher_authority';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="bg-emerald-100 p-2.5 sm:p-3 rounded-xl">
            <Megaphone size={24} className="text-emerald-600" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Announcements</h1>
            <p className="text-gray-500 text-xs sm:text-sm">Official updates from {user.localBodyName}</p>
          </div>
        </div>
        {isAuthority && (
          <button
            onClick={() => {
              setEditingId(null);
              setFormData({ title: '', content: '', type: 'announcement', targetAudience: user?.role === 'ward_member' ? user.wardNumber : 'all' });
              setShowModal(true);
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-200"
          >
            <Plus size={20} />
            New Announcement
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
          <Megaphone size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">No announcements found.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {announcements.map((ann) => (
            <div key={ann._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow relative overflow-hidden group">
              {ann.type === 'notification' && (
                <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500"></div>
              )}
              <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    {ann.type === 'notification' && <AlertCircle size={16} className="text-orange-500" />}
                    <h2 className="text-xl font-bold text-gray-900">{ann.title}</h2>
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${ann.type === 'notification' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                      {ann.type}
                    </span>
                  </div>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{ann.content}</p>
                  <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-gray-500 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} />
                      {new Date(ann.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} />
                      {ann.targetAudience === 'all' ? 'All Wards' : `Ward ${ann.targetAudience}`}
                    </div>
                    <div className="text-emerald-600 font-semibold uppercase tracking-tight">
                      By {ann.createdBy?.name} ({ann.createdBy?.role?.replace('_', ' ')})
                    </div>
                  </div>
                </div>
                {isAuthority && (
                  <div className="flex flex-col gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(ann)}
                      className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(ann._id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Announcement Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                {editingId ? <Edit2 size={22} className="text-emerald-600" /> : <Plus size={22} className="text-emerald-600" />} 
                {editingId ? 'Edit Announcement' : 'New Announcement'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handlePost} className="p-8 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Title</label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="E.g. Community Health Camp"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  >
                    <option value="announcement">Announcement</option>
                    <option value="notification">Critical Notification</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Target Audience</label>
                  {user?.role === 'ward_member' ? (
                    <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 font-medium cursor-not-allowed">
                      Ward {user.wardNumber} Citizens Only
                    </div>
                  ) : (
                    <select
                      value={formData.targetAudience === 'all' ? 'all' : 'ward_specific'}
                      onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value === 'all' ? 'all' : '' })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    >
                      <option value="all">Entire Body</option>
                      <option value="ward_specific">Specific Ward</option>
                    </select>
                  )}
                </div>
              </div>
              {formData.targetAudience !== 'all' && user?.role !== 'ward_member' && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Ward Number</label>
                  <input
                    required
                    type="text"
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    placeholder="Enter Ward Number"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Content</label>
                <textarea
                  required
                  rows="4"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Detailed information..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none"
                ></textarea>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={posting}
                  className={`flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-bold shadow-lg shadow-emerald-200 ${posting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {posting ? (editingId ? 'Updating...' : 'Posting...') : (editingId ? 'Update Now' : 'Post Now')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Announcements;
