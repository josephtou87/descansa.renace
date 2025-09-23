// Database management for FC DESCANSA
// This module handles all data operations using localStorage and text file simulation

class FCDescansaDatabase {
    constructor() {
        this.players = [];
        this.matches = [];
        this.news = [];
        this.stats = {};
        this.nextMatch = null;
        this.loadData();
    }

    // Player management
    addPlayer(playerData) {
        // Validate required fields
        if (!playerData.fullName || !playerData.email || !playerData.jerseyNumber || !playerData.position) {
            throw new Error('Datos requeridos faltantes');
        }

        // Validate email format
        if (!this.isValidEmail(playerData.email)) {
            throw new Error('Formato de email inválido');
        }

        // Validate WhatsApp format
        if (!this.isValidWhatsApp(playerData.whatsapp)) {
            throw new Error('Formato de WhatsApp inválido');
        }

        // Check if jersey number is available
        if (this.isJerseyNumberTaken(playerData.jerseyNumber)) {
            throw new Error('Número de camiseta no disponible');
        }

        // Check if email is already registered
        if (this.isEmailRegistered(playerData.email)) {
            throw new Error('Email ya registrado');
        }

        const player = {
            id: Date.now(),
            fullName: playerData.fullName.trim(),
            nickname: playerData.nickname ? playerData.nickname.trim() : '',
            jerseyNumber: parseInt(playerData.jerseyNumber),
            position: playerData.position,
            email: playerData.email.toLowerCase().trim(),
            whatsapp: playerData.whatsapp.trim(),
            password: playerData.password,
            photo: playerData.photo || null,
            registeredAt: new Date().toISOString(),
            stats: {
                goals: 0,
                assists: 0,
                gamesPlayed: 0,
                yellowCards: 0,
                redCards: 0
            },
            isActive: true
        };

        this.players.push(player);
        this.saveToFile('players', this.players);
        this.saveToLocalStorage();
        return player;
    }

    updatePlayer(playerId, updates) {
        const playerIndex = this.players.findIndex(p => p.id === playerId);
        if (playerIndex === -1) {
            throw new Error('Jugador no encontrado');
        }

        // Validate jersey number if being updated
        if (updates.jerseyNumber && this.isJerseyNumberTaken(updates.jerseyNumber, playerId)) {
            throw new Error('Número de camiseta no disponible');
        }

        // Validate email if being updated
        if (updates.email && this.isEmailRegistered(updates.email, playerId)) {
            throw new Error('Email ya registrado');
        }

        this.players[playerIndex] = { ...this.players[playerIndex], ...updates };
        this.saveToFile('players', this.players);
        this.saveToLocalStorage();
        return this.players[playerIndex];
    }

    deletePlayer(playerId) {
        const playerIndex = this.players.findIndex(p => p.id === playerId);
        if (playerIndex === -1) {
            throw new Error('Jugador no encontrado');
        }

        this.players.splice(playerIndex, 1);
        this.saveToFile('players', this.players);
        this.saveToLocalStorage();
    }

    getPlayer(playerId) {
        return this.players.find(p => p.id === playerId);
    }

    getPlayerByEmail(email) {
        return this.players.find(p => p.email === email.toLowerCase());
    }

    getAllPlayers() {
        return this.players.filter(p => p.isActive);
    }

    getPlayersByPosition(position) {
        return this.players.filter(p => p.position === position && p.isActive);
    }

    // Match management
    addMatch(matchData) {
        const match = {
            id: Date.now(),
            date: matchData.date,
            time: matchData.time,
            venue: matchData.venue,
            opponent: matchData.opponent,
            competition: matchData.competition || 'Liga Local',
            status: matchData.status || 'scheduled', // scheduled, live, finished
            homeScore: matchData.homeScore || null,
            awayScore: matchData.awayScore || null,
            createdAt: new Date().toISOString(),
            players: matchData.players || []
        };

        this.matches.push(match);
        this.saveToFile('matches', this.matches);
        this.saveToLocalStorage();

        // Send notifications if it's a new match
        if (match.status === 'scheduled') {
            this.sendMatchNotifications(match);
        }

        return match;
    }

    updateMatch(matchId, updates) {
        const matchIndex = this.matches.findIndex(m => m.id === matchId);
        if (matchIndex === -1) {
            throw new Error('Partido no encontrado');
        }

        this.matches[matchIndex] = { ...this.matches[matchIndex], ...updates };
        this.saveToFile('matches', this.matches);
        this.saveToLocalStorage();
        return this.matches[matchIndex];
    }

    getMatch(matchId) {
        return this.matches.find(m => m.id === matchId);
    }

    getAllMatches() {
        return this.matches.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    getRecentMatches(limit = 10) {
        return this.matches
            .filter(m => m.status === 'finished')
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, limit);
    }

    getUpcomingMatches() {
        const now = new Date();
        return this.matches
            .filter(m => m.status === 'scheduled' && new Date(m.date) > now)
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    setNextMatch(matchData) {
        this.nextMatch = matchData;
        this.saveToFile('nextMatch', this.nextMatch);
        this.saveToLocalStorage();
    }

    getNextMatch() {
        return this.nextMatch;
    }

    // News management
    addNews(newsData) {
        const news = {
            id: Date.now(),
            title: newsData.title,
            content: newsData.content,
            image: newsData.image || null,
            author: newsData.author || 'Administrador',
            createdAt: new Date().toISOString(),
            isPublished: true
        };

        this.news.push(news);
        this.saveToFile('news', this.news);
        this.saveToLocalStorage();
        return news;
    }

    getAllNews() {
        return this.news
            .filter(n => n.isPublished)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    getRecentNews(limit = 5) {
        return this.getAllNews().slice(0, limit);
    }

    // Statistics management
    updatePlayerStats(playerId, stats) {
        const player = this.getPlayer(playerId);
        if (!player) {
            throw new Error('Jugador no encontrado');
        }

        player.stats = { ...player.stats, ...stats };
        this.saveToFile('players', this.players);
        this.saveToLocalStorage();
        return player;
    }

    getTeamStats() {
        const activePlayers = this.getAllPlayers();
        const finishedMatches = this.matches.filter(m => m.status === 'finished');

        return {
            totalPlayers: activePlayers.length,
            totalMatches: finishedMatches.length,
            totalGoals: activePlayers.reduce((sum, p) => sum + p.stats.goals, 0),
            totalAssists: activePlayers.reduce((sum, p) => sum + p.stats.assists, 0),
            wins: finishedMatches.filter(m => m.homeScore > m.awayScore).length,
            draws: finishedMatches.filter(m => m.homeScore === m.awayScore).length,
            losses: finishedMatches.filter(m => m.homeScore < m.awayScore).length
        };
    }

    // Validation methods
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidWhatsApp(whatsapp) {
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        return phoneRegex.test(whatsapp.replace(/\s/g, ''));
    }

    isJerseyNumberTaken(jerseyNumber, excludePlayerId = null) {
        return this.players.some(p => 
            p.jerseyNumber === parseInt(jerseyNumber) && 
            p.id !== excludePlayerId && 
            p.isActive
        );
    }

    isEmailRegistered(email, excludePlayerId = null) {
        return this.players.some(p => 
            p.email === email.toLowerCase() && 
            p.id !== excludePlayerId && 
            p.isActive
        );
    }

    // Notification system
    sendMatchNotifications(match) {
        const message = `¡Nuevo partido programado! ${match.opponent} - ${match.date} a las ${match.time} en ${match.venue}`;
        this.sendNotifications(message);
    }

    sendReminderNotifications(match) {
        const message = `Recordatorio: Partido contra ${match.opponent} en 1 hora en ${match.venue}`;
        this.sendNotifications(message);
    }

    sendNotifications(message) {
        // In a real implementation, this would integrate with email and WhatsApp APIs
        this.players.forEach(player => {
            // Log notification (in production, send actual notifications)
            console.log(`Notification sent to ${player.fullName} (${player.email}): ${message}`);
            
            // Store notification in database
            this.addNotification({
                playerId: player.id,
                type: 'match_reminder',
                message: message,
                sentAt: new Date().toISOString(),
                status: 'sent'
            });
        });
    }

    addNotification(notificationData) {
        const notifications = this.getNotifications() || [];
        const notification = {
            id: Date.now(),
            ...notificationData
        };
        notifications.push(notification);
        this.saveToFile('notifications', notifications);
    }

    getNotifications() {
        const saved = localStorage.getItem('fcDescansaNotifications');
        return saved ? JSON.parse(saved) : [];
    }

    // File operations (simulating database files)
    saveToFile(filename, data) {
        // In a real application, this would save to actual files
        // For now, we'll use localStorage as a simulation
        try {
            const fileData = {
                filename: filename,
                data: data,
                lastModified: new Date().toISOString()
            };
            localStorage.setItem(`fcDescansa_${filename}`, JSON.stringify(fileData));
        } catch (error) {
            console.error('Error saving to file:', error);
        }
    }

    loadFromFile(filename) {
        try {
            const fileData = localStorage.getItem(`fcDescansa_${filename}`);
            return fileData ? JSON.parse(fileData).data : null;
        } catch (error) {
            console.error('Error loading from file:', error);
            return null;
        }
    }

    // Data persistence
    saveToLocalStorage() {
        const data = {
            players: this.players,
            matches: this.matches,
            news: this.news,
            nextMatch: this.nextMatch,
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('fcDescansaDatabase', JSON.stringify(data));
    }

    loadData() {
        // Load from localStorage
        const saved = localStorage.getItem('fcDescansaDatabase');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.players = data.players || [];
                this.matches = data.matches || [];
                this.news = data.news || [];
                this.nextMatch = data.nextMatch || null;
            } catch (error) {
                console.error('Error loading data:', error);
                this.initializeSampleData();
            }
        } else {
            this.initializeSampleData();
        }

        // Load from individual files (simulation)
        this.loadFromFiles();
    }

    loadFromFiles() {
        const fileData = {
            players: this.loadFromFile('players'),
            matches: this.loadFromFile('matches'),
            news: this.loadFromFile('news'),
            nextMatch: this.loadFromFile('nextMatch')
        };

        if (fileData.players) this.players = fileData.players;
        if (fileData.matches) this.matches = fileData.matches;
        if (fileData.news) this.news = fileData.news;
        if (fileData.nextMatch) this.nextMatch = fileData.nextMatch;
    }

    // Initialize sample data
    initializeSampleData() {
        // Sample players
        this.players = [
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
                stats: { goals: 5, assists: 8, gamesPlayed: 15, yellowCards: 2, redCards: 0 },
                isActive: true
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
                stats: { goals: 0, assists: 0, gamesPlayed: 15, yellowCards: 1, redCards: 0 },
                isActive: true
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
                stats: { goals: 12, assists: 3, gamesPlayed: 15, yellowCards: 0, redCards: 0 },
                isActive: true
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
                stats: { goals: 0, assists: 0, gamesPlayed: 0, yellowCards: 0, redCards: 0 },
                isActive: true
            }
        ];

        // Sample matches
        this.matches = [
            {
                id: 1,
                date: '2024-01-05',
                time: '15:00',
                venue: 'Cancha Municipal',
                opponent: 'Club Deportivo',
                competition: 'Liga Local',
                status: 'finished',
                homeScore: 3,
                awayScore: 1,
                createdAt: new Date().toISOString(),
                players: []
            },
            {
                id: 2,
                date: '2024-01-15',
                time: '15:00',
                venue: 'Cancha Municipal',
                opponent: 'Club Rival',
                competition: 'Liga Local',
                status: 'scheduled',
                homeScore: null,
                awayScore: null,
                createdAt: new Date().toISOString(),
                players: []
            }
        ];

        // Sample news
        this.news = [
            {
                id: 1,
                title: 'Entrenamiento Intensivo',
                content: 'El equipo se prepara intensamente para el próximo partido con sesiones dobles de entrenamiento.',
                image: 'https://via.placeholder.com/300x200/1e40af/ffffff?text=Entrenamiento',
                author: 'Administrador',
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                isPublished: true
            },
            {
                id: 2,
                title: 'Nueva Contratación',
                content: 'FC DESCANSA anuncia la llegada de un nuevo delantero para reforzar el ataque.',
                image: 'https://via.placeholder.com/300x200/059669/ffffff?text=Nueva%20Contratación',
                author: 'Administrador',
                createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
                isPublished: true
            }
        ];

        // Set next match
        const nextSunday = new Date();
        const daysUntilSunday = (7 - nextSunday.getDay()) % 7 || 7;
        nextSunday.setDate(nextSunday.getDate() + daysUntilSunday);
        nextSunday.setHours(15, 0, 0, 0);

        this.nextMatch = {
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

        this.saveToLocalStorage();
        this.saveToFile('players', this.players);
        this.saveToFile('matches', this.matches);
        this.saveToFile('news', this.news);
        this.saveToFile('nextMatch', this.nextMatch);
    }

    // Export data to text files (for backup)
    exportToTextFiles() {
        const timestamp = new Date().toISOString().split('T')[0];
        
        // Export players
        const playersText = this.players.map(p => 
            `ID: ${p.id}\nNombre: ${p.fullName}\nApodo: ${p.nickname}\nNúmero: ${p.jerseyNumber}\nPosición: ${p.position}\nEmail: ${p.email}\nWhatsApp: ${p.whatsapp}\nGoles: ${p.stats.goals}\nAsistencias: ${p.stats.assists}\nPartidos: ${p.stats.gamesPlayed}\nRegistrado: ${p.registeredAt}\n---\n`
        ).join('\n');

        // Export matches
        const matchesText = this.matches.map(m => 
            `ID: ${m.id}\nFecha: ${m.date}\nHora: ${m.time}\nLugar: ${m.venue}\nRival: ${m.opponent}\nCompetencia: ${m.competition}\nEstado: ${m.status}\nResultado: ${m.homeScore}-${m.awayScore}\n---\n`
        ).join('\n');

        // Create downloadable files
        this.downloadTextFile(`fc_descansa_players_${timestamp}.txt`, playersText);
        this.downloadTextFile(`fc_descansa_matches_${timestamp}.txt`, matchesText);
    }

    downloadTextFile(filename, content) {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }
}

// Create global database instance
window.FCDescansaDB = new FCDescansaDatabase();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FCDescansaDatabase;
}
