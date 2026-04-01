const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const routes = require('./routes');

const app = express();

// Middleware
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/v1', routes);

app.get('/', (req, res) => {
  res.json({ message: 'Backend Server is running', port: process.env.PORT });
});

module.exports = app;
