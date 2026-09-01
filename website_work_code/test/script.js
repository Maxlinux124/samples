// Dynamic click tracking effect for digital marketing stats
document.getElementById('marketingBtn').addEventListener('click', function() {
    // Add a quick feedback click animation or handle redirection
    console.log("CTA Clicked! Tracking conversion for Max website.");
    
    // Optional temporary effect on click
    this.style.background = '#1e40af';
    setTimeout(() => {
        this.style.background = 'linear-gradient(135deg, #2563eb, #1d4ed8)';
    }, 150);
});
