import React, { useState, useEffect } from 'react';
import { X, Upload, FileText, Loader2, CheckCircle2, XCircle, Trash2, Database, FileIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { setAuthToken } from '../services/api';
import axios from 'axios';
import UploadProgressBar from './UploadProgressBar';
import { parseUploadError, parseJobError } from '../utils/errorHandler';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const KnowledgeBaseModal = ({ bot, setShowModal }) => {
  const { getIdToken } = useAuth();
  const { showSuccess, showError, showWarning, showInfo } = useNotification();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadJobs, setUploadJobs] = useState([]); // Track active upload jobs

  useEffect(() => {
    fetchKnowledgeBase();
  }, [bot]);

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
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|txt|docx|csv|md)$/i)) {
      showError(
        'Please upload a valid document file.\n\nSupported formats:\n• PDF (.pdf)\n• Text (.txt)\n• Word (.docx)\n• CSV (.csv)\n• Markdown (.md)',
        'Invalid File Type'
      );
      return;
    }

    if (file.size > maxSize) {
      showError(
        `File size: ${(file.size / (1024 * 1024)).toFixed(2)} MB\nMaximum allowed: 50 MB\n\nTip: Try compressing your PDF or splitting large documents into smaller parts.`,
        'File Too Large',
        { duration: 8000 }
      );
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

      console.log('📤 Upload response:', response.data);
      
      const { jobId, filename } = response.data.data;
      console.log('📋 Job ID:', jobId, 'Filename:', filename);
      
      // Add job to tracking list
      const newJob = {
        jobId,
        filename,
        status: 'processing',
        progress: { percentage: 10, message: 'Upload started...' },
      };
      console.log('➕ Adding job to tracking:', newJob);
      setUploadJobs(prev => {
        console.log('📊 Current jobs:', prev);
        const updated = [...prev, newJob];
        console.log('📊 Updated jobs:', updated);
        return updated;
      });
      
      showSuccess(
        `${filename} uploaded successfully! Processing in background...`,
        'Upload Started'
      );
      setSelectedFile(null);
      
      // Start polling for job status
      pollJobStatus(jobId, token);

    } catch (err) {
      console.error('Upload error:', err);
      const errorInfo = parseUploadError(err);
      showError(errorInfo.message, errorInfo.title, { 
        duration: 10000,
        action: errorInfo.action 
      });
    } finally {
      setUploading(false);
    }
  };

  // Poll job status every 2 seconds
  const pollJobStatus = async (jobId, token) => {
    console.log('🔄 Starting to poll job:', jobId);
    const maxAttempts = 150; // 5 minutes max (150 * 2 seconds)
    let attempts = 0;

    const poll = async () => {
      try {
        console.log(`🔍 Polling attempt ${attempts + 1} for job ${jobId}`);
        const response = await axios.get(
          `${API_URL}/api/knowledge/${bot.id}/job/${jobId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const jobData = response.data.data;
        console.log('📊 Job status update:', jobData);

        // Update job in list
        setUploadJobs(prev => {
          const updated = prev.map(job =>
            job.jobId === jobId ? { ...job, ...jobData } : job
          );
          console.log('📊 Jobs after update:', updated);
          return updated;
        });

        // If completed or failed, stop polling
        if (jobData.status === 'completed' || jobData.status === 'failed') {
          if (jobData.status === 'completed') {
            showSuccess(
              `Successfully processed ${jobData.result?.vectorsUploaded || 0} vectors`,
              `${jobData.filename} Completed`,
              { duration: 6000 }
            );
            // Refresh knowledge base after completion
            setTimeout(() => {
              fetchKnowledgeBase();
            }, 1000);
          } else {
            // Parse job error with detailed explanation
            const errorInfo = parseJobError(jobData.result);
            showError(errorInfo.message, errorInfo.title, {
              duration: 15000, // Keep error visible longer
              action: errorInfo.action
            });
          }
          
          // Remove job from list after showing notification
          setTimeout(() => {
            setUploadJobs(prev => prev.filter(job => job.jobId !== jobId));
          }, 3000);
          
          return;
        }

        // Continue polling if not done and under max attempts
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000);
        } else {
          console.warn('Job polling timed out');
          showWarning(
            'The upload is taking longer than expected. The processing continues in the background. Please refresh the knowledge base in a few minutes.',
            'Processing Timeout',
            { duration: 10000 }
          );
          setUploadJobs(prev => prev.filter(job => job.jobId !== jobId));
        }
      } catch (err) {
        console.error('Job polling error:', err);
        showError(
          'Failed to check processing status. The upload may still be processing in the background.',
          'Status Check Failed',
          { duration: 8000 }
        );
        // Remove job from list on error
        setUploadJobs(prev => prev.filter(job => job.jobId !== jobId));
      }
    };

    poll();
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document? This will also remove it from Pinecone.')) return;

    try {
      const token = await getIdToken();
      await axios.delete(`${API_URL}/api/knowledge/${bot.id}/document/${documentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      showSuccess(
        'Document and its vectors have been deleted successfully.',
        'Document Deleted'
      );
      fetchKnowledgeBase();
    } catch (err) {
      console.error('Delete error:', err);
      const errorMsg = err.response?.data?.error || 'Failed to delete document';
      showError(
        errorMsg.includes('Pinecone') 
          ? `${errorMsg}\n\nNote: The document was removed from our database, but failed to delete from Pinecone. You may need to delete it manually from your Pinecone dashboard.`
          : errorMsg,
        'Delete Failed',
        { 
          duration: 10000,
          action: errorMsg.includes('Pinecone') ? {
            label: 'Open Pinecone',
            onClick: () => window.open('https://app.pinecone.io', '_blank')
          } : null
        }
      );
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
    <div 
      className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto animate-fadeIn"
      onClick={handleBackdropClick}
    >
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
              className="text-gray-400 hover:text-white hover:bg-gray-800 p-3 rounded-xl transition-all hover:rotate-90 duration-300"
              aria-label="Close modal"
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

          {/* Active Upload Jobs */}
          {uploadJobs.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-400 mb-3">Processing Documents</h3>
              {uploadJobs.map((job) => {
                console.log('🎨 Rendering progress bar for job:', job);
                return <UploadProgressBar key={job.jobId} job={job} />;
              })}
            </div>
          )}
          {uploadJobs.length === 0 && console.log('⚠️ No upload jobs to display')}

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
