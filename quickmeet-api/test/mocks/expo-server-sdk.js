module.exports = {
  Expo: class Expo {
    sendPushNotificationsAsync() {
      return Promise.resolve([{ status: 'ok' }]);
    }
    chunkPushNotifications(messages) {
      return [messages];
    }
  },
};
