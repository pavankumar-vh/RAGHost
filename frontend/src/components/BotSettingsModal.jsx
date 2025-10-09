import React, { useState, useEffect } from 'react';
import { X, Upload, FileText, Trash2, Users, Settings as SettingsIcon, Loader2, Plus, Mail } from 'lucide-react';
import { botsService, knowledgeService, setAuthToken } from '../services/api';
import { useAuth } from '../context/AuthContext';

const BotSettingsModal = ({ bot, setShowModal, onUpdate }) => {
  const { getIdToken } = useAuth();
  const [activeTab, setActiveTab] = useState('knowledge');
  const [knowledge, setKnowledge] = useState({ documents: [], totalDocuments: 0 });
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  
  // Advanced settings
  const [settings, setSettings] = useState({
    temperature: bot.temperature || 0.7,
    maxTokens: bot.maxTokens || 1024,
    systemPrompt: bot.systemPrompt || '',
  });

  // Team members
  const [teamMembers, setTeamMembers] = useState(bot.teamMembers || []);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('viewer');

  useEffect(() => {
    loadKnowledgeBase();
  }, []);

  // ESC key to close
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setShowModal(false);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [setShowModal]);

  // Click outside to close
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowModal(false);
    }
  };

  const loadKnowledgeBase = async () => {
    try {
      const token = await getIdToken();
      if (token) {
        setAuthToken(token);
        const data = await knowledgeService.getKnowledgeBase(bot.id);
        setKnowledge(data.data);
      }
    } catch (error) {
      console.error('Error loading knowledge base:', error);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      setUploadStatus({ type: 'info', message: 'Uploading and processing document...' });
      const token = await getIdToken();
      if (token) {
        setAuthToken(token);
        const result = await knowledgeService.uploadDocument(bot.id, file);
        setUploadStatus({ 
          type: 'success', 
          message: `✅ ${file.name} uploaded! Embedding ${result.data.chunkCount} chunks to Pinecone...` 
        });
        await loadKnowledgeBase();
        
        // Clear status after 5 seconds
        setTimeout(() => setUploadStatus(null), 5000);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadStatus({ 
        type: 'error', 
        message: error.response?.data?.error || 'Failed to upload file' 
      });
      setTimeout(() => setUploadStatus(null), 5000);
    } finally {
      setUploading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      const token = await getIdToken();
      if (token) {
        setAuthToken(token);
        await knowledgeService.deleteDocument(bot.id, documentId);
        await loadKnowledgeBase();
      }
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const handleUpdateSettings = async () => {
    try {
      setLoading(true);
      const token = await getIdToken();
      if (token) {
        setAuthToken(token);
        await botsService.updateSettings(bot.id, settings);
        if (onUpdate) await onUpdate();
        alert('Settings updated successfully!');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      alert('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeamMember = async () => {
    if (!newMemberEmail) return;

    try {
      setLoading(true);
      const token = await getIdToken();
      if (token) {
        setAuthToken(token);
        const response = await botsService.addTeamMember(bot.id, newMemberEmail, newMemberRole);
        setTeamMembers(response.data.teamMembers);
        setNewMemberEmail('');
        setNewMemberRole('viewer');
      }
    } catch (error) {
      console.error('Error adding team member:', error);
      alert(error.response?.data?.error || 'Failed to add team member');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTeamMember = async (email) => {
    if (!window.confirm(`Remove ${email} from team?`)) return;

    try {
      const token = await getIdToken();
      if (token) {
        setAuthToken(token);
        const response = await botsService.removeTeamMember(bot.id, email);
        setTeamMembers(response.data.teamMembers);
      }
    } catch (error) {
      console.error('Error removing team member:', error);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div className="relative bg-gradient-to-br from-gray-900 to-black border border-gray-700 rounded-3xl p-8 w-full max-w-4xl my-8 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/5 via-transparent to-accent-pink/5 rounded-3xl pointer-events-none"></div>
        
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Bot Settings
              </h2>
              <p className="text-gray-400 text-sm mt-1">{bot.name}</p>
            </div>
            <button 
              onClick={() => setShowModal(false)}
              className="text-gray-400 hover:text-white hover:bg-gray-800 p-3 rounded-xl transition-all hover:rotate-90 duration-300"
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-800">
            {[
              { id: 'knowledge', label: 'Knowledge Base', icon: FileText },
              { id: 'settings', label: 'Advanced Settings', icon: SettingsIcon },
              { id: 'team', label: 'Team', icon: Users },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-t-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-accent-blue/20 text-accent-blue border-b-2 border-accent-blue'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="min-h-[400px]">
            {/* Knowledge Base Tab */}
            {activeTab === 'knowledge' && (
              <div className="space-y-6">
                {/* Upload Status */}
                {uploadStatus && (
                  <div className={`p-4 rounded-xl border flex items-center gap-2 ${
                    uploadStatus.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
                    uploadStatus.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                    'bg-blue-500/10 border-blue-500/30 text-blue-400'
                  }`}>
                    {uploadStatus.type === 'info' && <Loader2 size={18} className="animate-spin" />}
                    <span className="text-sm">{uploadStatus.message}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">Knowledge Base</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {knowledge.totalDocuments} document{knowledge.totalDocuments !== 1 ? 's' : ''} • {knowledge.totalChunks} chunks
                    </p>
                  </div>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf,.txt,.docx,.csv,.md"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                    <div className={`flex items-center gap-2 bg-accent-blue text-black font-semibold px-6 py-3 rounded-xl transition-all ${
                      uploading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90 hover:scale-105'
                    }`}>
                      {uploading ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
                      {uploading ? 'Uploading...' : 'Upload File'}
                    </div>
                  </label>
                </div>

                {knowledge.documents.length === 0 ? (
                  <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-12 text-center">
                    <FileText size={48} className="text-gray-600 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold mb-2">No Documents Yet</h4>
                    <p className="text-gray-400 text-sm mb-4">Upload PDFs, Word docs, or text files to train your bot</p>
                    <div className="bg-accent-blue/10 border border-accent-blue/30 rounded-lg p-3 text-xs text-left">
                      <p className="font-semibold text-accent-blue mb-1">💡 How it works:</p>
                      <p className="text-gray-300">1. Upload a document (PDF, DOCX, TXT, CSV, MD)</p>
                      <p className="text-gray-300">2. We chunk and embed it using Gemini</p>
                      <p className="text-gray-300">3. Store vectors in your Pinecone index</p>
                      <p className="text-gray-300">4. Bot uses this context to answer questions!</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {knowledge.documents.map(doc => (
                      <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-gray-700 transition-all">
                        <div className="flex items-center gap-3 flex-1">
                          <FileText size={20} className="text-accent-blue" />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold truncate">{doc.filename}</div>
                            <div className="text-xs text-gray-400">
                              {doc.fileType.toUpperCase()} • {doc.chunkCount} chunks • {new Date(doc.uploadedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="text-gray-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Advanced Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold mb-4">Advanced Settings</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Temperature: {settings.temperature}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={settings.temperature}
                      onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Lower = more focused, Higher = more creative
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Max Tokens: {settings.maxTokens}
                    </label>
                    <input
                      type="number"
                      min="256"
                      max="4096"
                      step="256"
                      value={settings.maxTokens}
                      onChange={(e) => setSettings({ ...settings, maxTokens: parseInt(e.target.value) })}
                      className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-accent-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">System Prompt (Optional)</label>
                    <textarea
                      value={settings.systemPrompt}
                      onChange={(e) => setSettings({ ...settings, systemPrompt: e.target.value })}
                      placeholder="Custom system prompt for your bot..."
                      rows={4}
                      className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-accent-blue resize-none"
                    />
                  </div>

                  <button
                    onClick={handleUpdateSettings}
                    disabled={loading}
                    className="w-full bg-accent-blue text-black font-semibold py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading && <Loader2 size={20} className="animate-spin" />}
                    Save Settings
                  </button>
                </div>
              </div>
            )}

            {/* Team Tab */}
            {activeTab === 'team' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-4">Team Members</h3>
                  <p className="text-sm text-gray-400 mb-6">Share access to this bot with your team</p>
                </div>

                {/* Add Team Member */}
                <div className="flex gap-3">
                  <input
                    type="email"
                    placeholder="Email address"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    className="flex-1 bg-black/50 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-accent-blue"
                  />
                  <select
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value)}
                    className="bg-black/50 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-accent-blue"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                  </select>
                  <button
                    onClick={handleAddTeamMember}
                    disabled={loading || !newMemberEmail}
                    className="bg-accent-blue text-black font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
                    Add
                  </button>
                </div>

                {/* Team Members List */}
                <div className="space-y-3">
                  {teamMembers.length === 0 ? (
                    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 text-center">
                      <Users size={32} className="text-gray-600 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">No team members yet</p>
                    </div>
                  ) : (
                    teamMembers.map(member => (
                      <div key={member.email} className="flex items-center justify-between p-4 bg-gray-900/50 border border-gray-800 rounded-xl">
                        <div className="flex items-center gap-3">
                          <Mail size={20} className="text-accent-blue" />
                          <div>
                            <div className="font-semibold">{member.email}</div>
                            <div className="text-xs text-gray-400 capitalize">{member.role}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveTeamMember(member.email)}
                          className="text-gray-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BotSettingsModal;

