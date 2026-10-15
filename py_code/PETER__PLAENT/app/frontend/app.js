const app = window.app || {};

// Configuration
app.apiBase = ""; // Since we serve from the same origin, use relative paths
app.voiceEngine = null;
app.isProcessing = false;   // Waiting for backend response
app.isListening = false;    // Voice recognition active
app.isSpeaking = false;     // Speech synthesis active
app.neuralEngine = null;    // Will be set once the neural engine is loaded

app.init = () => {
    const clock = document.getElementById("clock");
    if (clock) {
        const tick = () => {
            const now = new Date();
            clock.textContent = now.toLocaleTimeString(undefined, { hour12: false });
            requestAnimationFrame(tick);
        };
        tick();
    }

    const indicator = document.getElementById("connectionIndicator");
    const dot = indicator?.querySelector(".dot");
    if (indicator && dot) {
        dot.style.background = "var(--cyan)";
        indicator.querySelector("span").textContent = "Local";
    }

    const greeting = document.getElementById("greeting");
    if (greeting) {
        greeting.textContent = "Peter Planet initialized. Neural visualization online.";
    }

    const log = document.getElementById("activityList");
    if (log) {
        const logActivity = (text, type = "info") => {
            const node = document.createElement("div");
            node.className = "activity-item" + (type ? " " + type : "");
            node.textContent = text;
            log.appendChild(node);
            requestAnimationFrame(() => {
                log.lastElementChild.scrollIntoView({ behavior: "smooth", block: "nearest" });
            });
        };

        logActivity("Application startup", "audit");
        logActivity("Frontend ready", "audit");
    }

    const clearBtn = document.getElementById("clearChatBtn");
    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            const messages = document.querySelectorAll(".chat-messages .message");
            messages.forEach((item) => item.remove());
            app.addMessage("Peter", "Conversation cleared.");
            logActivity("Conversation cleared", "info");
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
            logActivity("Message submitted", "audit");
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

    // Initialize voice engine
    app.initVoiceEngine();

    // Start checking backend health
    app.startHealthChecks();

    // Wait for neural engine to be exposed (it's set in neural-canvas.js)
    setTimeout(() => {
        app.neuralEngine = window.neuralEngine;
        if (app.neuralEngine) {
            app.updateNeuralEngineState(); // Set initial state
            logActivity("Neural engine ready", "audit");
        } else {
            logActivity("Neural engine not found", "error");
        }
    }, 100);
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

app.sendMessageToBackend = async (text) => {
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

app.setConnectionStatus = (status) => {
    const indicator = document.getElementById("connectionIndicator");
    const dot = indicator?.querySelector(".dot");
    const textSpan = indicator?.querySelector("span");
    if (!indicator || !dot || !textSpan) return;

    switch (status) {
        case "connected":
            dot.style.background = "var(--green)";
            textSpan.textContent = "Connected";
            break;
        case "connecting":
            dot.style.background = "var(--yellow)";
            textSpan.textContent = "Connecting...";
            break;
        case "disconnected":
            dot.style.background = "var(--red)";
            textSpan.textContent = "Disconnected";
            break;
        case "error":
            dot.style.background = "var(--red)";
            textSpan.textContent = "Error";
            break;
        default:
            dot.style.background = "var(--cyan)";
            textSpan.textContent = "Local";
    }
};

app.startHealthChecks = () => {
    // Initial check
    app.checkBackendHealth();
    // Then every 5 seconds
    setInterval(app.checkBackendHealth, 5000);
};

app.checkBackendHealth = async () => {
    app.setConnectionStatus("connecting");
    try {
        const response = await fetch(`${app.apiBase}/api/health`, {
            timeout: 3000
        });
        if (response.ok) {
            app.setConnectionStatus("connected");
        } else {
            app.setConnectionStatus("error");
        }
    } catch (error) {
        console.warn("Health check failed:", error);
        app.setConnectionStatus("disconnected");
    }
};

app.initVoiceEngine = () => {
    // Check if speech recognition and synthesis are supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const speechSynthesis = window.speechSynthesis;

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
            if (app.voiceEngine.isListening) {
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
};

app.updateVoiceButton = () => {
    const voiceBtn = document.getElementById("voiceButton");
    if (!voiceBtn || !app.voiceEngine) return;

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
    const buttons = document.querySelectorAll(".module-card");
    buttons.forEach((button) => {
        const label = button.querySelector("span:not(.badge)").textContent.toLowerCase();
        if (label.includes("core")) {
            // Check if the neural engine is in a state that indicates connection
            // For demo, we consider it connected if it's not IDLE? Or we can use a flag.
            // We'll say it's connected if the neural engine is not in IDLE state.
            if (app.neuralEngine && app.neuralEngine.state !== "IDLE") {
                button.querySelector(".badge").textContent = "Connected";
                button.classList.remove("disabled");
            } else {
                button.querySelector(".badge").textContent = "Not Connected";
                button.classList.add("disabled");
            }
        } else {
            button.querySelector(".badge").textContent = "Coming Soon";
            button.classList.add("disabled");
        }
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
        list.lastElementChild.scrollIntoView({ behavior: "smooth", block: "nearest" });
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
export const app = app;