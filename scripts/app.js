document.addEventListener("DOMContentLoaded", function () {
  initializeApp();
  setupEventListeners();
});

let userData = {
  dailyGoal: 2,
  studyLogs: [],
  settings: {
    notificationTime: "18:00",
    enableNotifications: true,
  },
};

function initializeApp() {
  const savedData = localStorage.getItem("studyTrackerData");

  if (savedData) {
    userData = JSON.parse(savedData);
  }

  document.getElementById("daily-goal-value").textContent = userData.dailyGoal;

  const today = new Date();
  const dateString = today.toISOString().substr(0, 10);
  document.getElementById("study-date").value = dateString;

  updateDashboardStats();
}

function setupEventListeners() {
  document
    .getElementById("study-log-form")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      submitStudyLog();
    });

  document
    .getElementById("edit-goal-btn")
    .addEventListener("click", function () {
      document.getElementById("edit-goal-form").classList.remove("hidden");
      document.getElementById("new-goal").value = userData.dailyGoal;
    });

  document
    .getElementById("save-goal-btn")
    .addEventListener("click", function () {
      saveNewGoal();
    });

  document
    .getElementById("cancel-goal-btn")
    .addEventListener("click", function () {
      document.getElementById("edit-goal-form").classList.add("hidden");
    });

  document
    .getElementById("settings-btn")
    .addEventListener("click", function () {
      openNotificationSettings();
    });

  document
    .getElementById("save-notifications")
    .addEventListener("click", function () {
      saveNotificationSettings();
    });

  document.getElementById("close-modal").addEventListener("click", function () {
    document.getElementById("notification-settings").classList.add("hidden");
  });
}

function submitStudyLog() {
  const date = document.getElementById("study-date").value;
  const hours = parseFloat(document.getElementById("study-hours").value);
  const subject = document.getElementById("study-subject").value;
  const notes = document.getElementById("study-notes").value;

  const newLog = {
    date,
    hours,
    subject,
    notes,
    timestamp: new Date().toISOString(),
  };

  userData.studyLogs.unshift(newLog);

  saveUserData();

  document.getElementById("study-hours").value = "";
  document.getElementById("study-subject").value = "";
  document.getElementById("study-notes").value = "";

  updateDashboardStats();
  alert("Study time logged successfully!");
}

function saveNewGoal() {
  const newGoal = parseFloat(document.getElementById("new-goal").value);

  if (newGoal <= 0 || newGoal > 24) {
    alert("Please enter a valid goal between 0.5 and 24 hours.");
    return;
  }

  userData.dailyGoal = newGoal;
  document.getElementById("daily-goal-value").textContent = newGoal;
  document.getElementById("edit-goal-form").classList.add("hidden");

  saveUserData();

  updateDashboardStats();
}

function updateDashboardStats() {
  const today = new Date().toISOString().substr(0, 10);
  const todayLogs = userData.studyLogs.filter((log) => log.date === today);
  const todayHours = todayLogs.reduce((total, log) => total + log.hours, 0);
  const goalPercentage = Math.min((todayHours / userData.dailyGoal) * 100, 100);

  document.getElementById("today-progress").style.width = `${goalPercentage}%`;
  document.getElementById(
    "today-hours"
  ).textContent = `${todayHours} / ${userData.dailyGoal} hours`;

  const progressBar = document.getElementById("today-progress");
  if (goalPercentage >= 100) {
    progressBar.style.backgroundColor = "var(--success-color)";
  } else if (goalPercentage >= 50) {
    progressBar.style.backgroundColor = "var(--warning-color)";
  } else {
    progressBar.style.backgroundColor = "var(--primary-color)";
  }

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const weekLogs = userData.studyLogs.filter(
    (log) => new Date(log.date) >= oneWeekAgo
  );

  let weeklyTotal = 0;
  const dayCounts = {};

  weekLogs.forEach((log) => {
    weeklyTotal += log.hours;
    dayCounts[log.date] = (dayCounts[log.date] || 0) + log.hours;
  });

  const daysTracked = Object.keys(dayCounts).length;
  const weeklyAverage = daysTracked
    ? (weeklyTotal / daysTracked).toFixed(1)
    : 0;

  document.getElementById(
    "weekly-average"
  ).textContent = `${weeklyAverage} hrs`;

  let currentStreak = 0;
  let currentDate = new Date();

  const formatDate = (date) => {
    return date.toISOString().substr(0, 10);
  };

  while (true) {
    const dateStr = formatDate(currentDate);
    const dayLogs = userData.studyLogs.filter((log) => log.date === dateStr);
    const dayTotal = dayLogs.reduce((total, log) => total + log.hours, 0);

    if (dayTotal >= userData.dailyGoal) {
      currentStreak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  document.getElementById(
    "current-streak"
  ).textContent = `${currentStreak} days`;
}

function openNotificationSettings() {
  document.getElementById("notification-time").value =
    userData.settings.notificationTime;
  document.getElementById("enable-notifications").checked =
    userData.settings.enableNotifications;
  document.getElementById("notification-settings").classList.remove("hidden");
}

function saveNotificationSettings() {
  userData.settings.notificationTime =
    document.getElementById("notification-time").value;
  userData.settings.enableNotifications = document.getElementById(
    "enable-notifications"
  ).checked;

  document.getElementById("notification-settings").classList.add("hidden");

  saveUserData();

  if (userData.settings.enableNotifications) {
    scheduleNotification();
  }
}

function saveUserData() {
  localStorage.setItem("studyTrackerData", JSON.stringify(userData));
}
