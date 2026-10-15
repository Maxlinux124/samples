import { NeuralEngine } from "./neural-core.js";

window.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("neuralCanvas");
    const core = document.getElementById("core");
    const coreLabel = document.getElementById("coreLabel");
    const coreSub = document.getElementById("coreSub");

    const engine = new NeuralEngine(canvas, {
        coreLabel,
        coreSub,
        idleText: "PETER CORE - STANDBY",
        listeningText: "LISTENING",
        processingText: "PROCESSING REQUEST",
        speakingText: "PETER IS SPEAKING",
        errorText: "Network error",
    });

    // Expose the engine for external state control
    window.neuralEngine = engine;

    // Remove the click listener that changes state to avoid interference
    // canvas.addEventListener("click", (e) => {
    //     if (this.state === "IDLE") {
    //         this.setState("LISTENING");
    //     }
    // });

    window.closeNeuralAnimation = () => {
        engine.destroy();
    };
});
