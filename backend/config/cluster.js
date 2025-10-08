import cluster from 'cluster';
import os from 'os';
import process from 'process';

/**
 * Setup cluster to utilize all CPU cores for better performance
 * This significantly improves throughput under high load
 */
export const setupCluster = (startServerFn) => {
  // Check if clustering is enabled
  const ENABLE_CLUSTERING = process.env.ENABLE_CLUSTERING === 'true';
  
  if (!ENABLE_CLUSTERING) {
    console.log('ℹ️  Clustering disabled - running in single process mode');
    startServerFn();
    return;
  }

  const numCPUs = os.cpus().length;
  const MAX_WORKERS = parseInt(process.env.MAX_WORKERS) || numCPUs;
  const actualWorkers = Math.min(MAX_WORKERS, numCPUs);

  if (cluster.isPrimary) {
    console.log(`🚀 Master process ${process.pid} is running`);
    console.log(`💻 System has ${numCPUs} CPU cores`);
    console.log(`👷 Spawning ${actualWorkers} worker processes...`);

    // Fork workers
    for (let i = 0; i < actualWorkers; i++) {
      const worker = cluster.fork();
      console.log(`✅ Worker ${worker.process.pid} started`);
    }

    // Handle worker exit
    cluster.on('exit', (worker, code, signal) => {
      console.warn(`⚠️  Worker ${worker.process.pid} died (${signal || code})`);
      
      // Restart worker automatically
      if (!worker.exitedAfterDisconnect) {
        console.log('🔄 Starting a new worker...');
        const newWorker = cluster.fork();
        console.log(`✅ New worker ${newWorker.process.pid} started`);
      }
    });

    // Handle worker online event
    cluster.on('online', (worker) => {
      console.log(`✅ Worker ${worker.process.pid} is online`);
    });

    // Handle worker disconnect
    cluster.on('disconnect', (worker) => {
      console.log(`⚠️  Worker ${worker.process.pid} disconnected`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('📥 SIGTERM signal received: closing HTTP server');
      
      // Disconnect all workers
      for (const id in cluster.workers) {
        cluster.workers[id].disconnect();
      }
      
      // Force exit after 10 seconds
      setTimeout(() => {
        console.error('❌ Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    });

    // Monitor worker health
    setInterval(() => {
      const workers = Object.values(cluster.workers);
      const activeWorkers = workers.filter(w => w && w.isConnected());
      
      if (activeWorkers.length < actualWorkers / 2) {
        console.warn(`⚠️  Warning: Only ${activeWorkers.length}/${actualWorkers} workers active`);
      }
    }, 30000); // Check every 30 seconds

  } else {
    // Worker process - start the server
    console.log(`👷 Worker ${process.pid} starting server...`);
    startServerFn();
    
    // Worker-specific graceful shutdown
    process.on('SIGTERM', () => {
      console.log(`📥 Worker ${process.pid} received SIGTERM`);
      process.exit(0);
    });
  }
};

/**
 * Get cluster information
 */
export const getClusterInfo = () => {
  if (cluster.isPrimary) {
    const workers = Object.values(cluster.workers);
    return {
      isPrimary: true,
      totalWorkers: workers.length,
      activeWorkers: workers.filter(w => w && w.isConnected()).length,
      workers: workers.map(w => ({
        id: w.id,
        pid: w.process.pid,
        state: w.state,
        isConnected: w.isConnected(),
      })),
    };
  } else {
    return {
      isPrimary: false,
      workerId: cluster.worker.id,
      pid: process.pid,
    };
  }
};

/**
 * Broadcast message to all workers
 */
export const broadcastToWorkers = (message) => {
  if (cluster.isPrimary) {
    for (const id in cluster.workers) {
      cluster.workers[id].send(message);
    }
  }
};

export default {
  setupCluster,
  getClusterInfo,
  broadcastToWorkers,
};
