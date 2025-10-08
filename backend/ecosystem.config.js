// PM2 Ecosystem Configuration for Memory-Optimized Production
module.exports = {
  apps: [{
    name: 'raghost-backend',
    script: './server.js',
    instances: 1, // Single instance for 512MB limit
    exec_mode: 'fork', // Use fork mode instead of cluster
    max_memory_restart: '450M', // Restart if memory exceeds 450MB (safety buffer)
    node_args: [
      '--max-old-space-size=400', // Limit heap to 400MB
      '--optimize-for-size', // Optimize for memory usage over speed
      '--gc-interval=100', // More frequent garbage collection
    ],
    env: {
      NODE_ENV: 'production',
    },
    error_file: './logs/error.log',
    out_file: './logs/output.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
  }]
};
