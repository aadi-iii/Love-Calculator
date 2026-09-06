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
            game4Score: gameState.scores.game4,
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
        game3: 0,
        game4: 0
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
        if (['game1Screen', 'game2Screen', 'game3Screen', 'game4Screen'].includes(activeId)) {
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

// Smart Fisher-Yates Randomization ensuring matching cards are distributed non-adjacently
function generateSmartRandomMemoryCards() {
    const pairs = [...heartEmojis, ...heartEmojis];
    let bestCards = null;
    let minAdjacencies = Infinity;

    // Retry shuffle up to 100 times to get zero adjacent matching pairs in 4x3 grid
    for (let attempt = 0; attempt < 100; attempt++) {
        const shuffled = [...pairs];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        let adjCount = 0;

        // Check 4 columns x 3 rows grid adjacencies (12 cards total)
        for (let i = 0; i < 12; i++) {
            const row = Math.floor(i / 4);
            const col = i % 4;

            // Horizontal neighbor (right)
            if (col < 3 && shuffled[i] === shuffled[i + 1]) {
                adjCount++;
            }
            // Vertical neighbor (below)
            if (row < 2 && shuffled[i] === shuffled[i + 4]) {
                adjCount++;
            }
        }

        if (adjCount < minAdjacencies) {
            minAdjacencies = adjCount;
            bestCards = shuffled;
        }

        // Perfect configuration found (zero adjacencies)!
        if (adjCount === 0) break;
    }

    return bestCards;
}

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
    
    // Generate fresh smart randomized card arrangement for every new game/restart
    memoryGame.cards = generateSmartRandomMemoryCards();
    
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
        // Original words (KEPT 100%)
        { word: 'ROMANCE', hint: 'Love affair' },
        { word: 'PASSION', hint: 'Intense emotion' },
        { word: 'FOREVER', hint: 'Eternal love' },
        { word: 'SOULMATE', hint: 'Perfect match' },
        { word: 'BELOVED', hint: 'Dearly loved' },
        { word: 'CUPID', hint: 'Love god' },
        { word: 'SWEETHEART', hint: 'Term of endearment' },

        // Expanded romantic word additions
        { word: 'AFFECTION', hint: 'Fondness & warmth' },
        { word: 'ADORABLE', hint: 'Charming & cute' },
        { word: 'DEVOTION', hint: 'Deep loyalty & love' },
        { word: 'HEARTBEAT', hint: 'Rhythm of your heart' },
        { word: 'TOGETHER', hint: 'Side by side forever' },
        { word: 'DARLING', hint: 'Precious loved one' },
        { word: 'CUDDLE', hint: 'Warm affectionate hug' },
        { word: 'KISSES', hint: 'Sweet romantic lips' },
        { word: 'CHEMISTRY', hint: 'Natural spark & attraction' },
        { word: 'CRUSH', hint: 'Secret romantic feeling' },
        { word: 'LOVER', hint: 'Partner in romance' },
        { word: 'HUGS', hint: 'Comforting warm embrace' },
        { word: 'BLUSH', hint: 'Shy rosy smile' },
        { word: 'DATE', hint: 'Romantic outing together' },
        { word: 'MEMORIES', hint: 'Cherished moments shared' }
    ],
    currentWord: null,
    userGuess: [],
    attempts: 0,
    startTime: 0
};

function initWordScramble() {
    // Pick random word from expanded pool
    const randomWord = wordGame.words[Math.floor(Math.random() * wordGame.words.length)];
    wordGame.currentWord = randomWord.word;
    wordGame.userGuess = [];
    wordGame.attempts = 0;
    wordGame.startTime = Date.now();
    
    // Scramble the word, ensuring scrambled string is not identical to original word
    let scrambled = wordGame.currentWord;
    let scrambleAttempts = 0;
    while (scrambleAttempts < 20 && (scrambled === wordGame.currentWord || scrambled.length !== wordGame.currentWord.length)) {
        scrambled = wordGame.currentWord.split('').sort(() => Math.random() - 0.5).join('');
        scrambleAttempts++;
    }
    
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
        // Transition to Game 4: Who Falls First?
        switchScreen('game3Screen', 'game4Screen');
        initWhoFallsFirstGame();
        return;
    }
    
    arrowGame.hasShot = true;
    
    // Stop animations
    clearInterval(arrowGame.arrowInterval);
    clearInterval(arrowGame.powerInterval);
    
    // Real DOM Geometry Hit Detection using actual rendered element positions
    const targetHeart = document.querySelector('#game3Screen .target-heart');
    const movingArrow = document.getElementById('movingArrow');

    let isHit = false;
    let posAccuracy = 0; // 0 to 1

    if (targetHeart && movingArrow) {
        const heartRect = targetHeart.getBoundingClientRect();
        const arrowRect = movingArrow.getBoundingClientRect();

        // Calculate actual horizontal center of target heart and arrow impact tip
        const heartCenterX = heartRect.left + heartRect.width / 2;
        const arrowTipX = arrowRect.left + arrowRect.width / 2;

        const heartHalfWidth = heartRect.width / 2;
        const distX = Math.abs(arrowTipX - heartCenterX);

        // Evaluate if arrow tip hits within rendered heart target bounds
        if (distX <= heartHalfWidth) {
            isHit = true;
            // 1.0 accuracy at exact center, scaling down to 0.0 at outer edge of target
            posAccuracy = 1 - (distX / heartHalfWidth);
        } else {
            isHit = false;
            posAccuracy = 0;
        }
    } else {
        // Safe fallback if DOM elements are detached
        const centerDistance = Math.abs(arrowGame.arrowPosition - 42.5);
        posAccuracy = Math.max(0, 1 - (centerDistance / 25));
        isHit = posAccuracy > 0;
    }

    // Power Accuracy (50% power level is ideal)
    const powerDist = Math.abs(arrowGame.powerLevel - 50);
    const powerAccuracy = Math.max(0, 1 - (powerDist / 50)); // 1.0 for 50%, 0.0 for 0% or 100%

    // Calculate score out of 35 max points deterministically
    let totalScore = 0;

    if (!isHit) {
        // Complete Miss (0 points)
        totalScore = 0;
    } else {
        // Hit: Position accuracy contributes up to 25 pts, power contributes up to 10 pts
        const posPoints = posAccuracy * 25;
        const powerPoints = powerAccuracy * 10;
        totalScore = Math.min(35, Math.max(5, Math.round(posPoints + powerPoints)));
    }

    arrowGame.score = totalScore;
    gameState.scores.game3 = totalScore;
    
    // Update score display
    const arrowScoreEl = document.getElementById('arrowScore');
    if (arrowScoreEl) arrowScoreEl.textContent = totalScore;
    
    // Dynamic Feedback Messages based strictly on real shot accuracy
    let message = '';
    if (!isHit) {
        message = `💀 Cupid missed completely! +0 pts`;
    } else if (totalScore >= 32) {
        message = `🎯 Bullseye! Cupid approves. ❤️ +${totalScore} pts`;
    } else if (totalScore >= 24) {
        message = `So close! Cupid almost got it. 💘 +${totalScore} pts`;
    } else {
        message = `💔 Barely clipped the heart! +${totalScore} pts`;
    }
    
    const resultDiv = document.getElementById('game3Result');
    const shootButtonEl = document.getElementById('shootButton');
    if (resultDiv) resultDiv.innerHTML = message;
    if (shootButtonEl) shootButtonEl.textContent = 'Next Game: Who Falls First? 💘';
}

// ============= GAME 4: WHO FALLS FIRST? =============
let whoFallsState = {
    currentSituationIndex: 0,
    name1FallScore: 0,
    name2FallScore: 0,
    totalSituations: 10
};

const whoFallsSituations = [
    {
        question: "Who texts first in the morning?",
        options: [
            { text: "{name1} always sends the first cute good morning text", name1Pts: 3, name2Pts: 0 },
            { text: "{name2} wakes up early and texts first", name1Pts: 0, name2Pts: 3 },
            { text: "Both text each other at the exact same time!", name1Pts: 2, name2Pts: 2 }
        ]
    },
    {
        question: "When planning a surprise date night...",
        options: [
            { text: "{name1} secretly plans every single detail", name1Pts: 3, name2Pts: 0 },
            { text: "{name2} brings all the spontaneous romantic ideas", name1Pts: 0, name2Pts: 3 },
            { text: "They brainstorm and plan everything together", name1Pts: 2, name2Pts: 2 }
        ]
    },
    {
        question: "Who gets cute & jealous faster during friendly banter?",
        options: [
            { text: "{name1} gets super protective immediately", name1Pts: 3, name2Pts: 0 },
            { text: "{name2} pretends not to care but secretly is jealous", name1Pts: 0, name2Pts: 3 },
            { text: "Neither — total unshakeable trust!", name1Pts: 2, name2Pts: 2 }
        ]
    },
    {
        question: "Who double texts when left on read for 10 minutes?",
        options: [
            { text: "{name1} sends 5 follow-up funny memes", name1Pts: 3, name2Pts: 0 },
            { text: "{name2} calls immediately to check if they're okay", name1Pts: 0, name2Pts: 3 },
            { text: "Both wait patiently without stressing", name1Pts: 2, name2Pts: 2 }
        ]
    },
    {
        question: "Who says 'I love you' first during emotional moments?",
        options: [
            { text: "{name1} lets it slip out first", name1Pts: 3, name2Pts: 0 },
            { text: "{name2} confesses deep feelings first", name1Pts: 0, name2Pts: 3 },
            { text: "They blurt it out simultaneously!", name1Pts: 2, name2Pts: 2 }
        ]
    },
    {
        question: "Who initiates hand-holding first in public?",
        options: [
            { text: "{name1} reaches out without hesitating", name1Pts: 3, name2Pts: 0 },
            { text: "{name2} softly grabs the other's hand first", name1Pts: 0, name2Pts: 3 },
            { text: "Their hands brush and interlock automatically", name1Pts: 2, name2Pts: 2 }
        ]
    },
    {
        question: "Who remembers every single anniversary & tiny detail?",
        options: [
            { text: "{name1} keeps a secret notes app full of details", name1Pts: 3, name2Pts: 0 },
            { text: "{name2} never forgets a single date or memory", name1Pts: 0, name2Pts: 3 },
            { text: "Both have flawless memory for relationship milestones", name1Pts: 2, name2Pts: 2 }
        ]
    },
    {
        question: "After a tiny misunderstanding, who apologizes first?",
        options: [
            { text: "{name1} can't stay mad for more than 5 minutes", name1Pts: 3, name2Pts: 0 },
            { text: "{name2} brings peace offerings and warm hugs", name1Pts: 0, name2Pts: 3 },
            { text: "Both laugh and say sorry at the exact same moment", name1Pts: 2, name2Pts: 2 }
        ]
    },
    {
        question: "Who spends weeks searching for the ultimate birthday gift?",
        options: [
            { text: "{name1} prepares emotional handmade surprises", name1Pts: 3, name2Pts: 0 },
            { text: "{name2} finds the dream gift way ahead of time", name1Pts: 0, name2Pts: 3 },
            { text: "Both go completely over the top with gifts", name1Pts: 2, name2Pts: 2 }
        ]
    },
    {
        question: "Who gets caught staring when the other isn't looking?",
        options: [
            { text: "{name1} gets caught admiring {name2} constantly", name1Pts: 3, name2Pts: 0 },
            { text: "{name2} blushes when caught staring deeply", name1Pts: 0, name2Pts: 3 },
            { text: "Both catch each other staring and smiling", name1Pts: 2, name2Pts: 2 }
        ]
    }
];

function initWhoFallsFirstGame() {
    whoFallsState.currentSituationIndex = 0;
    whoFallsState.name1FallScore = 0;
    whoFallsState.name2FallScore = 0;

    const meterName1 = document.getElementById('meterName1');
    const meterName2 = document.getElementById('meterName2');
    const resultCard = document.getElementById('game4ResultCard');
    const situationCard = document.getElementById('situationCard');

    if (meterName1) meterName1.textContent = gameState.name1 || 'Name 1';
    if (meterName2) meterName2.textContent = gameState.name2 || 'Name 2';

    if (resultCard) resultCard.style.display = 'none';
    if (situationCard) situationCard.style.display = 'block';

    updateLoveMeterUI();
    renderCurrentSituation();
}

function updateLoveMeterUI() {
    const fill = document.getElementById('loveBalanceFill');
    const statusText = document.getElementById('meterStatusText');

    const n1 = whoFallsState.name1FallScore;
    const n2 = whoFallsState.name2FallScore;
    const total = n1 + n2;

    let percentage = 50;
    if (total > 0) {
        percentage = Math.round((n1 / total) * 100);
    }

    // Keep fill visually bounded between 15% and 85% for nice UI appearance
    const visualWidth = Math.max(15, Math.min(85, percentage));
    if (fill) fill.style.width = visualWidth + '%';

    if (statusText) {
        if (percentage > 58) {
            statusText.textContent = `${gameState.name1 || 'Name 1'} is falling faster! 🔥`;
        } else if (percentage < 42) {
            statusText.textContent = `${gameState.name2 || 'Name 2'} is falling faster! 🔥`;
        } else {
            statusText.textContent = `Love tendency balanced 💕`;
        }
    }
}

function renderCurrentSituation() {
    const counterEl = document.getElementById('situationCounter');
    const questionEl = document.getElementById('situationQuestion');
    const optionsContainer = document.getElementById('situationOptions');

    if (whoFallsState.currentSituationIndex >= whoFallsSituations.length) {
        finishWhoFallsGame();
        return;
    }

    const current = whoFallsSituations[whoFallsState.currentSituationIndex];

    if (counterEl) {
        counterEl.textContent = `Situation ${whoFallsState.currentSituationIndex + 1} of ${whoFallsSituations.length}`;
    }

    // Replace name placeholders
    const questionText = current.question
        .replace(/{name1}/g, gameState.name1 || 'Name 1')
        .replace(/{name2}/g, gameState.name2 || 'Name 2');

    if (questionEl) questionEl.textContent = questionText;

    if (optionsContainer) {
        optionsContainer.innerHTML = '';
        current.options.forEach((opt) => {
            const optText = opt.text
                .replace(/{name1}/g, gameState.name1 || 'Name 1')
                .replace(/{name2}/g, gameState.name2 || 'Name 2');

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'btn-option situation-option-btn';
            btn.innerHTML = `<span class="option-text">${optText}</span><span class="option-arrow">›</span>`;
            btn.onclick = function() {
                btn.classList.add('selected');
                selectSituationOption(opt.name1Pts, opt.name2Pts);
            };
            optionsContainer.appendChild(btn);
        });
    }
}

function selectSituationOption(name1Pts, name2Pts) {
    whoFallsState.name1FallScore += name1Pts;
    whoFallsState.name2FallScore += name2Pts;

    updateLoveMeterUI();

    whoFallsState.currentSituationIndex++;
    if (whoFallsState.currentSituationIndex < whoFallsSituations.length) {
        renderCurrentSituation();
    } else {
        finishWhoFallsGame();
    }
}

function finishWhoFallsGame() {
    const situationCard = document.getElementById('situationCard');
    const resultCard = document.getElementById('game4ResultCard');
    const winnerEl = document.getElementById('whoFallsWinner');
    const subtitleEl = document.getElementById('whoFallsSubtitle');
    const breakdownName1 = document.getElementById('breakdownName1');
    const breakdownPercent1 = document.getElementById('breakdownPercent1');
    const fallingFill1 = document.getElementById('fallingFill1');
    const breakdownName2 = document.getElementById('breakdownName2');
    const breakdownPercent2 = document.getElementById('breakdownPercent2');
    const fallingFill2 = document.getElementById('fallingFill2');

    const n1 = whoFallsState.name1FallScore;
    const n2 = whoFallsState.name2FallScore;
    const total = n1 + n2;

    let p1 = 50;
    let p2 = 50;
    if (total > 0) {
        p1 = Math.round((n1 / total) * 100);
        p2 = 100 - p1;
    }

    if (situationCard) situationCard.style.display = 'none';
    if (resultCard) resultCard.style.display = 'block';

    if (breakdownName1) breakdownName1.textContent = gameState.name1 || 'Name 1';
    if (breakdownPercent1) breakdownPercent1.textContent = p1 + '%';
    if (fallingFill1) fallingFill1.style.width = p1 + '%';

    if (breakdownName2) breakdownName2.textContent = gameState.name2 || 'Name 2';
    if (breakdownPercent2) breakdownPercent2.textContent = p2 + '%';
    if (fallingFill2) fallingFill2.style.width = p2 + '%';

    if (Math.abs(p1 - p2) <= 8) {
        if (winnerEl) winnerEl.textContent = `You Both Fall Together! 💕`;
        if (subtitleEl) subtitleEl.textContent = `Equally obsessed with each other! 💘`;
    } else if (p1 > p2) {
        if (winnerEl) winnerEl.textContent = `${gameState.name1 || 'Name 1'} Falls First! 💘`;
        if (subtitleEl) subtitleEl.textContent = `And they fall HARD. 💀❤️`;
    } else {
        if (winnerEl) winnerEl.textContent = `${gameState.name2 || 'Name 2'} Falls First! 💘`;
        if (subtitleEl) subtitleEl.textContent = `And they fall HARD. 💀❤️`;
    }

    // Calculate score for Game 4 out of 35 max points (max achievable points in quiz is 30)
    const game4Points = Math.min(35, Math.round((total / 30) * 35));
    gameState.scores.game4 = game4Points;
}

function finishGame4AndShowFinalResults() {
    switchScreen('game4Screen', 'resultScreen');
    showFinalResult();
}

// ============= FINAL RESULT =============
function showFinalResult() {
    switchScreen('game4Screen', 'resultScreen');
    
    // Calculate total score across all 4 games (max 140 points)
    const totalScore = gameState.scores.game1 + gameState.scores.game2 + gameState.scores.game3 + gameState.scores.game4;
    
    // Calculate final percentage (max 140 points possible, scale to 100)
    const percentage = Math.min(100, Math.round((totalScore / 140) * 100));
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
    const score4El = document.getElementById('score4');
    if (score1El) score1El.textContent = gameState.scores.game1;
    if (score2El) score2El.textContent = gameState.scores.game2;
    if (score3El) score3El.textContent = gameState.scores.game3;
    if (score4El) score4El.textContent = gameState.scores.game4;
    
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
            game3: 0,
            game4: 0
        },
        finalPercentage: 0
    };

    whoFallsState = {
        currentSituationIndex: 0,
        name1FallScore: 0,
        name2FallScore: 0,
        totalSituations: 10
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
window.initWhoFallsFirstGame = initWhoFallsFirstGame;
window.selectSituationOption = selectSituationOption;
window.finishWhoFallsGame = finishWhoFallsGame;
window.finishGame4AndShowFinalResults = finishGame4AndShowFinalResults;
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
