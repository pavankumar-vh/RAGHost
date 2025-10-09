import React from 'react';
import { Loader2, CheckCircle2, XCircle, FileText } from 'lucide-react';

const UploadProgressBar = ({ job }) => {
  console.log('🎨 UploadProgressBar rendering with job:', job);
  
  if (!job) {
    console.log('⚠️ No job provided to UploadProgressBar');
    return null;
  }

  const getStatusIcon = () => {
    switch (job.status) {
      case 'completed':
        return <CheckCircle2 className="text-green-500" size={20} />;
      case 'failed':
        return <XCircle className="text-red-500" size={20} />;
      default:
        return <Loader2 className="text-accent-blue animate-spin" size={20} />;
    }
  };

  const getStatusColor = () => {
    switch (job.status) {
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'extracting':
        return 'bg-yellow-500';
      case 'chunking':
        return 'bg-blue-500';
      case 'embedding':
        return 'bg-purple-500';
      case 'uploading':
        return 'bg-accent-blue';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusLabel = () => {
    switch (job.status) {
      case 'pending':
        return 'Pending';
      case 'extracting':
        return 'Extracting Text';
      case 'chunking':
        return 'Creating Chunks';
      case 'embedding':
        return 'Generating Embeddings';
      case 'uploading':
        return 'Uploading to Pinecone';
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      default:
        return 'Processing';
    }
  };

  const progress = job.progress || { percentage: 0, message: 'Initializing...' };

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <FileText size={18} className="text-gray-400" />
          <div>
            <p className="font-medium text-sm">{job.filename || 'Unknown file'}</p>
            <p className="text-xs text-gray-500">{job.fileType ? job.fileType.toUpperCase() : 'FILE'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-sm font-medium">{getStatusLabel()}</span>
        </div>
      </div>

      {/* Progress Bar */}
      {job.status !== 'completed' && job.status !== 'failed' && (
        <div className="mb-2">
          <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full ${getStatusColor()} transition-all duration-300 ease-out`}
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Status Message */}
      <p className="text-xs text-gray-400 mt-2">
        {job.status === 'completed' && job.result
          ? `Successfully processed ${job.result.vectorsUploaded} vectors`
          : job.status === 'failed' && job.result
          ? `Error: ${job.result.error}`
          : progress.message}
      </p>

      {/* Percentage */}
      {job.status !== 'completed' && job.status !== 'failed' && (
        <p className="text-xs text-gray-500 mt-1">
          {progress.percentage}% complete
        </p>
      )}
    </div>
  );
};

export default UploadProgressBar;
