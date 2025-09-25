// Global variables
let currentUser = null;
let players = [];
let nextMatch = null;
let isLoggedIn = false;
let db = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadData();
    updateCountdown();
    setInterval(updateCountdown, 1000);
    startInnovativeEffect();
    initializeCarousel();
    playChampionsAnthem();
    initializeFIFACards();
    initializeFieldFormation();
});

// Innovative text effect for the subtitle
function startInnovativeEffect() {
    const textElement = document.getElementById('innovative-text');
    if (!textElement) return;
    
    const text = textElement.textContent;
    textElement.textContent = '';
    textElement.style.opacity = '0';
    
    // Add word-by-word animation
    const words = text.split(' ');
    let wordIndex = 0;
    
    const showWords = () => {
        if (wordIndex < words.length) {
            textElement.textContent += (wordIndex > 0 ? ' ' : '') + words[wordIndex];
            wordIndex++;
            
            // Add a slight bounce effect
            textElement.style.transform = 'scale(1.1)';
            setTimeout(() => {
                textElement.style.transform = 'scale(1)';
            }, 150);
            
            setTimeout(showWords, 300);
        } else {
            // Final reveal with glow effect
            textElement.style.opacity = '1';
            textElement.style.transform = 'scale(1)';
        }
    };
    
    // Start the effect after a short delay
    setTimeout(showWords, 800);
}

// Initialize carousel functionality
function initializeCarousel() {
    // Photo carousel
    const slides = document.querySelectorAll('.carousel-slide');
    const thumbnails = document.querySelectorAll('.thumbnail');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    const carouselContainer = document.querySelector('.carousel-container');
    let currentSlide = 0;
    let autoPlayInterval;

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
        thumbnails.forEach((thumb, i) => {
            thumb.classList.toggle('active', i === index);
        });
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
    }

    function startAutoPlay() {
        autoPlayInterval = setInterval(nextSlide, 5000);
    }

    function stopAutoPlay() {
        clearInterval(autoPlayInterval);
    }

    // Start auto-play
    startAutoPlay();

    // Pause on hover
    if (carouselContainer) {
        carouselContainer.addEventListener('mouseenter', stopAutoPlay);
        carouselContainer.addEventListener('mouseleave', startAutoPlay);
    }

    // Event listeners
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    
    thumbnails.forEach((thumb, index) => {
        thumb.addEventListener('click', () => {
            currentSlide = index;
            showSlide(currentSlide);
        });
    });

    // Click on slide to open modal
    slides.forEach((slide, index) => {
        slide.addEventListener('click', () => {
            const img = slide.querySelector('.main-image');
            const title = slide.querySelector('.carousel-overlay h3');
            const description = slide.querySelector('.carousel-overlay p');
            
            if (img) {
                openImageModal(img.src, title?.textContent || '', description?.textContent || '');
            }
        });
    });


    // Video carousel
    const videoSlides = document.querySelectorAll('.video-slide');
    const videoPrevBtn = document.querySelector('.video-prev');
    const videoNextBtn = document.querySelector('.video-next');
    let currentVideoSlide = 0;

    function showVideoSlide(index) {
        videoSlides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
    }

    function nextVideoSlide() {
        currentVideoSlide = (currentVideoSlide + 1) % videoSlides.length;
        showVideoSlide(currentVideoSlide);
    }

    function prevVideoSlide() {
        currentVideoSlide = (currentVideoSlide - 1 + videoSlides.length) % videoSlides.length;
        showVideoSlide(currentVideoSlide);
    }

    if (videoNextBtn) videoNextBtn.addEventListener('click', nextVideoSlide);
    if (videoPrevBtn) videoPrevBtn.addEventListener('click', prevVideoSlide);
}

// Play Champions League anthem
function playChampionsAnthem() {
    const audio = document.getElementById('champions-anthem');
    if (audio) {
        // Play after a short delay
        setTimeout(() => {
            audio.volume = 0.3; // Set volume to 30%
            audio.play().catch(e => {
                console.log('Audio autoplay was prevented:', e);
            });
        }, 1000);
    }
}

// Initialize FIFA-style player cards
function initializeFIFACards() {
    const modal = document.getElementById('playerCardModal');
    const closeBtn = document.querySelector('.fifa-close');
    
    // Close modal functionality
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Show FIFA player card
function showFIFACard(player) {
    const modal = document.getElementById('playerCardModal');
    const card = document.getElementById('fifaPlayerCard');
    
    // Calculate overall rating based on stats
    const overall = calculateOverallRating(player.stats);
    
    // Get season stats
    const gamesPlayed = player.gamesPlayed || 0;
    const goals = player.goals || 0;
    const assists = player.assists || 0;
    const yellowCards = player.yellowCards || 0;
    const redCards = player.redCards || 0;
    
    card.innerHTML = `
        <div class="fifa-card-header">
            <div class="fifa-player-name">${player.fullName || player.name}</div>
            <div class="fifa-overall-rating">${overall}</div>
        </div>
        <div class="fifa-player-info">
            <div class="fifa-player-details">
                <div class="fifa-position">${player.position}</div>
                <div class="fifa-jersey-number">#${player.jerseyNumber}</div>
            </div>
            <img src="${player.photo || 'assets/images/players/default.jpg'}" alt="${player.name}" class="fifa-player-photo">
            
            <!-- Season Stats -->
            <div class="fifa-season-stats">
                <div class="season-stat">
                    <div class="season-stat-label" data-translate="games">${translations[currentLanguage].games}</div>
                    <div class="season-stat-value">${gamesPlayed}</div>
                </div>
                <div class="season-stat">
                    <div class="season-stat-label" data-translate="goals">${translations[currentLanguage].goals}</div>
                    <div class="season-stat-value">${goals}</div>
                </div>
                <div class="season-stat">
                    <div class="season-stat-label" data-translate="assists">${translations[currentLanguage].assists}</div>
                    <div class="season-stat-value">${assists}</div>
                </div>
                <div class="season-stat">
                    <div class="season-stat-label" data-translate="yellow">${translations[currentLanguage].yellow}</div>
                    <div class="season-stat-value">${yellowCards}</div>
                </div>
                <div class="season-stat">
                    <div class="season-stat-label" data-translate="red">${translations[currentLanguage].red}</div>
                    <div class="season-stat-value">${redCards}</div>
                </div>
            </div>
            
            <div class="fifa-stats">
                <div class="fifa-stat">
                    <div class="fifa-stat-label">PAC</div>
                    <div class="fifa-stat-value">${player.stats.pace || 75}</div>
                </div>
                <div class="fifa-stat">
                    <div class="fifa-stat-label">SHO</div>
                    <div class="fifa-stat-value">${player.stats.shooting || 70}</div>
                </div>
                <div class="fifa-stat">
                    <div class="fifa-stat-label">PAS</div>
                    <div class="fifa-stat-value">${player.stats.passing || 75}</div>
                </div>
                <div class="fifa-stat">
                    <div class="fifa-stat-label">DRI</div>
                    <div class="fifa-stat-value">${player.stats.dribbling || 70}</div>
                </div>
                <div class="fifa-stat">
                    <div class="fifa-stat-label">DEF</div>
                    <div class="fifa-stat-value">${player.stats.defense || 60}</div>
                </div>
                <div class="fifa-stat">
                    <div class="fifa-stat-label">PHY</div>
                    <div class="fifa-stat-value">${player.stats.physical || 75}</div>
                </div>
            </div>
        </div>
        <div class="fifa-card-footer">
            <img src="assets/images/logo.png" alt="FC DESCANSA" class="fifa-team-logo">
        </div>
    `;
    
    modal.style.display = 'block';
}

// Calculate overall rating
function calculateOverallRating(stats) {
    const weights = {
        pace: 0.15,
        shooting: 0.20,
        passing: 0.20,
        dribbling: 0.15,
        defense: 0.15,
        physical: 0.15
    };
    
    let total = 0;
    let count = 0;
    
    for (const [stat, weight] of Object.entries(weights)) {
        if (stats[stat]) {
            total += stats[stat] * weight;
            count += weight;
        }
    }
    
    return Math.round(total / count) || 75;
}

// Initialize field formation
function initializeFieldFormation() {
    const field = document.getElementById('playersField');
    
    if (!field) {
        console.error('Field element not found');
        return;
    }
    
    // Formation 4-3-3 - Better spaced positions
    const formation = {
        goalkeeper: { position: '50% 90%' }, // Centered in goal area
        defenders: [
            { position: '10% 80%' }, // LB - Left back
            { position: '30% 80%' }, // CB - Left center back
            { position: '70% 80%' }, // CB - Right center back
            { position: '90% 80%' }  // RB - Right back
        ],
        midfielders: [
            { position: '15% 60%' }, // LM - Left midfielder
            { position: '50% 60%' }, // CM - Center midfielder
            { position: '85% 60%' }  // RM - Right midfielder
        ],
        forwards: [
            { position: '10% 30%' }, // LW - Left winger
            { position: '50% 25%' }, // ST - Center striker (Captain)
            { position: '90% 30%' }  // RW - Right winger
        ]
    };
    
    // Real players data with photos and stats
    const players = [
        { 
            name: 'Gudy', 
            fullName: 'Jesus Ocampo Gudy',
            jerseyNumber: 1, 
            position: 'POR', 
            photo: 'assets/images/players/gudy.png',
            stats: { pace: 60, shooting: 40, passing: 70, dribbling: 50, defense: 85, physical: 80 },
            gamesPlayed: 15,
            goals: 0,
            assists: 0,
            yellowCards: 2,
            redCards: 0
        },
        { 
            name: 'Carlos', 
            fullName: 'Carlos Rodriguez',
            jerseyNumber: 2, 
            position: 'DEF', 
            photo: 'assets/images/players/default.jpg',
            stats: { pace: 70, shooting: 50, passing: 75, dribbling: 60, defense: 85, physical: 80 },
            gamesPlayed: 12,
            goals: 1,
            assists: 3,
            yellowCards: 4,
            redCards: 0
        },
        { 
            name: 'Miguel', 
            fullName: 'Miguel Torres',
            jerseyNumber: 3, 
            position: 'DEF', 
            photo: 'assets/images/players/default.jpg',
            stats: { pace: 75, shooting: 55, passing: 80, dribbling: 65, defense: 88, physical: 82 },
            gamesPlayed: 14,
            goals: 0,
            assists: 2,
            yellowCards: 3,
            redCards: 0
        },
        { 
            name: 'Luis', 
            fullName: 'Luis Martinez',
            jerseyNumber: 4, 
            position: 'DEF', 
            photo: 'assets/images/players/default.jpg',
            stats: { pace: 72, shooting: 52, passing: 78, dribbling: 62, defense: 87, physical: 81 },
            gamesPlayed: 13,
            goals: 1,
            assists: 1,
            yellowCards: 2,
            redCards: 0
        },
        { 
            name: 'Pedro', 
            fullName: 'Pedro Silva',
            jerseyNumber: 5, 
            position: 'DEF', 
            photo: 'assets/images/players/default.jpg',
            stats: { pace: 68, shooting: 48, passing: 73, dribbling: 58, defense: 86, physical: 79 },
            gamesPlayed: 11,
            goals: 0,
            assists: 4,
            yellowCards: 1,
            redCards: 0
        },
        { 
            name: 'Antonio', 
            fullName: 'Antonio Lopez',
            jerseyNumber: 6, 
            position: 'MED', 
            photo: 'assets/images/players/default.jpg',
            stats: { pace: 75, shooting: 70, passing: 85, dribbling: 80, defense: 75, physical: 78 },
            gamesPlayed: 15,
            goals: 3,
            assists: 6,
            yellowCards: 3,
            redCards: 0
        },
        { 
            name: 'Diego', 
            fullName: 'Diego Fernandez',
            jerseyNumber: 7, 
            position: 'MED', 
            photo: 'assets/images/players/default.jpg',
            stats: { pace: 80, shooting: 75, passing: 88, dribbling: 85, defense: 70, physical: 76 },
            gamesPlayed: 14,
            goals: 5,
            assists: 8,
            yellowCards: 2,
            redCards: 0
        },
        { 
            name: 'Roberto', 
            fullName: 'Roberto Garcia',
            jerseyNumber: 8, 
            position: 'MED', 
            photo: 'assets/images/players/default.jpg',
            stats: { pace: 78, shooting: 72, passing: 87, dribbling: 82, defense: 72, physical: 77 },
            gamesPlayed: 12,
            goals: 2,
            assists: 5,
            yellowCards: 4,
            redCards: 1
        },
        { 
            name: 'Joseph', 
            fullName: 'Joseph Angel Santos',
            jerseyNumber: 9, 
            position: 'DEL', 
            photo: 'assets/images/players/joseph.png',
            stats: { pace: 85, shooting: 90, passing: 80, dribbling: 90, defense: 40, physical: 75 },
            gamesPlayed: 15,
            goals: 12,
            assists: 4,
            yellowCards: 1,
            redCards: 0,
            isCaptain: true
        },
        { 
            name: 'Alejandro', 
            fullName: 'Alejandro Ruiz',
            jerseyNumber: 10, 
            position: 'DEL', 
            photo: 'assets/images/players/default.jpg',
            stats: { pace: 88, shooting: 88, passing: 75, dribbling: 85, defense: 35, physical: 78 },
            gamesPlayed: 13,
            goals: 8,
            assists: 3,
            yellowCards: 2,
            redCards: 0
        }
    ];
    
    // Clear field
    field.innerHTML = '';
    console.log('Field cleared, adding players...');
    
    // Add goalkeeper
    const gk = players[0];
    const gkElement = createFieldPlayer(gk, formation.goalkeeper.position);
    field.appendChild(gkElement);
    console.log('Goalkeeper added:', gk.name);
    
    // Add defenders (4) - Carlos (LB), Miguel (CB), Luis (CB), Pedro (RB)
    const defenderPlayers = [players[1], players[2], players[3], players[4]]; // Carlos, Miguel, Luis, Pedro
    formation.defenders.forEach((pos, index) => {
        const player = defenderPlayers[index];
        const playerElement = createFieldPlayer(player, pos.position);
        field.appendChild(playerElement);
    });
    
    // Add midfielders (3) - Antonio (LM), Diego (CM), Roberto (RM)
    const midfielderPlayers = [players[5], players[6], players[7]]; // Antonio, Diego, Roberto
    formation.midfielders.forEach((pos, index) => {
        const player = midfielderPlayers[index];
        const playerElement = createFieldPlayer(player, pos.position);
        field.appendChild(playerElement);
    });
    
    // Add forwards (3) - Luis (LW), Joseph (ST - Captain), Alejandro (RW)
    const forwardPlayers = [players[8], players[9], players[10]]; // Luis, Joseph, Alejandro
    formation.forwards.forEach((pos, index) => {
        const player = forwardPlayers[index];
        const playerElement = createFieldPlayer(player, pos.position);
        field.appendChild(playerElement);
    });
    
    // Store players data globally for squad display
    window.teamPlayers = players;
    
    // Initialize substitutes
    initializeSubstitutes();
}

// Initialize substitutes section
function initializeSubstitutes() {
    const substitutesGrid = document.getElementById('substitutesGrid');
    
    if (!substitutesGrid) {
        console.error('Substitutes grid not found');
        return;
    }
    
    // Sample substitutes data
    const substitutes = [
        { name: 'Marco', jerseyNumber: 12, position: 'POR', photo: 'assets/images/players/default.jpg', gamesPlayed: 3, goals: 0, assists: 0, yellowCards: 0, redCards: 0 },
        { name: 'Andres', jerseyNumber: 13, position: 'DEF', photo: 'assets/images/players/default.jpg', gamesPlayed: 8, goals: 0, assists: 1, yellowCards: 2, redCards: 0 },
        { name: 'Eduardo', jerseyNumber: 14, position: 'DEF', photo: 'assets/images/players/default.jpg', gamesPlayed: 6, goals: 1, assists: 0, yellowCards: 1, redCards: 0 },
        { name: 'Francisco', jerseyNumber: 15, position: 'MED', photo: 'assets/images/players/default.jpg', gamesPlayed: 7, goals: 2, assists: 3, yellowCards: 1, redCards: 0 },
        { name: 'Ricardo', jerseyNumber: 16, position: 'MED', photo: 'assets/images/players/default.jpg', gamesPlayed: 5, goals: 1, assists: 2, yellowCards: 0, redCards: 0 },
        { name: 'Oscar', jerseyNumber: 17, position: 'DEL', photo: 'assets/images/players/default.jpg', gamesPlayed: 9, goals: 4, assists: 1, yellowCards: 2, redCards: 0 },
        { name: 'Rafael', jerseyNumber: 18, position: 'DEL', photo: 'assets/images/players/default.jpg', gamesPlayed: 4, goals: 2, assists: 0, yellowCards: 1, redCards: 0 },
        { name: 'Sebastian', jerseyNumber: 19, position: 'MED', photo: 'assets/images/players/default.jpg', gamesPlayed: 3, goals: 0, assists: 1, yellowCards: 0, redCards: 0 }
    ];
    
    // Clear substitutes grid
    substitutesGrid.innerHTML = '';
    console.log('Substitutes grid cleared, adding substitutes...');
    
    // Add substitutes
    substitutes.forEach(substitute => {
        const substituteElement = createSubstitutePlayer(substitute);
        substitutesGrid.appendChild(substituteElement);
    });
    console.log('Substitutes added:', substitutes.length);
}

// Create substitute player element
function createSubstitutePlayer(player) {
    const substituteDiv = document.createElement('div');
    substituteDiv.className = 'substitute-player';
    
    substituteDiv.innerHTML = `
        <div class="substitute-jersey">
            <img src="${player.photo}" alt="${player.name}" class="substitute-photo" onerror="this.src='assets/images/players/default.jpg'">
            <div class="substitute-number">${player.jerseyNumber}</div>
        </div>
        <div class="substitute-name">${player.name}</div>
    `;
    
    // Add click event to show FIFA card
    substituteDiv.addEventListener('click', () => {
        // Create a basic stats object for substitutes
        const stats = {
            pace: 70 + Math.floor(Math.random() * 20),
            shooting: 60 + Math.floor(Math.random() * 25),
            passing: 65 + Math.floor(Math.random() * 25),
            dribbling: 65 + Math.floor(Math.random() * 25),
            defense: 55 + Math.floor(Math.random() * 30),
            physical: 70 + Math.floor(Math.random() * 20)
        };
        
        const playerWithStats = { ...player, stats };
        showFIFACard(playerWithStats);
    });
    
    return substituteDiv;
}

// Language and Theme Functions
function initializeLanguageSelector() {
    const languageDropdown = document.getElementById('languageDropdown');
    const languageOptions = document.querySelectorAll('.language-option');
    
    languageOptions.forEach(option => {
        option.addEventListener('click', () => {
            const lang = option.getAttribute('data-lang');
            currentLanguage = lang;
            
            // Update dropdown button
            if (languageDropdown) {
                const flag = option.querySelector('.flag').textContent;
                const langText = lang.toUpperCase();
                languageDropdown.querySelector('.flag').textContent = flag;
                languageDropdown.querySelector('.language-text').textContent = langText;
            }
            
            // Update active option
            languageOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            
            // Save preference
            localStorage.setItem('language', lang);
            
            // Translate page
            translatePage(lang);
        });
    });
}

function initializeThemeSelector() {
    const themeToggle = document.getElementById('themeToggle');
    
    function updateThemeButton() {
        if (themeToggle) {
            const themeIcon = themeToggle.querySelector('.theme-icon');
            const themeText = themeToggle.querySelector('.theme-text');
            
            if (currentTheme === 'dark') {
                themeIcon.className = 'fas fa-moon theme-icon';
                themeText.textContent = 'Oscuro';
            } else {
                themeIcon.className = 'fas fa-sun theme-icon';
                themeText.textContent = 'Claro';
            }
        }
    }
    
    function toggleTheme() {
        currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
        updateThemeButton();
        localStorage.setItem('theme', currentTheme);
        applyTheme(currentTheme);
    }
    
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

function applySavedPreferences() {
    // Apply saved language
    const savedLang = localStorage.getItem('language') || 'es';
    currentLanguage = savedLang;
    
    // Apply saved theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    currentTheme = savedTheme;
    
    // Update language dropdown
    const languageDropdown = document.getElementById('languageDropdown');
    const languageOptions = document.querySelectorAll('.language-option');
    const activeOption = document.querySelector(`[data-lang="${savedLang}"]`);
    
    if (activeOption && languageDropdown) {
        const flag = activeOption.querySelector('.flag').textContent;
        const langText = savedLang.toUpperCase();
        
        languageDropdown.querySelector('.flag').textContent = flag;
        languageDropdown.querySelector('.language-text').textContent = langText;
        
        languageOptions.forEach(opt => opt.classList.remove('active'));
        activeOption.classList.add('active');
    }
    
    // Update theme toggle
    const themeToggle = document.getElementById('themeToggle');
    
    if (themeToggle) {
        const themeIcon = themeToggle.querySelector('.theme-icon');
        const themeText = themeToggle.querySelector('.theme-text');
        
        if (savedTheme === 'dark') {
            themeIcon.className = 'fas fa-moon theme-icon';
            themeText.textContent = 'Oscuro';
        } else {
            themeIcon.className = 'fas fa-sun theme-icon';
            themeText.textContent = 'Claro';
        }
    }
    
    // Apply translations and theme
    translatePage(savedLang);
    applyTheme(savedTheme);
}

function translatePage(lang) {
    const elements = document.querySelectorAll('[data-translate]');
    
    elements.forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[lang] && translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });
    
    // Update specific elements by ID or class
    updateSpecificElements(lang);
    
    // Update FIFA cards if they're open
    updateFIFACardsLanguage(lang);
    
    // Update theme toggle text
    updateThemeToggleText(lang);
}

function updateSpecificElements(lang) {
    // Update hero subtitle
    const heroSubtitle = document.getElementById('innovative-text');
    if (heroSubtitle && translations[lang]['hero-subtitle']) {
        heroSubtitle.textContent = translations[lang]['hero-subtitle'];
    }
    
    // Update dream team text
    const dreamTeam = document.querySelector('.dream-team');
    if (dreamTeam && translations[lang]['dream-team']) {
        dreamTeam.textContent = translations[lang]['dream-team'];
    }
    
    // Update next match title
    const nextMatchTitle = document.querySelector('.next-match h2');
    if (nextMatchTitle && translations[lang]['next-match-title']) {
        nextMatchTitle.textContent = translations[lang]['next-match-title'];
    }
    
    // Update latest news title
    const latestNewsTitle = document.querySelector('.latest-news h2');
    if (latestNewsTitle && translations[lang]['latest-news-title']) {
        latestNewsTitle.textContent = translations[lang]['latest-news-title'];
    }
    
    // Update footer elements
    const followUs = document.querySelector('[data-translate="follow-us"]');
    if (followUs && translations[lang]['follow-us']) {
        followUs.textContent = translations[lang]['follow-us'];
    }
    
    const quickLinks = document.querySelector('[data-translate="quick-links"]');
    if (quickLinks && translations[lang]['quick-links']) {
        quickLinks.textContent = translations[lang]['quick-links'];
    }
    
    const contact = document.querySelector('[data-translate="contact"]');
    if (contact && translations[lang]['contact']) {
        contact.textContent = translations[lang]['contact'];
    }
    
    const teamDescription = document.querySelector('[data-translate="team-description"]');
    if (teamDescription && translations[lang]['team-description']) {
        teamDescription.textContent = translations[lang]['team-description'];
    }
}

function updateThemeToggleText(lang) {
    const themeToggle = document.getElementById('themeToggle');
    
    if (themeToggle) {
        const themeText = themeToggle.querySelector('.theme-text');
        if (themeText) {
            if (currentTheme === 'dark') {
                themeText.textContent = translations[lang]['dark-theme'];
            } else {
                themeText.textContent = translations[lang]['light-theme'];
            }
        }
    }
}

// Image Modal Functions
function openImageModal(imageSrc, title, description) {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');
    
    if (modal && modalImage) {
        modalImage.src = imageSrc;
        modalImage.alt = title;
        
        if (modalTitle) modalTitle.textContent = title;
        if (modalDescription) modalDescription.textContent = description;
        
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Close modal when clicking on close button
        const closeBtn = document.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.onclick = () => closeImageModal();
        }
        
        // Close modal when clicking outside the image
        modal.onclick = (e) => {
            if (e.target === modal) {
                closeImageModal();
            }
        };
        
        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeImageModal();
            }
        });
    }
}

function closeImageModal() {
    const modal = document.getElementById('imageModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Mobile Menu Functions
function initializeMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenuBtn.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking on nav links
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuBtn.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                mobileMenuBtn.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }
}

// Camera Functions
function initializeCamera() {
    const takePhotoBtn = document.getElementById('takePhotoBtn');
    const uploadPhotoBtn = document.getElementById('uploadPhotoBtn');
    const cameraInput = document.getElementById('cameraInput');
    const photoInput = document.getElementById('photo');
    const cameraPreview = document.getElementById('cameraPreview');
    
    if (takePhotoBtn && cameraInput) {
        takePhotoBtn.addEventListener('click', () => {
            cameraInput.click();
        });
    }
    
    if (uploadPhotoBtn && photoInput) {
        uploadPhotoBtn.addEventListener('click', () => {
            photoInput.click();
        });
    }
    
    if (cameraInput) {
        cameraInput.addEventListener('change', (e) => {
            handleImagePreview(e, cameraPreview);
        });
    }
    
    if (photoInput) {
        photoInput.addEventListener('change', (e) => {
            handleImagePreview(e, cameraPreview);
        });
    }
}

function handleImagePreview(event, previewElement) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            previewElement.src = e.target.result;
            previewElement.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    
    // Update header background
    const header = document.querySelector('.header');
    if (theme === 'light') {
        header.style.background = 'linear-gradient(135deg, #4a90e2 0%, #357abd 50%, #2e5c8a 100%)';
    } else {
        header.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #00d4ff 100%)';
    }
}

function updateFIFACardsLanguage(lang) {
    // Update any open FIFA cards with new language
    const modal = document.getElementById('playerCardModal');
    if (modal && modal.style.display === 'block') {
        // Re-translate the currently displayed card
        const seasonStats = modal.querySelectorAll('.season-stat-label');
        seasonStats.forEach((stat, index) => {
            const keys = ['games', 'goals', 'assists', 'yellow', 'red'];
            if (keys[index] && translations[lang] && translations[lang][keys[index]]) {
                stat.textContent = translations[lang][keys[index]];
            }
        });
    }
}

// Create field player element
function createFieldPlayer(player, position) {
    const [x, y] = position.split(' ');
    
    const playerDiv = document.createElement('div');
    playerDiv.className = 'field-player';
    playerDiv.style.left = x;
    playerDiv.style.top = y;
    
    // Determine jersey color based on position
    const jerseyClass = player.position === 'POR' ? 'jersey-white' : 'jersey-black';
    
    playerDiv.innerHTML = `
        <div class="player-jersey ${jerseyClass}">
            <img src="${player.photo}" alt="${player.name}" class="player-photo" onerror="this.src='assets/images/players/default.jpg'">
            <div class="jersey-number">${player.jerseyNumber}</div>
            ${player.isCaptain ? '<div class="captain-badge">C</div>' : ''}
        </div>
        <div class="player-name-box">
            <div class="player-name">${player.name}</div>
        </div>
    `;
    
    // Add click event to show FIFA card
    playerDiv.addEventListener('click', () => {
        showFIFACard(player);
    });
    
    return playerDiv;
}

// Translation system
const translations = {
    es: {
        // Navigation
        'home': 'Inicio',
        'stats': 'Estadísticas',
        'media': 'Multimedia',
        'squad': 'Plantilla',
        'login': 'Iniciar Sesión',
        
        // Hero Section
        'hero-subtitle': '¡Somos más que un equipo, somos una familia!',
        'dream-team': 'Dream Team',
        
        // Sections
        'substitutes': 'SUPLENTES',
        'manager': 'DIRECTOR TÉCNICO',
        'coach-name': 'Nombre del Entrenador',
        'starting-xi': '11 Titular',
        'formation': 'Formación : 4-3-3',
        
        // Next Match
        'next-match-title': 'Próximo Partido',
        'vs': 'vs',
        'stadium': 'Estadio',
        'date': 'Fecha',
        'time': 'Hora',
        
        // Latest News
        'latest-news-title': 'Últimas Noticias',
        'read-more': 'Leer Más',
        
        // Live Results
        'live-results-title': 'Resultados en Vivo',
        'birthday-title': '🎉⚽ ¡Feliz cumpleaños, crack! ⚽🎉',
        'birthday-message': 'Hoy celebramos la vida de uno de los pilares más fuertes de Descansa FC, nuestro muro en la defensa. Gracias por tu entrega, tu pasión y por dejarlo todo en la cancha en cada partido. 💪🔥',
        'birthday-wishes': 'Que este nuevo año te traiga muchas alegrías, éxitos y momentos de triunfo dentro y fuera del campo. 🏆✨',
        'birthday-ending': '¡A seguir defendiendo nuestros colores como el mejor! 🖤🤍💛',
        'birthday-hashtags': '#FelizCumple #DescansaFC #MuroInquebrantable',
        
        // Transfer News
        'transfer-title': 'Nueva Contratación',
        'transfer-message': 'FC DESCANSA anuncia la llegada de un nuevo lateral por derecha para reforzar la defensa que será un muro impasable y le dará confianza al equipo.',
        'transfer-date': '8 de Enero, 2024',
        
        // Goalkeeper News
        'goalkeeper-title': '🧤⚽ ¡Bienvenido a la familia Descansa FC! ⚽🧤',
        'goalkeeper-intro': 'Hoy tenemos el honor de presentar a nuestro nuevo guardián del arco: Gudy 🔥',
        'goalkeeper-description': 'Un portero con reflejos felinos, seguridad bajo los tres palos y la garra que caracteriza a nuestro equipo. 💪🖤🤍💛',
        'goalkeeper-protection': 'Con él, el arco de Descansa FC estará más protegido que nunca. 🛡️✨',
        'goalkeeper-support': '¡Aplausos y mucho apoyo para Gudy en esta nueva etapa con nosotros! 👏👏',
        'goalkeeper-hashtags': '#BienvenidoGudy #DescansaFC #MuroSeguro',
        
        // Player stats
        'games': 'Partidos',
        'goals': 'Goles',
        'assists': 'Asistencias',
        'yellow': 'Amarillas',
        'red': 'Rojas',
        
        // FIFA Stats
        'pace': 'Velocidad',
        'shooting': 'Disparo',
        'passing': 'Pase',
        'dribbling': 'Regate',
        'defense': 'Defensa',
        'physical': 'Físico',
        
        // Theme
        'dark-theme': 'Oscuro',
        'light-theme': 'Claro',
        
        // Footer
        'follow-us': 'Síguenos',
        'quick-links': 'Enlaces Rápidos',
        'contact': 'Contacto',
        'team-description': 'Somos más que un equipo, somos una familia unida por la pasión del fútbol.',
        'email': 'info@fcdescansa.com',
        'phone': '+52 123 456 7890'
    },
    en: {
        // Navigation
        'home': 'Home',
        'stats': 'Statistics',
        'media': 'Multimedia',
        'squad': 'Squad',
        'login': 'Login',
        
        // Hero Section
        'hero-subtitle': 'We are more than a team, we are a family!',
        'dream-team': 'Dream Team',
        
        // Sections
        'substitutes': 'SUBSTITUTES',
        'manager': 'MANAGER',
        'coach-name': 'Coach Name',
        'starting-xi': 'Starting XI',
        'formation': 'Formation : 4-3-3',
        
        // Next Match
        'next-match-title': 'Next Match',
        'vs': 'vs',
        'stadium': 'Stadium',
        'date': 'Date',
        'time': 'Time',
        
        // Latest News
        'latest-news-title': 'Latest News',
        'read-more': 'Read More',
        
        // Live Results
        'live-results-title': 'Live Results',
        'birthday-title': '🎉⚽ Happy Birthday, Star! ⚽🎉',
        'birthday-message': 'Today we celebrate the life of one of the strongest pillars of Descansa FC, our wall in defense. Thank you for your dedication, your passion and for leaving everything on the field in every match. 💪🔥',
        'birthday-wishes': 'May this new year bring you many joys, successes and moments of triumph both on and off the field. 🏆✨',
        'birthday-ending': 'Keep defending our colors as the best! 🖤🤍💛',
        'birthday-hashtags': '#HappyBirthday #DescansaFC #UnbreakableWall',
        
        // Transfer News
        'transfer-title': 'New Signing',
        'transfer-message': 'FC DESCANSA announces the arrival of a new right-back to strengthen the defense that will be an impassable wall and give confidence to the team.',
        'transfer-date': 'January 8, 2024',
        
        // Goalkeeper News
        'goalkeeper-title': '🧤⚽ Welcome to the Descansa FC family! ⚽🧤',
        'goalkeeper-intro': 'Today we have the honor of presenting our new goalkeeper: Gudy 🔥',
        'goalkeeper-description': 'A goalkeeper with feline reflexes, security under the three posts and the claw that characterizes our team. 💪🖤🤍💛',
        'goalkeeper-protection': 'With him, the Descansa FC goal will be more protected than ever. 🛡️✨',
        'goalkeeper-support': 'Applause and much support for Gudy in this new stage with us! 👏👏',
        'goalkeeper-hashtags': '#WelcomeGudy #DescansaFC #SafeWall',
        
        // Player stats
        'games': 'Games',
        'goals': 'Goals',
        'assists': 'Assists',
        'yellow': 'Yellow',
        'red': 'Red',
        
        // FIFA Stats
        'pace': 'Pace',
        'shooting': 'Shooting',
        'passing': 'Passing',
        'dribbling': 'Dribbling',
        'defense': 'Defense',
        'physical': 'Physical',
        
        // Theme
        'dark-theme': 'Dark',
        'light-theme': 'Light',
        
        // Footer
        'follow-us': 'Follow Us',
        'quick-links': 'Quick Links',
        'contact': 'Contact',
        'team-description': 'We are more than a team, we are a family united by the passion for football.',
        'email': 'info@fcdescansa.com',
        'phone': '+52 123 456 7890'
    },
    zh: {
        // Navigation
        'home': '首页',
        'stats': '统计',
        'media': '多媒体',
        'squad': '阵容',
        'login': '登录',
        
        // Hero Section
        'hero-subtitle': '我们不仅是一支球队，我们是一个家庭！',
        'dream-team': '梦之队',
        
        // Sections
        'substitutes': '替补',
        'manager': '教练',
        'coach-name': '教练姓名',
        'starting-xi': '首发十一人',
        'formation': '阵型 : 4-3-3',
        
        // Next Match
        'next-match-title': '下一场比赛',
        'vs': '对',
        'stadium': '体育场',
        'date': '日期',
        'time': '时间',
        
        // Latest News
        'latest-news-title': '最新消息',
        'read-more': '阅读更多',
        
        // Live Results
        'live-results-title': '实时比分',
        'birthday-title': '🎉⚽ 生日快乐，明星！ ⚽🎉',
        'birthday-message': '今天我们庆祝Descansa FC最强支柱之一的生命，我们防守的城墙。感谢你的奉献、激情，以及在每场比赛中全力以赴。💪🔥',
        'birthday-wishes': '愿这新的一年为你带来许多欢乐、成功以及场上场下的胜利时刻。🏆✨',
        'birthday-ending': '继续以最佳状态捍卫我们的颜色！🖤🤍💛',
        'birthday-hashtags': '#生日快乐 #DescansaFC #坚不可摧的城墙',
        
        // Transfer News
        'transfer-title': '新签约',
        'transfer-message': 'FC DESCANSA宣布新右后卫的到来，他将加强防守，成为一道不可逾越的城墙，为球队带来信心。',
        'transfer-date': '2024年1月8日',
        
        // Goalkeeper News
        'goalkeeper-title': '🧤⚽ 欢迎加入Descansa FC大家庭！ ⚽🧤',
        'goalkeeper-intro': '今天我们很荣幸地介绍我们的新守门员：Gudy 🔥',
        'goalkeeper-description': '一位拥有猫科动物般反射、三根立柱下安全以及我们球队特色的守门员。💪🖤🤍💛',
        'goalkeeper-protection': '有了他，Descansa FC的球门将比以往任何时候都更加安全。🛡️✨',
        'goalkeeper-support': '为Gudy在我们这里的新阶段鼓掌和大力支持！👏👏',
        'goalkeeper-hashtags': '#欢迎Gudy #DescansaFC #安全城墙',
        
        // Player stats
        'games': '比赛',
        'goals': '进球',
        'assists': '助攻',
        'yellow': '黄牌',
        'red': '红牌',
        
        // FIFA Stats
        'pace': '速度',
        'shooting': '射门',
        'passing': '传球',
        'dribbling': '盘带',
        'defense': '防守',
        'physical': '身体',
        
        // Theme
        'dark-theme': '暗色',
        'light-theme': '亮色',
        
        // Footer
        'follow-us': '关注我们',
        'quick-links': '快速链接',
        'contact': '联系方式',
        'team-description': '我们不仅是一支球队，我们是一个因对足球的热情而团结的大家庭。',
        'email': 'info@fcdescansa.com',
        'phone': '+52 123 456 7890'
    }
};

let currentLanguage = 'es';
let currentTheme = 'dark';

// Initialize application
function initializeApp() {
    // Initialize database
    db = window.FCDescansaDB;
    
    // Load saved data
    loadPlayers();
    loadNextMatch();
    
    // Initialize language and theme
    initializeLanguageSelector();
    initializeThemeSelector();
    
    // Initialize mobile menu
    initializeMobileMenu();
    
    // Initialize camera functionality
    initializeCamera();
    
    // Apply saved preferences
    applySavedPreferences();
    
    // Check if user is logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        isLoggedIn = true;
        updateLoginUI();
    }
    
    // Initialize sample data if none exists
    if (players.length === 0) {
        initializeSampleData();
    }
    
    if (!nextMatch) {
        setNextMatch();
    }
    
    // Update UI
    updateMatchInfo();
    updateFCLogo();
    loadSquad();
    loadStartingXI();
    
    // Initialize live matches
    initializeLiveMatches();
    
    // Initialize 3D carousel
    initialize3DCarousel();
}

// Setup event listeners
function setupEventListeners() {
    // Navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', handleNavigation);
    });
    
    // Mobile menu
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
    
    // Authentication tabs
    const authTabs = document.querySelectorAll('.auth-tab');
    authTabs.forEach(tab => {
        tab.addEventListener('click', handleAuthTab);
    });
    
    // Forms
    const loginForm = document.getElementById('loginFormElement');
    const registerForm = document.getElementById('registerFormElement');
    const forgotForm = document.getElementById('forgotFormElement');
    
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (registerForm) registerForm.addEventListener('submit', handleRegister);
    if (forgotForm) forgotForm.addEventListener('submit', handleForgotPassword);
    
    // Media tabs
    const mediaTabs = document.querySelectorAll('.media-tab');
    mediaTabs.forEach(tab => {
        tab.addEventListener('click', handleMediaTab);
    });
    
    // Live results tabs
    const liveTabs = document.querySelectorAll('.live-tab-button');
    liveTabs.forEach(tab => {
        tab.addEventListener('click', handleLiveTab);
    });
    
    // Photo capture
    const takePhotoBtn = document.getElementById('takePhotoBtn');
    const captureBtn = document.getElementById('captureBtn');
    const cancelCaptureBtn = document.getElementById('cancelCaptureBtn');
    const photoModal = document.getElementById('photoModal');
    const closeModal = document.querySelector('.close');
    
    if (takePhotoBtn) takePhotoBtn.addEventListener('click', openPhotoModal);
    if (captureBtn) captureBtn.addEventListener('click', capturePhoto);
    if (cancelCaptureBtn) cancelCaptureBtn.addEventListener('click', closePhotoModal);
    if (closeModal) closeModal.addEventListener('click', closePhotoModal);
    if (photoModal) {
        photoModal.addEventListener('click', (e) => {
            if (e.target === photoModal) closePhotoModal();
        });
    }
    
    // Register player button
    const registerPlayerBtn = document.getElementById('registerPlayerBtn');
    if (registerPlayerBtn) {
        registerPlayerBtn.addEventListener('click', () => {
            showSection('login');
            switchAuthTab('register');
        });
    }
    
    // Jersey number validation
    const jerseyNumberInput = document.getElementById('jerseyNumber');
    if (jerseyNumberInput) {
        jerseyNumberInput.addEventListener('input', validateJerseyNumber);
    }
    
    // Gallery items
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const img = item.querySelector('img');
            showImageModal(img.src, img.alt);
        });
    });
    
    // Video play buttons
    const playButtons = document.querySelectorAll('.play-button');
    playButtons.forEach(button => {
        button.addEventListener('click', () => {
            // In a real implementation, this would open a video player
            alert('Funcionalidad de video en desarrollo');
        });
    });
}

// Navigation handling
function handleNavigation(e) {
    e.preventDefault();
    const target = e.target.getAttribute('href').substring(1);
    showSection(target);
    
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    e.target.classList.add('active');
    
    // Close mobile menu
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu) navMenu.classList.remove('active');
}

// Show section
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
}

// Authentication tab handling
function handleAuthTab(e) {
    const tabType = e.target.getAttribute('data-auth');
    switchAuthTab(tabType);
}

function switchAuthTab(tabType) {
    // Update tab buttons
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-auth="${tabType}"]`).classList.add('active');
    
    // Update content
    document.querySelectorAll('.auth-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabType}Form`).classList.add('active');
}

// Media tab handling
function handleMediaTab(e) {
    const mediaType = e.target.getAttribute('data-media');
    
    // Update tab buttons
    document.querySelectorAll('.media-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    e.target.classList.add('active');
    
    // Update content
    document.querySelectorAll('.media-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(mediaType).classList.add('active');
}

// Live tab handling
function handleLiveTab(e) {
    const tabType = e.target.getAttribute('data-live-tab');
    
    // Update tab buttons
    document.querySelectorAll('.live-tab-button').forEach(tab => {
        tab.classList.remove('active');
    });
    e.target.classList.add('active');
    
    // Update content
    document.querySelectorAll('.live-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`live-${tabType}`).classList.add('active');
    
    // Load matches for the selected tab
    loadLiveMatchesForTab(tabType);
}

// Login handling
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Find user
    let user;
    if (db) {
        user = db.getPlayerByEmail(email);
        if (user && user.password !== password) {
            user = null;
        }
    } else {
        user = players.find(player => 
            player.email === email && player.password === password
        );
    }
    
    if (user) {
        currentUser = user;
        isLoggedIn = true;
        localStorage.setItem('currentUser', JSON.stringify(user));
        updateLoginUI();
        showSection('home');
        alert('¡Bienvenido ' + user.fullName + '!');
    } else {
        alert('Credenciales incorrectas');
    }
}

// Register handling
function handleRegister(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const playerData = {
        id: Date.now(),
        fullName: document.getElementById('fullName').value,
        nickname: document.getElementById('nickname').value,
        jerseyNumber: parseInt(document.getElementById('jerseyNumber').value),
        position: document.getElementById('position').value,
        email: document.getElementById('email').value,
        whatsapp: document.getElementById('whatsapp').value,
        password: document.getElementById('password').value,
        photo: null,
        registeredAt: new Date().toISOString(),
        stats: {
            goals: 0,
            assists: 0,
            gamesPlayed: 0
        }
    };
    
    // Validate jersey number
    if (!validateJerseyNumber()) {
        alert('Número de camiseta no disponible');
        return;
    }
    
    // Handle photo
    const photoInput = document.getElementById('photo');
    if (photoInput.files.length > 0) {
        const reader = new FileReader();
        reader.onload = function(e) {
            playerData.photo = e.target.result;
            completeRegistration(playerData);
        };
        reader.readAsDataURL(photoInput.files[0]);
    } else {
        completeRegistration(playerData);
    }
}

function completeRegistration(playerData) {
    try {
        if (db) {
            const newPlayer = db.addPlayer(playerData);
            players.push(newPlayer);
        } else {
            players.push(playerData);
            savePlayers();
        }
        
        alert('¡Registro exitoso! Ya puedes iniciar sesión.');
        switchAuthTab('login');
        
        // Clear form
        document.getElementById('registerFormElement').reset();
    } catch (error) {
        alert('Error en el registro: ' + error.message);
    }
}

// Forgot password handling
function handleForgotPassword(e) {
    e.preventDefault();
    
    const email = document.getElementById('forgotEmail').value;
    const user = players.find(player => player.email === email);
    
    if (user) {
        // In a real implementation, this would send an email
        alert('Se ha enviado un código de recuperación a tu correo electrónico.');
    } else {
        alert('No se encontró una cuenta con ese correo electrónico.');
    }
}

// Jersey number validation
function validateJerseyNumber() {
    const jerseyNumber = parseInt(document.getElementById('jerseyNumber').value);
    const statusElement = document.getElementById('jerseyStatus');
    
    if (!jerseyNumber || jerseyNumber < 1 || jerseyNumber > 99) {
        statusElement.textContent = 'Número inválido (1-99)';
        statusElement.style.color = 'red';
        return false;
    }
    
    let isTaken = false;
    if (db) {
        isTaken = db.isJerseyNumberTaken(jerseyNumber);
    } else {
        isTaken = players.some(player => player.jerseyNumber === jerseyNumber);
    }
    
    if (isTaken) {
        statusElement.textContent = 'Número no disponible';
        statusElement.style.color = 'red';
        return false;
    } else {
        statusElement.textContent = 'Número disponible';
        statusElement.style.color = 'green';
        return true;
    }
}

// Photo capture
function openPhotoModal() {
    const modal = document.getElementById('photoModal');
    modal.style.display = 'block';
    
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            const video = document.getElementById('video');
            video.srcObject = stream;
        })
        .catch(err => {
            console.error('Error accessing camera:', err);
            alert('No se pudo acceder a la cámara');
        });
}

function capturePhoto() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    
    const photoData = canvas.toDataURL('image/png');
    
    // Stop camera
    const stream = video.srcObject;
    const tracks = stream.getTracks();
    tracks.forEach(track => track.stop());
    
    closePhotoModal();
    
    // Set photo in form
    const photoInput = document.getElementById('photo');
    const file = dataURLtoFile(photoData, 'photo.png');
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    photoInput.files = dataTransfer.files;
    
    alert('Foto capturada exitosamente');
}

function closePhotoModal() {
    const modal = document.getElementById('photoModal');
    modal.style.display = 'none';
    
    // Stop camera
    const video = document.getElementById('video');
    if (video.srcObject) {
        const stream = video.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
    }
}

function dataURLtoFile(dataurl, filename) {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while(n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
}

// Update login UI
function updateLoginUI() {
    const loginLink = document.getElementById('loginLink');
    if (isLoggedIn && currentUser) {
        loginLink.innerHTML = `
            <div class="user-info">
                <img src="${currentUser.photo || 'https://via.placeholder.com/30x30/1e40af/ffffff?text=U'}" 
                     alt="${currentUser.fullName}" class="user-avatar">
                <span>${currentUser.fullName}</span>
                <button onclick="logout()" class="logout-btn">Salir</button>
            </div>
        `;
    } else {
        loginLink.textContent = 'Iniciar Sesión';
    }
}

// Logout function
function logout() {
    currentUser = null;
    isLoggedIn = false;
    localStorage.removeItem('currentUser');
    updateLoginUI();
    showSection('home');
}

// Countdown timer
function updateCountdown() {
    if (!nextMatch) return;
    
    const now = new Date().getTime();
    const matchTime = new Date(nextMatch.dateTime).getTime();
    const timeLeft = matchTime - now;
    
    if (timeLeft > 0) {
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        
        document.getElementById('days').textContent = days.toString().padStart(2, '0');
        document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
        document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
        document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
    } else {
        document.getElementById('days').textContent = '00';
        document.getElementById('hours').textContent = '00';
        document.getElementById('minutes').textContent = '00';
        document.getElementById('seconds').textContent = '00';
    }
}

// Set next match
function setNextMatch() {
    // Set a sample next match (next Sunday at 3 PM)
    const nextSunday = new Date();
    const daysUntilSunday = (7 - nextSunday.getDay()) % 7 || 7;
    nextSunday.setDate(nextSunday.getDate() + daysUntilSunday);
    nextSunday.setHours(15, 0, 0, 0);
    
    nextMatch = {
        date: nextSunday.toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        }),
        time: '15:00',
        venue: 'Cancha Municipal',
        opponent: 'Club Deportivo Rival',
        dateTime: nextSunday.toISOString()
    };
    
    saveNextMatch();
}

// Update match info
function updateMatchInfo() {
    if (!nextMatch) return;
    
    document.getElementById('matchDate').textContent = nextMatch.date;
    document.getElementById('matchTime').textContent = nextMatch.time;
    document.getElementById('matchVenue').textContent = nextMatch.venue;
    document.getElementById('rivalName').textContent = nextMatch.opponent;
    
    // Update rival team logo
    updateTeamLogo(nextMatch.opponent);
}

// Update team logo based on opponent name
function updateTeamLogo(opponentName) {
    const logoElement = document.getElementById('rivalLogo');
    if (!logoElement) return;
    
    // Create logo filename from opponent name
    const logoFilename = opponentName.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
    
    const logoPath = `assets/images/teams/${logoFilename}.png`;
    
    // Update logo source
    logoElement.src = logoPath;
    logoElement.alt = opponentName;
}

// Update FC DESCANSA logo in matches
function updateFCLogo() {
    const fcLogoElements = document.querySelectorAll('.team img[alt="FC DESCANSA"]');
    fcLogoElements.forEach(logo => {
        logo.src = 'assets/images/logo.png';
        logo.alt = 'FC DESCANSA';
    });
}

// Load squad
function loadSquad() {
    const positions = {
        'Portero': 'goalkeepers',
        'Defensa': 'defenders',
        'Centrocampista': 'midfielders',
        'Delantero': 'forwards',
        'Director Técnico': 'staff'
    };
    
    // Clear existing players
    Object.values(positions).forEach(positionId => {
        const container = document.getElementById(positionId);
        if (container) container.innerHTML = '';
    });
    
    // Add players to their positions
    players.forEach(player => {
        const positionContainer = document.getElementById(positions[player.position]);
        if (positionContainer) {
            const playerCard = createPlayerCard(player);
            positionContainer.appendChild(playerCard);
        }
    });
}

// Create player card
function createPlayerCard(player) {
    const card = document.createElement('div');
    card.className = 'player-card';
    card.onclick = () => showPlayerModal(player);
    
    // Create player photo path
    const photoFilename = player.fullName.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
    const photoPath = `assets/images/players/${photoFilename}.jpg`;
    
    card.innerHTML = `
        <img src="${player.photo || photoPath}" 
             alt="${player.fullName}" 
             class="player-photo"
             onerror="this.src='https://via.placeholder.com/80x80/1e40af/ffffff?text=${player.fullName.charAt(0)}'">
        <div class="player-name">${player.fullName}</div>
        ${player.nickname ? `<div class="player-nickname">"${player.nickname}"</div>` : ''}
        <div class="player-number">${player.jerseyNumber}</div>
    `;
    
    return card;
}

// Show player modal
function showPlayerModal(player) {
    const modal = document.getElementById('playerModal');
    const details = document.getElementById('playerDetails');
    
    details.innerHTML = `
        <div class="player-modal-content">
            <img src="${player.photo || 'https://via.placeholder.com/150x150/1e40af/ffffff?text=' + (player.fullName.charAt(0))}" 
                 alt="${player.fullName}" class="modal-player-photo">
            <h2>${player.fullName}</h2>
            ${player.nickname ? `<h3>"${player.nickname}"</h3>` : ''}
            <div class="player-info">
                <p><strong>Número:</strong> ${player.jerseyNumber}</p>
                <p><strong>Posición:</strong> ${player.position}</p>
                <p><strong>Goles:</strong> ${player.stats.goals}</p>
                <p><strong>Asistencias:</strong> ${player.stats.assists}</p>
                <p><strong>Partidos Jugados:</strong> ${player.stats.gamesPlayed}</p>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
    
    const closeModal = modal.querySelector('.close');
    closeModal.onclick = () => modal.style.display = 'none';
    
    modal.onclick = (e) => {
        if (e.target === modal) modal.style.display = 'none';
    };
}

// Load starting XI
function loadStartingXI() {
    const field = document.getElementById('playersField');
    if (!field) return;
    
    field.innerHTML = '';
    
    // Sample starting XI positions (in a 4-3-3 formation)
    const positions = [
        { x: '50%', y: '85%', role: 'GK' }, // Goalkeeper
        { x: '15%', y: '65%', role: 'LB' }, // Left Back
        { x: '35%', y: '65%', role: 'CB' }, // Center Back
        { x: '65%', y: '65%', role: 'CB' }, // Center Back
        { x: '85%', y: '65%', role: 'RB' }, // Right Back
        { x: '25%', y: '45%', role: 'CM' }, // Central Midfielder
        { x: '50%', y: '45%', role: 'CM' }, // Central Midfielder
        { x: '75%', y: '45%', role: 'CM' }, // Central Midfielder
        { x: '20%', y: '25%', role: 'LW' }, // Left Wing
        { x: '50%', y: '25%', role: 'ST' }, // Striker
        { x: '80%', y: '25%', role: 'RW' }  // Right Wing
    ];
    
    positions.forEach((pos, index) => {
        const playerElement = document.createElement('div');
        playerElement.className = 'player-position';
        playerElement.style.left = pos.x;
        playerElement.style.top = pos.y;
        playerElement.style.transform = 'translate(-50%, -50%)';
        
        // Find a player for this position (simplified)
        const suitablePlayers = players.filter(p => {
            switch(pos.role) {
                case 'GK': return p.position === 'Portero';
                case 'LB':
                case 'CB':
                case 'RB': return p.position === 'Defensa';
                case 'CM': return p.position === 'Centrocampista';
                case 'LW':
                case 'ST':
                case 'RW': return p.position === 'Delantero';
                default: return false;
            }
        });
        
        if (suitablePlayers[index]) {
            const player = suitablePlayers[index];
            playerElement.innerHTML = `
                <img src="${player.photo || 'https://via.placeholder.com/60x60/1e40af/ffffff?text=' + (player.fullName.charAt(0))}" 
                     alt="${player.fullName}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">
            `;
            playerElement.title = player.fullName;
        } else {
            playerElement.textContent = pos.role;
        }
        
        field.appendChild(playerElement);
    });
}

// Show image modal
function showImageModal(src, alt) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 90%; max-height: 90%;">
            <span class="close">&times;</span>
            <img src="${src}" alt="${alt}" style="width: 100%; height: auto; border-radius: 10px;">
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const closeModal = modal.querySelector('.close');
    closeModal.onclick = () => {
        document.body.removeChild(modal);
    };
    
    modal.onclick = (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    };
}

// Data management
function loadData() {
    loadPlayers();
    loadNextMatch();
    loadInternationalResults();
}

function savePlayers() {
    localStorage.setItem('fcDescansaPlayers', JSON.stringify(players));
}

function loadPlayers() {
    if (db) {
        players = db.getAllPlayers();
    } else {
        const saved = localStorage.getItem('fcDescansaPlayers');
        if (saved) {
            players = JSON.parse(saved);
        }
    }
}

function saveNextMatch() {
    localStorage.setItem('fcDescansaNextMatch', JSON.stringify(nextMatch));
}

function loadNextMatch() {
    if (db) {
        nextMatch = db.getNextMatch();
    } else {
        const saved = localStorage.getItem('fcDescansaNextMatch');
        if (saved) {
            nextMatch = JSON.parse(saved);
        }
    }
}

// Initialize sample data
function initializeSampleData() {
    const samplePlayers = [
        {
            id: 1,
            fullName: 'Juan Pérez',
            nickname: 'El Capitán',
            jerseyNumber: 10,
            position: 'Centrocampista',
            email: 'juan@example.com',
            whatsapp: '+52123456789',
            password: '123456',
            photo: null,
            registeredAt: new Date().toISOString(),
            stats: { goals: 5, assists: 8, gamesPlayed: 15 }
        },
        {
            id: 2,
            fullName: 'Carlos Rodríguez',
            nickname: 'El Guardián',
            jerseyNumber: 1,
            position: 'Portero',
            email: 'carlos@example.com',
            whatsapp: '+52123456790',
            password: '123456',
            photo: null,
            registeredAt: new Date().toISOString(),
            stats: { goals: 0, assists: 0, gamesPlayed: 15 }
        },
        {
            id: 3,
            fullName: 'Miguel Sánchez',
            nickname: 'El Toro',
            jerseyNumber: 9,
            position: 'Delantero',
            email: 'miguel@example.com',
            whatsapp: '+52123456791',
            password: '123456',
            photo: null,
            registeredAt: new Date().toISOString(),
            stats: { goals: 12, assists: 3, gamesPlayed: 15 }
        },
        {
            id: 4,
            fullName: 'Roberto García',
            position: 'Director Técnico',
            jerseyNumber: 0,
            email: 'roberto@example.com',
            whatsapp: '+52123456792',
            password: '123456',
            photo: null,
            registeredAt: new Date().toISOString(),
            stats: { goals: 0, assists: 0, gamesPlayed: 0 }
        }
    ];
    
    players = samplePlayers;
    savePlayers();
}

// Load live matches for specific tab
async function loadLiveMatchesForTab(tabType) {
    try {
        let matches = [];
        
        switch(tabType) {
            case 'all':
                matches = await window.FootballAPI.getLiveMatches();
                break;
            default:
                matches = await window.FootballAPI.getLiveMatches();
                break;
        }
        
        updateLiveMatchesUI(`liveMatches${tabType.charAt(0).toUpperCase() + tabType.slice(1)}`, matches);
    } catch (error) {
        console.error('Error loading live matches for tab:', error);
        updateLiveMatchesUI(`liveMatches${tabType.charAt(0).toUpperCase() + tabType.slice(1)}`, []);
    }
}

// Get matches by league ID
async function getMatchesByLeague(leagueId) {
    try {
        const data = await window.FootballAPI.makeRequest(`/fixtures?league=${leagueId}&season=2024`);
        return window.FootballAPI.formatMatches(data.response);
    } catch (error) {
        console.error(`Error fetching matches for league ${leagueId}:`, error);
        return [];
    }
}

// Update live matches UI
function updateLiveMatchesUI(containerId, matches) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (matches.length === 0) {
        container.innerHTML = `
            <div class="no-matches">
                <i class="fas fa-futbol"></i>
                <p>No hay partidos disponibles en este momento</p>
            </div>
        `;
        return;
    }

    // Add data source indicator for Liga MX
    let dataSource = '';
    if (containerId.includes('LigaMx') && matches.length > 0 && matches[0].id.includes('liga-mx')) {
        dataSource = '<div class="data-source-indicator"><i class="fas fa-info-circle"></i> Datos simulados con equipos reales de Liga MX</div>';
    } else if (matches.length === 0) {
        // Show API key instructions when no matches are found
        const instructions = window.FootballAPI.getApiKeyInstructions();
        dataSource = `
            <div class="api-key-instructions">
                <div class="instructions-header">
                    <i class="fas fa-key"></i>
                    <h3>¿Quieres ver resultados reales?</h3>
                </div>
                <div class="instructions-content">
                    <p>${instructions.message}</p>
                    <div class="steps">
                        ${instructions.steps.map(step => `<div class="step">${step}</div>`).join('')}
                    </div>
                    <div class="benefits">
                        ${instructions.benefits.map(benefit => `<div class="benefit">${benefit}</div>`).join('')}
                    </div>
                    <button class="get-api-key-btn" onclick="window.open('https://www.api-football.com/', '_blank')">
                        <i class="fas fa-external-link-alt"></i> Obtener API Key Gratuita
                    </button>
                </div>
            </div>
        `;
    }

    const matchesHTML = matches.map(match => `
        <div class="live-match-card ${match.isLive ? 'live' : ''}">
            ${match.isLive ? '<div class="live-indicator">EN VIVO</div>' : ''}
            <div class="match-teams">
                <div class="team-container">
                    <div class="team-logo">
                        <img src="${match.homeTeamLogo || 'https://media.api-sports.io/football/teams/1.png'}" 
                             alt="${match.homeTeam}" 
                             onerror="this.src='https://media.api-sports.io/football/teams/1.png'">
                    </div>
                    <div class="team-name" title="${match.homeTeam}">${match.homeTeam}</div>
                </div>
                <div class="match-score-container">
                    <div class="match-score">${match.homeScore !== null ? match.homeScore : '-'}-${match.awayScore !== null ? match.awayScore : '-'}</div>
                    <div class="match-time">${match.minute ? `${match.minute}'` : formatMatchStatus(match.status)}</div>
                </div>
                <div class="team-container">
                    <div class="team-name" title="${match.awayTeam}">${match.awayTeam}</div>
                    <div class="team-logo">
                        <img src="${match.awayTeamLogo || 'https://media.api-sports.io/football/teams/1.png'}" 
                             alt="${match.awayTeam}" 
                             onerror="this.src='https://media.api-sports.io/football/teams/1.png'">
                    </div>
                </div>
            </div>
            <div class="match-info">
                <div class="match-competition">${match.competition}</div>
                <div class="match-status ${match.status.toLowerCase()}">
                    ${match.isLive ? 'EN VIVO' : formatMatchStatus(match.status)}
                </div>
            </div>
        </div>
    `).join('');

    container.innerHTML = dataSource + matchesHTML;
}

// Initialize 3D Carousel
function initialize3DCarousel() {
    const carousel = document.getElementById('carousel3D');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const indicators = document.querySelectorAll('.indicator');
    const cards = document.querySelectorAll('.carousel-3d-card');
    
    if (!carousel) return;
    
    let currentIndex = 0;
    const totalCards = cards.length;
    let rotationAngle = 0;
    
    // Function to update carousel position
    function updateCarousel() {
        rotationAngle = -currentIndex * 72; // 360 / 5 = 72 degrees per card
        carousel.style.transform = `rotateY(${rotationAngle}deg)`;
        
        // Update indicators
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentIndex);
        });
        
        // Update cards
        cards.forEach((card, index) => {
            card.classList.toggle('active', index === currentIndex);
        });
    }
    
    // Next button
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % totalCards;
            updateCarousel();
        });
    }
    
    // Previous button
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + totalCards) % totalCards;
            updateCarousel();
        });
    }
    
    // Indicators
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            currentIndex = index;
            updateCarousel();
        });
    });
    
    // Card click events
    cards.forEach((card, index) => {
        card.addEventListener('click', () => {
            currentIndex = index;
            updateCarousel();
        });
    });
    
    // Auto-rotation (optional)
    let autoRotate = setInterval(() => {
        currentIndex = (currentIndex + 1) % totalCards;
        updateCarousel();
    }, 4000);
    
    // Pause auto-rotation on hover
    carousel.addEventListener('mouseenter', () => {
        clearInterval(autoRotate);
    });
    
    carousel.addEventListener('mouseleave', () => {
        autoRotate = setInterval(() => {
            currentIndex = (currentIndex + 1) % totalCards;
            updateCarousel();
        }, 4000);
    });
    
    // Initialize
    updateCarousel();
}

// Format match status
function formatMatchStatus(status) {
    const statusMap = {
        'FT': 'Finalizado',
        'NS': 'Por jugar',
        'LIVE': 'En vivo',
        'HT': 'Descanso',
        '1H': 'Primer tiempo',
        '2H': 'Segundo tiempo',
        'FINISHED': 'Finalizado',
        'SCHEDULED': 'Programado',
        'POSTPONED': 'Aplazado',
        'CANCELLED': 'Cancelado',
        'PEN': 'Penales',
        'ET': 'Tiempo Extra',
        'CANC': 'Cancelado',
        'SUSP': 'Suspendido',
        'AWD': 'Adjudicado',
        'WO': 'Walkover'
    };
    return statusMap[status] || status;
}

// Auto-refresh live matches
function startLiveMatchesRefresh() {
    // Refresh every 30 seconds
    setInterval(async () => {
        const activeTab = document.querySelector('.live-tab-button.active');
        if (activeTab) {
            const tabType = activeTab.getAttribute('data-live-tab');
            await loadLiveMatchesForTab(tabType);
        }
    }, 30000);
}

// Initialize live matches
async function initializeLiveMatches() {
    try {
        // Test API key first
        const apiStatus = await window.FootballAPI.testApiKey();
        console.log('API Status:', apiStatus);
        
        // Load initial matches for the active tab
        await loadLiveMatchesForTab('all');
        
        // Start auto-refresh
        startLiveMatchesRefresh();
    } catch (error) {
        console.error('Error initializing live matches:', error);
    }
}

// API integration for live matches
async function fetchLiveMatches() {
    try {
        // This would be replaced with actual API calls
        // For example: Football-Data.org API, API-Sports, etc.
        
        // Mock API response
        const mockResponse = {
            matches: [
                {
                    homeTeam: 'Manchester City',
                    awayTeam: 'Real Madrid',
                    score: '2-1',
                    status: 'FT',
                    competition: 'Champions League'
                }
            ]
        };
        
        return mockResponse;
    } catch (error) {
        console.error('Error fetching live matches:', error);
        return null;
    }
}

// Notification system
function sendNotification(type, message, recipients) {
    // This would integrate with email and WhatsApp APIs
    console.log(`Sending ${type} notification:`, message, 'to:', recipients);
    
    // Mock implementation
    if (type === 'email') {
        // Send email notification
        alert(`Email enviado: ${message}`);
    } else if (type === 'whatsapp') {
        // Send WhatsApp notification
        alert(`WhatsApp enviado: ${message}`);
    }
}

// Send match notifications
function sendMatchNotifications(match) {
    const message = `¡Nuevo partido programado! ${match.opponent} - ${match.date} a las ${match.time} en ${match.venue}`;
    
    players.forEach(player => {
        sendNotification('email', message, player.email);
        sendNotification('whatsapp', message, player.whatsapp);
    });
}

// Send reminder notifications
function sendReminderNotifications(match) {
    const message = `Recordatorio: Partido contra ${match.opponent} en 1 hora en ${match.venue}`;
    
    players.forEach(player => {
        sendNotification('email', message, player.email);
        sendNotification('whatsapp', message, player.whatsapp);
    });
}

// Utility functions
function formatDate(date) {
    return new Date(date).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatTime(date) {
    return new Date(date).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Export functions for external use
window.FCDescansa = {
    login: handleLogin,
    register: handleRegister,
    logout: logout,
    showSection: showSection,
    sendMatchNotifications: sendMatchNotifications,
    sendReminderNotifications: sendReminderNotifications
};
