import { initPeterCore3D } from "./peter-core-3d.js";

const app = window.app || {};
const YOUTUBE_TASK_URL = "https://www.youtube.com/";
let PETER_USER_NAME = "Sagar";
const getWelcomeGreeting = () => `Hello, ${PETER_USER_NAME}! Kaisa haal hai? Aaj kya kar rahe ho?`;
const SPEECH_VOICE_PREFERENCE = "peterPlanetVoiceURI";
const SPEECH_LANGUAGE_PREFERENCE = "peterPlanetSpeechLanguage";
const STARTUP_SOUND_PREFERENCE = "peterPlanetStartupSound";
let startupAudioContext = null;
let startupSoundEnabled = readStartupSoundPreference();
let startupSoundPlayed = false;
let isInitialized = false;
let pendingDocumentConfirmation = null;
const messageAnimations = new WeakMap();

function readStartupSoundPreference() {
    try {
        return window.localStorage.getItem(STARTUP_SOUND_PREFERENCE) !== "off";
    } catch {
        return true;
    }
}

function includeUserNameOnce(text) {
    const reply = String(text ?? "").trim();
    const namePattern = new RegExp(`\\b${PETER_USER_NAME}\\b`, "gi");
    const matches = [...reply.matchAll(namePattern)];
    if (!matches.length) return `${PETER_USER_NAME}, ${reply}`;

    const first = matches[0];
    const prefix = reply.slice(0, first.index);
    let suffix = reply.slice(first.index + first[0].length).replace(namePattern, "");
    suffix = suffix.replace(/\s+([,.;:!?])/g, "$1");
    suffix = suffix.replace(/[,;:]\s*([.!?])/g, "$1");
    suffix = suffix.replace(/([,.;:!?])\s*([,.;:!?])/g, "$1");
    suffix = suffix.replace(/\s{2,}/g, " ");
    return `${prefix}${PETER_USER_NAME}${suffix}`.trim();
}

function setUserName(userName) {
    if (typeof userName !== "string" || !userName.trim()) return;
    PETER_USER_NAME = userName.trim();
    const greeting = document.getElementById("greeting");
    if (greeting) greeting.textContent = getWelcomeGreeting();
}

function playStartupSound(fromUserGesture = false) {
    if (!startupSoundEnabled || startupSoundPlayed) return;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    try {
        startupAudioContext ??= new AudioContextClass();
        if (startupAudioContext.state !== "running") {
            if (fromUserGesture && startupAudioContext.state === "suspended") {
                startupAudioContext.resume()
                    .then(() => playStartupSound())
                    .catch(() => {});
            }
            return;
        }

        const now = startupAudioContext.currentTime;
        [523.25, 659.25, 783.99].forEach((frequency, index) => {
            const startAt = now + index * 0.12;
            const oscillator = startupAudioContext.createOscillator();
            const envelope = startupAudioContext.createGain();
            oscillator.type = "sine";
            oscillator.frequency.setValueAtTime(frequency, startAt);
            envelope.gain.setValueAtTime(0.0001, startAt);
            envelope.gain.exponentialRampToValueAtTime(0.028, startAt + 0.035);
            envelope.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.42);
            oscillator.connect(envelope);
            envelope.connect(startupAudioContext.destination);
            oscillator.start(startAt);
            oscillator.stop(startAt + 0.44);
        });
        startupSoundPlayed = true;
    } catch {
        // Audio is optional; the interface should still start without it.
    }
}

function isYouTubeTaskRequest(message) {
    const request = message.trim().toLowerCase()
        .replace(/^peter[,\s]+/, "")
        .replace(/[.!?]+$/, "");
    return /^(?:(?:please|zara|plz|can you|could you|mujhe)\s+)*(?:(?:open|launch|start)(?:\s+the)?\s+youtube(?:\s+(?:please|for me))?|youtube\s+(?:open(?:\s+(?:karo|kar do|please|for me))?|kholo(?:\s+please)?|khol(?:\s+do)?|khul(?:\s+do)?|chalao|start(?:\s+kar(?:\s+do)?)?)|mujhe\s+youtube\s+(?:open\s+(?:karo|kar\s+do)|kholo|khol\s+do|chalao))$/.test(request);
}

function isOpenFileTaskRequest(message) {
    const request = message.trim().toLowerCase()
        .replace(/^peter[,\s]+/, "")
        .replace(/[.!?]+$/, "");
    return /^(?:(?:please|zara|plz|can you|could you|mujhe)\s+)*(?:(?:open|choose|select)(?:\s+the)?(?:\s+(?:a|my))?\s+(?:local\s+)?(?:file|document)|(?:file|document)\s+(?:open|kholo|kholna|khol\s+na|khol\s+do|select\s+karo|chuno))$/.test(request);
}

function isAffirmativeConfirmation(message) {
    return /^(?:yes|yeah|yep|sure|ok|okay|haan|han|ji|zaroor|theek hai|kar do)[.! ]*$/i.test(message.trim());
}

function isNegativeConfirmation(message) {
    return /^(?:no|nope|nah|cancel|cancel karo|nahi|nahin|mat karo)[.! ]*$/i.test(message.trim());
}

function addDocumentPickerConfirmation(responseMessage) {
    const bubble = responseMessage?.querySelector(".message-bubble");
    if (!bubble) {
        console.error("Could not display the document action confirmation.");
        app.logActivity("Document action confirmation could not be displayed", "error");
        return;
    }

    const actions = document.createElement("div");
    actions.className = "task-confirmation";
    const confirmButton = document.createElement("button");
    confirmButton.className = "task-confirmation-button";
    confirmButton.type = "button";
    confirmButton.textContent = "Choose a document";

    const cancelButton = document.createElement("button");
    cancelButton.className = "task-cancel-button";
    cancelButton.type = "button";
    cancelButton.textContent = "Cancel";

    const status = document.createElement("span");
    status.className = "task-confirmation-status";
    status.setAttribute("role", "status");

    const openSelectedDocument = async () => {
        confirmButton.disabled = true;
        cancelButton.disabled = true;
        status.textContent = "Choose a supported document in the file picker.";
        app.logActivity("Waiting for a document selection", "audit");

        try {
            const response = await fetch(`${app.apiBase}/api/open-file`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({})
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || `Request failed (${response.status})`);
            }

            if (result.cancelled) {
                status.textContent = "No document was opened.";
                app.logActivity("Document selection cancelled", "info");
            } else if (result.opened && typeof result.filename === "string") {
                status.textContent = `Opened ${result.filename}.`;
                app.logActivity("Opened a user-selected document", "audit");
            } else {
                throw new Error("The backend returned an unexpected response.");
            }
        } catch (error) {
            console.error("Could not open the selected document:", error);
            status.textContent = error.message || "Could not open the selected document.";
            app.logActivity("Document action failed", "error");
        }
    };

    const cancelDocumentSelection = () => {
        confirmButton.disabled = true;
        cancelButton.disabled = true;
        status.textContent = "Cancelled. No file was selected or opened.";
        app.logActivity("Document action cancelled", "info");
    };

    confirmButton.addEventListener("click", () => {
        pendingDocumentConfirmation = null;
        openSelectedDocument();
    });

    cancelButton.addEventListener("click", () => {
        pendingDocumentConfirmation = null;
        cancelDocumentSelection();
    });

    actions.append(confirmButton, cancelButton);
    bubble.append(actions, status);
    pendingDocumentConfirmation = {
        confirm: openSelectedDocument,
        cancel: cancelDocumentSelection,
    };
    app.logActivity("Waiting for confirmation to choose a document", "audit");
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
    const startupSoundButton = document.getElementById("startupSoundButton");
    const updateStartupSoundButton = () => {
        if (!startupSoundButton) return;
        startupSoundButton.setAttribute("aria-pressed", String(startupSoundEnabled));
        startupSoundButton.setAttribute("aria-label", startupSoundEnabled ? "Mute startup sound" : "Enable startup sound");
        startupSoundButton.title = startupSoundEnabled ? "Mute startup sound" : "Enable startup sound";
        startupSoundButton.querySelector("[data-sound-muted-mark]")
            ?.setAttribute("opacity", startupSoundEnabled ? "0" : "1");
    };
    updateStartupSoundButton();
    startupSoundButton?.addEventListener("click", () => {
        startupSoundEnabled = !startupSoundEnabled;
        try {
            window.localStorage.setItem(STARTUP_SOUND_PREFERENCE, startupSoundEnabled ? "on" : "off");
        } catch {
            // Keep the in-memory preference if storage is unavailable.
        }
        updateStartupSoundButton();
        if (startupSoundEnabled) playStartupSound(true);
    });

    const retryStartupSound = (event) => {
        if (event.target instanceof Element && event.target.closest("#startupSoundButton")) return;
        playStartupSound(true);
        if (startupSoundPlayed) {
            document.removeEventListener("click", retryStartupSound);
            document.removeEventListener("keydown", retryStartupSound);
        }
    };
    document.addEventListener("click", retryStartupSound);
    document.addEventListener("keydown", retryStartupSound);
    playStartupSound();

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
        greeting.textContent = getWelcomeGreeting();
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
        if (pendingDocumentConfirmation) {
            const confirmation = pendingDocumentConfirmation;
            pendingDocumentConfirmation = null;
            confirmation.cancel();
        }
        messages.querySelectorAll(".message").forEach(app.cancelMessageAnimation);
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

        const requestDocumentTask = (message) => {
            app.addMessage("Me", message);
            const response = app.addMessage(
                "Peter",
                "I can show a file picker for a document in Documents, Downloads, or Desktop. Do you want to continue?"
            );
            addDocumentPickerConfirmation(response);
        };

        sendBtn.addEventListener("click", () => {
            const text = messageInput.value.trim();
            if (!text) return;
            app.openChat(true);
            if (
                pendingDocumentConfirmation
                && !isAffirmativeConfirmation(text)
                && !isNegativeConfirmation(text)
            ) {
                const confirmation = pendingDocumentConfirmation;
                pendingDocumentConfirmation = null;
                confirmation.cancel();
            }
            if (pendingDocumentConfirmation && isAffirmativeConfirmation(text)) {
                app.addMessage("Me", text);
                const confirmation = pendingDocumentConfirmation;
                pendingDocumentConfirmation = null;
                confirmation.confirm();
            } else if (pendingDocumentConfirmation && isNegativeConfirmation(text)) {
                app.addMessage("Me", text);
                const confirmation = pendingDocumentConfirmation;
                pendingDocumentConfirmation = null;
                confirmation.cancel();
            } else if (isYouTubeTaskRequest(text)) {
                requestYouTubeTask();
            } else if (isOpenFileTaskRequest(text)) {
                requestDocumentTask(text);
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

function animateResponseWords(bubble, text, waitForSpeech, onFinish) {
    const messages = document.getElementById("chatMessages");
    const wordSpans = [];
    const tokenPattern = /\S+\s*/gu;
    let match;
    while ((match = tokenPattern.exec(text))) {
        const word = match[0].match(/\S+/u)[0];
        const wordSpan = document.createElement("span");
        wordSpan.className = "response-word";
        wordSpan.textContent = word;
        const whitespace = match[0].slice(word.length);
        wordSpans.push({
            element: wordSpan,
            start: match.index,
            whitespace: whitespace ? document.createTextNode(whitespace) : null,
        });
    }

    let revealedCount = 0;
    let timer = 0;
    let speechActive = false;
    let finished = false;

    const keepLatestVisible = () => {
        if (!messages) return;
        const wasAtBottom = messages.scrollHeight - messages.scrollTop - messages.clientHeight < 40;
        if (wasAtBottom) messages.scrollTop = messages.scrollHeight;
    };
    const revealWord = (index) => {
        const word = wordSpans[index];
        word.element.classList.add("is-revealing");
        window.setTimeout(() => word.element.classList.remove("is-revealing"), 850);
        const speechWave = bubble.querySelector(".speech-wave");
        bubble.insertBefore(word.element, speechWave);
        if (word.whitespace) bubble.insertBefore(word.whitespace, speechWave);
        keepLatestVisible();
    };
    const nextWordDelay = () => {
        const word = wordSpans[revealedCount - 1].element.textContent;
        const punctuationPause = /[.!?]["')\]]?$/u.test(word) ? 220
            : /[,;:]$/u.test(word) ? 100
                : 0;
        return (speechActive ? 280 : 120) + punctuationPause;
    };
    const revealNextWord = () => {
        if (revealedCount >= wordSpans.length) {
            finish();
            return;
        }
        revealWord(revealedCount);
        revealedCount += 1;
        if (revealedCount === wordSpans.length) finish();
        else schedule(nextWordDelay());
    };
    const schedule = (delay) => {
        window.clearTimeout(timer);
        timer = window.setTimeout(revealNextWord, delay);
    };
    const finish = () => {
        if (finished) return;
        finished = true;
        window.clearTimeout(timer);
        for (let index = revealedCount; index < wordSpans.length; index += 1) {
            revealWord(index);
        }
        revealedCount = wordSpans.length;
        keepLatestVisible();
        onFinish?.();
    };

    if (wordSpans.length) schedule(waitForSpeech ? 700 : 65);
    else finish();

    return {
        startSpeechSync: () => {
            if (finished) return;
            speechActive = true;
            schedule(700);
        },
        revealSpeechBoundary: (characterIndex, characterLength) => {
            if (finished || !Number.isInteger(characterIndex) || characterIndex < 0) return;
            speechActive = true;
            window.clearTimeout(timer);
            const boundaryEnd = characterIndex + Math.max(characterLength || 1, 1);
            while (revealedCount < wordSpans.length && wordSpans[revealedCount].start < boundaryEnd) {
                revealWord(revealedCount);
                revealedCount += 1;
            }
            if (revealedCount === wordSpans.length) finish();
            else schedule(700);
        },
        resumeIndependent: () => {
            if (finished) return;
            speechActive = false;
            schedule(65);
        },
        finish,
        cancel: () => {
            finished = true;
            window.clearTimeout(timer);
            bubble.querySelectorAll(".response-word.is-revealing").forEach((word) => {
                word.classList.remove("is-revealing");
            });
        },
    };
}

app.addMessage = (from, text, { animate = false, waitForSpeech = false, onAnimationComplete } = {}) => {
    const messages = document.getElementById("chatMessages");
    if (!messages) return;
    const messageText = from === "Me" ? text : includeUserNameOnce(text);
    const message = document.createElement("div");
    message.className = `message ${from === "Me" ? "user" : "demo"}`;
    message.innerHTML = `
        <div class="message-avatar">${from === "Me" ? "Me" : "P"}</div>
        <div class="message-bubble">${escapeHtml(messageText)}${from === "Me" ? "" : '<span class="speech-wave" aria-hidden="true"><i></i><i></i><i></i></span>'}</div>
    `;
    const bubble = message.querySelector(".message-bubble");
    if (animate && bubble) {
        bubble.dataset.fullText = messageText;
        bubble.replaceChildren();
        const animation = animateResponseWords(bubble, messageText, waitForSpeech, onAnimationComplete);
        messageAnimations.set(message, animation);
        const speechWave = document.createElement("span");
        speechWave.className = "speech-wave";
        speechWave.setAttribute("aria-hidden", "true");
        speechWave.innerHTML = "<i></i><i></i><i></i>";
        bubble.appendChild(speechWave);
    }
    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight;
    return message;
};

app.cancelMessageAnimation = (message) => {
    messageAnimations.get(message)?.cancel();
    messageAnimations.delete(message);
};

app.setChatMode = (mode) => {
    app.chatMode = mode;
    const badge = document.getElementById("chatMode");
    const label = mode ? (mode === "demo" ? "Demo Mode" : (mode === "ollama" ? "Local AI Mode" : `${mode} mode`)) : "Mode unavailable";
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
    const agentTaskId = app.startAgentTask?.(text);
    let requestSucceeded = false;
    try {
        const response = await fetch(`${app.apiBase}/api/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: text,
                history: Array.from(document.querySelectorAll("#chatMessages .message"))
                    .filter((message) => message.id !== "chatTypingIndicator" && !message.classList.contains("initial-greeting"))
                    .map((message) => ({
                        role: message.classList.contains("user") ? "user" : "assistant",
                        content: message.querySelector(".message-bubble")?.dataset.fullText
                            || message.querySelector(".message-bubble")?.textContent.trim()
                            || "",
                    }))
                    .filter((message) => message.content)
                    .slice(-12),
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        requestSucceeded = true;
        app.hasBackendError = false;
        app.isResponding = true;
        if (data.mode) app.setChatMode(data.mode);
        const reply = includeUserNameOnce(data.reply || "Sorry, I didn't understand that.");
        document.getElementById("chatTypingIndicator")?.remove();
        const shouldSpeak = !!app.voiceEngine?.speechSynthesisEnabled;
        const responseMessage = app.addMessage("Peter", reply, {
            animate: true,
            waitForSpeech: shouldSpeak,
            onAnimationComplete: () => {
                if (app.isSpeaking) return;
                clearTimeout(app.respondingTimeout);
                app.respondingTimeout = 0;
                app.isResponding = false;
                app.updateNeuralEngineState();
            },
        });
        app.logActivity("Backend response received", "audit");

        if (data.action === "open_file") {
            addDocumentPickerConfirmation(responseMessage);
        }

        // Speak the response if voice synthesis is enabled
        if (shouldSpeak) {
            app.voiceEngine.speak(reply, false, responseMessage);
        }
    } catch (error) {
        console.error("Error communicating with backend:", error);
        app.isResponding = false;
        document.getElementById("chatTypingIndicator")?.remove();
        app.addMessage("Peter", "Sorry, I couldn't reach the local chat service. Please check the connection.");
        app.logActivity("Backend communication error: " + error.message, "error");
        app.hasBackendError = true;
        app.setConnectionStatus("error");
    } finally {
        app.finishAgentTask?.(agentTaskId, requestSucceeded);
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

    const chatMessages = document.getElementById("chatMessages");
    chatMessages?.querySelectorAll(".message.demo.is-speaking").forEach((message) => message.classList.remove("is-speaking"));
    if (app.isSpeaking) chatMessages?.querySelector(".message.demo:last-child")?.classList.add("is-speaking");

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

            setUserName(status.user_name);
            app.setStatusLabel("backendStatus", status.backend === "running" ? "Running" : "Unavailable", status.backend === "running" ? "ok" : "unavailable");
            app.setStatusLabel("backendSystemStatus", status.backend === "running" ? "Running" : "Unavailable", status.backend === "running" ? "ok" : "unavailable");
            app.setStatusLabel("apiStatus", services.api === "active" ? "Available" : "Unavailable", services.api === "active" ? "ok" : "unavailable");
            const aiEngine = services.ai_engine || "unavailable";
            const isDemo = aiEngine === "demo";
            const isOllama = aiEngine === "ollama";
            app.setStatusLabel("aiEngineStatus", isDemo ? "Demo responses" : (isOllama ? "Ollama local model" : aiEngine), isDemo ? "demo" : (isOllama ? "ok" : "unavailable"));
            app.setStatusLabel("databaseStatus", services.database === "disconnected" ? "Not connected" : (services.database || "Unavailable"), services.database === "disconnected" ? "off" : "unavailable");
            app.setChatMode(isDemo ? "demo" : (isOllama ? "ollama" : null));
            const greeting = document.getElementById("greeting");
            if (greeting) greeting.textContent = getWelcomeGreeting();
            app.updateNeuralEngineState();
        } catch (statusError) {
            console.warn("Backend status check failed:", statusError);
            app.setStatusLabel("apiStatus", "Unavailable", "unavailable");
            app.setStatusLabel("aiEngineStatus", "Unavailable", "unavailable");
            app.setStatusLabel("databaseStatus", "Unavailable", "unavailable");
            app.setChatMode(null);
            const greeting = document.getElementById("greeting");
            if (greeting) greeting.textContent = getWelcomeGreeting();
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
        if (greeting) greeting.textContent = getWelcomeGreeting();
        app.updateNeuralEngineState();
    }
};


app.initVoiceEngine = () => {
    // Check if speech recognition and synthesis are supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const speechSynthesis = window.speechSynthesis;

    const recognitionAvailable = !!SpeechRecognition;
    const synthesisAvailable = !!speechSynthesis;
        const voiceSelection = document.getElementById("voiceSelection");
        const recognitionLanguage = document.getElementById("recognitionLanguage");
        const previewVoiceButton = document.getElementById("previewVoiceButton");
        const readPreference = (key, fallback) => {
            try {
                return window.localStorage.getItem(key) || fallback;
            } catch {
                return fallback;
            }
        };
        const savePreference = (key, value) => {
            try {
                window.localStorage.setItem(key, value);
            } catch {
                // Voice controls continue to work if browser storage is disabled.
            }
        };
        const populateVoices = () => {
            if (!voiceSelection || !speechSynthesis) return;
            const voices = speechSynthesis.getVoices();
            if (!voices.length) {
                voiceSelection.replaceChildren(new Option("No browser voices available", ""));
                voiceSelection.disabled = true;
                if (previewVoiceButton) previewVoiceButton.disabled = true;
                return;
            }

            const savedVoice = readPreference(SPEECH_VOICE_PREFERENCE, "");
            const preferredVoice = voices.find((voice) => /zira|heera|jenny|aria|sonia|neerja|swara|female/i.test(voice.name))
                || voices.find((voice) => voice.default)
                || voices[0];
            voiceSelection.replaceChildren(...voices.map((voice) => new Option(`${voice.name} (${voice.lang})`, voice.voiceURI)));
            voiceSelection.value = voices.some((voice) => voice.voiceURI === savedVoice) ? savedVoice : preferredVoice.voiceURI;
            voiceSelection.disabled = false;
            savePreference(SPEECH_VOICE_PREFERENCE, voiceSelection.value);
            if (previewVoiceButton) previewVoiceButton.disabled = false;
        };

        const getRecognitionLanguage = () => recognitionLanguage?.value === "device"
            ? (navigator.language || "en-US")
            : (recognitionLanguage?.value || navigator.language || "en-US");

        if (recognitionLanguage) {
            const savedLanguage = readPreference(SPEECH_LANGUAGE_PREFERENCE, "hi-IN");
            recognitionLanguage.value = Array.from(recognitionLanguage.options).some((option) => option.value === savedLanguage)
                ? savedLanguage
                : "hi-IN";
            recognitionLanguage.addEventListener("change", () => {
                savePreference(SPEECH_LANGUAGE_PREFERENCE, recognitionLanguage.value);
                if (app.voiceEngine?.recognition) app.voiceEngine.recognition.lang = getRecognitionLanguage();
            });
        }
        populateVoices();
        speechSynthesis?.addEventListener("voiceschanged", populateVoices);
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
                app.voiceEngine.recognition.lang = getRecognitionLanguage();

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
        speak: (text, force = false, responseMessage = null) => {
            if (app.voiceEngine.synthesis && (app.voiceEngine.speechSynthesisEnabled || force)) {
                // Cancel any ongoing speech
                app.voiceEngine.synthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(text);
                const animation = responseMessage ? messageAnimations.get(responseMessage) : null;
                utterance.voice = app.voiceEngine.synthesis.getVoices()
                    .find((voice) => voice.voiceURI === voiceSelection?.value) || null;
                utterance.lang = utterance.voice?.lang || recognitionLanguage?.value || navigator.language || "en-US";
                utterance.rate = 0.9;
                utterance.pitch = 1;
                utterance.volume = 1;
                utterance.onend = () => {
                    animation?.finish();
                    app.isSpeaking = false;
                    if (animation) {
                        clearTimeout(app.respondingTimeout);
                        app.respondingTimeout = 0;
                        app.isResponding = false;
                    }
                    app.updateNeuralEngineState();
                    app.updateVoiceButton();
                };
                utterance.onstart = () => {
                    animation?.startSpeechSync();
                    app.isSpeaking = true;
                    app.updateNeuralEngineState();
                    app.updateVoiceButton();
                };
                utterance.onboundary = (event) => {
                    animation?.revealSpeechBoundary(event.charIndex, event.charLength);
                };
                utterance.onerror = (event) => {
                    animation?.resumeIndependent();
                    if (animation) {
                        clearTimeout(app.respondingTimeout);
                        app.respondingTimeout = 0;
                    }
                    console.error("Speech synthesis error:", event.error);
                    app.logActivity("Speech synthesis error: " + event.error, "error");
                    app.isSpeaking = false;
                    app.updateNeuralEngineState();
                    app.updateVoiceButton();
                };
                app.voiceEngine.synthesis.speak(utterance);
            }
        },
        isListening: () => app.isListening,
        isSpeaking: () => app.isSpeaking
    };

    app.voiceEngine.init();
    app.updateVoiceButton();
    voiceSelection?.addEventListener("change", () => savePreference(SPEECH_VOICE_PREFERENCE, voiceSelection.value));
    previewVoiceButton?.addEventListener("click", () => app.voiceEngine.speak(getWelcomeGreeting(), true));
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

function initSubAgentAvatars() {
    if (document.getElementById("peter-agent-overlay")) return;

    const neuralField = document.getElementById("neuralField") || document.querySelector(".neural-field");
    if (!neuralField) return;
    const agentHome = document.getElementById("agentHome");
    const agentHomeStatus = document.getElementById("agentHomeStatus");
    if (!agentHome || !agentHomeStatus) {
        console.error("The agent home could not be initialized.");
        app.logActivity("The agent home could not be initialized", "error");
        return;
    }

    const style = document.createElement("style");
    style.id = "peter-agent-overlay-styles";
    style.textContent = `
        .peter-agent-overlay {
            position: absolute;
            inset: 0;
            z-index: 4;
            pointer-events: none;
            overflow: hidden;
        }
        .peter-agent-overlay canvas {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            display: block;
        }
        .peter-agent {
            position: absolute;
            left: 50%;
            top: 50%;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 7px;
            transform: translate(-50%, -50%) translate(var(--agent-drift-x, 0px), var(--agent-drift-y, 0px)) scale(var(--agent-scale, 1));
            filter: drop-shadow(0 0 20px rgba(10, 220, 255, 0.18));
            transition: transform 0.52s cubic-bezier(0.22, 1, 0.36, 1), filter 0.3s ease, opacity 0.3s ease;
            pointer-events: auto;
            opacity: 1;
        }
        .peter-agent-visual {
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 7px;
            animation: peter-agent-float 3.8s ease-in-out infinite;
        }
        .peter-agent[data-agent="local"] .peter-agent-visual { animation-delay: 0.5s; }
        .peter-agent[data-agent="communication"] .peter-agent-visual { animation-delay: 1s; }
        .peter-agent[data-agent="research"] .peter-agent-visual { animation-delay: 1.4s; }
        .peter-agent[data-agent="quality"] .peter-agent-visual { animation-delay: 1.8s; }
        .agent-shell {
            position: relative;
            width: 58px;
            height: 64px;
            border-radius: 18px 18px 16px 16px;
            background: rgba(9, 16, 28, 0.78);
            border: 1px solid rgba(255, 255, 255, 0.12);
            box-shadow: inset 0 0 0 1px rgba(255,255,255,0.04), 0 12px 22px rgba(2, 8, 14, 0.38), 0 0 24px rgba(103, 224, 255, 0.14);
        }
        .agent-shell::before {
            content: "";
            position: absolute;
            left: 50%;
            top: -10px;
            width: 12px;
            height: 12px;
            transform: translateX(-50%);
            border-radius: 50%;
            background: var(--agent-led);
            box-shadow: 0 0 18px var(--agent-glow), 0 0 24px var(--agent-glow), 0 0 30px var(--agent-glow);
        }
        .agent-shell::after {
            content: "";
            position: absolute;
            left: 50%;
            bottom: -7px;
            width: 18px;
            height: 7px;
            transform: translateX(-50%);
            border-radius: 999px;
            background: rgba(255,255,255,0.08);
        }
        .agent-face {
            position: absolute;
            inset: 12px 10px 10px;
            border-radius: 12px;
            background: rgba(13, 22, 36, 0.86);
            border: 1px solid rgba(255,255,255,0.08);
            display: grid;
            place-items: center;
            overflow: hidden;
        }
        .agent-eyes {
            position: absolute;
            top: 15px;
            left: 50%;
            width: 28px;
            height: 14px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transform: translateX(-50%);
        }
        .agent-eye {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: var(--agent-eye-color, #8de9ff);
            box-shadow: 0 0 10px var(--agent-eye-color, rgba(140, 231, 255, 0.95)), 0 0 18px var(--agent-eye-color, rgba(140, 231, 255, 0.7)), 0 0 28px rgba(140, 231, 255, 0.45);
            animation: peter-eye-blink 4.8s ease-in-out infinite;
            transform-origin: center center;
            transition: width 0.22s ease, height 0.22s ease, transform 0.24s ease, border-radius 0.22s ease, background 0.24s ease, box-shadow 0.24s ease;
        }
        .agent-mouth {
            position: absolute;
            left: 50%;
            bottom: 11px;
            width: 18px;
            height: 9px;
            transform: translateX(-50%);
            border-bottom: 2px solid rgba(255,255,255,0.8);
            border-radius: 0 0 12px 12px;
            opacity: 0.7;
            transition: transform 0.24s ease, border-color 0.24s ease, opacity 0.24s ease;
        }
        .agent-hands,
        .agent-feet {
            position: absolute;
            left: 50%;
            width: 64px;
            height: 18px;
            transform: translateX(-50%);
            pointer-events: none;
        }
        .agent-hands {
            top: 20px;
            opacity: 0.8;
        }
        .agent-feet {
            bottom: -12px;
            opacity: 0;
            transition: opacity 0.22s ease, transform 0.2s ease;
        }
        .hand,
        .foot {
            position: absolute;
            width: 10px;
            height: 12px;
            border-radius: 9px 9px 12px 12px;
            border: 1px solid rgba(255,255,255,0.22);
            background: rgba(18, 28, 42, 0.82);
            box-shadow: inset 0 0 0 1px rgba(255,255,255,0.08);
        }
        .hand-left { left: 0; transform: rotate(24deg); }
        .hand-right { right: 0; transform: rotate(-24deg); }
        .foot-left { left: 15px; }
        .foot-right { right: 15px; }
        .agent-label {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 5px 10px 5px 8px;
            border-radius: 8px;
            background: rgba(7, 12, 18, 0.84);
            border: 1px solid rgba(145, 172, 208, 0.22);
            color: rgba(223, 237, 247, 0.92);
            font-size: 9px;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            white-space: nowrap;
            box-shadow: 0 0 12px rgba(110, 220, 255, 0.06);
        }
        .agent-label .agent-led-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: var(--agent-led);
            box-shadow: 0 0 12px var(--agent-glow);
            animation: peter-led-pulse 2.2s ease-in-out infinite;
        }
        .agent-task-card {
            width: min(190px, 42vw);
            margin-top: 5px;
            padding: 8px 10px;
            border: 1px solid rgba(164, 213, 237, 0.18);
            border-radius: 10px;
            background: rgba(5, 12, 22, 0.76);
            box-shadow: 0 8px 22px rgba(0, 0, 0, 0.22), 0 0 18px var(--agent-task-glow, rgba(103, 224, 255, 0.1));
            color: rgba(226, 239, 248, 0.92);
            text-align: left;
            white-space: normal;
            backdrop-filter: blur(8px);
            animation: peter-task-card-in 0.32s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .peter-agent-visual { position: relative; }
        .peter-agent[data-agent="research"] .agent-task-card,
        .peter-agent[data-agent="quality"] .agent-task-card {
            position: absolute;
            bottom: calc(100% + 6px);
            margin: 0;
        }
        .agent-task-card[hidden] { display: none; }
        .agent-task-heading {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            color: var(--agent-led);
            font-size: 8px;
            font-weight: 700;
            letter-spacing: 0.1em;
            text-transform: uppercase;
        }
        .agent-task-state {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            color: rgba(217, 231, 240, 0.78);
            font-size: 7px;
            letter-spacing: 0.08em;
        }
        .agent-task-state::before {
            width: 5px;
            height: 5px;
            border-radius: 50%;
            background: var(--agent-led);
            box-shadow: 0 0 8px var(--agent-glow);
            content: "";
            animation: peter-led-pulse 1.4s ease-in-out infinite;
        }
        .agent-task-description {
            display: -webkit-box;
            margin: 5px 0 6px;
            overflow: hidden;
            color: rgba(226, 239, 248, 0.88);
            font-size: 9px;
            line-height: 1.4;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
        }
        .agent-task-progress {
            height: 2px;
            overflow: hidden;
            border-radius: 4px;
            background: rgba(255, 255, 255, 0.1);
        }
        .agent-task-progress::after {
            display: block;
            width: 42%;
            height: 100%;
            border-radius: inherit;
            background: var(--agent-led);
            box-shadow: 0 0 8px var(--agent-glow);
            content: "";
            animation: peter-task-progress 1.8s ease-in-out infinite;
        }
        .peter-agent[data-task-state="done"] .agent-task-progress::after {
            width: 100%;
            animation: none;
        }
        .peter-agent[data-task-state="error"] .agent-task-progress::after {
            width: 100%;
            background: #ff9a9a;
            animation: none;
        }
        .peter-agent[data-task-state="done"] .agent-task-state::before { background: #8dffb0; }
        .peter-agent[data-task-state="error"] .agent-task-state::before { background: #ff8a8a; }
        .peter-agent[data-mood="sad"] .agent-eye {
            width: 8px;
            height: 8px;
            border-radius: 50% 50% 45% 45%;
            transform: translateY(2px) scaleY(0.7);
        }
        .peter-agent[data-mood="sad"] .agent-mouth {
            border-bottom: 2px solid rgba(255,255,255,0.8);
            border-top: none;
            transform: translateX(-50%) rotate(0deg) scaleY(0.8);
            opacity: 0.8;
        }
        .peter-agent[data-mood="angry"] .agent-eye {
            width: 8px;
            height: 8px;
            border-radius: 2px;
            transform: rotate(-12deg) scaleY(0.9);
        }
        .peter-agent[data-mood="angry"] .agent-eye:last-child {
            transform: rotate(12deg) scaleY(0.9);
        }
        .peter-agent[data-mood="angry"] .agent-mouth {
            border-bottom: 2px solid rgba(255,255,255,0.8);
            width: 14px;
            transform: translateX(-50%) rotate(2deg) scaleX(0.8);
        }
        .peter-agent[data-mood="action"] .agent-eye {
            width: 11px;
            height: 11px;
            border-radius: 50%;
            animation: peter-action-eye 0.55s ease-in-out infinite alternate;
        }
        .peter-agent[data-mood="action"] .agent-mouth {
            width: 22px;
            border-bottom: 2px solid rgba(255,255,255,0.9);
            opacity: 1;
        }
        .peter-agent[data-mood="action"] .agent-feet {
            opacity: 1;
            animation: peter-foot-bounce 0.65s ease-in-out infinite alternate;
        }
        .peter-agent[data-hidden="true"] {
            filter: drop-shadow(0 0 12px rgba(10, 220, 255, 0.08));
            opacity: 0.95;
        }
        .peter-agent[data-hovered="true"] .agent-feet {
            opacity: 1;
            animation: peter-foot-bounce 0.7s ease-in-out infinite alternate;
        }
        .peter-agent[data-hovered="true"] {
            --agent-scale: 1.08;
            filter: drop-shadow(0 0 26px rgba(140, 231, 255, 0.28));
        }
        .peter-agent[data-resting="true"] { --agent-scale: 0.72; }
        .peter-agent[data-resting="true"][data-hovered="true"] { --agent-scale: 0.78; }
        .peter-agent[data-resting="true"] .agent-label { opacity: 0.9; }
        .agent-label { order: -1; display: grid; grid-template-columns: 7px 1fr; justify-items: start; gap: 1px 5px; padding: 5px 8px; }
        .agent-label .agent-led-dot { grid-row: 1 / span 2; align-self: center; }
        .agent-role { grid-column: 2; color: rgba(186, 208, 228, 0.82); font-size: 8px; letter-spacing: 0.04em; text-transform: none; }
        .peter-agent[data-mood="resting"] .agent-eye { animation-duration: 6s; }
        .peter-agent[data-agent-state="working"] { z-index: 2; }
        .peter-social-agent { --agent-led: #5ef4ff; --agent-glow: rgba(94,244,255,1); --agent-eye-color: #78f9ff; }
        .peter-local-agent { --agent-led: #ffb766; --agent-glow: rgba(255,183,102,1); --agent-eye-color: #ffca73; }
        .peter-communication-agent { --agent-led: #7efca0; --agent-glow: rgba(126,252,160,1); --agent-eye-color: #79ff9d; }
        .peter-research-agent { --agent-led: #ff79f8; --agent-glow: rgba(255,121,248,1); --agent-eye-color: #ff8af8; }
        .peter-quality-agent { --agent-led: #ff7d7d; --agent-glow: rgba(255,125,125,1); --agent-eye-color: #ff8da8; }
        @keyframes peter-eye-blink {
            0%, 43%, 47%, 100% { transform: scaleY(1); opacity: 1; }
            45% { transform: scaleY(0.18); opacity: 0.8; }
        }
        @keyframes peter-led-pulse {
            0%, 100% { transform: scale(1); opacity: 0.9; }
            50% { transform: scale(1.35); opacity: 1; }
        }
        @keyframes peter-agent-float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-7px); }
        }
        @keyframes peter-action-eye {
            0% { transform: scaleY(1) scaleX(1); opacity: 1; }
            100% { transform: scaleY(1.35) scaleX(1.2); opacity: 1; }
        }
        @keyframes peter-foot-bounce {
            0% { transform: translateX(-50%) translateY(0px); }
            100% { transform: translateX(-50%) translateY(-2px); }
        }
        @keyframes peter-task-card-in {
            from { opacity: 0; transform: translateY(5px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes peter-task-progress {
            0% { transform: translateX(-110%); }
            100% { transform: translateX(250%); }
        }
    `;
    document.head.appendChild(style);

    const overlay = document.createElement("div");
    overlay.id = "peter-agent-overlay";
    overlay.className = "peter-agent-overlay";
    overlay.setAttribute("aria-hidden", "true");

    const canvas = document.createElement("canvas");
    canvas.id = "peter-agent-wave-canvas";

    const agents = [
        {
            key: "social",
            className: "peter-social-agent",
            label: "Piku",
            role: "Social Media",
            x: 18,
            y: 26,
        },
        {
            key: "local",
            className: "peter-local-agent",
            label: "Achu",
            role: "Files & Documents",
            x: 73,
            y: 19,
        },
        {
            key: "communication",
            className: "peter-communication-agent",
            label: "Bechu",
            role: "Messages",
            x: 84,
            y: 52,
        },
        {
            key: "research",
            className: "peter-research-agent",
            label: "Nori",
            role: "Research",
            x: 56,
            y: 80,
        },
        {
            key: "quality",
            className: "peter-quality-agent",
            label: "Zuzu",
            role: "Review & Quality",
            x: 28,
            y: 77,
        },
    ];

    const agentRuntime = new Map();

    agents.forEach((agent) => {
        const node = document.createElement("div");
        node.className = `peter-agent ${agent.className}`;
        node.dataset.agent = agent.key;
        node.dataset.mood = "resting";
        node.dataset.hidden = "false";
        node.dataset.hovered = "false";
        node.dataset.resting = "true";
        node.style.left = `${agent.x}%`;
        node.style.top = `${agent.y}%`;
        node.innerHTML = `
            <div class="peter-agent-visual">
                <div class="agent-shell">
                    <div class="agent-face">
                        <div class="agent-eyes">
                            <span class="agent-eye"></span>
                            <span class="agent-eye"></span>
                        </div>
                        <span class="agent-mouth"></span>
                    </div>
                    <div class="agent-hands">
                        <span class="hand hand-left"></span>
                        <span class="hand hand-right"></span>
                    </div>
                    <div class="agent-feet">
                        <span class="foot foot-left"></span>
                        <span class="foot foot-right"></span>
                    </div>
                </div>
                <div class="agent-label"><span class="agent-led-dot"></span><span>${agent.label}</span><span class="agent-role">${agent.role}</span></div>
                <div class="agent-task-card" hidden>
                    <div class="agent-task-heading">
                        <span>Peter's task</span>
                        <span class="agent-task-state">Working</span>
                    </div>
                    <p class="agent-task-description"></p>
                    <div class="agent-task-progress"></div>
                </div>
            </div>
        `;

        const state = {
            key: agent.key,
            x: 0,
            y: 0,
            positioned: false,
            alert: false,
            returningHome: false,
            hovered: false,
            seed: Math.random() * 10,
            pendingTasks: new Map(),
        };

        const setMood = (mood) => {
            node.dataset.mood = mood;
        };
        node.addEventListener("pointerenter", () => {
            state.hovered = true;
            node.dataset.hovered = "true";
            if (!state.alert) setMood("happy");
        });
        node.addEventListener("pointerleave", () => {
            state.hovered = false;
            node.dataset.hovered = "false";
            if (!state.alert) setMood("happy");
        });
        overlay.appendChild(node);
        agentRuntime.set(agent.key, state);
    });

    overlay.appendChild(canvas);
    neuralField.appendChild(overlay);

    const waveState = {
        center: { x: 0, y: 0 },
        targets: {},
        restTargets: {},
        particles: [],
        animationFrame: 0,
    };

    const updateHomeStatus = () => {
        const working = [];
        const returning = [];
        agentRuntime.forEach((state, key) => {
            const agent = agents.find((item) => item.key === key);
            if (state.pendingTasks.size) working.push(agent.label);
            else if (state.returningHome) returning.push(agent.label);
        });

        const restingCount = agents.length - working.length - returning.length;
        if (!working.length && !returning.length) {
            agentHomeStatus.textContent = "All five friends are home and resting.";
            return;
        }

        const statusParts = [];
        if (working.length) {
            const names = working.join(", ");
            statusParts.push(`${names} ${working.length === 1 ? "is" : "are"} helping Peter`);
        }
        if (returning.length) {
            statusParts.push(`${returning.join(", ")} ${returning.length === 1 ? "is" : "are"} heading home`);
        }
        if (restingCount) statusParts.push(`${restingCount} resting at home`);
        agentHomeStatus.textContent = `${statusParts.join(" · ")}.`;
    };

    const updateLayout = () => {
        const rect = neuralField.getBoundingClientRect();
        const homeRect = agentHome.getBoundingClientRect();
        waveState.center.x = rect.width * 0.5;
        waveState.center.y = rect.height * 0.48;
        const homeLeft = homeRect.left - rect.left;
        const homeTop = homeRect.top - rect.top;

        const positions = {
            social: { x: rect.width * 0.23, y: rect.height * 0.28 },
            local: { x: rect.width * 0.78, y: rect.height * 0.22 },
            communication: { x: rect.width * 0.86, y: rect.height * 0.52 },
            research: { x: rect.width * 0.62, y: rect.height * 0.8 },
            quality: { x: rect.width * 0.38, y: rect.height * 0.8 },
        };
        const homeSlots = {
            social: { x: 0.2, y: 0.36 },
            local: { x: 0.5, y: 0.5 },
            communication: { x: 0.8, y: 0.5 },
            research: { x: 0.35, y: 0.8 },
            quality: { x: 0.65, y: 0.8 },
        };

        Object.entries(positions).forEach(([key, target]) => {
            waveState.targets[key] = target;
        });
        Object.entries(homeSlots).forEach(([key, slot]) => {
            waveState.restTargets[key] = {
                x: homeLeft + homeRect.width * slot.x,
                y: homeTop + homeRect.height * slot.y,
            };
        });
    };

    let previousFrameTime = 0;
    const updateAgentDrift = (width, height, frameTime) => {
        const deltaSeconds = previousFrameTime
            ? Math.min((frameTime - previousFrameTime) / 1000, 0.05)
            : 1 / 60;
        previousFrameTime = frameTime;

        agentRuntime.forEach((runtime, key) => {
            const node = overlay.querySelector(`.peter-agent[data-agent="${key}"]`);
            if (!node) return;
            const target = waveState.targets[key];
            const homeTarget = waveState.restTargets[key];
            if (!target || !homeTarget) return;

            if (!runtime.positioned) {
                runtime.x = homeTarget.x;
                runtime.y = homeTarget.y;
                runtime.positioned = true;
            }

            const destinationX = runtime.alert ? target.x : homeTarget.x;
            const destinationY = runtime.alert ? target.y : homeTarget.y;
            const deltaX = destinationX - runtime.x;
            const deltaY = destinationY - runtime.y;
            const distance = Math.hypot(deltaX, deltaY);
            const travel = Math.min(distance, 110 * deltaSeconds);

            if (distance > 0) {
                runtime.x += (deltaX / distance) * travel;
                runtime.y += (deltaY / distance) * travel;
            }

            if (runtime.returningHome && distance <= travel + 2) {
                runtime.returningHome = false;
                node.dataset.resting = "true";
                node.dataset.agentState = "resting";
                node.querySelector(".agent-task-card").hidden = true;
                node.dataset.taskState = "";
                updateHomeStatus();
            }

            const breathingX = Math.sin((frameTime * 0.00022) + runtime.seed) * 2.2;
            const breathingY = Math.cos((frameTime * 0.00018) + runtime.seed) * 2.8;
            node.style.left = `${((runtime.x + breathingX) / width) * 100}%`;
            node.style.top = `${((runtime.y + breathingY) / height) * 100}%`;
        });
    };

    function cubicBezier(p0, p1, p2, p3, t) {
        const u = 1 - t;
        return (u * u * u * p0) + (3 * u * u * t * p1) + (3 * u * t * t * p2) + (t * t * t * p3);
    }

    function triggerTaskFlow(agentKey) {
        const target = waveState.targets[agentKey];
        if (!target) return;

        const hueMap = {
            social: "105, 241, 255",
            local: "255, 190, 115",
            communication: "141, 255, 176",
            research: "255, 122, 244",
            quality: "255, 122, 122",
        };

        const tone = hueMap[agentKey] || "105, 241, 255";
        for (let index = 0; index < 18; index += 1) {
            waveState.particles.push({
                agentKey,
                progress: Math.random() * 0.18,
                speed: 0.004 + Math.random() * 0.01,
                size: 6 + Math.random() * 14,
                offset: index / 18,
                alpha: 0.2 + Math.random() * 0.6,
                hue: tone,
            });
        }
    }

    let taskSequence = 0;
    const taskProfiles = [
        { key: "quality", pattern: /\b(review|verify|quality|inspect|report|proofread|check|test|jaanch|janch)\b/i },
        { key: "communication", pattern: /\b(email|call|message|reply|contact|outreach|communication|jawab|baat|bhejo|bhej do)\b/i },
        { key: "local", pattern: /\b(file|folder|directory|document|image|local|organize|organise|data|khol|kholo|kholna)\b/i },
        { key: "research", pattern: /\b(research|search|website|web|look up|find information|browse|jankari|jaankari|dhundo|dhoondo|talash|talaash|client|lead|prospect|customer|find.*company|potential customer|grahak|company.*(dhundo|dhoondo|khojo))\b/i },
        { key: "social", pattern: /\b(social media|instagram|facebook|youtube|tiktok|post|caption|hashtag|content|reel|tweet)\b/i },
    ];
    const taskDescriptions = {
        social: "Preparing social media content",
        local: "Checking files and data",
        communication: "Preparing a communication response",
        research: "Researching the request",
        quality: "Reviewing the requested result",
    };

    app.startAgentTask = (taskText) => {
        const request = String(taskText || "").trim();
        const profile = taskProfiles.find((item) => item.pattern.test(request));
        if (!profile) return null;
        const agentKey = profile.key;
        const state = agentRuntime.get(agentKey);
        const node = overlay.querySelector(`.peter-agent[data-agent="${agentKey}"]`);
        const target = waveState.targets[agentKey];
        if (!state || !node || !target) return null;

        const taskId = ++taskSequence;
        const description = request.length > 110 ? `${request.slice(0, 107)}...` : request;
        state.pendingTasks.set(taskId, {
            description: description || taskDescriptions[agentKey],
            summary: taskDescriptions[agentKey],
        });
        state.alert = true;
        state.returningHome = false;
        node.dataset.resting = "false";
        node.dataset.agentState = "working";
        node.dataset.taskState = "working";
        node.dataset.mood = "action";
        node.querySelector(".agent-task-state").textContent = taskDescriptions[agentKey];
        node.querySelector(".agent-task-description").textContent = description || taskDescriptions[agentKey];
        node.querySelector(".agent-task-card").hidden = false;
        updateHomeStatus();
        triggerTaskFlow(agentKey);
        return taskId;
    };

    app.finishAgentTask = (taskId, succeeded) => {
        if (!taskId) return;
        agentRuntime.forEach((state, agentKey) => {
            const completedTask = state.pendingTasks.get(taskId);
            if (!completedTask) return;
            state.pendingTasks.delete(taskId);
            const node = overlay.querySelector(`.peter-agent[data-agent="${agentKey}"]`);
            if (!node) return;

            if (state.pendingTasks.size > 0) {
                const latestTask = Array.from(state.pendingTasks.values()).pop();
                node.dataset.taskState = "working";
                node.dataset.mood = "action";
                node.querySelector(".agent-task-state").textContent = latestTask.summary;
                node.querySelector(".agent-task-description").textContent = latestTask.description;
                return;
            }

            node.dataset.taskState = succeeded ? "done" : "error";
            node.dataset.mood = "resting";
            node.querySelector(".agent-task-state").textContent = succeeded ? "Reply ready" : "Service unavailable";
            state.alert = false;
            state.returningHome = true;
            node.dataset.agentState = "returning";
            updateHomeStatus();
        });
    };

    function renderWaveFrame(frameTime) {
        const context = canvas.getContext("2d");
        if (!context) return;

        const width = neuralField.clientWidth;
        const height = neuralField.clientHeight;
        if (!width || !height) {
            waveState.animationFrame = requestAnimationFrame(renderWaveFrame);
            return;
        }
        updateAgentDrift(width, height, frameTime);
        canvas.width = width;
        canvas.height = height;
        context.clearRect(0, 0, width, height);

        const { center } = waveState;
        for (let index = waveState.particles.length - 1; index >= 0; index -= 1) {
            const particle = waveState.particles[index];
            const target = waveState.targets[particle.agentKey];
            if (!target) {
                waveState.particles.splice(index, 1);
                continue;
            }

            particle.progress += particle.speed;
            if (particle.progress >= 1) {
                waveState.particles.splice(index, 1);
                continue;
            }

            const t = particle.progress;
            const midX = (center.x + target.x) / 2 + Math.sin((t + particle.offset) * Math.PI * 2) * 24;
            const midY = (center.y + target.y) / 2 - 48 - Math.cos((t + particle.offset) * Math.PI * 2) * 16;
            const x = cubicBezier(center.x, midX, midX, target.x, t);
            const y = cubicBezier(center.y, midY, midY, target.y, t);
            const radius = (1 - t) * particle.size;
            const alpha = (1 - t) * particle.alpha;

            context.beginPath();
            context.arc(x, y, radius, 0, Math.PI * 2);
            context.fillStyle = `rgba(${particle.hue}, ${alpha})`;
            context.fill();

            context.beginPath();
            context.strokeStyle = `rgba(${particle.hue}, ${alpha * 0.7})`;
            context.lineWidth = 1.2;
            context.moveTo(x, y);
            context.lineTo(x + 4, y + 4);
            context.stroke();
        }

        waveState.animationFrame = requestAnimationFrame(renderWaveFrame);
    }

    updateLayout();
    renderWaveFrame(performance.now());

    const resizeObserver = new ResizeObserver(() => {
        updateLayout();
    });
    resizeObserver.observe(neuralField);
    window.addEventListener("resize", updateLayout, { passive: true });
}

const originalInit = app.init;
app.init = function peterAgentOverlayInit() {
    if (typeof originalInit === "function") {
        originalInit.call(this);
    }
    initSubAgentAvatars();
};

// Export for use in other modules if needed
window.app = app;

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", app.init, { once: true });
} else {
    app.init();
}
