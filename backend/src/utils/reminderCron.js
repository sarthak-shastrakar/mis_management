const cron = require('node-cron');
const Trainer = require('../modules/trainer/models/trainerModel');
const Attendance = require('../modules/attendance/models/attendanceModel');
const { sendPushNotification } = require('./onesignal');

const initReminderCron = () => {
  // Scheduled for 12:35 PM daily (for testing)
  // Syntax: minute hour day-of-month month day-of-week
  cron.schedule('35 12 * * *', async () => {
    console.log('--- Running Daily Attendance Reminder Cron Job (12:35 PM) ---');
    
    try {
      // 1. Get all active trainers with their assigned projects
      const trainers = await Trainer.find({ status: 'active' })
        .populate('assignedProjects')
        .select('_id fullName assignedProjects');
      
      if (!trainers || trainers.length === 0) {
        console.log('No active trainers found.');
        return;
      }

      // 2. Identify and store absent records
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const missingAttendanceTrainers = new Set(); // To avoid duplicate notifications

      for (const trainer of trainers) {
        if (!trainer.assignedProjects || trainer.assignedProjects.length === 0) continue;

        for (const project of trainer.assignedProjects) {
          const projectId = project._id.toString();

          // Check if there is any attendance entry for this trainer and project today
          const existingAttendance = await Attendance.findOne({
            trainerId: trainer._id,
            projectId: projectId,
            date: today
          });

          if (!existingAttendance) {
            // Create Absent Record
            await Attendance.create({
              trainerId: trainer._id,
              projectId: projectId,
              date: today,
              status: 'absent',
              remarks: 'System: Automatically marked absent (Attendance not submitted by cutoff)',
              photos: [] // Empty array for absent
            });
            
            missingAttendanceTrainers.add(trainer._id.toString());
            console.log(`Marked ABSENT: ${trainer.fullName} for Project: ${project.name || projectId}`);
          }
        }
      }

      // 3. Send notifications to those who were marked absent
      if (missingAttendanceTrainers.size > 0 || true) { // Forced true for testing with specific ID
        const externalUserIds = Array.from(missingAttendanceTrainers);
        
        // Add user's test ID if not present
        if (!externalUserIds.includes("1234567890")) {
          externalUserIds.push("1234567890");
        }
        
        await sendPushNotification(
          externalUserIds,
          "Bhai, aaj ki attendance mark nahi ki? Humne aapko 'Absent' mark kar diya hai. Jaldi check karo!",
          "Attendance Missed"
        );
        
        console.log(`Sent missed attendance notifications to ${externalUserIds.length} trainers.`);
      }

    } catch (error) {
      console.error('Error in reminder cron job:', error);
    }
  }, {
    scheduled: true,
    timezone: "Asia/Kolkata"
  });

  console.log('✔ Attendance Reminder Cron Job Initialized (12:21 PM)');
};

module.exports = initReminderCron;
