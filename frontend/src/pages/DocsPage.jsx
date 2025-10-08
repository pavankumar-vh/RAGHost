import React, { useState } from 'react';
import { BookOpen, Key, Database, Copy, Check, ExternalLink, ChevronRight } from 'lucide-react';

const DocsPage = () => {
  const [copiedText, setCopiedText] = useState('');

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const CodeBlock = ({ code, id }) => (
    <div className="relative bg-dark-bg rounded-lg p-4 mt-2 border border-gray-700">
      <button
        onClick={() => copyToClipboard(code, id)}
        className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
      >
        {copiedText === id ? (
          <Check size={16} className="text-green-400" />
        ) : (
          <Copy size={16} className="text-gray-400" />
        )}
      </button>
      <pre className="text-sm text-gray-300 overflow-x-auto pr-12">
        <code>{code}</code>
      </pre>
    </div>
  );

  const StepCard = ({ number, title, children }) => (
    <div className="bg-dark-card rounded-xl p-6 border border-gray-700/50 hover:border-accent-blue/50 transition-all">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 bg-accent-blue rounded-full flex items-center justify-center font-bold text-lg">
          {number}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold mb-3 text-white">{title}</h3>
          <div className="text-gray-300 space-y-3">{children}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-bg text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-accent-blue/10 to-accent-purple/10 border-b border-gray-700/50">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen size={32} className="text-accent-blue" />
            <h1 className="text-4xl font-bold">Documentation</h1>
          </div>
          <p className="text-xl text-gray-300">
            Learn how to get your API keys and start building your AI chatbot
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        {/* Quick Start */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <ChevronRight size={24} className="text-accent-yellow" />
            <h2 className="text-3xl font-bold">Quick Start</h2>
          </div>
          <p className="text-lg text-gray-300 mb-6">
            To create your chatbot, you'll need API keys from Google Gemini and Pinecone. Follow these simple steps:
          </p>
        </section>

        {/* Gemini API Key */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Key size={28} className="text-accent-pink" />
            <h2 className="text-3xl font-bold">Getting Your Gemini API Key</h2>
          </div>
          
          <div className="space-y-6">
            <StepCard number="1" title="Visit Google AI Studio">
              <p>Go to Google AI Studio to get your free API key:</p>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-accent-blue hover:bg-accent-blue/90 rounded-lg transition-colors mt-2"
              >
                Open Google AI Studio <ExternalLink size={16} />
              </a>
            </StepCard>

            <StepCard number="2" title="Sign in with Google">
              <p>Use your Google account to sign in. If you don't have one, create a new Google account first.</p>
            </StepCard>

            <StepCard number="3" title="Create API Key">
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Click on <strong>"Create API Key"</strong> or <strong>"Get API Key"</strong></li>
                <li>Select your Google Cloud project (or create a new one)</li>
                <li>Your API key will be generated instantly</li>
              </ul>
            </StepCard>

            <StepCard number="4" title="Copy Your API Key">
              <p>Click the copy button next to your API key and save it securely. It should look like this:</p>
              <CodeBlock 
                code="AIzaSyD-example_key-1234567890abcdef" 
                id="gemini-example"
              />
              <div className="bg-amber-500/10 border border-amber-500/50 rounded-lg p-4 mt-3">
                <p className="text-amber-400 text-sm">
                  ⚠️ <strong>Important:</strong> Keep your API key secure! Don't share it publicly or commit it to version control.
                </p>
              </div>
            </StepCard>

            <StepCard number="5" title="Check Usage Limits">
              <p>Google Gemini offers a generous free tier:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Free Tier:</strong> 60 requests per minute</li>
                <li><strong>Cost:</strong> Completely free for development</li>
                <li><strong>Rate Limits:</strong> Sufficient for most chatbot use cases</li>
              </ul>
            </StepCard>
          </div>
        </section>

        {/* Pinecone API Key */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Database size={28} className="text-accent-purple" />
            <h2 className="text-3xl font-bold">Getting Your Pinecone API Key</h2>
          </div>
          
          <div className="space-y-6">
            <StepCard number="1" title="Sign up for Pinecone">
              <p>Create a free Pinecone account:</p>
              <a
                href="https://www.pinecone.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-accent-purple hover:bg-accent-purple/90 rounded-lg transition-colors mt-2"
              >
                Go to Pinecone <ExternalLink size={16} />
              </a>
            </StepCard>

            <StepCard number="2" title="Create Your Account">
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Click <strong>"Sign Up"</strong> or <strong>"Start Free"</strong></li>
                <li>Enter your email and create a password</li>
                <li>Verify your email address</li>
              </ul>
            </StepCard>

            <StepCard number="3" title="Create a New Index">
              <p>After signing in, create your first vector database index:</p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                <li>Click <strong>"Create Index"</strong> in the dashboard</li>
                <li><strong>Index Name:</strong> Choose any name (e.g., "my-chatbot")</li>
                <li><strong>Dimensions:</strong> Enter <code className="bg-dark-bg px-2 py-1 rounded">768</code> (for Gemini embeddings)</li>
                <li><strong>Metric:</strong> Select <strong>"Cosine"</strong></li>
                <li><strong>Cloud:</strong> Choose any free region (e.g., "us-east-1")</li>
                <li>Click <strong>"Create Index"</strong></li>
              </ul>
              <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-4 mt-3">
                <p className="text-blue-400 text-sm">
                  💡 <strong>Tip:</strong> The index creation takes 1-2 minutes. You can proceed to get your API key while it's being created.
                </p>
              </div>
            </StepCard>

            <StepCard number="4" title="Get Your API Key">
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Go to <strong>"API Keys"</strong> in the left sidebar</li>
                <li>Click <strong>"Create API Key"</strong></li>
                <li>Give it a name (e.g., "chatbot-key")</li>
                <li>Copy your API key - it starts with <code className="bg-dark-bg px-2 py-1 rounded">pcsk_</code></li>
              </ul>
              <CodeBlock 
                code="pcsk_example-1234_key567890abcdefghijklmnop" 
                id="pinecone-api-example"
              />
            </StepCard>

            <StepCard number="5" title="Get Your Environment URL">
              <p>You'll also need your Pinecone environment URL:</p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                <li>Go to your index details page</li>
                <li>Find the <strong>"Host"</strong> or <strong>"Environment"</strong> field</li>
                <li>Copy the full URL (e.g., <code className="bg-dark-bg px-2 py-1 rounded">https://your-index-abc123.svc.region.pinecone.io</code>)</li>
              </ul>
              <CodeBlock 
                code="https://my-index-abc123.svc.us-east-1-aws.pinecone.io" 
                id="pinecone-env-example"
              />
            </StepCard>

            <StepCard number="6" title="Pinecone Free Tier Limits">
              <p>Pinecone's Starter (free) plan includes:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Storage:</strong> 100,000 vectors (enough for ~5,000 documents)</li>
                <li><strong>Queries:</strong> Unlimited queries</li>
                <li><strong>Cost:</strong> Completely free</li>
                <li><strong>Performance:</strong> Single pod with good response times</li>
              </ul>
            </StepCard>
          </div>
        </section>

        {/* Using Your Keys */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <ChevronRight size={28} className="text-accent-green" />
            <h2 className="text-3xl font-bold text-accent-green">Using Your API Keys</h2>
          </div>
          
          <div className="space-y-6">
            <StepCard number="1" title="Create Your Bot">
              <p>In the RAGhost dashboard, click <strong>"Create New Bot"</strong></p>
            </StepCard>

            <StepCard number="2" title="Enter Your Keys">
              <p>Paste your API keys into the bot creation form:</p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                <li><strong>Gemini API Key:</strong> Your AIzaSy... key</li>
                <li><strong>Pinecone API Key:</strong> Your pcsk_... key</li>
                <li><strong>Pinecone Environment:</strong> Your https://... URL</li>
                <li><strong>Pinecone Index Name:</strong> The name you chose when creating the index</li>
              </ul>
            </StepCard>

            <StepCard number="3" title="Upload Documents">
              <p>Add knowledge to your chatbot by uploading documents:</p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                <li>Supported formats: PDF, TXT, DOCX, MD</li>
                <li>Max file size: 10MB per file</li>
                <li>Your documents will be processed and stored as vectors</li>
              </ul>
            </StepCard>

            <StepCard number="4" title="Test Your Bot">
              <p>Use the chat interface to test your bot with questions about your uploaded documents!</p>
            </StepCard>
          </div>
        </section>

        {/* Troubleshooting */}
        <section>
          <div className="bg-dark-card rounded-xl p-8 border border-gray-700/50">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="text-3xl">🔧</span> Troubleshooting
            </h2>
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="font-semibold text-white mb-2">❌ "Invalid API Key" Error</h3>
                <p className="ml-4">• Double-check you copied the entire key without spaces<br/>• Make sure your Gemini API key is enabled in Google Cloud Console</p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">❌ "Index Not Found" Error</h3>
                <p className="ml-4">• Verify your Pinecone index name is spelled correctly<br/>• Ensure the index has finished initializing (check Pinecone dashboard)</p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">❌ Rate Limit Errors</h3>
                <p className="ml-4">• Gemini free tier: 60 requests/min - wait a minute and try again<br/>• Consider upgrading if you need higher limits</p>
              </div>
            </div>
          </div>
        </section>

        {/* Support */}
        <section className="text-center py-8">
          <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
          <p className="text-gray-300 mb-6">
            If you're having trouble getting your API keys, check out the official documentation:
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="https://ai.google.dev/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors inline-flex items-center gap-2"
            >
              Gemini Docs <ExternalLink size={16} />
            </a>
            <a
              href="https://docs.pinecone.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors inline-flex items-center gap-2"
            >
              Pinecone Docs <ExternalLink size={16} />
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DocsPage;
