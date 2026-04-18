const axios = require('axios');

const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY;

/**
 * Send a push notification via OneSignal
 * @param {Array<string>} userIds - Array of IDs (Player IDs or External User IDs)
 * @param {string} message - Notification content
 * @param {string} heading - Notification title
 * @param {boolean} usePlayerId - If true, use include_player_ids; else use include_external_user_ids
 */
const sendPushNotification = async (userIds, message, heading = "Attendance Reminder", usePlayerId = true) => {
  try {
    if (!userIds || userIds.length === 0) return;

    const payload = {
      app_id: ONESIGNAL_APP_ID,
      contents: { en: message },
      headings: { en: heading },
    };

    if (usePlayerId) {
      payload.include_player_ids = userIds;
    } else {
      payload.include_external_user_ids = userIds;
    }

    const response = await axios.post(
      'https://onesignal.com/api/v1/notifications',
      payload,
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
