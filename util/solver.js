if (!window.hasRunWordleSolver) {
    window.hasRunWordleSolver = true;

    (async () => {
        const WORDLIST_URL = chrome.runtime.getURL('util/wordlist.txt');

        const loadWordList = async () => {
            try {
                const response = await fetch(WORDLIST_URL);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const text = await response.text();
                return text.split('\n').map(word => word.trim());
            } catch (error) {
                console.error('Failed to fetch word list:', error);
                return [];
            }
        };

        const getFeedback = () => {
            const rows = document.querySelectorAll('[class*="Row-module_row"]');
            const feedback = [];
            rows.forEach(row => {
                const tiles = row.querySelectorAll('[class*="Tile-module_tile"]');
                tiles.forEach(tile => {
                    feedback.push({
                        letter: tile.textContent,
                        evaluation: tile.getAttribute('data-state')
                    });
                });
            });
            return feedback.slice(-5); // Get feedback for the last guess
        };

        const filterWordList = (wordList, feedback) => {
            // Filter word list based on feedback
            feedback.forEach(({ letter, evaluation }, index) => {
                if (evaluation === 'correct') {
                    wordList = wordList.filter(word => word[index] === letter);
                } else if (evaluation === 'present') {
                    wordList = wordList.filter(word => word.includes(letter) && word[index] !== letter);
                } else {
                    wordList = wordList.filter(word => !word.includes(letter));
                }
            });
            return wordList;
        };

        const inputGuess = async (word) => {
            const keyboard = document.querySelector('[class*="Game-keyboard"]');
            if (keyboard) {
                for (const char of word) {
                    const keyButton = keyboard.querySelector(`[data-key="${char}"]`);
                    if (keyButton) {
                        keyButton.click();
                        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between key presses
                    }
                }
                const enterButton = keyboard.querySelector('[data-key="↵"]');
                if (enterButton) {
                    enterButton.click();
                } else {
                    console.error('Enter button not found');
                }
            } else {
                console.error('Keyboard not found');
            }
        };

        const solveWordle = async () => {
            let wordList = await loadWordList();
            if (wordList.length === 0) {
                console.error('Word list is empty or could not be loaded.');
                return;
            }
            while (wordList.length > 1) {
                const guess = wordList[Math.floor(Math.random() * wordList.length)];
                await inputGuess(guess);
                await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for feedback
                const feedback = getFeedback();
                wordList = filterWordList(wordList, feedback);
            }
            if (wordList.length === 1) {
                await inputGuess(wordList[0]);
            }
        };

        solveWordle();
    })();
}
