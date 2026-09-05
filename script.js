// ============= FIREBASE FIRESTORE INTEGRATION =============
// Firebase is loaded dynamically via ES module imports on-demand so that existing inline 
// onclick handlers and non-module script architecture continue working seamlessly.
const firebaseConfig = {
    apiKey: "AIzaSyA_RZ6KkA7DbRgvgZ6MucVKm4QYldSpNCA",
    authDomain: "love-n-toxic-analytics.firebaseapp.com",
    projectId: "love-n-toxic-analytics",
    storageBucket: "love-n-toxic-analytics.firebasestorage.app",
    messagingSenderId: "44732402596",
    appId: "1:44732402596:web:5b14c469c2233207e94f31"
};

let firebaseDb = null;
let hasSavedCurrentResult = false;

async function getFirebaseDb() {
    if (firebaseDb) return firebaseDb;
    try {
        const { initializeApp } = await import(
            "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js"
        );
        const { getFirestore } = await import(
            "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js"
        );
        const app = initializeApp(firebaseConfig);
        firebaseDb = getFirestore(app);
        console.log("Firebase initialized successfully.");
        return firebaseDb;
    } catch (error) {
        console.error("Firebase initialization failed:", error);
        return null;
    }
}

async function saveLoveCalculatorResult() {
    if (hasSavedCurrentResult) return;
    hasSavedCurrentResult = true;

    try {
        const db = await getFirebaseDb();
        if (!db) {
            console.warn("Firestore instance not available.");
            return;
        }
        const { collection, addDoc, serverTimestamp } = await import(
            "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js"
        );
        await addDoc(collection(db, "loveCalculatorAttempts"), {
            name1: gameState.name1,
            name2: gameState.name2,
            game1Score: gameState.scores.game1,
            game2Score: gameState.scores.game2,
            game3Score: gameState.scores.game3,
            finalPercentage: gameState.finalPercentage,
            createdAt: serverTimestamp()
        });
        console.log("Love Calculator result saved to Firestore successfully.");
    } catch (error) {
        // Firebase failure must NEVER break the Love Calculator experience.
        console.error("Error saving result to Firestore:", error);
    }
}

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

// ============= NAVIGATION & MOBILE MENU =============
const screenMap = {
    'home': 'welcomeScreen',
    'how-it-works': 'howItWorksScreen',
    'fun': 'funScreen',
    'contact': 'contactScreen'
};

function navigateTo(screenKey) {
    const targetScreenId = screenMap[screenKey] || 'welcomeScreen';
    
    // Check if user is currently in the middle of a mini-game
    const currentActiveScreen = document.querySelector('.screen.active');
    if (currentActiveScreen) {
        const activeId = currentActiveScreen.id;
        if (['game1Screen', 'game2Screen', 'game3Screen'].includes(activeId)) {
            const confirmLeave = confirm('Are you sure you want to leave the active game? Your progress will be reset. 💕');
            if (!confirmLeave) return;
        }
    }

    // Close mobile menu if open
    closeMobileMenu();

    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });

    // Show target screen
    const targetElement = document.getElementById(targetScreenId);
    if (targetElement) {
        targetElement.classList.add('active');
    }

    // Update nav active link state
    document.querySelectorAll('.nav-links .nav-item').forEach(navItem => {
        if (navItem.getAttribute('data-screen') === screenKey) {
            navItem.classList.add('active');
        } else {
            navItem.classList.remove('active');
        }
    });

    // Scroll to top of container smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleMobileMenu() {
    const hamburger = document.getElementById('hamburgerBtn');
    const navLinks = document.getElementById('navLinks');
    
    if (hamburger) hamburger.classList.toggle('active');
    if (navLinks) navLinks.classList.toggle('active');
}

function closeMobileMenu() {
    const hamburger = document.getElementById('hamburgerBtn');
    const navLinks = document.getElementById('navLinks');
    
    if (hamburger) hamburger.classList.remove('active');
    if (navLinks) navLinks.classList.remove('active');
}

// ============= FUN SCREEN: LOVE FACT GENERATOR =============
const loveFacts = [
    "When two people in love look into each other's eyes for 3 minutes, their heartbeats sync up naturally!",
    "Falling in love releases dopamine, oxytocin, and adrenaline — creating natural feelings of pure magic and excitement!",
    "Penguins propose to their lifelong soulmates with a pebble, and seahorses swim holding tails!",
    "A hug lasting 4+ seconds triggers oxytocin release, boosting trust and instantly reducing stress.",
    "Couples who laugh together regularly report 80% higher relationship satisfaction and happiness.",
    "Chocolate contains phenylethylamine — the same chemical your brain releases when you fall in love!",
    "Holding hands with someone you love can instantly relieve physical pain and lessen anxiety.",
    "Butterflies in your stomach are real! It is caused by an adrenaline rush when seeing your special person.",
    "It takes only 1/5th of a second for love-related neurochemicals to start firing in your brain!"
];

let lastFactIndex = 0;

function generateNewLoveFact() {
    let nextIndex;
    do {
        nextIndex = Math.floor(Math.random() * loveFacts.length);
    } while (nextIndex === lastFactIndex && loveFacts.length > 1);
    
    lastFactIndex = nextIndex;
    const factElement = document.getElementById('featuredFactText');
    if (factElement) {
        factElement.style.opacity = '0';
        setTimeout(() => {
            factElement.textContent = loveFacts[nextIndex];
            factElement.style.opacity = '1';
        }, 200);
    }
}

// ============= GAME FLOW =============
// Start Love Test
function startLoveTest() {
    const name1Input = document.getElementById('name1');
    const name2Input = document.getElementById('name2');
    
    const name1 = name1Input ? name1Input.value.trim() : '';
    const name2 = name2Input ? name2Input.value.trim() : '';
    
    if(name1 === '' || name2 === '') {
        alert('Please enter both names! 💕');
        return;
    }
    
    hasSavedCurrentResult = false; // Reset duplicate save guard for new attempt
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
    if (memoryGame.timerInterval) clearInterval(memoryGame.timerInterval);
    
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
    if (grid) {
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
    }
    
    // Update display
    const movesEl = document.getElementById('moves');
    const matchesEl = document.getElementById('matches');
    const timerEl = document.getElementById('memoryTimer');
    
    if (movesEl) movesEl.textContent = '0';
    if (matchesEl) matchesEl.textContent = '0/6';
    if (timerEl) timerEl.textContent = '0';
    
    // Start timer
    memoryGame.timerInterval = setInterval(() => {
        memoryGame.timer++;
        const currentTimerEl = document.getElementById('memoryTimer');
        if (currentTimerEl) currentTimerEl.textContent = memoryGame.timer;
    }, 1000);
}

function flipCard() {
    if(memoryGame.flippedCards.length >= 2) return;
    if(this.classList.contains('flipped') || this.classList.contains('matched')) return;
    
    this.classList.add('flipped');
    memoryGame.flippedCards.push(this);
    
    if(memoryGame.flippedCards.length === 2) {
        memoryGame.moves++;
        const movesEl = document.getElementById('moves');
        if (movesEl) movesEl.textContent = memoryGame.moves;
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
            const matchesEl = document.getElementById('matches');
            if (matchesEl) matchesEl.textContent = `${memoryGame.matchedPairs}/6`;
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
    if (resultDiv) resultDiv.innerHTML = message;
    
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
    const scrambledWordEl = document.getElementById('scrambledWord');
    const wordHintEl = document.getElementById('wordHint');
    if (scrambledWordEl) scrambledWordEl.textContent = scrambled;
    if (wordHintEl) wordHintEl.textContent = randomWord.hint;
    
    // Create letter buttons
    const letterButtons = document.getElementById('letterButtons');
    if (letterButtons) {
        letterButtons.innerHTML = '';
        scrambled.split('').forEach((letter, index) => {
            const btn = document.createElement('button');
            btn.className = 'letter-btn';
            btn.textContent = letter;
            btn.dataset.index = index;
            btn.addEventListener('click', selectLetter);
            letterButtons.appendChild(btn);
        });
    }
    
    // Clear guessed word display & results
    const guessedWordEl = document.getElementById('guessedWord');
    const resultDiv = document.getElementById('game2Result');
    if (guessedWordEl) guessedWordEl.textContent = '';
    if (resultDiv) resultDiv.innerHTML = '';
}

function selectLetter() {
    if(this.classList.contains('used')) return;
    
    this.classList.add('used');
    const letter = this.textContent;
    wordGame.userGuess.push({ letter, button: this });
    
    // Update display
    const guessedWordEl = document.getElementById('guessedWord');
    if (guessedWordEl) {
        guessedWordEl.textContent = wordGame.userGuess.map(item => item.letter).join(' ');
    }
}

function clearGuess() {
    wordGame.userGuess.forEach(item => {
        if (item.button) item.button.classList.remove('used');
    });
    wordGame.userGuess = [];
    const guessedWordEl = document.getElementById('guessedWord');
    if (guessedWordEl) guessedWordEl.textContent = '';
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
        
        const resultDiv = document.getElementById('game2Result');
        if (resultDiv) resultDiv.innerHTML = message;
        
        setTimeout(() => {
            switchScreen('game2Screen', 'game3Screen');
            initArrowGame();
        }, 3000);
    } else {
        // Wrong
        const hintEl = document.getElementById('wordHint');
        const hintText = hintEl ? hintEl.textContent : '';
        alert(`Not quite! Try again. (Hint: ${hintText})`);
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
    if (arrowGame.arrowInterval) clearInterval(arrowGame.arrowInterval);
    if (arrowGame.powerInterval) clearInterval(arrowGame.powerInterval);

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
    
    const arrowScoreEl = document.getElementById('arrowScore');
    const shootButtonEl = document.getElementById('shootButton');
    const game3ResultEl = document.getElementById('game3Result');
    
    if (arrowScoreEl) arrowScoreEl.textContent = '0';
    if (shootButtonEl) shootButtonEl.textContent = '🏹 Shoot Arrow!';
    if (game3ResultEl) game3ResultEl.innerHTML = '';
    
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
        
        if (arrow) arrow.style.left = arrowGame.arrowPosition + '%';
    }, 20);
    
    // Start power bar animation manually
    arrowGame.powerInterval = setInterval(() => {
        arrowGame.powerLevel += arrowGame.powerDirection * 3;
        
        if(arrowGame.powerLevel >= 100) {
            arrowGame.powerDirection = -1;
        } else if(arrowGame.powerLevel <= 0) {
            arrowGame.powerDirection = 1;
        }
        
        if (powerBar) powerBar.style.width = arrowGame.powerLevel + '%';
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
    const arrowScoreEl = document.getElementById('arrowScore');
    if (arrowScoreEl) arrowScoreEl.textContent = totalScore;
    
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
    
    const resultDiv = document.getElementById('game3Result');
    const shootButtonEl = document.getElementById('shootButton');
    if (resultDiv) resultDiv.innerHTML = message;
    if (shootButtonEl) shootButtonEl.textContent = 'See Results! 💖';
}

// ============= FINAL RESULT =============
function showFinalResult() {
    switchScreen('game3Screen', 'resultScreen');
    
    // Calculate total score
    const totalScore = gameState.scores.game1 + gameState.scores.game2 + gameState.scores.game3;
    
    // Calculate percentage (max 105 points possible, scale to 100)
    const percentage = Math.min(100, Math.round((totalScore / 105) * 100));
    gameState.finalPercentage = percentage;
    
    // Save to Firebase Firestore (non-blocking, failsafed)
    saveLoveCalculatorResult().catch(err => console.error("Firebase save error:", err));
    
    // Display names
    const finalName1El = document.getElementById('finalName1');
    const finalName2El = document.getElementById('finalName2');
    if (finalName1El) finalName1El.textContent = gameState.name1;
    if (finalName2El) finalName2El.textContent = gameState.name2;
    
    // Display scores
    const score1El = document.getElementById('score1');
    const score2El = document.getElementById('score2');
    const score3El = document.getElementById('score3');
    if (score1El) score1El.textContent = gameState.scores.game1;
    if (score2El) score2El.textContent = gameState.scores.game2;
    if (score3El) score3El.textContent = gameState.scores.game3;
    
    // Animate percentage
    animatePercentage(percentage);
    
    // Show compatibility message
    showCompatibilityMessage(percentage);
}

function animatePercentage(percentage) {
    const circle = document.getElementById('progressCircle');
    const percentText = document.getElementById('percentageText');
    
    // Calculate circumference based on screen size (default r=90 -> 565.48, mobile r=75 -> 471.24)
    const isMobile = window.innerWidth <= 600;
    const circumference = isMobile ? (2 * Math.PI * 75) : (2 * Math.PI * 90);
    
    // Animate from 0 to final percentage
    let currentPercent = 0;
    const increment = percentage / 50;
    
    const interval = setInterval(() => {
        currentPercent += increment;
        
        if(currentPercent >= percentage) {
            currentPercent = percentage;
            clearInterval(interval);
        }
        
        if (percentText) percentText.textContent = Math.round(currentPercent) + '%';
        const currentOffset = circumference - (currentPercent / 100) * circumference;
        if (circle) circle.style.strokeDashoffset = currentOffset;
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
    
    if (levelElement) levelElement.textContent = level;
    if (messageElement) messageElement.textContent = message;
}

// ============= UTILITY FUNCTIONS =============
function switchScreen(currentScreen, nextScreen) {
    const current = document.getElementById(currentScreen);
    const next = document.getElementById(nextScreen);
    
    if (current) current.classList.remove('active');
    if (next) next.classList.add('active');

    // Update nav active link state
    document.querySelectorAll('.nav-links .nav-item').forEach(navItem => {
        navItem.classList.remove('active');
    });

    if (nextScreen === 'welcomeScreen') {
        const homeNavItem = document.querySelector('.nav-links .nav-item[data-screen="home"]');
        if (homeNavItem) homeNavItem.classList.add('active');
    }
}

function resetCalculator() {
    hasSavedCurrentResult = false; // Reset duplicate save guard for new attempt
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
    const name1Input = document.getElementById('name1');
    const name2Input = document.getElementById('name2');
    if (name1Input) name1Input.value = '';
    if (name2Input) name2Input.value = '';
    
    // Reset progress circle
    const circle = document.getElementById('progressCircle');
    if (circle) circle.style.strokeDashoffset = '565.48';
    
    // Go back to welcome screen
    switchScreen('resultScreen', 'welcomeScreen');
}

// Global scope attachment for inline HTML onclick handlers
window.startLoveTest = startLoveTest;
window.startGame1 = startGame1;
window.clearGuess = clearGuess;
window.submitWord = submitWord;
window.shootArrow = shootArrow;
window.showFinalResult = showFinalResult;
window.resetCalculator = resetCalculator;
window.navigateTo = navigateTo;
window.toggleMobileMenu = toggleMobileMenu;
window.closeMobileMenu = closeMobileMenu;
window.generateNewLoveFact = generateNewLoveFact;
window.saveLoveCalculatorResult = saveLoveCalculatorResult;

// Keyboard support & document setup
document.addEventListener('DOMContentLoaded', function() {
    const name1Input = document.getElementById('name1');
    const name2Input = document.getElementById('name2');
    
    if (name1Input) {
        name1Input.addEventListener('keypress', function(e) {
            if(e.key === 'Enter' && name2Input) {
                name2Input.focus();
            }
        });
    }
    
    if (name2Input) {
        name2Input.addEventListener('keypress', function(e) {
            if(e.key === 'Enter') {
                startLoveTest();
            }
        });
    }

    // Smooth scroll focused name inputs into visible mobile viewport above virtual keyboard
    function setupMobileInputScroll(inputElement) {
        if (!inputElement) return;

        inputElement.addEventListener('focus', function() {
            setTimeout(function() {
                inputElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'nearest'
                });
            }, 300);
        });
    }

    setupMobileInputScroll(name1Input);
    setupMobileInputScroll(name2Input);

    // Adjust scrolling on mobile visualViewport resize when virtual keyboard opens/closes
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', function() {
            const activeEl = document.activeElement;
            if (activeEl && (activeEl.id === 'name1' || activeEl.id === 'name2')) {
                activeEl.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'nearest'
                });
            }
        });
    }

    // Close mobile menu when clicking outside navbar
    document.addEventListener('click', function(event) {
        const navbar = document.querySelector('.navbar');
        if (navbar && !navbar.contains(event.target)) {
            closeMobileMenu();
        }
    });
});
