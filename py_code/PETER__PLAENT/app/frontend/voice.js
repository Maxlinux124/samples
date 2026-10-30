function getVoiceState() {
    return {
        speechSynthesisSupported: "speechSynthesis" in window,
        speechRecognitionSupported: "SpeechRecognition" in window || "webkitSpeechRecognition" in window
    };
}

function getVoiceRecordButton() {
    return document.getElementById("voiceButton");
}

function getVoiceStateText() {
    return document.getElementById("statusLabel");
}

function getActivityLog() {
    return document.getElementById("activityList");
}

function getActivityCountText() {
    return document.getElementById("activityCount");
}

function logActivity(text, type) {
    const list = getActivityLog();
    if (!list) return;
    const emptyState = document.getElementById("activityEmpty");
    if (emptyState) emptyState.hidden = true;
    const node = document.createElement("div");
    node.className = "activity-item" + (type ? " " + type : "");
    node.textContent = text;
    list.appendChild(node);
    requestAnimationFrame(() => {
        list.lastElementChild.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
    const counter = getActivityCountText();
    if (counter) counter.textContent = String(Number(counter.textContent.replace(" events", "")) + 1) + " events";
}

function recordError(text, type) {
    logActivity("Error: " + text, type || "error");
}

function recordInfo(text, type) {
    logActivity(text, type || "info");
}

function recordMicrophoneDenied(type) {
    recordError("Microphone permission denied", type);
}

function recordRecognitionError(type) {
    recordError("Speech recognition failed", type);
}

const voice = {
    getVoiceState,
    getVoiceRecordButton,
    getVoiceStateText,
    getActivityLog,
    logActivity,
    recordError,
    recordInfo,
    recordMicrophoneDenied,
    recordRecognitionError
};

export default voice;
