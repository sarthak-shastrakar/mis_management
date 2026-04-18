require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

// Connect to MongoDB
connectDB();

// Initialize Cron Jobs
const { initReminderCron } = require('./src/utils/reminderCron');
initReminderCron();

const PORT = process.env.PORT || 5005;

app.listen(PORT, () => {
  console.log(`✔ Server is running on port ${PORT}`);
});
