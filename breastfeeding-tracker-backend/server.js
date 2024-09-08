// Import required modules
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const Session = require('./models/Session'); // Import the Session model
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => {
  console.error('Could not connect to MongoDB', err);
  process.exit(1);
});

// Root route
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Breastfeeding Tracker API</title>
    </head>
    <body>
        <h1>Breastfeeding Tracker API</h1>
        <p>Your API is running successfully.</p>
    </body>
    </html>
  `);
});

// Route to fetch all sessions, with optional filtering by search term
app.get('/sessions', async (req, res) => {
  const { searchTerm } = req.query;
  let query = {};

  if (searchTerm) {
    query = {
      $or: [
        { date: { $regex: searchTerm, $options: 'i' } },
        { time: { $regex: searchTerm, $options: 'i' } },
        { notes: { $regex: searchTerm, $options: 'i' } }
      ]
    };
  }

  try {
    const sessions = await Session.find(query);
    res.json(sessions);
  } catch (err) {
    console.error('Error fetching sessions:', err);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// Route to add a new session
app.post('/sessions', async (req, res) => {
  const { date, time, notes } = req.body;

  if (!date || !time) {
    return res.status(400).json({ error: 'Date and time are required' });
  }

  const newSession = new Session({ date, time, notes });

  try {
    await newSession.save();
    res.status(201).json(newSession);
  } catch (err) {
    console.error('Error saving session:', err);
    res.status(500).json({ error: 'Failed to save session' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});