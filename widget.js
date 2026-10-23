// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: clock;
//
// FocusPulse Live iPhone Widget for Scriptable
// Supports Lock Screen (Rectangular, Inline, Circular) & Home Screen (Small, Medium)
// Real-time ticking countdown via native iOS WidgetKit timer engine.

const FIREBASE_URL = "https://focuspulse-d6131-default-rtdb.firebaseio.com/state.json";
const APP_URL = "https://markazjo.github.io/focuspulse/";

const family = config.widgetFamily || "medium";
let widget = await createWidget(family);

if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  if (family === "accessoryRectangular") {
    widget.presentAccessoryRectangular();
  } else if (family === "accessoryInline") {
    widget.presentAccessoryInline();
  } else if (family === "accessoryCircular") {
    widget.presentAccessoryCircular();
  } else if (family === "small") {
    widget.presentSmall();
  } else {
    widget.presentMedium();
  }
}
Script.complete();

async function createWidget(widgetFamily) {
  let widget = new ListWidget();
  widget.backgroundColor = new Color("#000000");
  widget.url = APP_URL;

  // Fetch state from Firebase cloud
  let state = null;
  try {
    let req = new Request(FIREBASE_URL);
    req.timeoutInterval = 4;
    state = await req.loadJSON();
  } catch (e) {
    state = null;
  }

  // Calculate times
  const totalTarget = (state && state.timerTotalSeconds) ? state.timerTotalSeconds : 38640; // 10h 44m
  let remaining = (state && typeof state.timerRemainingSeconds === 'number') ? state.timerRemainingSeconds : totalTarget;
  const isRunning = state ? !!state.timerIsRunning : false;

  let targetDate = null;
  if (isRunning) {
    if (state && state.timerTargetEndDate) {
      let targetMs = Date.parse(state.timerTargetEndDate);
      if (!isNaN(targetMs) && targetMs > Date.now()) {
        targetDate = new Date(targetMs);
        remaining = Math.max(0, Math.floor((targetMs - Date.now()) / 1000));
      }
    }
    // Fallback: ensure timer ticks live even if timerTargetEndDate was missing
    if (!targetDate && remaining > 0) {
      targetDate = new Date(Date.now() + remaining * 1000);
    }
  }

  // Tell iOS to reload widget as frequently as WidgetKit allows
  widget.refreshAfterDate = new Date(Date.now() + 60 * 1000);

  // Today's worked seconds
  let workedToday = 0;
  if (state && Array.isArray(state.timeLogs)) {
    const todayStr = getTodayDayString();
    workedToday = state.timeLogs.filter(l => {
      if (l.workDate) return l.workDate === todayStr;
      if (!l.completedAt) return false;
      const ms = typeof l.completedAt === 'number' ? l.completedAt : Date.parse(l.completedAt);
      if (isNaN(ms)) return false;
      const d = new Date(ms);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` === todayStr;
    }).reduce((sum, l) => sum + (l.durationSeconds || 0), 0);
  }

  // 1. Lock Screen: Inline (Above clock)
  if (widgetFamily === "accessoryInline") {
    let text = widget.addText("");
    if (isRunning && targetDate) {
      let countdown = widget.addDate(targetDate);
      countdown.applyTimerStyle();
    } else {
      text.text = `⏳ FocusPulse: ${formatHMS(remaining)} left`;
    }
    return widget;
  }

  // 2. Lock Screen: Circular
  if (widgetFamily === "accessoryCircular") {
    let col = widget.addStack();
    col.layoutVertically();
    col.centerAlignContent();

    let title = col.addText("REMAIN");
    title.font = Font.boldSystemFont(8);
    title.textColor = new Color("#8e8e93");

    let val = col.addText(formatCompactHours(remaining));
    val.font = Font.boldSystemFont(13);
    val.textColor = new Color("#ffffff");

    return widget;
  }

  // 3. Lock Screen: Rectangular (Most popular Lock Screen widget)
  if (widgetFamily === "accessoryRectangular") {
    let root = widget.addStack();
    root.layoutVertically();
    root.spacing = 2;

    // Header line: FOCUSPULSE ● RUNNING
    let topStack = root.addStack();
    topStack.layoutHorizontally();
    topStack.centerAlignContent();

    let title = topStack.addText("FOCUSPULSE");
    title.font = Font.boldSystemFont(9);
    title.textColor = new Color("#ff9f0a");

    topStack.addSpacer();

    let dot = topStack.addText(isRunning ? "● RUNNING" : "⏸ PAUSED");
    dot.font = Font.systemFont(8);
    dot.textColor = isRunning ? new Color("#30d158") : new Color("#8e8e93");

    // Big Countdown Line (Live ticking timer on Lock Screen)
    let timeStack = root.addStack();
    timeStack.layoutHorizontally();
    timeStack.centerAlignContent();

    if (isRunning && targetDate) {
      let timer = timeStack.addDate(targetDate);
      timer.applyTimerStyle();
      timer.font = Font.boldSystemFont(18);
      timer.textColor = new Color("#ffffff");
    } else {
      let timer = timeStack.addText(formatHMS(remaining));
      timer.font = Font.boldSystemFont(18);
      timer.textColor = new Color("#ffffff");
    }

    // Progress bar
    let pct = totalTarget > 0 ? Math.min(1.0, (totalTarget - remaining) / totalTarget) : 0;
    let barBg = root.addStack();
    barBg.backgroundColor = new Color("#2c2c2e");
    barBg.cornerRadius = 2;
    barBg.size = new Size(130, 3);

    return widget;
  }

  // 4. Home Screen: Small (2x2)
  if (widgetFamily === "small") {
    widget.setPadding(12, 12, 12, 12);
    let root = widget.addStack();
    root.layoutVertically();

    // Header
    let top = root.addStack();
    top.layoutHorizontally();
    top.centerAlignContent();

    let brand = top.addText("FOCUSPULSE");
    brand.font = Font.boldSystemFont(10);
    brand.textColor = new Color("#ff9f0a");

    top.addSpacer();

    let statusDot = top.addText(isRunning ? "●" : "⏸");
    statusDot.font = Font.systemFont(10);
    statusDot.textColor = isRunning ? new Color("#30d158") : new Color("#ff9f0a");

    root.addSpacer();

    let label = root.addText("REMAINING TODAY");
    label.font = Font.systemFont(9);
    label.textColor = new Color("#8e8e93");

    root.addSpacer(2);

    // Live Countdown
    let timeStack = root.addStack();
    if (isRunning && targetDate) {
      let timer = timeStack.addDate(targetDate);
      timer.applyTimerStyle();
      timer.font = Font.systemFont(26);
      timer.textColor = new Color("#ffffff");
    } else {
      let timer = timeStack.addText(formatHMS(remaining));
      timer.font = Font.systemFont(26);
      timer.textColor = new Color("#ffffff");
    }

    root.addSpacer();

    // Progress bar
    let pct = totalTarget > 0 ? Math.min(1.0, (totalTarget - remaining) / totalTarget) : 0;
    let barBg = root.addStack();
    barBg.backgroundColor = new Color("#2c2c2e");
    barBg.cornerRadius = 3;
    barBg.size = new Size(130, 4);

    let goalSub = root.addText(`${Math.round(pct * 100)}% Completed`);
    goalSub.font = Font.systemFont(9);
    goalSub.textColor = new Color("#8e8e93");

    return widget;
  }

  // 5. Home Screen: Medium (4x2)
  widget.setPadding(14, 16, 14, 16);
  let mainStack = widget.addStack();
  mainStack.layoutHorizontally();
  mainStack.centerAlignContent();

  // Left Column: Timer & Controls
  let leftCol = mainStack.addStack();
  leftCol.layoutVertically();

  let headerStack = leftCol.addStack();
  headerStack.layoutHorizontally();
  headerStack.centerAlignContent();

  let brand = headerStack.addText("FOCUSPULSE");
  brand.font = Font.boldSystemFont(11);
  brand.textColor = new Color("#ff9f0a");

  leftCol.addSpacer(6);

  let remainLabel = leftCol.addText("TODAY'S REMAINING");
  remainLabel.font = Font.systemFont(9);
  remainLabel.textColor = new Color("#8e8e93");

  leftCol.addSpacer(2);

  // Big Timer
  let timeRow = leftCol.addStack();
  if (isRunning && targetDate) {
    let timer = timeRow.addDate(targetDate);
    timer.applyTimerStyle();
    timer.font = Font.systemFont(32);
    timer.textColor = new Color("#ffffff");
  } else {
    let timer = timeRow.addText(formatHMS(remaining));
    timer.font = Font.systemFont(32);
    timer.textColor = new Color("#ffffff");
  }

  leftCol.addSpacer(4);

  let statusText = leftCol.addText(isRunning ? "● TRACKING ACTIVE" : "⏸ TIMER PAUSED");
  statusText.font = Font.boldSystemFont(9);
  statusText.textColor = isRunning ? new Color("#30d158") : new Color("#ff9f0a");

  mainStack.addSpacer();

  // Divider line
  let div = mainStack.addStack();
  div.backgroundColor = new Color("#2c2c2e");
  div.size = new Size(1, 90);

  mainStack.addSpacer(14);

  // Right Column: Progress & Stats
  let rightCol = mainStack.addStack();
  rightCol.layoutVertically();
  rightCol.size = new Size(130, 90);

  let statHeader = rightCol.addText("TODAY'S PROGRESS");
  statHeader.font = Font.boldSystemFont(10);
  statHeader.textColor = new Color("#ff9f0a");

  rightCol.addSpacer(12);

  let pct = totalTarget > 0 ? Math.min(1.0, (totalTarget - remaining) / totalTarget) : 0;
  let pctText = rightCol.addText(`${Math.round(pct * 100)}%`);
  pctText.font = Font.boldSystemFont(28);
  pctText.textColor = new Color("#30d158");

  let pctSub = rightCol.addText("Completed");
  pctSub.font = Font.systemFont(11);
  pctSub.textColor = new Color("#8e8e93");

  return widget;
}

function formatDuration(sec) {
  sec = Math.max(0, Math.floor(sec));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s > 0 ? s + "s" : ""}`.trim();
  return `${s}s`;
}

function formatCompactHours(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return `${h}h ${m}m`;
}

function formatHMS(sec) {
  sec = Math.max(0, Math.floor(sec));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function getTodayDayString() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
