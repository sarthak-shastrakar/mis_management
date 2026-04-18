const axios = require('axios');

const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY;

/**
 * Send a push notification via OneSignal
 * @param {Array<string>} externalUserIds - Array of MongoDB User IDs
 * @param {string} message - Notification content
 * @param {string} heading - Notification title
 */
const sendPushNotification = async (externalUserIds, message, heading = "Attendance Reminder") => {
  try {
    if (!externalUserIds || externalUserIds.length === 0) return;

    const response = await axios.post(
      'https://onesignal.com/api/v1/notifications',
      {
        app_id: ONESIGNAL_APP_ID,
        include_external_user_ids: externalUserIds,
        contents: { en: message },
        headings: { en: heading },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`
        }
      }
    );

    console.log('OneSignal Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending OneSignal notification:', error.response ? error.response.data : error.message);
    throw error;
  }
};

module.exports = {
  sendPushNotification
};
