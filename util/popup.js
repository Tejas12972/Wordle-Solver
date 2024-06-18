document.addEventListener('DOMContentLoaded', () => {
    const solveButton = document.getElementById('solveButton');
    if (solveButton) {
        solveButton.addEventListener('click', () => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, { action: 'solveWordle' });
            });
        });
    }
});
