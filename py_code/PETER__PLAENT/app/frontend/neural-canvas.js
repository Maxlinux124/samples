import { NeuralEngine } from "./neural-core.js";

export function initNeuralCanvas() {
    if (window.neuralEngine) return window.neuralEngine;

    const canvas = document.getElementById("neuralCanvas");
    if (!canvas) throw new Error("Neural canvas element was not found.");

    const engine = new NeuralEngine(canvas, {
        coreLabel: document.getElementById("coreLabel"),
        coreSub: document.getElementById("coreSub"),
        idleText: "PETER CORE - STANDBY",
        listeningText: "LISTENING",
        processingText: "PROCESSING REQUEST",
        speakingText: "PETER IS SPEAKING",
        errorText: "Network error",
    });

    window.neuralEngine = engine;
    window.closeNeuralAnimation = () => engine.destroy();
    return engine;
}