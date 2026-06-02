const tasks = [
  { id: "glasses", label: "Find glasses" },
  { id: "tea", label: "Make tea" },
  { id: "medication", label: "Take medication" },
  { id: "photo", label: "Look at the photo" },
  { id: "phone", label: "Call someone familiar" },
  { id: "door", label: "Leave for the appointment" }
];

const objectCopy = {
  glasses: {
    clear: "glasses",
    soft: "small lenses",
    line: "The glasses are beside the bed, folded like they were waiting.",
    softLine: "Two bright circles. Useful. Yours, probably."
  },
  tea: {
    clear: "kettle",
    soft: "warm thing",
    line: "The kettle clicks softly. Tea makes the room feel named again.",
    softLine: "Steam rises before the word for it arrives."
  },
  medication: {
    clear: "medication",
    soft: "morning bottle",
    line: "The label is clear today. One tablet after tea.",
    softLine: "The bottle has instructions. The note helps them stay still."
  },
  photo: {
    clear: "photo",
    soft: "someone loved",
    line: "Mom at the beach, 2018. Mango tea. Blue towel. Wind in her hair.",
    softLine: "She is important. The name is close, but not in reach."
  },
  phone: {
    clear: "phone",
    soft: "voice box",
    line: "The call connects. A familiar voice says, 'Take your time.'",
    softLine: "A voice arrives. The room loosens around it."
  },
  door: {
    clear: "door",
    soft: "outside",
    line: "The appointment card is in your pocket. The hallway is only a hallway.",
    softLine: "The outside waits. The note says where it begins."
  },
  note: {
    clear: "note",
    soft: "anchor",
    line: "A note in your own handwriting: glasses, tea, medicine, call, appointment.",
    softLine: "The paper remembers without asking you to apologize."
  }
};

const reflections = [
  {
    title: "Softened recall",
    poetic:
      "The prototype treats memory as a changing relationship with objects, not a simple pass/fail test. The room stays gentle, even when names slip.",
    plain:
      "This scene shows how memory can change during a familiar routine. The goal is support, not blame."
  },
  {
    title: "Support cues",
    poetic:
      "Labels, notes, and calm voices do not replace the person. They make the environment less demanding, which can reduce distress.",
    plain:
      "Notes, labels, and patient communication can make daily tasks easier and less stressful."
  },
  {
    title: "Dignity by design",
    poetic:
      "The game avoids curing the morning. It asks what a room can do when someone needs gentler ways to move through it.",
    plain:
      "The design focuses on dignity, routine, and practical help rather than a cure."
  }
];

const state = {
  started: false,
  completed: new Set(),
  support: 1,
  recall: 6,
  reflectionIndex: 0,
  settings: {
    reducedMotion: false,
    plainLanguage: false,
    largeText: false,
    highContrast: false
  }
};

const els = {
  titleScreen: document.querySelector("#titleScreen"),
  gameScreen: document.querySelector("#gameScreen"),
  settingsPanel: document.querySelector("#settingsPanel"),
  reflection: document.querySelector("#reflection"),
  ending: document.querySelector("#ending"),
  taskList: document.querySelector("#taskList"),
  currentPrompt: document.querySelector("#currentPrompt"),
  journalLog: document.querySelector("#journalLog"),
  recallMeter: document.querySelector("#recallMeter"),
  supportMeter: document.querySelector("#supportMeter"),
  caption: document.querySelector("#caption"),
  room: document.querySelector("#room"),
  player: document.querySelector("#player"),
  reflectionTitle: document.querySelector("#reflectionTitle"),
  reflectionBody: document.querySelector("#reflectionBody")
};

function init() {
  document.querySelector("#startGame").addEventListener("click", startGame);
  document.querySelector("#openSettings").addEventListener("click", () => toggleSettings(true));
  document.querySelector("#closeSettings").addEventListener("click", () => toggleSettings(false));
  document.querySelector("#supportCue").addEventListener("click", placeSupportCue);
  document.querySelector("#learnMore").addEventListener("click", showReflection);
  document.querySelector("#closeReflection").addEventListener("click", () => els.reflection.classList.add("hidden"));
  document.querySelector("#restart").addEventListener("click", restart);

  for (const key of Object.keys(state.settings)) {
    document.querySelector(`#${key}`).addEventListener("change", (event) => {
      state.settings[key] = event.target.checked;
      applySettings();
    });
  }

  document.querySelectorAll(".object").forEach((button) => {
    button.addEventListener("click", () => interact(button.dataset.object, button));
  });

  renderTasks();
  updateMeters();
}

function startGame() {
  state.started = true;
  els.titleScreen.classList.add("hidden");
  els.gameScreen.classList.remove("hidden");
  log("The morning begins in a low, warm light.");
}

function restart() {
  state.completed.clear();
  state.support = 1;
  state.recall = 6;
  state.reflectionIndex = 0;
  els.journalLog.innerHTML = "";
  document.querySelectorAll(".object").forEach((object) => object.classList.remove("done"));
  els.ending.classList.add("hidden");
  els.gameScreen.classList.remove("hidden");
  els.currentPrompt.textContent = "The apartment is quiet. Find your glasses.";
  els.caption.textContent = "Click objects in the room. Labels may change as recall softens.";
  renderTasks();
  updateLabels();
  updateMeters();
  log("The morning begins again, softly.");
}

function toggleSettings(show) {
  els.settingsPanel.classList.toggle("hidden", !show);
}

function applySettings() {
  document.body.classList.toggle("reduced-motion", state.settings.reducedMotion);
  document.body.classList.toggle("large-text", state.settings.largeText);
  document.body.classList.toggle("high-contrast", state.settings.highContrast);
  els.room.classList.toggle("reduced", state.settings.reducedMotion);
}

function interact(id, button) {
  movePlayer(button);

  if (id === "note") {
    state.support = Math.min(6, state.support + 1);
    state.recall = Math.min(6, state.recall + 1);
    log(objectCopy.note.line);
    els.caption.textContent = objectCopy.note.softLine;
    updateAfterInteraction();
    return;
  }

  const nextTask = tasks.find((task) => !state.completed.has(task.id));
  if (!nextTask || nextTask.id !== id) {
    state.recall = Math.max(1, state.recall - 0.5);
    log("The object is here, but the morning asks for something else first.");
    els.caption.textContent = "A small pause. The room does not punish you for it.";
    updateAfterInteraction();
    return;
  }

  state.completed.add(id);
  button.classList.add("done");
  const softened = state.recall <= 3.5;
  const copy = objectCopy[id];
  log(softened ? copy.softLine : copy.line);
  state.recall = Math.max(1, state.recall - 0.9);

  if (id === "phone") {
    state.support = Math.min(6, state.support + 2);
  }

  if (id === "door") {
    finishGame();
    return;
  }

  const following = tasks.find((task) => !state.completed.has(task.id));
  els.currentPrompt.textContent = following ? promptFor(following.id) : "The morning has softened enough to continue.";
  els.caption.textContent = softened ? "A word slips. The task remains possible." : "The apartment holds its shape for now.";
  updateAfterInteraction();
}

function promptFor(id) {
  const prompts = {
    glasses: "The apartment is quiet. Find your glasses.",
    tea: "Make tea before the rest of the morning gathers.",
    medication: "Take medication after tea.",
    photo: "Look at the photo near the table.",
    phone: "Call the familiar number.",
    door: "Leave for the appointment."
  };
  return prompts[id];
}

function placeSupportCue() {
  state.support = Math.min(6, state.support + 1);
  state.recall = Math.min(6, state.recall + 0.7);
  log("You place a small label where the morning keeps thinning.");
  els.caption.textContent = "Support cue placed: the room becomes a little easier to read.";
  updateAfterInteraction();
}

function updateAfterInteraction() {
  renderTasks();
  updateMeters();
  updateLabels();
}

function updateLabels() {
  const soft = state.recall < 4 && state.support < 4;
  els.room.classList.toggle("uncertain", soft);

  document.querySelectorAll(".object").forEach((button) => {
    const id = button.dataset.object;
    const copy = objectCopy[id];
    button.querySelector("span").textContent = soft ? copy.soft : copy.clear;
  });
}

function renderTasks() {
  els.taskList.innerHTML = "";
  tasks.forEach((task) => {
    const item = document.createElement("li");
    item.textContent = task.label;
    item.className = state.completed.has(task.id) ? "done" : "";
    els.taskList.append(item);
  });
}

function updateMeters() {
  els.recallMeter.style.width = `${(state.recall / 6) * 100}%`;
  els.supportMeter.style.width = `${(state.support / 6) * 100}%`;
}

function log(text) {
  const entry = document.createElement("p");
  entry.className = "entry";
  entry.textContent = text;
  els.journalLog.prepend(entry);
}

function movePlayer(target) {
  const roomRect = els.room.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  const left = ((targetRect.left + targetRect.width / 2 - roomRect.left) / roomRect.width) * 100;
  const top = ((targetRect.top + targetRect.height / 2 - roomRect.top) / roomRect.height) * 100;
  els.player.style.left = `${left}%`;
  els.player.style.top = `${top}%`;
}

function showReflection() {
  const card = reflections[state.reflectionIndex % reflections.length];
  state.reflectionIndex += 1;
  els.reflectionTitle.textContent = card.title;
  els.reflectionBody.textContent = state.settings.plainLanguage ? card.plain : card.poetic;
  els.reflection.classList.remove("hidden");
}

function finishGame() {
  els.gameScreen.classList.add("hidden");
  els.ending.classList.remove("hidden");
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

window.softRecallTrailer = {
  async run() {
    if (!state.started) {
      document.querySelector("#startGame").click();
    }

    await wait(2800);
    document.querySelector('[data-object="glasses"]').click();
    await wait(3600);
    document.querySelector('[data-object="tea"]').click();
    await wait(3600);
    document.querySelector('[data-object="medication"]').click();
    await wait(2800);
    document.querySelector("#supportCue").click();
    await wait(3300);
    document.querySelector('[data-object="photo"]').click();
    await wait(3600);
    document.querySelector('[data-object="phone"]').click();
    await wait(3300);
    document.querySelector('[data-object="door"]').click();
    await wait(7600);
  }
};

init();
