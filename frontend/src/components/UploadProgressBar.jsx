import React from 'react';
import { Loader2, CheckCircle2, XCircle, FileText } from 'lucide-react';

const UploadProgressBar = ({ job }) => {
  if (!job) return null;

  const getStatusIcon = () => {
    switch (job.status) {
      case 'completed':
        return <CheckCircle2 className="text-green-600" size={20} />;
      case 'failed':
        return <XCircle className="text-red-600" size={20} />;
      default:
        return <Loader2 className="text-black animate-spin" size={20} />;
    }
  };

  const getStatusColor = () => {
    switch (job.status) {
      case 'completed':
        return 'bg-green-400';
      case 'failed':
        return 'bg-red-400';
      case 'extracting':
        return 'bg-nb-yellow';
      case 'chunking':
        return 'bg-nb-blue';
      case 'embedding':
        return 'bg-nb-purple';
      case 'uploading':
        return 'bg-nb-green';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusLabel = () => {
    switch (job.status) {
      case 'pending':
        return 'Queued';
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

  const getStageIndex = () => {
    const stages = ['pending', 'extracting', 'chunking', 'embedding', 'uploading', 'completed'];
    return stages.indexOf(job.status);
  };

  const stages = [
    { key: 'extracting', label: 'Extract' },
    { key: 'chunking', label: 'Chunk' },
    { key: 'embedding', label: 'Embed' },
    { key: 'uploading', label: 'Upload' },
  ];

  const progress = job.progress || { percentage: 0, message: 'Initializing...' };
  const currentStage = getStageIndex();
  const isActive = job.status !== 'completed' && job.status !== 'failed';

  return (
    <div className={`border-2 border-black p-4 mb-3 transition-all duration-300 ${
      job.status === 'completed' ? 'bg-green-50 shadow-nb-sm' :
      job.status === 'failed' ? 'bg-red-50 shadow-nb-sm' :
      'bg-white shadow-nb-sm'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <FileText size={18} className="text-nb-text" />
          <div>
            <p className="font-bold text-sm text-nb-text">{job.filename || 'Unknown file'}</p>
            <p className="text-xs text-nb-muted">{job.fileType ? job.fileType.toUpperCase() : 'FILE'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-sm font-bold">{getStatusLabel()}</span>
        </div>
      </div>

      {/* Stage Steps */}
      {isActive && (
        <div className="flex items-center gap-1 mb-3">
          {stages.map((stage, i) => {
            const stageIdx = i + 1; // offset since 'pending' is 0
            const isDone = currentStage > stageIdx;
            const isCurrent = currentStage === stageIdx;
            return (
              <div key={stage.key} className="flex-1 flex flex-col items-center">
                <div className={`w-full h-2 border border-black transition-all duration-500 ${
                  isDone ? getStatusColor() : isCurrent ? `${getStatusColor()} animate-pulse` : 'bg-gray-100'
                }`} />
                <span className={`text-[10px] mt-1 font-bold ${
                  isCurrent ? 'text-nb-text' : isDone ? 'text-nb-muted' : 'text-gray-300'
                }`}>{stage.label}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Progress Bar */}
      {isActive && (
        <div className="mb-2">
          <div className="w-full bg-gray-100 border border-black h-2.5 overflow-hidden">
            <div
              className={`h-full ${getStatusColor()} transition-all duration-700 ease-out`}
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Status Message */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-nb-muted">
          {job.status === 'completed' && job.result
            ? `✓ Successfully processed ${job.result.vectorsUploaded} vectors`
            : job.status === 'failed' && job.result
            ? `✗ ${job.result.error}`
            : progress.message}
        </p>
        {isActive && (
          <p className="text-xs font-bold text-nb-text">{progress.percentage}%</p>
        )}
      </div>

      {/* Chunk & Vector Stats */}
      {(progress.chunksCreated || progress.vectorsUploaded) && (
        <div className="flex gap-3 mt-2 pt-2 border-t border-gray-200">
          {progress.chunksCreated > 0 && (
            <span className="text-[11px] font-bold text-nb-muted">
              📦 {progress.chunksCreated} chunks
            </span>
          )}
          {progress.chunksEmbedded > 0 && (
            <span className="text-[11px] font-bold text-nb-muted">
              🧠 {progress.chunksEmbedded}/{progress.chunksCreated} embedded
            </span>
          )}
          {progress.vectorsUploaded > 0 && (
            <span className="text-[11px] font-bold text-nb-muted">
              📤 {progress.vectorsUploaded}/{progress.vectorsTotal} uploaded
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default UploadProgressBar;
