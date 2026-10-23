import { initNeuralCanvas } from "./neural-canvas.js";

const app = window.app || {};
let isInitialized = false;

// Configuration
app.apiBase = ""; // Since we serve from the same origin, use relative paths
app.voiceEngine = null;
app.isProcessing = false;   // Waiting for backend response
app.isListening = false;    // Voice recognition active
app.isSpeaking = false;     // Speech synthesis active
app.neuralEngine = null;    // Will be set once the neural engine is loaded

app.init = () => {
    if (isInitialized) return;
    const clock = document.getElementById("clock");
    if (clock) {
        const tick = () => {
            const now = new Date();
            clock.textContent = now.toLocaleTimeString(undefined, { hour12: false });
            requestAnimationFrame(tick);
        };
        tick();
    }

    const greeting = document.getElementById("greeting");
    if (greeting) {
        greeting.textContent = "Neural visualization ready. Chat service status is being checked.";
    }

    app.logActivity("Application startup", "audit");
    app.logActivity("Frontend ready", "audit");
    const clearBtn = document.getElementById("clearChatBtn");
    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            const messages = document.querySelectorAll(".chat-messages .message");
            messages.forEach((item) => item.remove());
            app.addMessage("Peter", "Conversation cleared.");
            app.logActivity("Conversation cleared", "info");
        });
    }

    const sendBtn = document.getElementById("sendBtn");
    const messageInput = document.getElementById("messageInput");
    if (sendBtn && messageInput) {
        sendBtn.addEventListener("click", () => {
            const text = messageInput.value.trim();
            if (!text) return;
            app.sendMessageToBackend(text);
            messageInput.value = "";
            messageInput.style.height = "auto";
            app.logActivity("Message submitted", "audit");
        });

        messageInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendBtn.click();
            }
        });
    }

    const voiceBtn = document.getElementById("voiceButton");
    if (voiceBtn) {
        voiceBtn.addEventListener("click", async () => {
            if (app.voiceEngine) {
                await app.voiceEngine.toggle();
                app.updateModules();
            }
        });
    }

    const settingsBtn = document.getElementById("settingsBtn");
    const modalBackdrop = document.getElementById("modalBackdrop");
    const settingsModal = document.getElementById("settingsModal");
    const closeSettingsBtn = document.getElementById("closeSettingsBtn");

    if (settingsBtn && modalBackdrop && settingsModal && closeSettingsBtn) {
        settingsBtn.addEventListener("click", () => {
            settingsModal.hidden = false;
            modalBackdrop.hidden = false;
        });

        const close = () => {
            settingsModal.hidden = true;
            modalBackdrop.hidden = true;
        };

        closeSettingsBtn.addEventListener("click", close);
        modalBackdrop.addEventListener("click", close);
    }

    document.querySelectorAll(".nav-link[href^='#']").forEach((link) => {
        link.addEventListener("click", () => {
            document.querySelectorAll(".nav-link[href^='#']").forEach((item) => item.classList.remove("active"));
            link.classList.add("active");
        });
    });

    // Initialize voice engine
    app.initVoiceEngine();

    // Start checking backend health
    app.startHealthChecks();

    app.neuralEngine = initNeuralCanvas();
    app.neuralEngine.start();
    app.updateNeuralEngineState();
    app.logActivity("Neural animation ready", "audit");
    isInitialized = true;
};

app.addMessage = (from, text) => {
    const messages = document.getElementById("chatMessages");
    if (!messages) return;
    const message = document.createElement("div");
    message.className = `message ${from === "Me" ? "user" : "demo"}`;
    message.innerHTML = `
        <div class="message-avatar">${from === "Me" ? "Me" : "P"}</div>
        <div class="message-bubble">${escapeHtml(text)}</div>
    `;
    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight;
};

app.setChatMode = (mode) => {
    const badge = document.getElementById("chatMode");
    if (!badge) return;
    badge.textContent = mode ? (mode === "demo" ? "Demo Mode" : `${mode} mode`) : "Mode unavailable";
};

app.sendMessageToBackend = async (text) => {
    app.addMessage("Me", text);
    // Set processing state
    app.isProcessing = true;
    app.updateNeuralEngineState();
    app.logActivity("Sending message to backend", "audit");
    try {
        const response = await fetch(`${app.apiBase}/api/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message: text })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.mode) app.setChatMode(data.mode);
        const reply = data.reply || "Sorry, I didn't understand that.";
        app.addMessage("Peter", reply);
        app.logActivity("Backend response received", "audit");

        // Speak the response if voice synthesis is enabled
        if (app.voiceEngine && app.voiceEngine.speechSynthesisEnabled) {
            app.voiceEngine.speak(reply);
        }
    } catch (error) {
        console.error("Error communicating with backend:", error);
        app.addMessage("Peter", "Sorry, I'm having trouble connecting to my brain. Please check the connection.");
        app.logActivity("Backend communication error: " + error.message, "error");
        // Show error in the connection indicator
        app.setConnectionStatus("error");
    } finally {
        app.isProcessing = false;
        app.updateNeuralEngineState();
    }
};

app.updateNeuralEngineState = () => {
    if (!app.neuralEngine) return;
    let newState = "IDLE";
    if (app.isProcessing) {
        newState = "PROCESSING";
    } else if (app.isListening) {
        newState = "LISTENING";
    } else if (app.isSpeaking) {
        newState = "SPEAKING";
    }
    app.neuralEngine.setState(newState);
};

app.setStatusLabel = (id, text, state) => {
    const label = document.getElementById(id);
    if (!label) return;
    label.textContent = text;
    label.className = "status-value " + (state || "checking");
};

app.setConnectionStatus = (status) => {
    const indicator = document.getElementById("connectionIndicator");
    const dot = indicator?.querySelector(".dot");
    const textSpan = indicator?.querySelector("span:last-child");
    if (!indicator || !dot || !textSpan) return;

    const states = {
        connected: ["Backend running", "#62d6a5"],
        connecting: ["Checking backend", "#e7bd68"],
        disconnected: ["Backend unavailable", "#f07882"],
        error: ["Backend error", "#f07882"]
    };
    const [label, color] = states[status] || states.connecting;
    dot.style.background = color;
    dot.style.boxShadow = "0 0 12px " + color + "55";
    textSpan.textContent = label;
    indicator.dataset.state = status;
};


app.startHealthChecks = () => {
    // Initial check
    app.checkBackendHealth();
    // Then every 5 seconds
    setInterval(app.checkBackendHealth, 5000);
};

app.checkBackendHealth = async () => {
    try {
        const healthResponse = await fetch(`${app.apiBase}/api/health`);
        if (!healthResponse.ok) throw new Error("Health endpoint returned an error");
        const health = await healthResponse.json();
        if (health.status !== "ok") throw new Error("Backend health check failed");

        app.setConnectionStatus("connected");
        app.setStatusLabel("backendStatus", "Running", "ok");

        try {
            const statusResponse = await fetch(`${app.apiBase}/api/status`);
            if (!statusResponse.ok) throw new Error("Status endpoint returned an error");
            const status = await statusResponse.json();
            const services = status.services || {};

            app.setStatusLabel("backendStatus", status.backend === "running" ? "Running" : "Unavailable", status.backend === "running" ? "ok" : "unavailable");
            app.setStatusLabel("aiEngineStatus", services.ai_engine === "demo" ? "Demo responses" : (services.ai_engine || "Unavailable"), services.ai_engine === "demo" ? "demo" : "unavailable");
            app.setStatusLabel("databaseStatus", services.database === "disconnected" ? "Not connected" : (services.database || "Unavailable"), services.database === "disconnected" ? "off" : "unavailable");
            app.setChatMode(services.ai_engine === "demo" ? "demo" : null);
            const greeting = document.getElementById("greeting");
            if (greeting) greeting.textContent = services.ai_engine === "demo" ? "Local demo chat is available. Voice input is optional." : "Backend status loaded.";
        } catch (statusError) {
            console.warn("Backend status check failed:", statusError);
            app.setStatusLabel("aiEngineStatus", "Unavailable", "unavailable");
            app.setStatusLabel("databaseStatus", "Unavailable", "unavailable");
            app.setChatMode(null);
            const greeting = document.getElementById("greeting");
            if (greeting) greeting.textContent = "Backend is running, but service details are unavailable.";
        }
    } catch (error) {
        console.warn("Health check failed:", error);
        app.setConnectionStatus("disconnected");
        app.setStatusLabel("backendStatus", "Unavailable", "unavailable");
        app.setStatusLabel("aiEngineStatus", "Unavailable", "unavailable");
        app.setStatusLabel("databaseStatus", "Unavailable", "unavailable");
        app.setChatMode(null);
        const greeting = document.getElementById("greeting");
        if (greeting) greeting.textContent = "Backend unavailable. Chat requires the local server.";
    }
};


app.initVoiceEngine = () => {
    // Check if speech recognition and synthesis are supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const speechSynthesis = window.speechSynthesis;

    const recognitionAvailable = !!SpeechRecognition;
    const synthesisAvailable = !!speechSynthesis;
    app.setStatusLabel("speechRecognitionStatus", recognitionAvailable ? "Available" : "Unavailable", recognitionAvailable ? "ok" : "off");
    app.setStatusLabel("speechSynthesisStatus", synthesisAvailable ? "Available" : "Unavailable", synthesisAvailable ? "ok" : "off");
    const recognitionSettings = document.getElementById("recognitionStatusText");
    const synthesisSettings = document.getElementById("synthesisStatusText");
    if (recognitionSettings) recognitionSettings.textContent = recognitionAvailable ? "Available" : "Unavailable";
    if (synthesisSettings) synthesisSettings.textContent = synthesisAvailable ? "Available" : "Unavailable";
    const microphoneStatus = document.getElementById("micPermissionText");
    if (microphoneStatus) microphoneStatus.textContent = "Not requested";

    app.voiceEngine = {
        recognition: null,
        synthesis: speechSynthesis,
        speechSynthesisEnabled: !!speechSynthesis,
        init: () => {
            if (SpeechRecognition) {
                app.voiceEngine.recognition = new SpeechRecognition();
                app.voiceEngine.recognition.continuous = false;
                app.voiceEngine.recognition.interimResults = false;
                app.voiceEngine.recognition.lang = "en-US";

                app.voiceEngine.recognition.onresult = (event) => {
                    const transcript = event.results[0][0].transcript;
                    if (transcript) {
                        app.sendMessageToBackend(transcript);
                    }
                    app.isListening = false;
                    app.updateNeuralEngineState();
                    app.updateVoiceButton();
                };

                app.voiceEngine.recognition.onend = () => {
                    app.isListening = false;
                    app.updateNeuralEngineState();
                    app.updateVoiceButton();
                    // If we were listening and it ended without a result, we go back to idle
                    // (handled by isListening being false)
                };

                app.voiceEngine.recognition.onerror = (event) => {
                    console.error("Speech recognition error:", event.error);
                    app.logActivity("Speech recognition error: " + event.error, "error");
                    app.isListening = false;
                    app.updateNeuralEngineState();
                    app.updateVoiceButton();
                };
            }
        },
        start: () => {
            if (app.voiceEngine.recognition) {
                try {
                    app.voiceEngine.recognition.start();
                    app.isListening = true;
                    app.updateNeuralEngineState();
                    app.updateVoiceButton();
                    app.logActivity("Speech recognition started", "audit");
                } catch (error) {
                    console.error("Error starting speech recognition:", error);
                    app.logActivity("Error starting speech recognition: " + error.message, "error");
                }
            }
        },
        stop: () => {
            if (app.voiceEngine.recognition) {
                try {
                    app.voiceEngine.recognition.stop();
                } catch (error) {
                    console.error("Error stopping speech recognition:", error);
                }
            }
            app.isListening = false;
            app.updateNeuralEngineState();
            app.updateVoiceButton();
        },
        toggle: async () => {
            if (app.voiceEngine.isListening()) {
                await app.voiceEngine.stop();
            } else {
                await app.voiceEngine.start();
            }
        },
        speak: (text) => {
            if (app.voiceEngine.synthesis && app.voiceEngine.speechSynthesisEnabled) {
                // Cancel any ongoing speech
                app.voiceEngine.synthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.onend = () => {
                    app.isSpeaking = false;
                    app.updateNeuralEngineState();
                    app.updateVoiceButton();
                };
                utterance.onstart = () => {
                    app.isSpeaking = true;
                    app.updateNeuralEngineState();
                    app.updateVoiceButton();
                };
                app.voiceEngine.synthesis.speak(utterance);
                app.isSpeaking = true;
                app.updateNeuralEngineState();
                app.updateVoiceButton();
            }
        },
        isListening: () => app.isListening,
        isSpeaking: () => app.isSpeaking
    };

    app.voiceEngine.init();
    app.updateVoiceButton();
};

app.updateVoiceButton = () => {
    const voiceBtn = document.getElementById("voiceButton");
    if (!voiceBtn || !app.voiceEngine) return;

    if (!app.voiceEngine.recognition) {
        voiceBtn.disabled = true;
        voiceBtn.setAttribute("aria-label", "Voice input unavailable");
        voiceBtn.setAttribute("title", "Speech recognition is unavailable");
        return;
    }

    voiceBtn.disabled = false;
    if (app.voiceEngine.isListening()) {
        voiceBtn.classList.add("active");
        voiceBtn.setAttribute("aria-label", "Stop voice input");
        voiceBtn.setAttribute("title", "Listening... Click to stop");
    } else {
        voiceBtn.classList.remove("active");
        voiceBtn.setAttribute("aria-label", "Start voice input");
        voiceBtn.setAttribute("title", "Start voice input");
    }
};


app.updateModules = () => {
    document.querySelectorAll(".module-card").forEach((card) => {
        const name = card.querySelector(".module-name")?.textContent.trim().toLowerCase();
        const badge = card.querySelector(".badge");
        if (!name || !badge) return;
        badge.textContent = name.includes("peter core") ? "Visual only" : "Coming soon";
    });
};


app.logActivity = (text, type) => {
    const list = document.getElementById("activityList");
    if (!list) return;
    const node = document.createElement("div");
    node.className = "activity-item" + (type ? " " + type : "");
    node.textContent = text;
    list.appendChild(node);
    requestAnimationFrame(() => {
        list.scrollTop = list.scrollHeight;
    });
    const counter = document.getElementById("activityCount");
    if (counter) {
        const count = Number(counter.textContent.replace(" events", "")) + 1;
        counter.textContent = count + " events";
    }
};

function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = value;
    return div.innerHTML;
}

// Export for use in other modules if needed
window.app = app;

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", app.init, { once: true });
} else {
    app.init();
}
