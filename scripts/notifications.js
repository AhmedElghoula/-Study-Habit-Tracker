document.addEventListener("DOMContentLoaded", function () {
  requestNotificationPermission();
  scheduleNotification();
});

function requestNotificationPermission() {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications");
    return;
  }

  if (
    Notification.permission !== "granted" &&
    Notification.permission !== "denied"
  ) {
    Notification.requestPermission().then(function (permission) {
      if (permission === "granted") {
        console.log("Notification permission granted");
      }
    });
  }
}

function scheduleNotification() {
  if (!userData.settings.enableNotifications) return;

  const now = new Date();
  const [hours, minutes] = userData.settings.notificationTime.split(":");

  const notificationTime = new Date();
  notificationTime.setHours(parseInt(hours, 10));
  notificationTime.setMinutes(parseInt(minutes, 10));
  notificationTime.setSeconds(0);

  if (notificationTime <= now) {
    notificationTime.setDate(notificationTime.getDate() + 1);
  }

  const timeUntilNotification = notificationTime.getTime() - now.getTime();

  if (window.scheduledNotification) {
    clearTimeout(window.scheduledNotification);
  }

  window.scheduledNotification = setTimeout(function () {
    showNotification();
    scheduleNotification();
  }, timeUntilNotification);
}

function showNotification() {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return;
  }

  const today = new Date().toISOString().substr(0, 10);
  const todayLogs = userData.studyLogs.filter((log) => log.date === today);
  const todayHours = todayLogs.reduce((total, log) => total + log.hours, 0);

  let notificationTitle, notificationBody;

  if (todayLogs.length === 0) {
    notificationTitle = "Time to Study!";
    notificationBody = `You haven't logged any study time today. Your goal is ${userData.dailyGoal} hours.`;
  } else if (todayHours < userData.dailyGoal) {
    notificationTitle = "Study Reminder";
    notificationBody = `You've studied ${todayHours} hours today. Only ${(
      userData.dailyGoal - todayHours
    ).toFixed(1)} more to reach your goal!`;
  } else {
    notificationTitle = "Goal Achieved!";
    notificationBody = `Congratulations! You've met your study goal of ${userData.dailyGoal} hours today.`;
  }

  const notification = new Notification(notificationTitle, {
    body: notificationBody,
  });

  setTimeout(() => {
    notification.close();
  }, 10000);
}
