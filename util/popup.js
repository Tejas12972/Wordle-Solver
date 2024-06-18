document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('solve').addEventListener('click', solveWordle);
});

const solveWordle = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            files: ['util/solver.js']
        });
    });
};
