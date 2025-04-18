document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('le-poisson-steve');
    
    // Add click event to enable audio
    document.body.addEventListener('click', () => {
        if (video.muted) {
            video.muted = false;
            video.play();
        }
    });
});