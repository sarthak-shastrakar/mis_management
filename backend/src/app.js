const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const routes = require('./routes');

const app = express();

// Middleware
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// API Routes
app.use('/api/v1', routes);

// Serve Static Files from Frontend Build
const frontendPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendPath));

// API Root Status
app.get('/api/v1', (req, res) => {
  res.json({ message: 'Backend Server is running', port: process.env.PORT });
});

// Catch-all route for React SPA navigation
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

module.exports = app;
