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
});

// Initialize application
function initializeApp() {
    // Initialize database
    db = window.FCDescansaDB;
    
    // Load saved data
    loadPlayers();
    loadNextMatch();
    
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
    loadSquad();
    loadStartingXI();
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
    
    // International results tabs
    const resultTabs = document.querySelectorAll('.tab-button');
    resultTabs.forEach(tab => {
        tab.addEventListener('click', handleResultTab);
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

// Result tab handling
function handleResultTab(e) {
    const tabType = e.target.getAttribute('data-tab');
    
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(tab => {
        tab.classList.remove('active');
    });
    e.target.classList.add('active');
    
    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabType).classList.add('active');
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
    
    card.innerHTML = `
        <img src="${player.photo || 'https://via.placeholder.com/80x80/1e40af/ffffff?text=' + (player.fullName.charAt(0))}" 
             alt="${player.fullName}" class="player-photo">
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

// Load international results (mock data)
function loadInternationalResults() {
    // This would normally fetch from an API
    // For now, we'll use the static data from HTML
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
