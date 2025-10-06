/**
 * Global error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * 404 Not Found handler
 */
export const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};
