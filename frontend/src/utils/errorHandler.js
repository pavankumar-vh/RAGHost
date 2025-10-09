/**
 * Comprehensive Error Handler
 * Parses API errors and provides user-friendly messages with actionable guidance
 */

export const parseApiError = (error) => {
  // Default error structure
  const result = {
    title: 'Error',
    message: 'Something went wrong. Please try again.',
    action: null,
    type: 'error',
  };

  // No response - Network error
  if (!error.response) {
    result.title = 'Connection Error';
    result.message = error.message.includes('Network Error')
      ? 'Unable to connect to the server. Please check your internet connection.'
      : error.message || 'Network error occurred.';
    result.action = {
      label: 'Retry',
      onClick: () => window.location.reload(),
    };
    return result;
  }

  const { status, data } = error.response;
  const errorMessage = data?.error || data?.message || '';

  // Handle specific status codes
  switch (status) {
    case 400: // Bad Request
      result.title = 'Invalid Request';
      
      // File upload errors
      if (errorMessage.includes('file')) {
        result.message = errorMessage;
      }
      // Validation errors
      else if (errorMessage.includes('required') || errorMessage.includes('invalid')) {
        result.message = errorMessage;
      }
      // API key errors
      else if (errorMessage.includes('API key') || errorMessage.includes('api key')) {
        result.message = errorMessage;
        result.action = {
          label: 'Update API Keys',
          onClick: () => window.location.hash = '#/settings',
        };
      }
      else {
        result.message = errorMessage || 'The request contains invalid data.';
      }
      break;

    case 401: // Unauthorized
      result.title = 'Authentication Required';
      result.message = 'Your session has expired. Please sign in again.';
      result.action = {
        label: 'Sign In',
        onClick: () => window.location.hash = '#/login',
      };
      break;

    case 403: // Forbidden
      result.title = 'Access Denied';
      result.message = errorMessage || 'You don\'t have permission to perform this action.';
      break;

    case 404: // Not Found
      result.title = 'Not Found';
      result.message = errorMessage || 'The requested resource was not found.';
      break;

    case 429: // Rate Limit
      result.title = 'Rate Limit Exceeded';
      
      // Gemini API rate limit
      if (errorMessage.includes('quota') || errorMessage.includes('rate limit') || errorMessage.includes('Gemini')) {
        result.message = '⚠️ Gemini API rate limit reached. This happens when:\n\n' +
          '• Free tier: 15 requests/minute, 1,500 requests/day\n' +
          '• Too many embedding requests at once\n\n' +
          'Solutions:\n' +
          '1. Wait a few minutes and try again\n' +
          '2. Upload smaller documents\n' +
          '3. Upgrade your Gemini API quota at Google AI Studio';
        result.action = {
          label: 'Open Google AI Studio',
          onClick: () => window.open('https://aistudio.google.com/app/apikey', '_blank'),
        };
      }
      // Pinecone API rate limit
      else if (errorMessage.includes('Pinecone')) {
        result.message = '⚠️ Pinecone API rate limit reached.\n\n' +
          'Solutions:\n' +
          '1. Wait a moment and try again\n' +
          '2. Check your Pinecone plan limits\n' +
          '3. Consider upgrading your Pinecone plan';
        result.action = {
          label: 'Check Pinecone Dashboard',
          onClick: () => window.open('https://app.pinecone.io', '_blank'),
        };
      }
      else {
        result.message = 'Too many requests. Please slow down and try again in a few minutes.';
      }
      break;

    case 500: // Internal Server Error
      result.title = 'Server Error';
      
      // Parse specific server errors
      if (errorMessage.includes('MongoDB') || errorMessage.includes('database')) {
        result.message = 'Database connection error. Our team has been notified. Please try again in a few minutes.';
      }
      else if (errorMessage.includes('Pinecone')) {
        result.message = '⚠️ Vector database error. Possible causes:\n\n' +
          '• Invalid Pinecone configuration\n' +
          '• Index not found or deleted\n' +
          '• Network issues with Pinecone\n\n' +
          'Please check your Pinecone settings and try again.';
        result.action = {
          label: 'Update Pinecone Settings',
          onClick: () => window.location.hash = '#/settings',
        };
      }
      else if (errorMessage.includes('Gemini') || errorMessage.includes('embedding')) {
        result.message = '⚠️ AI embedding error. Possible causes:\n\n' +
          '• Invalid Gemini API key\n' +
          '• API quota exceeded\n' +
          '• Document text too complex\n\n' +
          'Please verify your Gemini API key and try again.';
        result.action = {
          label: 'Check API Keys',
          onClick: () => window.location.hash = '#/settings',
        };
      }
      else {
        result.message = errorMessage || 'An unexpected server error occurred. Please try again later.';
      }
      break;

    case 503: // Service Unavailable
      result.title = 'Service Unavailable';
      result.message = 'The server is temporarily unavailable. Please try again in a few minutes.';
      result.action = {
        label: 'Check Status',
        onClick: () => window.open('https://raghost-pcgw.onrender.com/health', '_blank'),
      };
      break;

    default:
      result.message = errorMessage || `An error occurred (Status: ${status})`;
  }

  return result;
};

/**
 * Parse upload-specific errors with detailed guidance
 */
export const parseUploadError = (error) => {
  const result = parseApiError(error);

  // Add upload-specific context
  if (error.response?.status === 413) {
    result.title = 'File Too Large';
    result.message = '⚠️ The file you\'re trying to upload is too large.\n\n' +
      'Maximum file size: 50MB\n\n' +
      'Solutions:\n' +
      '1. Compress the PDF using online tools\n' +
      '2. Split large documents into smaller parts\n' +
      '3. Remove unnecessary images from the document';
  }

  // Handle embedding-specific errors
  if (error.response?.data?.error?.includes('embedding')) {
    result.title = 'Embedding Failed';
    result.message = '⚠️ Failed to generate embeddings for your document.\n\n' +
      'Common causes:\n' +
      '• Document contains unsupported characters\n' +
      '• Text extraction failed\n' +
      '• Gemini API issues\n\n' +
      'Try:\n' +
      '1. Re-save the PDF using a different tool\n' +
      '2. Convert to plain text first\n' +
      '3. Check your Gemini API key';
  }

  // Handle Pinecone errors
  if (error.response?.data?.error?.includes('Pinecone')) {
    result.title = 'Vector Storage Failed';
    result.message = '⚠️ Failed to store vectors in Pinecone.\n\n' +
      'Possible causes:\n' +
      '• Invalid Pinecone credentials\n' +
      '• Index not found or wrong dimensions\n' +
      '• Pinecone service issues\n\n' +
      'Action required:\n' +
      '1. Verify Pinecone API key\n' +
      '2. Confirm index exists (1536 dimensions)\n' +
      '3. Check Pinecone dashboard for issues';
    result.action = {
      label: 'Open Pinecone Dashboard',
      onClick: () => window.open('https://app.pinecone.io', '_blank'),
    };
  }

  return result;
};

/**
 * Parse job/processing errors with progress context
 */
export const parseJobError = (jobResult) => {
  const errorMsg = jobResult?.error || 'Unknown error';
  
  const result = {
    title: 'Processing Failed',
    message: errorMsg,
    action: null,
    type: 'error',
  };

  // Rate limit errors
  if (errorMsg.includes('quota') || errorMsg.includes('rate limit') || errorMsg.includes('429')) {
    result.title = 'API Rate Limit Exceeded';
    result.message = '⚠️ Gemini API rate limit reached during processing.\n\n' +
      'Your document was uploaded but embedding failed.\n\n' +
      'What happened:\n' +
      '• Free tier allows 15 requests/minute\n' +
      '• Large documents need many API calls\n' +
      '• Previous uploads may have used your quota\n\n' +
      'Solutions:\n' +
      '1. Wait 5-10 minutes for quota to reset\n' +
      '2. Delete the failed document and re-upload\n' +
      '3. Upgrade your Gemini API quota';
    result.action = {
      label: 'Manage API Quota',
      onClick: () => window.open('https://aistudio.google.com/app/apikey', '_blank'),
    };
  }

  // Embedding dimension errors
  else if (errorMsg.includes('dimension') || errorMsg.includes('1536')) {
    result.title = 'Vector Dimension Mismatch';
    result.message = '⚠️ Pinecone index configuration error.\n\n' +
      'Your Pinecone index must be configured for 1536 dimensions (Gemini standard).\n\n' +
      'To fix:\n' +
      '1. Create a new Pinecone index with 1536 dimensions\n' +
      '2. Update your bot settings with the new index name\n' +
      '3. Re-upload your document';
    result.action = {
      label: 'Learn More',
      onClick: () => window.open('https://docs.pinecone.io/docs/indexes', '_blank'),
    };
  }

  // Text extraction errors
  else if (errorMsg.includes('extract') || errorMsg.includes('parse')) {
    result.title = 'Document Parsing Failed';
    result.message = '⚠️ Could not extract text from your document.\n\n' +
      'Common causes:\n' +
      '• Scanned PDF (image-based, not text)\n' +
      '• Corrupted or password-protected file\n' +
      '• Unsupported file format\n\n' +
      'Solutions:\n' +
      '1. Use OCR to convert scanned PDFs to text\n' +
      '2. Remove password protection\n' +
      '3. Try converting to .txt or .docx format';
  }

  // Pinecone connection errors
  else if (errorMsg.includes('Pinecone') || errorMsg.includes('upsert')) {
    result.title = 'Vector Upload Failed';
    result.message = '⚠️ Could not upload vectors to Pinecone.\n\n' +
      'Possible issues:\n' +
      '• Invalid Pinecone API key or host URL\n' +
      '• Index doesn\'t exist\n' +
      '• Network connectivity issues\n\n' +
      'To resolve:\n' +
      '1. Verify your Pinecone credentials in bot settings\n' +
      '2. Confirm the index name is correct\n' +
      '3. Check Pinecone dashboard for service status';
    result.action = {
      label: 'Update Bot Settings',
      onClick: () => window.location.hash = '#/bots',
    };
  }

  return result;
};

/**
 * Parse authentication errors
 */
export const parseAuthError = (error) => {
  const result = {
    title: 'Authentication Error',
    message: 'Authentication failed. Please try again.',
    action: null,
    type: 'error',
  };

  const errorMsg = error.message || error.code || '';

  if (errorMsg.includes('email-already-in-use')) {
    result.message = 'This email is already registered. Try signing in instead.';
    result.action = {
      label: 'Sign In',
      onClick: () => window.location.hash = '#/login',
    };
  } else if (errorMsg.includes('weak-password')) {
    result.message = 'Password is too weak. Use at least 6 characters with letters and numbers.';
  } else if (errorMsg.includes('invalid-email')) {
    result.message = 'Invalid email address. Please check and try again.';
  } else if (errorMsg.includes('user-not-found')) {
    result.message = 'No account found with this email. Try signing up instead.';
    result.action = {
      label: 'Sign Up',
      onClick: () => window.location.hash = '#/signup',
    };
  } else if (errorMsg.includes('wrong-password')) {
    result.message = 'Incorrect password. Please try again or reset your password.';
    result.action = {
      label: 'Reset Password',
      onClick: () => window.location.hash = '#/reset-password',
    };
  } else if (errorMsg.includes('too-many-requests')) {
    result.message = 'Too many failed attempts. Please wait a few minutes and try again.';
  } else if (errorMsg.includes('network')) {
    result.message = 'Network error. Please check your internet connection.';
  }

  return result;
};
