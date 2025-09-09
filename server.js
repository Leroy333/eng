const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Serve the React app
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Telegram Web App endpoint
app.get('/webapp', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// API endpoints for Telegram bot
app.post('/api/user', (req, res) => {
  const { telegramId, username, firstName, lastName } = req.body;
  
  // Here you would save user data to database
  console.log('User data:', { telegramId, username, firstName, lastName });
  
  res.json({ success: true, message: 'User data received' });
});

app.get('/api/user/:telegramId', (req, res) => {
  const { telegramId } = req.params;
  
  // Here you would fetch user data from database
  const userData = {
    telegramId,
    newWordsCount: 20,
    currentPage: 'onboarding'
  };
  
  res.json(userData);
});

app.post('/api/progress', (req, res) => {
  const { telegramId, wordId, status } = req.body;
  
  // Here you would update user progress in database
  console.log('Progress update:', { telegramId, wordId, status });
  
  res.json({ success: true, message: 'Progress updated' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Web App available at: http://localhost:${PORT}/webapp`);
});
