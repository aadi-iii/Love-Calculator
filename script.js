// Game State
let gameState = {
    name1: '',
    name2: '',
    scores: {
        game1: 0,
        game2: 0,
        game3: 0
    },
    finalPercentage: 0
};

// Start Love Test
function startLoveTest() {
    const name1 = document.getElementById('name1').value.trim();
    const name2 = document.getElementById('name2').value.trim();
    
    if(name1 === '' || name2 === '') {
        alert('Please enter both names! 💕');
        return;
    }
    
    gameState.name1 = name1;
    gameState.name2 = name2;
    
    switchScreen('welcomeScreen', 'instructionsScreen');
}

// Start Game 1
function startGame1() {
    switchScreen('instructionsScreen', 'game1Screen');
    initMemoryGame();
}

// ============= GAME 1: MEMORY MATCH =============
let memoryGame = {
    cards: [],
    flippedCards: [],
    matchedPairs: 0,
    moves: 0,
    timer: 0,
    timerInterval: null
};

const heartEmojis = ['💖', '💗', '💝', '💘', '💕', '💞'];

function initMemoryGame() {
    // Reset game state
    memoryGame = {
        cards: [],
        flippedCards: [],
        matchedPairs: 0,
        moves: 0,
        timer: 0,
        timerInterval: null
    };
    
    // Create card pairs
    const cardPairs = [...heartEmojis, ...heartEmojis];
    memoryGame.cards = cardPairs.sort(() => Math.random() - 0.5);
    
    // Generate grid
    const grid = document.getElementById('memoryGrid');
    grid.innerHTML = '';
    
    memoryGame.cards.forEach((emoji, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.index = index;
        card.innerHTML = `
            <div class="card-back">💟</div>
            <div class="card-front">${emoji}</div>
        `;
        card.addEventListener('click', flipCard);
        grid.appendChild(card);
    });
    
    // Update display
    document.getElementById('moves').textContent = '0';
    document.getElementById('matches').textContent = '0/6';
    document.getElementById('memoryTimer').textContent = '0';
    
    // Start timer
    memoryGame.timerInterval = setInterval(() => {
        memoryGame.timer++;
        document.getElementById('memoryTimer').textContent = memoryGame.timer;
    }, 1000);
}

function flipCard() {
    if(memoryGame.flippedCards.length >= 2) return;
    if(this.classList.contains('flipped') || this.classList.contains('matched')) return;
    
    this.classList.add('flipped');
    memoryGame.flippedCards.push(this);
    
    if(memoryGame.flippedCards.length === 2) {
        memoryGame.moves++;
        document.getElementById('moves').textContent = memoryGame.moves;
        checkMatch();
    }
}

function checkMatch() {
    const [card1, card2] = memoryGame.flippedCards;
    const emoji1 = memoryGame.cards[card1.dataset.index];
    const emoji2 = memoryGame.cards[card2.dataset.index];
    
    if(emoji1 === emoji2) {
        // Match!
        setTimeout(() => {
            card1.classList.add('matched');
            card2.classList.add('matched');
            memoryGame.matchedPairs++;
            document.getElementById('matches').textContent = `${memoryGame.matchedPairs}/6`;
            memoryGame.flippedCards = [];
            
            if(memoryGame.matchedPairs === 6) {
                endMemoryGame();
            }
        }, 500);
    } else {
        // No match
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            memoryGame.flippedCards = [];
        }, 1000);
    }
}

function endMemoryGame() {
    clearInterval(memoryGame.timerInterval);
    
    // Calculate score (max 35 points)
    let score = 35;
    
    // Deduct for moves (perfect = 6 moves)
    if(memoryGame.moves > 6) {
        score -= Math.min(10, (memoryGame.moves - 6) * 1);
    }
    
    // Deduct for time (under 30 seconds is good)
    if(memoryGame.timer > 30) {
        score -= Math.min(10, Math.floor((memoryGame.timer - 30) / 3));
    }
    
    score = Math.max(15, score); // Minimum 15 points
    gameState.scores.game1 = score;
    
    let message = '';
    if(score >= 30) {
        message = `🌟 Amazing Memory! Completed in ${memoryGame.timer}s with ${memoryGame.moves} moves! Perfect sync! +${score} pts`;
    } else if(score >= 25) {
        message = `💫 Great Job! ${memoryGame.timer}s and ${memoryGame.moves} moves. Strong connection! +${score} pts`;
    } else {
        message = `💕 Well Done! ${memoryGame.timer}s and ${memoryGame.moves} moves. Love takes time! +${score} pts`;
    }
    
    const resultDiv = document.getElementById('game1Result');
    resultDiv.innerHTML = message;
    
    setTimeout(() => {
        switchScreen('game1Screen', 'game2Screen');
        initWordScramble();
    }, 3000);
}

// ============= GAME 2: WORD SCRAMBLE =============
let wordGame = {
    words: [
        { word: 'ROMANCE', hint: 'Love affair', scrambled: '' },
        { word: 'PASSION', hint: 'Intense emotion', scrambled: '' },
        { word: 'FOREVER', hint: 'Eternal love', scrambled: '' },
        { word: 'SOULMATE', hint: 'Perfect match', scrambled: '' },
        { word: 'BELOVED', hint: 'Dearly loved', scrambled: '' },
        { word: 'CUPID', hint: 'Love god', scrambled: '' },
        { word: 'SWEETHEART', hint: 'Term of endearment', scrambled: '' }
    ],
    currentWord: null,
    userGuess: [],
    attempts: 0,
    startTime: 0
};

function initWordScramble() {
    // Pick random word
    const randomWord = wordGame.words[Math.floor(Math.random() * wordGame.words.length)];
    wordGame.currentWord = randomWord.word;
    wordGame.userGuess = [];
    wordGame.attempts = 0;
    wordGame.startTime = Date.now();
    
    // Scramble the word
    const scrambled = wordGame.currentWord.split('').sort(() => Math.random() - 0.5).join('');
    
    // Display scrambled word
    document.getElementById('scrambledWord').textContent = scrambled;
    document.getElementById('wordHint').textContent = randomWord.hint;
    
    // Create letter buttons
    const letterButtons = document.getElementById('letterButtons');
    letterButtons.innerHTML = '';
    
    scrambled.split('').forEach((letter, index) => {
        const btn = document.createElement('button');
        btn.className = 'letter-btn';
        btn.textContent = letter;
        btn.dataset.index = index;
        btn.addEventListener('click', selectLetter);
        letterButtons.appendChild(btn);
    });
    
    // Clear guessed word display
    document.getElementById('guessedWord').textContent = '';
}

function selectLetter() {
    if(this.classList.contains('used')) return;
    
    this.classList.add('used');
    const letter = this.textContent;
    wordGame.userGuess.push({ letter, button: this });
    
    // Update display
    document.getElementById('guessedWord').textContent = 
        wordGame.userGuess.map(item => item.letter).join(' ');
}

function clearGuess() {
    wordGame.userGuess.forEach(item => {
        item.button.classList.remove('used');
    });
    wordGame.userGuess = [];
    document.getElementById('guessedWord').textContent = '';
}

function submitWord() {
    if(wordGame.userGuess.length === 0) return;
    
    wordGame.attempts++;
    const guess = wordGame.userGuess.map(item => item.letter).join('');
    
    if(guess === wordGame.currentWord) {
        // Correct!
        const timeTaken = Math.floor((Date.now() - wordGame.startTime) / 1000);
        
        // Calculate score (max 35 points)
        let score = 35;
        
        // Deduct for attempts
        if(wordGame.attempts > 1) {
            score -= (wordGame.attempts - 1) * 5;
        }
        
        // Deduct for time (under 20 seconds is good)
        if(timeTaken > 20) {
            score -= Math.min(10, Math.floor((timeTaken - 20) / 3));
        }
        
        score = Math.max(15, score);
        gameState.scores.game2 = score;
        
        let message = '';
        if(score >= 30) {
            message = `🎯 Perfect! Got it in ${timeTaken}s on attempt ${wordGame.attempts}! Mind connection! +${score} pts`;
        } else if(score >= 25) {
            message = `⭐ Excellent! ${timeTaken}s and ${wordGame.attempts} attempts. Great teamwork! +${score} pts`;
        } else {
            message = `💝 Nice Work! ${timeTaken}s and ${wordGame.attempts} attempts. Love conquers all! +${score} pts`;
        }
        
        document.getElementById('game2Result').innerHTML = message;
        
        setTimeout(() => {
            switchScreen('game2Screen', 'game3Screen');
            initArrowGame();
        }, 3000);
    } else {
        // Wrong
        alert(`Not quite! Try again. (Hint: ${document.getElementById('wordHint').textContent})`);
        clearGuess();
    }
}

// ============= GAME 3: CUPID'S ARROW =============
let arrowGame = {
    score: 0,
    hasShot: false,
    arrowInterval: null,
    powerInterval: null,
    arrowPosition: 0,
    arrowDirection: 1,
    powerLevel: 0,
    powerDirection: 1
};

function initArrowGame() {
    arrowGame = {
        score: 0,
        hasShot: false,
        arrowInterval: null,
        powerInterval: null,
        arrowPosition: 0,
        arrowDirection: 1,
        powerLevel: 0,
        powerDirection: 1
    };
    
    document.getElementById('arrowScore').textContent = '0';
    document.getElementById('shootButton').textContent = '🏹 Shoot Arrow!';
    document.getElementById('game3Result').innerHTML = '';
    
    const arrow = document.getElementById('movingArrow');
    const powerBar = document.getElementById('powerBar');
    
    // Start arrow animation manually
    arrowGame.arrowInterval = setInterval(() => {
        arrowGame.arrowPosition += arrowGame.arrowDirection * 2;
        
        if(arrowGame.arrowPosition >= 85) {
            arrowGame.arrowDirection = -1;
        } else if(arrowGame.arrowPosition <= 0) {
            arrowGame.arrowDirection = 1;
        }
        
        arrow.style.left = arrowGame.arrowPosition + '%';
    }, 20);
    
    // Start power bar animation manually
    arrowGame.powerInterval = setInterval(() => {
        arrowGame.powerLevel += arrowGame.powerDirection * 3;
        
        if(arrowGame.powerLevel >= 100) {
            arrowGame.powerDirection = -1;
        } else if(arrowGame.powerLevel <= 0) {
            arrowGame.powerDirection = 1;
        }
        
        powerBar.style.width = arrowGame.powerLevel + '%';
    }, 30);
}

function shootArrow() {
    if(arrowGame.hasShot) {
        // Move to next screen
        switchScreen('game3Screen', 'resultScreen');
        showFinalResult();
        return;
    }
    
    arrowGame.hasShot = true;
    
    // Stop animations
    clearInterval(arrowGame.arrowInterval);
    clearInterval(arrowGame.powerInterval);
    
    // Calculate score based on arrow position (center is best)
    const centerDistance = Math.abs(arrowGame.arrowPosition - 42.5); // Center is around 42.5%
    let posScore = Math.max(0, 50 - centerDistance);
    
    // Calculate power score (50% is perfect)
    const powerDistance = Math.abs(arrowGame.powerLevel - 50);
    let powerScore = Math.max(0, 50 - powerDistance);
    
    const totalScore = Math.min(35, Math.round((posScore + powerScore) / 3));
    arrowGame.score = totalScore;
    gameState.scores.game3 = totalScore;
    
    // Update display
    document.getElementById('arrowScore').textContent = totalScore;
    
    let message = '';
    if(totalScore >= 30) {
        message = `🎯 Bullseye! Perfect shot! Your hearts beat as one! +${totalScore} pts`;
    } else if(totalScore >= 25) {
        message = `💘 Great Aim! Close to the heart! Strong bond! +${totalScore} pts`;
    } else if(totalScore >= 20) {
        message = `💖 Good Shot! Nice timing! +${totalScore} pts`;
    } else {
        message = `💕 Nice Try! Love doesn't need perfection! +${totalScore} pts`;
    }
    
    document.getElementById('game3Result').innerHTML = message;
    document.getElementById('shootButton').textContent = 'See Results! 💖';
}

// ============= FINAL RESULT =============
function showFinalResult() {
    switchScreen('game3Screen', 'resultScreen');
    
    // Calculate total score
    const totalScore = gameState.scores.game1 + gameState.scores.game2 + gameState.scores.game3;
    
    // Calculate percentage (max 105 points possible, scale to 100)
    const percentage = Math.min(100, Math.round((totalScore / 105) * 100));
    gameState.finalPercentage = percentage;
    
    // Display names
    document.getElementById('finalName1').textContent = gameState.name1;
    document.getElementById('finalName2').textContent = gameState.name2;
    
    // Display scores
    document.getElementById('score1').textContent = gameState.scores.game1;
    document.getElementById('score2').textContent = gameState.scores.game2;
    document.getElementById('score3').textContent = gameState.scores.game3;
    
    // Animate percentage
    animatePercentage(percentage);
    
    // Show compatibility message
    showCompatibilityMessage(percentage);
}

function animatePercentage(percentage) {
    const circle = document.getElementById('progressCircle');
    const percentText = document.getElementById('percentageText');
    const circumference = 2 * Math.PI * 90;
    const offset = circumference - (percentage / 100) * circumference;
    
    // Animate from 0 to final percentage
    let currentPercent = 0;
    const increment = percentage / 50;
    
    const interval = setInterval(() => {
        currentPercent += increment;
        
        if(currentPercent >= percentage) {
            currentPercent = percentage;
            clearInterval(interval);
        }
        
        percentText.textContent = Math.round(currentPercent) + '%';
        const currentOffset = circumference - (currentPercent / 100) * circumference;
        circle.style.strokeDashoffset = currentOffset;
    }, 40);
}

function showCompatibilityMessage(percentage) {
    const levelElement = document.getElementById('compatibilityLevel');
    const messageElement = document.getElementById('loveMessage');
    
    let level = '';
    let message = '';
    
    if(percentage >= 90) {
        level = '💖 Perfect Match! 💖';
        message = `${gameState.name1} and ${gameState.name2}, you two are destined to be together! Your minds sync perfectly, your hearts beat as one, and your aim is true. This is a love written in the stars! 🌟✨`;
    } else if(percentage >= 75) {
        level = '💕 Excellent Compatibility! 💕';
        message = `${gameState.name1} and ${gameState.name2}, you share an incredible bond! You remember each other perfectly, communicate brilliantly, and your timing is impeccable. This love is built to last! 🌹💫`;
    } else if(percentage >= 60) {
        level = '💝 Great Connection! 💝';
        message = `${gameState.name1} and ${gameState.name2}, you have wonderful chemistry together! Your mental connection is strong, you understand each other well, and you work great as a team. Keep nurturing this beautiful relationship! 🌺💗`;
    } else if(percentage >= 45) {
        level = '💗 Good Match! 💗';
        message = `${gameState.name1} and ${gameState.name2}, you complement each other nicely! There's real potential here. With patience, practice, and lots of love, your bond will grow even stronger! 🌸💖`;
    } else if(percentage >= 30) {
        level = '💓 Promising Start! 💓';
        message = `${gameState.name1} and ${gameState.name2}, every great love story has a beginning! You've got the foundation - keep playing together, learning together, and growing together! 🌼💕`;
    } else {
        level = '💞 Friends First! 💞';
        message = `${gameState.name1} and ${gameState.name2}, the best relationships start with friendship! Take your time, enjoy the journey, and let love develop naturally. Great things take time! 🌻💝`;
    }
    
    levelElement.textContent = level;
    messageElement.textContent = message;
}

// ============= UTILITY FUNCTIONS =============
function switchScreen(currentScreen, nextScreen) {
    document.getElementById(currentScreen).classList.remove('active');
    document.getElementById(nextScreen).classList.add('active');
}

function resetCalculator() {
    gameState = {
        name1: '',
        name2: '',
        scores: {
            game1: 0,
            game2: 0,
            game3: 0
        },
        finalPercentage: 0
    };
    
    // Clear inputs
    document.getElementById('name1').value = '';
    document.getElementById('name2').value = '';
    
    // Reset progress circle
    document.getElementById('progressCircle').style.strokeDashoffset = 565.48;
    
    // Go back to welcome screen
    switchScreen('resultScreen', 'welcomeScreen');
}

// Keyboard support
document.addEventListener('DOMContentLoaded', function() {
    const name1Input = document.getElementById('name1');
    const name2Input = document.getElementById('name2');
    
    name1Input.addEventListener('keypress', function(e) {
        if(e.key === 'Enter') {
            name2Input.focus();
        }
    });
    
    name2Input.addEventListener('keypress', function(e) {
        if(e.key === 'Enter') {
            startLoveTest();
        }
    });
});
