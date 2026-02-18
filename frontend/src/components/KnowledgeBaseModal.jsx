import React, { useState, useEffect } from 'react';
import { X, Upload, FileText, Loader2, CheckCircle2, XCircle, Trash2, Database, FileIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { setAuthToken } from '../services/api';
import axios from 'axios';
import UploadProgressBar from './UploadProgressBar';
import ConfirmDialog from './ConfirmDialog';
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
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, documentId: null });

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
    try {
      const token = await getIdToken();
      const response = await axios.delete(`${API_URL}/api/knowledge/${bot.id}/document/${documentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log('🗑️ Delete response:', response.data);
      
      // Update local state immediately
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      
      showSuccess(
        'Document and its vectors have been deleted successfully.',
        'Document Deleted'
      );
      
      // Refresh knowledge base to get updated counts
      await fetchKnowledgeBase();
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
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div className="bg-nb-bg border-2 border-black shadow-nb-xl w-full max-w-3xl my-2 sm:my-8">
        {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b-2 border-black bg-nb-yellow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border-2 border-black bg-white flex items-center justify-center"><Database size={20} /></div>
            <div>
              <h2 className="text-xl font-bold text-nb-text">Knowledge Base</h2>
              <p className="text-sm text-black/60">Upload documents for {bot.name}</p>
            </div>
          </div>
          <button onClick={() => setShowModal(false)} className="nb-btn bg-white p-2"><X size={20} /></button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Alerts */}
          {error && (
            <div className="p-4 bg-red-50 border-2 border-red-500 text-red-700 text-sm flex items-center gap-2">
              <XCircle size={16} className="flex-shrink-0" /><span>{error}</span>
            </div>
          )}
          {success && (
            <div className="p-4 bg-green-50 border-2 border-green-500 text-green-700 text-sm flex items-center gap-2">
              <CheckCircle2 size={16} className="flex-shrink-0" /><span>{success}</span>
            </div>
          )}

          {/* Active Upload Jobs */}
          {uploadJobs.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-nb-text mb-3">Processing Documents</h3>
              {uploadJobs.map((job) => <UploadProgressBar key={job.jobId} job={job} />)}
            </div>
          )}

          {/* Upload Section */}
          <div className="bg-white border-2 border-black shadow-nb-sm p-5">
            <h3 className="text-base font-bold mb-4 flex items-center gap-2">
              <Upload size={18} />Upload Document
            </h3>
            <div
              className={`border-2 border-dashed p-8 text-center transition-all ${dragActive ? 'border-black bg-nb-yellow/30' : 'border-gray-400 hover:border-black hover:bg-gray-50'}`}
              onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
            >
              {selectedFile ? (
                <div className="space-y-4">
                  <div className="text-5xl">{getFileIcon(selectedFile.name.split('.').pop())}</div>
                  <div>
                    <p className="font-bold text-nb-text">{selectedFile.name}</p>
                    <p className="text-nb-muted text-sm">{formatFileSize(selectedFile.size)}</p>
                  </div>
                  <div className="flex gap-3 justify-center">
                    <button onClick={handleUpload} disabled={uploading}
                      className="nb-btn bg-black text-white border-black px-5 py-2 disabled:opacity-50 disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0">
                      {uploading ? <><Loader2 size={14} className="animate-spin" />Uploading...</> : <><Upload size={14} />Upload</>}
                    </button>
                    <button onClick={() => setSelectedFile(null)} className="nb-btn bg-white px-5 py-2">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload size={36} className="mx-auto text-gray-400" />
                  <p className="font-bold text-nb-text">Drag & drop your document here</p>
                  <p className="text-nb-muted text-sm">or click to browse</p>
                  <label className="cursor-pointer inline-block">
                    <input type="file" className="hidden" accept=".pdf,.txt,.docx,.csv,.md" onChange={handleFileSelect} />
                    <span className="nb-btn bg-nb-yellow border-black px-5 py-2 inline-flex items-center gap-2 font-bold text-sm">Choose File</span>
                  </label>
                  <p className="text-xs text-nb-muted">PDF, TXT, DOCX, CSV, MD (Max 50MB)</p>
                </div>
              )}
            </div>
          </div>

          {/* Documents List */}
          <div className="bg-white border-2 border-black shadow-nb-sm p-5">
            <h3 className="text-base font-bold mb-4 flex items-center gap-2">
              <FileText size={18} />Uploaded Documents ({documents.length})
            </h3>
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-8 h-8 border-4 border-black border-t-nb-yellow animate-spin" />
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-10">
                <FileIcon size={36} className="mx-auto text-gray-300 mb-3" />
                <p className="text-nb-muted font-medium">No documents uploaded yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div key={doc._id} className="flex items-center justify-between p-3 border-2 border-black bg-nb-bg hover:bg-nb-yellow/20 transition-colors">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="text-2xl">{getFileIcon(doc.fileType)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-nb-text truncate text-sm">{doc.originalName}</p>
                        <p className="text-nb-muted text-xs">{doc.chunkCount} chunks · {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <button onClick={() => setConfirmDialog({ isOpen: true, documentId: doc._id })}
                      className="nb-btn bg-white p-2 hover:bg-red-100 hover:border-red-500 hover:text-red-600">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, documentId: null })}
        onConfirm={() => handleDelete(confirmDialog.documentId)}
        title="Delete Document?"
        message="Are you sure you want to delete this document? This will permanently remove it from your knowledge base and delete all associated vectors from Pinecone."
        confirmText="Delete" cancelText="Cancel" type="warning" danger={true}
      />
    </div>
  );
};

export default KnowledgeBaseModal;
