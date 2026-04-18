const cron = require('node-cron');
const Trainer = require('../modules/trainer/models/trainerModel');
const Attendance = require('../modules/attendance/models/attendanceModel');
const Notification = require('../modules/notification/models/notificationModel');
const { sendPushNotification } = require('./onesignal');

const runReminderJob = async () => {
  console.log('--- [DEBUG] Starting Attendance Reminder Logic ---');
  
  try {
    // 1. Get all active trainers
    const trainers = await Trainer.find({ status: 'active' })
      .populate('assignedProjects')
      .select('_id fullName assignedProjects oneSignalPlayerId');
    
    console.log(`[DEBUG] Found ${trainers.length} active trainers.`);

    if (trainers.length === 0) {
      return 0;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const trainersToNotify = []; // Array of { playerId: string, trainerId: ObjectId }

    for (const trainer of trainers) {
      console.log(`[DEBUG] Checking Trainer: ${trainer.fullName} (${trainer._id})`);
      
      if (!trainer.assignedProjects || trainer.assignedProjects.length === 0) {
        console.log(`  -> [SKIP] No assigned projects.`);
        continue;
      }

      let hasPendingAttendance = false;

      for (const project of trainer.assignedProjects) {
        const projectId = project._id.toString();

        const existingAttendance = await Attendance.findOne({
          trainerId: trainer._id,
          projectId: projectId,
          date: today
        });

        if (!existingAttendance) {
          try {
            await Attendance.create({
              trainerId: trainer._id,
              projectId: projectId,
              date: today,
              status: 'absent',
              remarks: 'System: bhai tune attendance nahi lagayi gaddari karbe (Auto-Absent at 7:10 PM)',
              photos: [] 
            });
            hasPendingAttendance = true;
            console.log(`  -> [ABSENT MARKED] Project: ${project.name || projectId}`);
          } catch (dupError) {
             console.log(`  -> [SKIP] Attendance already exists (possible race condition).`);
          }
        } else {
          console.log(`  -> [FOUND] Attendance already exists (${existingAttendance.status}).`);
        }
      }

      if (hasPendingAttendance) {
        if (trainer.oneSignalPlayerId) {
          trainersToNotify.push({
            playerId: trainer.oneSignalPlayerId,
            trainerId: trainer._id
          });
        } else {
          console.log(`  -> [WARNING] No OneSignalPlayerId found for this trainer.`);
        }
      }
    }

    // 3. Send notifications and save to DB
    if (trainersToNotify.length > 0) {
      const playerIds = trainersToNotify.map(t => t.playerId);
      const message = "bhai tune attendance nahi lagayi gaddari karbe";
      const title = "Attendance Missed";
      
      // Send via OneSignal
      await sendPushNotification(
        playerIds,
        message,
        title,
        true 
      );
      
      // Save logs to DB
      for (const t of trainersToNotify) {
        await Notification.create({
          recipientId: t.trainerId,
          title,
          message,
          type: 'attendance_reminder',
          status: 'sent'
        });
      }

      console.log(`[DEBUG] Sent notifications to ${playerIds.length} trainers and logged to DB.`);
      return playerIds.length;
    } else {
      console.log('[DEBUG] No trainers needed reminders.');
      return 0;
    }

  } catch (error) {
    console.error('[ERROR] in reminder job:', error);
    throw error;
  }
};

const initReminderCron = () => {
  // Scheduled for 5:00 PM daily
  cron.schedule('0 17 * * *', runReminderJob, {
    scheduled: true,
    timezone: "Asia/Kolkata"
  });

  console.log('✔ Attendance Reminder Cron Job Initialized (5:00 PM)');
};

module.exports = { initReminderCron, runReminderJob };
