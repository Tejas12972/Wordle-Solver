if (!window.hasRunWordleSolver) {
    window.hasRunWordleSolver = true;

    (async () => {
        const WORDLIST_URL = chrome.runtime.getURL('util/newlist.txt');

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
                const rowFeedback = [];
                tiles.forEach(tile => {
                    rowFeedback.push({
                        letter: tile.textContent.trim(),
                        evaluation: tile.getAttribute('data-state')
                    });
                });
                if (rowFeedback.length > 0) feedback.push(rowFeedback);
            });
            return feedback;
        };

        const filterWordList = (wordList, feedback) => {
            const correctLetters = new Map();
            const presentLetters = new Set();
            const absentLetters = new Set();
            const incorrectPositionLetters = new Map();

            feedback.forEach(row => {
                row.forEach(({ letter, evaluation }, index) => {
                    if (evaluation === 'correct') {
                        correctLetters.set(index, letter);
                    } else if (evaluation === 'present') {
                        presentLetters.add(letter);
                        if (!incorrectPositionLetters.has(letter)) {
                            incorrectPositionLetters.set(letter, new Set());
                        }
                        incorrectPositionLetters.get(letter).add(index);
                    } else if (evaluation === 'absent') {
                        absentLetters.add(letter);
                    }
                });
            });

            return wordList.filter(word => {
                for (const [index, letter] of correctLetters.entries()) {
                    if (word[index] !== letter) {
                        return false;
                    }
                }

                for (const letter of presentLetters) {
                    if (!word.includes(letter)) {
                        return false;
                    }
                }

                for (const letter of absentLetters) {
                    if (word.includes(letter) && !correctLetters.has(word.indexOf(letter))) {
                        return false;
                    }
                }

                for (const [letter, indices] of incorrectPositionLetters.entries()) {
                    for (const index of indices) {
                        if (word[index] === letter) {
                            return false;
                        }
                    }
                }

                return true;
            });
        };

        const inputGuess = async (word) => {
            const keyboard = document.querySelector('[class*="Keyboard-module_keyboard"]');
            if (keyboard) {
                for (const char of word) {
                    const keyButton = keyboard.querySelector(`[data-key="${char}"]`);
                    if (keyButton) {
                        keyButton.click();
                        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between key presses
                    } else {
                        console.error(`Key button for '${char}' not found`);
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

        const findNextGuess = (wordList, usedLetters) => {
            const nextWords = wordList.filter(word => {
                for (const letter of word) {
                    if (usedLetters.has(letter)) {
                        return false;
                    }
                }
                return true;
            });
            return nextWords.length > 0 ? nextWords[0] : wordList[0];
        };

        const solveWordle = async () => {
            let wordList = await loadWordList();
            if (wordList.length === 0) {
                console.error('Word list is empty or could not be loaded.');
                return;
            }

            let initialGuess = "crane";
            await inputGuess(initialGuess);
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for feedback

            let usedLetters = new Set();

            while (true) {
                const feedback = getFeedback();
                console.log('Feedback:', feedback);

                if (feedback[feedback.length - 1].every(({ evaluation }) => evaluation === 'correct')) {
                    console.log('Wordle solved!');
                    return;
                }

                wordList = filterWordList(wordList, feedback);
                console.log('Filtered word list:', wordList);

                feedback.forEach(row => {
                    row.forEach(({ letter, evaluation }) => {
                        if (evaluation === 'correct' || evaluation === 'present' || evaluation === 'absent') {
                            usedLetters.add(letter);
                        }
                    });
                });

                if (wordList.length === 0) {
                    console.error('No possible words left.');
                    return;
                }

                const guess = findNextGuess(wordList, usedLetters);
                await inputGuess(guess);
                await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for feedback
            }
        };

        // Listen for messages from the popup
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'solveWordle') {
                solveWordle();
            }
        });
    })();
}
