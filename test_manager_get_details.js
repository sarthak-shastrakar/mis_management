const mongoose = require('mongoose');
const { getProjectDetails } = require('./backend/src/modules/manager/controllers/managerController.js');

// mock request and response
let loggedError = null;
const req = {
  params: { id: "64a2..." }, // mock id
  user: { id: "user123" }
};
const res = {
  status: function(code) { this.statusCode = code; return this; },
  json: function(data) { this.data = data; }
};

// ... we can't easily mock because it connects to DB
