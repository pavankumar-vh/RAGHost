import React, { useState, useEffect } from 'react';
import { X, Upload, FileText, Loader2, CheckCircle2, XCircle, Trash2, Database, FileIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { setAuthToken } from '../services/api';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const KnowledgeBaseModal = ({ bot, setShowModal }) => {
  const { getIdToken } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    fetchKnowledgeBase();
  }, [bot]);

  const fetchKnowledgeBase = async () => {
    try {
      setLoading(true);
      const token = await getIdToken();
      const response = await axios.get(`${API_URL}/api/knowledge/${bot.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDocuments(response.data.data?.documents || []);
    } catch (err) {
      console.error('Error fetching knowledge base:', err);
      if (err.response?.status === 404) {
        setDocuments([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file) => {
    const allowedTypes = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/csv', 'text/markdown'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|txt|docx|csv|md)$/i)) {
      setError('Invalid file type. Allowed: PDF, TXT, DOCX, CSV, MD');
      return;
    }

    if (file.size > maxSize) {
      setError('File too large. Maximum size: 10MB');
      return;
    }

    setSelectedFile(file);
    setError('');
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setError('');
      setSuccess('');

      const token = await getIdToken();
      const formData = new FormData();
      formData.append('document', selectedFile);

      const response = await axios.post(
        `${API_URL}/api/knowledge/${bot.id}/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setSuccess(response.data.message || 'Document uploaded successfully!');
      setSelectedFile(null);
      
      // Refresh knowledge base
      setTimeout(() => {
        fetchKnowledgeBase();
      }, 1000);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.error || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      const token = await getIdToken();
      await axios.delete(`${API_URL}/api/knowledge/${bot.id}/document/${documentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setSuccess('Document deleted successfully');
      fetchKnowledgeBase();
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.response?.data?.error || 'Failed to delete document');
    }
  };

  const getFileIcon = (fileType) => {
    const icons = {
      pdf: '📄',
      txt: '📝',
      docx: '📘',
      csv: '📊',
      md: '📋',
    };
    return icons[fileType] || '📁';
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto animate-fadeIn">
      <div className="relative bg-gradient-to-br from-gray-900 to-black border border-gray-700 rounded-3xl p-8 w-full max-w-4xl my-8 shadow-2xl">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/5 via-transparent to-accent-pink/5 rounded-3xl pointer-events-none"></div>
        
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent flex items-center gap-3">
                <Database size={32} className="text-accent-blue" />
                Knowledge Base
              </h2>
              <p className="text-gray-400 text-sm mt-1">Upload documents for {bot.name}</p>
            </div>
            <button 
              onClick={() => setShowModal(false)}
              className="text-gray-500 hover:text-white hover:bg-gray-800 p-2 rounded-lg transition-all"
            >
              <X size={24} />
            </button>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2 animate-fadeIn">
              <XCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 size={18} />
              <span>{success}</span>
            </div>
          )}

          {/* Upload Section */}
          <div className="mb-8 p-6 bg-black/20 rounded-2xl border border-gray-800/50">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Upload size={20} className="text-accent-blue" />
              Upload Document
            </h3>

            {/* Drag & Drop Zone */}
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                dragActive
                  ? 'border-accent-blue bg-accent-blue/10'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {selectedFile ? (
                <div className="space-y-4">
                  <div className="text-6xl">{getFileIcon(selectedFile.name.split('.').pop())}</div>
                  <div>
                    <p className="text-white font-semibold">{selectedFile.name}</p>
                    <p className="text-gray-400 text-sm">{formatFileSize(selectedFile.size)}</p>
                  </div>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={handleUpload}
                      disabled={uploading}
                      className="bg-accent-blue text-black font-semibold px-6 py-2 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {uploading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload size={16} />
                          Upload
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload size={48} className="mx-auto text-gray-600" />
                  <div>
                    <p className="text-white font-semibold mb-2">
                      Drag & drop your document here
                    </p>
                    <p className="text-gray-400 text-sm mb-4">
                      or click to browse
                    </p>
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.txt,.docx,.csv,.md"
                        onChange={handleFileSelect}
                      />
                      <span className="bg-accent-blue/20 text-accent-blue px-6 py-2 rounded-lg hover:bg-accent-blue/30 transition-all inline-block">
                        Choose File
                      </span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">
                    Supported: PDF, TXT, DOCX, CSV, MD (Max 10MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Documents List */}
          <div className="p-6 bg-black/20 rounded-2xl border border-gray-800/50">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FileText size={20} className="text-accent-pink" />
              Uploaded Documents ({documents.length})
            </h3>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={32} className="animate-spin text-accent-blue" />
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-8">
                <FileIcon size={48} className="mx-auto text-gray-600 mb-3" />
                <p className="text-gray-400">No documents uploaded yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div
                    key={doc._id}
                    className="flex items-center justify-between p-4 bg-black/30 rounded-xl border border-gray-800/50 hover:border-gray-700 transition-all"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="text-3xl">{getFileIcon(doc.fileType)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold truncate">
                          {doc.originalName}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {doc.chunkCount} chunks • {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(doc._id)}
                      className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                      title="Delete document"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBaseModal;
