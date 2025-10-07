import axios from 'axios';

const testChatEndpoint = async () => {
  try {
    const botId = '68e4a385447de4c35517d1a9'; // Your test bot ID
    const apiUrl = 'http://localhost:5001';
    
    console.log('🧪 Testing chat endpoint...');
    console.log(`📍 Bot ID: ${botId}`);
    console.log(`📍 API URL: ${apiUrl}`);
    
    const response = await axios.post(
      `${apiUrl}/api/chat/${botId}/message`,
      {
        message: 'Test message from script',
        sessionId: 'test-session-' + Date.now(),
      }
    );
    
    console.log('\n✅ Response received:');
    console.log(JSON.stringify(response.data, null, 2));
    
    console.log('\n🎉 Chat endpoint is working!');
    console.log('Check the backend terminal for the daily stats log.');
    
  } catch (error) {
    console.error('\n❌ Error testing chat endpoint:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
};

testChatEndpoint();
