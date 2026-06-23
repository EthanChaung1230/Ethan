const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbx_-UWPuU8EaZveHn8lC2llZ8okX0FF4JJ9_cuQH8bz-Kv_JQO1671wvhYbepOw8voCMg/exec';
                         
const DEFAULT_SECONDS = 25 * 60; // 25 minutes in seconds

const taskElements = {
  name: document.getElementById('taskName'),
  memo: document.getElementById('taskMemo'),
  estimate: document.getElementById('taskEstimate'),
  history: document.getElementById('taskHistory'),
  note: document.getElementById('taskNote'),
  timer: document.getElementById('timerDisplay'),
  message: document.getElementById('formMessage')
};
const formElements = {
  name: document.getElementById('taskNameInput'),
  memo: document.getElementById('taskMemoInput'),
  estimate: document.getElementById('taskEstimateInput'),
  history: document.getElementById('taskHistoryInput'),
  note: document.getElementById('taskNoteInput')
};
const card = document.getElementById('flipCard');
const cardInner = document.getElementById('flipCardInner');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const autoFillBtn = document.getElementById('autoFillBtn');
const taskForm = document.getElementById('taskForm');
const tabs = document.querySelectorAll('.tab');
const views = document.querySelectorAll('.view');
let timerId = null;
let seconds = DEFAULT_SECONDS;
let tasks = [];
let activeIndex = 0;

function loadTasks() {
  const saved = localStorage.getItem('focusTasks');
  tasks = saved ? JSON.parse(saved) : [];
  if (tasks.length === 0) {
    tasks.push({
      name: '例：準備工作報告',
      memo: '先整理大綱，選出三個重點。',
      estimate: '2 顆番茄鐘',
      history: 0,
      note: '保持專注 25 分鐘，休息 5 分鐘。'
    });
    localStorage.setItem('focusTasks', JSON.stringify(tasks));
  }
  renderTask(0);
}

function renderTask(index) {
  activeIndex = index;
  const task = tasks[index];
  taskElements.name.textContent = task.name;
  taskElements.memo.textContent = task.memo;
  taskElements.estimate.textContent = task.estimate;
  taskElements.history.textContent = task.history;
  taskElements.note.textContent = task.note;
  requestAnimationFrame(() => (card.classList.remove('flipped')));
}

function formatTime(value) {
  const min = String(Math.floor(value / 60)).padStart(2, '0');
  const sec = String(value % 60).padStart(2, '0');
  return `${min}:${sec}`;
}

function updateTimer() {
  taskElements.timer.textContent = formatTime(seconds);
}

function startTimer() {
  if (timerId) return;
  startBtn.disabled = true;
  pauseBtn.disabled = false;
  timerId = setInterval(() => {
    if (seconds <= 0) {
      clearInterval(timerId);
      timerId = null;
      startBtn.disabled = false;
      pauseBtn.disabled = true;
      taskElements.message.textContent = '番茄鐘結束！請休息 5 分鐘。';
      return;
    }
    seconds -= 1;
    updateTimer();
  }, 1000);
}

function pauseTimer() {
  clearInterval(timerId);
  timerId = null;
  startBtn.disabled = false;
  pauseBtn.disabled = true;
}

function autoFillTask() {
  const name = formElements.name.value.trim() || '今天的專注任務';
  const estimateCount = Math.max(1, Math.min(6, Math.ceil(name.length / 6)));
  formElements.memo.value = `請專注完成「${name}」，先列出步驟並移除可能的干擾。`;
  formElements.estimate.value = `${estimateCount} 顆番茄鐘`;
  formElements.history.value = '0';
  formElements.note.value = '今天先從最重要的工作開始，維持 25 分鐘專注。';
  taskElements.message.textContent = '自動填入建議完成。';
}

async function sendTaskToGAS(task) {
  if (!GAS_WEB_APP_URL || GAS_WEB_APP_URL.includes('YOUR_GAS_WEB_APP_URL')) {
    return { success: false, message: '請在 script.js 中填入 GAS_WEB_APP_URL。' };
  }

  const response = await fetch(GAS_WEB_APP_URL, {
    method: 'POST',
    mode: 'cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task)
  });

  if (!response.ok) {
    return { success: false, message: `後端回應 ${response.status}` };
  }
  return response.json();
}

function setActiveTaskInForm(task) {
  formElements.name.value = task.name;
  formElements.memo.value = task.memo;
  formElements.estimate.value = task.estimate;
  formElements.history.value = task.history;
  formElements.note.value = task.note;
}

function showMessage(text) {
  taskElements.message.textContent = text;
}

function switchView(viewId) {
  views.forEach(view => view.classList.toggle('active', view.id === viewId));
  tabs.forEach(tab => tab.classList.toggle('active', tab.dataset.view === viewId));
}

card.addEventListener('click', () => card.classList.toggle('flipped'));
card.addEventListener('keydown', event => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    card.classList.toggle('flipped');
  }
});

startBtn.addEventListener('click', () => {
  if (seconds === 0) seconds = DEFAULT_SECONDS;
  startTimer();
});
pauseBtn.addEventListener('click', pauseTimer);
autoFillBtn.addEventListener('click', autoFillTask);

taskForm.addEventListener('submit', async event => {
  event.preventDefault();
  const task = {
    name: formElements.name.value.trim(),
    memo: formElements.memo.value.trim(),
    estimate: formElements.estimate.value.trim(),
    history: Number(formElements.history.value) || 0,
    note: formElements.note.value.trim()
  };

  if (!task.name) {
    showMessage('任務名稱為必填。');
    return;
  }

  tasks.unshift(task);
  localStorage.setItem('focusTasks', JSON.stringify(tasks));
  renderTask(0);
  setActiveTaskInForm(task);
  seconds = DEFAULT_SECONDS;
  updateTimer();

  try {
    const result = await sendTaskToGAS(task);
    const text = result.success ? '任務已儲存並送到 GAS。' : `儲存本機成功，後端錯誤：${result.message}`;
    showMessage(text);
  } catch (error) {
    showMessage(`儲存本機成功，但送出後端失敗：${error.message}`);
  }
});

tabs.forEach(tab => {
  tab.addEventListener('click', () => switchView(tab.dataset.view));
});

updateTimer();
loadTasks();
