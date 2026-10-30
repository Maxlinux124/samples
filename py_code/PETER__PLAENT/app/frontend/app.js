import { initPeterCore3D } from "./peter-core-3d.js";

const app = window.app || {};
const YOUTUBE_TASK_URL = "https://www.youtube.com/";
let isInitialized = false;

function isYouTubeTaskRequest(message) {
    const request = message.trim().toLowerCase()
        .replace(/^peter[,\s]+/, "")
        .replace(/[.!?]+$/, "");
    return /^(?:(?:please|zara|plz|can you|could you|mujhe)\s+)*(?:(?:open|launch|start)(?:\s+the)?\s+youtube(?:\s+(?:please|for me))?|youtube\s+(?:open(?:\s+(?:karo|kar do|please|for me))?|kholo(?:\s+please)?|khol(?:\s+do)?|khul(?:\s+do)?|chalao|start(?:\s+kar(?:\s+do)?)?)|mujhe\s+youtube\s+(?:open\s+(?:karo|kar\s+do)|kholo|khol\s+do|chalao))$/.test(request);
}

// Configuration
app.apiBase = ""; // Since we serve from the same origin, use relative paths
app.voiceEngine = null;
app.peterCore3D = null;
app.isProcessing = false;   // Waiting for backend response
app.isListening = false;    // Voice recognition active
app.isSpeaking = false;     // Speech synthesis active
app.isResponding = false;
app.respondingTimeout = 0;
app.chatMode = null;
app.hasBackendError = false;

app.init = () => {
    if (isInitialized) return;
    const updateVisibilityClass = () => {
        document.body.classList.toggle("tab-hidden", document.hidden);
    };
    document.addEventListener("visibilitychange", updateVisibilityClass);
    updateVisibilityClass();

    const clock = document.getElementById("clock");
    const headerDate = document.getElementById("headerDate");
    if (clock || headerDate) {
        const tick = () => {
            const now = new Date();
            if (clock) clock.textContent = now.toLocaleTimeString(undefined, { hour12: false });
            if (headerDate) {
                headerDate.textContent = now.toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                });
            }
        };
        tick();
        window.setInterval(tick, 1000);
    }

    const greeting = document.getElementById("greeting");
    if (greeting) {
        greeting.textContent = "A quiet place in your local universe.";
    }

    app.logActivity("Application startup", "audit");
    app.logActivity("Frontend ready", "audit");

    const navPanel = document.getElementById("navPanel");
    const navToggle = document.getElementById("navToggle");
    const navScrim = document.getElementById("navScrim");
    const closeNavigation = () => {
        if (navPanel) navPanel.hidden = true;
        if (navScrim) navScrim.hidden = true;
        if (navToggle) navToggle.setAttribute("aria-expanded", "false");
    };
    if (navToggle && navPanel && navScrim) {
        navToggle.addEventListener("click", () => {
            const isOpen = !navPanel.hidden;
            navPanel.hidden = isOpen;
            navScrim.hidden = isOpen;
            navToggle.setAttribute("aria-expanded", String(!isOpen));
        });
        navScrim.addEventListener("click", closeNavigation);
    }

    const utilityPanel = document.getElementById("utilityPanel");
    const utilityToggle = document.getElementById("utilityToggle");
    const utilityTitle = document.getElementById("utilityTitle");
    const setUtilityPanel = (panelId, title) => {
        if (!utilityPanel) return;
        utilityPanel.hidden = false;
        utilityPanel.querySelectorAll(".utility-section").forEach((section) => {
            section.hidden = section.id !== panelId;
        });
        utilityPanel.querySelectorAll(".utility-tab").forEach((tab) => {
            tab.classList.toggle("active", tab.dataset.panel === panelId);
        });
        if (utilityTitle) utilityTitle.textContent = title;
        if (utilityToggle) utilityToggle.setAttribute("aria-expanded", "true");
        const chatPanel = document.getElementById("chatPanel");
        if (chatPanel) chatPanel.hidden = true;
        document.getElementById("chatToggle")?.setAttribute("aria-expanded", "false");
    };
    if (utilityToggle) {
        utilityToggle.addEventListener("click", () => {
            if (utilityPanel?.hidden) {
                setUtilityPanel("modulesPanel", "Modules");
            } else if (utilityPanel) {
                utilityPanel.hidden = true;
                utilityToggle.setAttribute("aria-expanded", "false");
            }
        });
    }
    document.getElementById("utilityClose")?.addEventListener("click", () => {
        if (utilityPanel) utilityPanel.hidden = true;
        utilityToggle?.setAttribute("aria-expanded", "false");
    });
    document.querySelectorAll(".utility-tab").forEach((tab) => {
        tab.addEventListener("click", () => setUtilityPanel(tab.dataset.panel, tab.dataset.title));
    });

    const chatPanel = document.getElementById("chatPanel");
    const chatToggle = document.getElementById("chatToggle");
    app.openChat = (open = true) => {
        if (!chatPanel) return;
        chatPanel.hidden = !open;
        chatToggle?.setAttribute("aria-expanded", String(open));
        if (open && utilityPanel) {
            utilityPanel.hidden = true;
            utilityToggle?.setAttribute("aria-expanded", "false");
        }
    };
    chatToggle?.addEventListener("click", () => app.openChat(chatPanel?.hidden));
    document.getElementById("chatClose")?.addEventListener("click", () => app.openChat(false));
    document.getElementById("openChatNav")?.addEventListener("click", () => {
        closeNavigation();
        app.openChat(true);
    });
    document.getElementById("openModulesNav")?.addEventListener("click", () => {
        closeNavigation();
        setUtilityPanel("modulesPanel", "Modules");
    });
    document.getElementById("openSystemNav")?.addEventListener("click", () => {
        closeNavigation();
        setUtilityPanel("systemPanel", "System");
    });
    document.getElementById("openSettingsNav")?.addEventListener("click", () => {
        closeNavigation();
        document.getElementById("settingsBtn")?.click();
    });
    document.querySelectorAll(".nav-link[href^='#']").forEach((link) => {
        link.addEventListener("click", () => {
            closeNavigation();
            document.querySelectorAll(".nav-link[href^='#']").forEach((item) => item.classList.remove("active"));
            link.classList.add("active");
        });
    });
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeNavigation();
            app.openChat(false);
            if (utilityPanel) utilityPanel.hidden = true;
            utilityToggle?.setAttribute("aria-expanded", "false");
            document.getElementById("closeSettingsBtn")?.click();
        }
    });

    const clearConversation = (notice, activity) => {
        const messages = document.getElementById("chatMessages");
        if (!messages) return;
        messages.replaceChildren();
        app.addMessage("Peter", notice);
        app.logActivity(activity, "info");
    };
    const clearBtn = document.getElementById("clearChatBtn");
    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            clearConversation("Conversation cleared.", "Conversation cleared");
        });
    }

    const newChatBtn = document.getElementById("newChatBtn");
    if (newChatBtn) {
        newChatBtn.addEventListener("click", () => {
            clearConversation("New chat started. Send a message when you're ready.", "New chat started");
            document.getElementById("messageInput")?.focus();
        });
    }

    const sendBtn = document.getElementById("sendBtn");
    const messageInput = document.getElementById("messageInput");
    if (sendBtn && messageInput) {
        const requestYouTubeTask = () => {
            app.addMessage("Me", messageInput.value.trim());
            const response = app.addMessage("Peter", "I can open YouTube in a new tab. Do you want me to do that?");
            const bubble = response?.querySelector(".message-bubble");
            if (!bubble) {
                console.error("Could not display the YouTube task confirmation.");
                app.logActivity("YouTube task confirmation could not be displayed", "error");
                return;
            }

            const actions = document.createElement("div");
            actions.className = "task-confirmation";
            const confirmButton = document.createElement("button");
            confirmButton.className = "task-confirmation-button";
            confirmButton.type = "button";
            confirmButton.textContent = "Open YouTube";

            const cancelButton = document.createElement("button");
            cancelButton.className = "task-cancel-button";
            cancelButton.type = "button";
            cancelButton.textContent = "Cancel";

            const status = document.createElement("span");
            status.className = "task-confirmation-status";
            status.setAttribute("role", "status");

            confirmButton.addEventListener("click", () => {
                try {
                    const openedWindow = window.open(YOUTUBE_TASK_URL, "_blank");
                    if (!openedWindow) {
                        status.textContent = "The browser blocked the new tab. Allow pop-ups, then try again.";
                        app.logActivity("YouTube task blocked by the browser", "error");
                        return;
                    }

                    openedWindow.opener = null;
                    confirmButton.disabled = true;
                    cancelButton.disabled = true;
                    status.textContent = "YouTube opened in a new tab.";
                    app.logActivity("YouTube opened after user confirmation", "audit");
                } catch (error) {
                    console.error("Could not open YouTube:", error);
                    status.textContent = "Could not open YouTube. Check the browser and try again.";
                    app.logActivity("YouTube task failed: " + error.message, "error");
                }
            });

            cancelButton.addEventListener("click", () => {
                confirmButton.disabled = true;
                cancelButton.disabled = true;
                status.textContent = "Task cancelled. Nothing was opened.";
                app.logActivity("YouTube task cancelled", "info");
            });

            actions.append(confirmButton, cancelButton);
            bubble.append(actions, status);
            app.logActivity("Waiting for confirmation to open YouTube", "audit");
        };

        sendBtn.addEventListener("click", () => {
            const text = messageInput.value.trim();
            if (!text) return;
            app.openChat(true);
            if (isYouTubeTaskRequest(text)) {
                requestYouTubeTask();
            } else {
                app.sendMessageToBackend(text);
            }
            messageInput.value = "";
            messageInput.style.height = "auto";
            app.logActivity("Message submitted", "audit");
        });

        messageInput.addEventListener("input", () => {
            messageInput.style.height = "auto";
            messageInput.style.height = `${Math.min(messageInput.scrollHeight, 110)}px`;
        });

        messageInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
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

    const keyboardInputBtn = document.getElementById("keyboardInputBtn");
    if (keyboardInputBtn) {
        keyboardInputBtn.addEventListener("click", () => {
            app.openChat(true);
            document.getElementById("messageInput")?.focus();
        });
    }

    const speakerButton = document.getElementById("speakerButton");
    if (speakerButton) {
        speakerButton.addEventListener("click", () => {
            if (!app.voiceEngine?.synthesis) return;
            app.voiceEngine.speechSynthesisEnabled = !app.voiceEngine.speechSynthesisEnabled;
            if (!app.voiceEngine.speechSynthesisEnabled) {
                app.voiceEngine.synthesis.cancel();
                app.isSpeaking = false;
                app.updateNeuralEngineState();
            }
            app.updateVoiceButton();
            app.logActivity(app.voiceEngine.speechSynthesisEnabled ? "Spoken responses enabled" : "Spoken responses muted", "info");
        });
    }

    const settingsBtn = document.getElementById("settingsBtn");
    const modalBackdrop = document.getElementById("modalBackdrop");
    const settingsModal = document.getElementById("settingsModal");
    const closeSettingsBtn = document.getElementById("closeSettingsBtn");

    if (settingsBtn && modalBackdrop && settingsModal && closeSettingsBtn) {
        const open = () => {
            settingsModal.hidden = false;
            modalBackdrop.hidden = false;
        };
        settingsBtn.addEventListener("click", open);

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

    try {
        app.peterCore3D = initPeterCore3D();
        app.logActivity("Peter Core visual ready", "audit");
    } catch (error) {
        console.error("Peter Core 3D initialization failed:", error);
        const neuralField = document.getElementById("neuralField");
        if (neuralField) neuralField.dataset.webgl = "unavailable";
        const fallback = document.getElementById("coreFallback");
        if (fallback) {
            fallback.textContent = "The 3D scene is unavailable here. The local chat interface remains usable.";
            fallback.hidden = false;
        }
        const coreSub = document.getElementById("coreSub");
        if (coreSub) coreSub.textContent = "VISUAL FALLBACK";
        app.logActivity("3D visualization unavailable; CSS fallback active", "error");
    }
    app.updateNeuralEngineState();
    app.updateModules();
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
    return message;
};

app.setChatMode = (mode) => {
    app.chatMode = mode;
    const badge = document.getElementById("chatMode");
    const label = mode ? (mode === "demo" ? "Demo Mode" : `${mode} mode`) : "Mode unavailable";
    if (badge) badge.textContent = label;
    const dockMode = document.getElementById("dockMode");
    if (dockMode) dockMode.textContent = label;
    const modeNote = document.getElementById("chatModeNote");
    if (modeNote) {
        modeNote.hidden = mode !== "demo";
        modeNote.textContent = mode === "demo" ? "Demo Mode · responses are canned, not generated by an AI model." : "";
    }
    app.updateNeuralEngineState();
};

app.sendMessageToBackend = async (text) => {
    clearTimeout(app.respondingTimeout);
    app.respondingTimeout = 0;
    app.isResponding = false;
    app.openChat(true);
    app.addMessage("Me", text);
    app.hasBackendError = false;
    app.isProcessing = true;
    app.updateNeuralEngineState();
    app.showChatWaiting();
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
        app.hasBackendError = false;
        app.isResponding = true;
        if (data.mode) app.setChatMode(data.mode);
        const reply = data.reply || "Sorry, I didn't understand that.";
        document.getElementById("chatTypingIndicator")?.remove();
        app.addMessage("Peter", reply);
        app.logActivity("Backend response received", "audit");

        // Speak the response if voice synthesis is enabled
        if (app.voiceEngine && app.voiceEngine.speechSynthesisEnabled) {
            app.voiceEngine.speak(reply);
        }
        app.respondingTimeout = setTimeout(() => {
            app.isResponding = false;
            app.respondingTimeout = 0;
            app.updateNeuralEngineState();
        }, 900);
    } catch (error) {
        console.error("Error communicating with backend:", error);
        app.isResponding = false;
        document.getElementById("chatTypingIndicator")?.remove();
        app.addMessage("Peter", "Sorry, I couldn't reach the local chat service. Please check the connection.");
        app.logActivity("Backend communication error: " + error.message, "error");
        app.hasBackendError = true;
        app.setConnectionStatus("error");
    } finally {
        document.getElementById("chatTypingIndicator")?.remove();
        app.isProcessing = false;
        app.updateNeuralEngineState();
    }
};

app.updateNeuralEngineState = () => {
    let newState = "standby";
    if (app.hasBackendError) newState = "error";
    else if (app.isListening) newState = "listening";
    else if (app.isSpeaking) newState = "speaking";
    else if (app.isProcessing) newState = "waiting";
    else if (app.isResponding) newState = "responding";

    const labels = {
        standby: ["STANDBY", "Standby"],
        listening: ["LISTENING", "Listening"],
        speaking: ["SPEAKING", "Speaking"],
        waiting: [app.chatMode === "demo" ? "WAITING · DEMO MODE" : "WAITING FOR RESPONSE", "Waiting"],
        responding: ["RESPONDING", "Responding"],
        error: ["LOCAL SERVICE UNAVAILABLE", "Service unavailable"],
    };
    const [label, shortLabel] = labels[newState];
    const neuralField = document.getElementById("neuralField");
    if (neuralField) neuralField.dataset.state = newState;
    const coreStateLabel = document.getElementById("coreStateLabel");
    if (coreStateLabel) coreStateLabel.textContent = label;
    const coreSub = document.getElementById("coreSub");
    if (coreSub) coreSub.textContent = label;
    const sidebarStatus = document.getElementById("sidebarCoreStatus");
    if (sidebarStatus) sidebarStatus.textContent = shortLabel;
    app.peterCore3D?.setState(newState === "waiting" ? "processing" : newState);
    const composer = document.querySelector(".conversation-dock");
    if (composer) composer.dataset.state = newState;

    const voiceActivity = document.getElementById("voiceActivity");
    if (voiceActivity) {
        const state = app.isListening ? "listening" : (app.isSpeaking ? "speaking" : "idle");
        voiceActivity.dataset.state = state;
        voiceActivity.setAttribute("aria-label", `Voice activity visualization is ${state}`);
    }
};

app.showChatWaiting = () => {
    const messages = document.getElementById("chatMessages");
    if (!messages || document.getElementById("chatTypingIndicator")) return;
    const indicator = document.createElement("div");
    indicator.id = "chatTypingIndicator";
    indicator.className = "message demo typing-message";
    indicator.setAttribute("role", "status");
    indicator.innerHTML = `
        <div class="message-avatar" aria-hidden="true">P</div>
        <div class="message-bubble typing-bubble">
            <span>Waiting for the local service</span>
            <span class="typing-dots" aria-hidden="true"><i></i><i></i><i></i></span>
        </div>
    `;
    messages.appendChild(indicator);
    messages.scrollTop = messages.scrollHeight;
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
        app.hasBackendError = false;
        app.setStatusLabel("backendStatus", "Running", "ok");
        app.setStatusLabel("backendSystemStatus", "Running", "ok");

        try {
            const statusResponse = await fetch(`${app.apiBase}/api/status`);
            if (!statusResponse.ok) throw new Error("Status endpoint returned an error");
            const status = await statusResponse.json();
            const services = status.services || {};

            app.setStatusLabel("backendStatus", status.backend === "running" ? "Running" : "Unavailable", status.backend === "running" ? "ok" : "unavailable");
            app.setStatusLabel("backendSystemStatus", status.backend === "running" ? "Running" : "Unavailable", status.backend === "running" ? "ok" : "unavailable");
            app.setStatusLabel("apiStatus", services.api === "active" ? "Available" : "Unavailable", services.api === "active" ? "ok" : "unavailable");
            app.setStatusLabel("aiEngineStatus", services.ai_engine === "demo" ? "Demo responses" : (services.ai_engine || "Unavailable"), services.ai_engine === "demo" ? "demo" : "unavailable");
            app.setStatusLabel("databaseStatus", services.database === "disconnected" ? "Not connected" : (services.database || "Unavailable"), services.database === "disconnected" ? "off" : "unavailable");
            app.setChatMode(services.ai_engine === "demo" ? "demo" : null);
            const greeting = document.getElementById("greeting");
            if (greeting) greeting.textContent = services.ai_engine === "demo" ? "Local Demo Mode · responses are canned." : "Local service status is available.";
            app.updateNeuralEngineState();
        } catch (statusError) {
            console.warn("Backend status check failed:", statusError);
            app.setStatusLabel("apiStatus", "Unavailable", "unavailable");
            app.setStatusLabel("aiEngineStatus", "Unavailable", "unavailable");
            app.setStatusLabel("databaseStatus", "Unavailable", "unavailable");
            app.setChatMode(null);
            const greeting = document.getElementById("greeting");
            if (greeting) greeting.textContent = "Backend is running, but service details are unavailable.";
        }
    } catch (error) {
        console.warn("Health check failed:", error);
        app.setConnectionStatus("disconnected");
        app.hasBackendError = true;
        app.setStatusLabel("backendStatus", "Unavailable", "unavailable");
        app.setStatusLabel("backendSystemStatus", "Unavailable", "unavailable");
        app.setStatusLabel("apiStatus", "Unavailable", "unavailable");
        app.setStatusLabel("aiEngineStatus", "Unavailable", "unavailable");
        app.setStatusLabel("databaseStatus", "Unavailable", "unavailable");
        app.setChatMode(null);
        const greeting = document.getElementById("greeting");
        if (greeting) greeting.textContent = "Backend unavailable. Chat requires the local server.";
        app.updateNeuralEngineState();
    }
};


app.initVoiceEngine = () => {
    // Check if speech recognition and synthesis are supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const speechSynthesis = window.speechSynthesis;

    const recognitionAvailable = !!SpeechRecognition;
    const synthesisAvailable = !!speechSynthesis;
    app.setStatusLabel("speechRecognitionStatus", recognitionAvailable ? "Supported" : "Unavailable", recognitionAvailable ? "ok" : "off");
    app.setStatusLabel("speechSynthesisStatus", synthesisAvailable ? "Supported" : "Unavailable", synthesisAvailable ? "ok" : "off");
    const speakerStatus = document.getElementById("speakerStatus");
    if (speakerStatus) speakerStatus.textContent = synthesisAvailable ? "On" : "Unavailable";
    const recognitionSettings = document.getElementById("recognitionStatusText");
    const synthesisSettings = document.getElementById("synthesisStatusText");
    if (recognitionSettings) recognitionSettings.textContent = recognitionAvailable ? "Supported" : "Unavailable";
    if (synthesisSettings) synthesisSettings.textContent = synthesisAvailable ? "Supported" : "Unavailable";
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
    const voiceStatus = document.getElementById("voiceAssistantStatus");
    if (!voiceBtn || !app.voiceEngine) return;

    if (!app.voiceEngine.recognition) {
        voiceBtn.disabled = true;
        voiceBtn.setAttribute("aria-label", "Voice input unavailable");
        voiceBtn.setAttribute("title", "Speech recognition is unavailable");
        if (voiceStatus) {
            voiceStatus.textContent = "Unavailable in this browser";
            voiceStatus.dataset.state = "unavailable";
        }
    } else {
        voiceBtn.disabled = false;
        if (app.voiceEngine.isListening()) {
            voiceBtn.classList.add("active");
            voiceBtn.setAttribute("aria-label", "Stop voice input");
            voiceBtn.setAttribute("title", "Listening... Click to stop");
            if (voiceStatus) {
                voiceStatus.textContent = "Listening";
                voiceStatus.dataset.state = "listening";
            }
        } else {
            voiceBtn.classList.remove("active");
            voiceBtn.setAttribute("aria-label", "Start voice input");
            voiceBtn.setAttribute("title", "Start voice input");
            if (voiceStatus) {
                voiceStatus.textContent = app.isSpeaking ? "Speaking response" : "Ready";
                voiceStatus.dataset.state = app.isSpeaking ? "speaking" : "ready";
            }
        }
    }

    const speakerButton = document.getElementById("speakerButton");
    const speakerStatus = document.getElementById("speakerStatus");
    if (speakerButton) {
        const available = !!app.voiceEngine.synthesis;
        const enabled = available && app.voiceEngine.speechSynthesisEnabled;
        speakerButton.disabled = !available;
        speakerButton.setAttribute("aria-pressed", String(enabled));
        speakerButton.setAttribute("aria-label", enabled ? "Mute spoken responses" : "Enable spoken responses");
        if (speakerStatus) speakerStatus.textContent = available ? (enabled ? "On" : "Muted") : "Unavailable";
    }
};


app.updateModules = () => {
    document.querySelectorAll(".module-card").forEach((card) => {
        const name = card.querySelector(".module-name")?.textContent.trim().toLowerCase();
        const badge = card.querySelector(".badge");
        if (!name || !badge) return;
        badge.textContent = name.includes("peter core") ? "Visual only" : "Coming Soon";
    });
};


app.logActivity = (text, type) => {
    const list = document.getElementById("activityList");
    if (!list) return;
    const emptyState = document.getElementById("activityEmpty");
    if (emptyState) emptyState.hidden = true;
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
