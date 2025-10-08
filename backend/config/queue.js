import Bull from 'bull';

let chatQueue = null;
let embeddingQueue = null;
let analyticsQueue = null;
let isQueueAvailable = false;

/**
 * Initialize Bull queues for background job processing
 * Requires Redis for queue management
 */
export const initializeQueues = async () => {
  // Queues require Redis - if not configured, tasks will run synchronously
  if (!process.env.REDIS_URL) {
    console.log('ℹ️  Redis not configured - queues disabled (tasks will run synchronously)');
    return null;
  }

  try {
    // Chat processing queue - handle chat requests with rate limiting
    chatQueue = new Bull('chat-processing', process.env.REDIS_URL, {
      defaultJobOptions: {
        attempts: 3, // Retry failed jobs 3 times
        backoff: {
          type: 'exponential',
          delay: 2000, // Start with 2 second delay
        },
        removeOnComplete: 100, // Keep last 100 completed jobs
        removeOnFail: 500, // Keep last 500 failed jobs for debugging
      },
      limiter: {
        max: 50, // Process max 50 jobs
        duration: 1000, // per 1 second
      },
    });

    // Embedding generation queue - for document processing
    embeddingQueue = new Bull('embedding-processing', process.env.REDIS_URL, {
      defaultJobOptions: {
        attempts: 2,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: 50,
        removeOnFail: 200,
        timeout: 120000, // 2 minute timeout for heavy embedding tasks
      },
      limiter: {
        max: 10, // Process max 10 embedding jobs
        duration: 1000, // per 1 second (embeddings are expensive)
      },
    });

    // Analytics aggregation queue - for stats calculation
    analyticsQueue = new Bull('analytics-processing', process.env.REDIS_URL, {
      defaultJobOptions: {
        attempts: 2,
        removeOnComplete: 20,
        removeOnFail: 100,
      },
      limiter: {
        max: 20,
        duration: 1000,
      },
    });

    // Queue event handlers
    chatQueue.on('error', (error) => {
      console.error('❌ Chat Queue Error:', error);
    });

    chatQueue.on('ready', () => {
      console.log('✅ Chat Queue ready');
    });

    embeddingQueue.on('ready', () => {
      console.log('✅ Embedding Queue ready');
    });

    analyticsQueue.on('ready', () => {
      console.log('✅ Analytics Queue ready');
    });

    isQueueAvailable = true;
    console.log('✅ Bull Queues initialized successfully');

    return { chatQueue, embeddingQueue, analyticsQueue };
  } catch (error) {
    console.error('❌ Queue initialization failed:', error.message);
    console.log('⚠️  Continuing without queues - tasks will run synchronously');
    isQueueAvailable = false;
    return null;
  }
};

/**
 * Add chat job to queue
 */
export const addChatJob = async (jobData) => {
  if (!isQueueAvailable || !chatQueue) {
    return { queued: false, data: jobData };
  }

  try {
    const job = await chatQueue.add(jobData, {
      priority: jobData.priority || 5, // Lower number = higher priority
    });
    return { queued: true, jobId: job.id };
  } catch (error) {
    console.error('❌ Failed to add chat job:', error);
    return { queued: false, data: jobData };
  }
};

/**
 * Add embedding job to queue
 */
export const addEmbeddingJob = async (jobData) => {
  if (!isQueueAvailable || !embeddingQueue) {
    return { queued: false, data: jobData };
  }

  try {
    const job = await embeddingQueue.add(jobData);
    return { queued: true, jobId: job.id };
  } catch (error) {
    console.error('❌ Failed to add embedding job:', error);
    return { queued: false, data: jobData };
  }
};

/**
 * Add analytics job to queue
 */
export const addAnalyticsJob = async (jobData) => {
  if (!isQueueAvailable || !analyticsQueue) {
    return { queued: false, data: jobData };
  }

  try {
    const job = await analyticsQueue.add(jobData);
    return { queued: true, jobId: job.id };
  } catch (error) {
    console.error('❌ Failed to add analytics job:', error);
    return { queued: false, data: jobData };
  }
};

/**
 * Get queue statistics
 */
export const getQueueStats = async () => {
  if (!isQueueAvailable) {
    return { available: false };
  }

  try {
    const [chatStats, embeddingStats, analyticsStats] = await Promise.all([
      chatQueue?.getJobCounts(),
      embeddingQueue?.getJobCounts(),
      analyticsQueue?.getJobCounts(),
    ]);

    return {
      available: true,
      chat: chatStats,
      embedding: embeddingStats,
      analytics: analyticsStats,
    };
  } catch (error) {
    console.error('❌ Failed to get queue stats:', error);
    return { available: false, error: error.message };
  }
};

/**
 * Check if queues are available
 */
export const areQueuesAvailable = () => isQueueAvailable;

/**
 * Get queue instances
 */
export const getQueues = () => ({
  chatQueue,
  embeddingQueue,
  analyticsQueue,
});

/**
 * Gracefully close all queues
 */
export const closeQueues = async () => {
  try {
    await Promise.all([
      chatQueue?.close(),
      embeddingQueue?.close(),
      analyticsQueue?.close(),
    ]);
    console.log('✅ All queues closed gracefully');
  } catch (error) {
    console.error('❌ Error closing queues:', error);
  }
};

export default {
  initializeQueues,
  addChatJob,
  addEmbeddingJob,
  addAnalyticsJob,
  getQueueStats,
  areQueuesAvailable,
  getQueues,
  closeQueues,
};
