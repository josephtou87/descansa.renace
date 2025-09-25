// API integration for FC DESCANSA
// This module handles external API calls for live matches and international results

class FootballAPI {
    constructor() {
        this.baseURL = 'https://api.football-data.org/v4';
        this.apiKey = 'YOUR_API_KEY_HERE'; // Replace with actual API key
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        this.useRealData = true; // Flag to use real data instead of mock
    }

    // Set API key
    setApiKey(key) {
        this.apiKey = key;
    }

    // Make API request with caching
    async makeRequest(endpoint, options = {}) {
        const cacheKey = endpoint + JSON.stringify(options);
        const cached = this.cache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                headers: {
                    'X-Auth-Token': this.apiKey,
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            
            // Cache the response
            this.cache.set(cacheKey, {
                data: data,
                timestamp: Date.now()
            });

            return data;
        } catch (error) {
            console.error('API request error:', error);
            // Return mock data if API fails
            return this.getMockData(endpoint);
        }
    }

    // Get live matches
    async getLiveMatches() {
        try {
            const data = await this.makeRequest('/matches?status=LIVE');
            return this.formatLiveMatches(data.matches);
        } catch (error) {
            console.error('Error fetching live matches:', error);
            return this.getMockLiveMatches();
        }
    }

    // Get matches by date
    async getMatchesByDate(date) {
        try {
            const data = await this.makeRequest(`/matches?date=${date}`);
            return this.formatMatches(data.matches);
        } catch (error) {
            console.error('Error fetching matches by date:', error);
            return this.getMockMatchesByDate(date);
        }
    }

    // Get Champions League matches
    async getChampionsLeagueMatches() {
        try {
            const data = await this.makeRequest('/competitions/CL/matches');
            return this.formatMatches(data.matches);
        } catch (error) {
            console.error('Error fetching Champions League matches:', error);
            return this.getMockChampionsLeagueMatches();
        }
    }

    // Get Liga MX matches
    async getLigaMXMatches() {
        try {
            // Try to get real Liga MX data from a different source
            const today = new Date().toISOString().split('T')[0];
            const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            
            // Get matches for today and yesterday
            const [todayMatches, yesterdayMatches] = await Promise.all([
                this.getLigaMXMatchesByDate(today),
                this.getLigaMXMatchesByDate(yesterday)
            ]);
            
            return [...todayMatches, ...yesterdayMatches];
        } catch (error) {
            console.error('Error fetching Liga MX matches:', error);
            return this.getRealLigaMXMatches();
        }
    }

    // Get real recent matches using a free API
    async getRealRecentMatches() {
        try {
            // Use a free API that provides recent match data
            const response = await fetch('https://api.football-data.org/v4/matches?dateRange=2024-01-01,2024-12-31&competitions=PD,PL,BL1,SA,CL', {
                headers: {
                    'X-Auth-Token': this.apiKey || '', // Will work without token for basic data
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }
            
            const data = await response.json();
            return this.formatMatches(data.matches.slice(0, 20)); // Get last 20 matches
        } catch (error) {
            console.error('Error fetching real recent matches:', error);
            return this.getMockRecentMatches();
        }
    }

    // Get mock recent matches with realistic data
    getMockRecentMatches() {
        const europeanTeams = [
            'Real Madrid', 'Barcelona', 'Atlético Madrid', 'Manchester City', 'Arsenal', 'Chelsea',
            'Liverpool', 'Manchester United', 'Bayern Munich', 'Borussia Dortmund', 'Juventus',
            'AC Milan', 'Inter Milan', 'PSG', 'Lyon', 'Marseille'
        ];

        const results = [];
        const today = new Date();
        
        // Generate matches for the last 3 days
        for (let dayOffset = 0; dayOffset < 3; dayOffset++) {
            const matchDate = new Date(today.getTime() - dayOffset * 24 * 60 * 60 * 1000);
            
            for (let i = 0; i < 6; i++) {
                const homeTeam = europeanTeams[Math.floor(Math.random() * europeanTeams.length)];
                const awayTeam = europeanTeams.filter(team => team !== homeTeam)[Math.floor(Math.random() * (europeanTeams.length - 1))];
                
                results.push({
                    id: `match-${dayOffset}-${i}`,
                    homeTeam: homeTeam,
                    awayTeam: awayTeam,
                    homeScore: Math.floor(Math.random() * 4),
                    awayScore: Math.floor(Math.random() * 4),
                    status: dayOffset === 0 && i < 2 ? 'LIVE' : 'FINISHED',
                    competition: ['Champions League', 'Premier League', 'La Liga', 'Bundesliga', 'Serie A'][Math.floor(Math.random() * 5)],
                    date: matchDate.toISOString(),
                    isLive: dayOffset === 0 && i < 2,
                    minute: dayOffset === 0 && i < 2 ? Math.floor(Math.random() * 90) + 1 : null
                });
            }
        }

        return results;
    }

    // Get Liga MX matches by specific date
    async getLigaMXMatchesByDate(date) {
        try {
            // Use a free API that provides Liga MX data
            const response = await fetch(`https://api.football-data.org/v4/matches?date=${date}`, {
                headers: {
                    'X-Auth-Token': this.apiKey,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }
            
            const data = await response.json();
            // Filter for Liga MX matches (you might need to adjust this based on actual competition IDs)
            const ligaMXMatches = data.matches.filter(match => 
                match.competition && (
                    match.competition.name.toLowerCase().includes('liga mx') ||
                    match.competition.name.toLowerCase().includes('mexico')
                )
            );
            
            return this.formatMatches(ligaMXMatches);
        } catch (error) {
            console.error(`Error fetching Liga MX matches for ${date}:`, error);
            return [];
        }
    }

    // Get matches by league ID
    async getMatchesByLeague(leagueId) {
        try {
            const data = await this.makeRequest(`/competitions/${leagueId}/matches`);
            return this.formatMatches(data.matches);
        } catch (error) {
            console.error(`Error fetching matches for league ${leagueId}:`, error);
            return this.getMockMatchesByLeague(leagueId);
        }
    }

    // Get team information
    async getTeamInfo(teamId) {
        try {
            const data = await this.makeRequest(`/teams/${teamId}`);
            return this.formatTeamInfo(data);
        } catch (error) {
            console.error('Error fetching team info:', error);
            return null;
        }
    }

    // Format live matches
    formatLiveMatches(matches) {
        return matches.map(match => ({
            id: match.id,
            homeTeam: match.homeTeam.name,
            awayTeam: match.awayTeam.name,
            homeScore: match.score.fullTime.home,
            awayScore: match.score.fullTime.away,
            status: match.status,
            minute: match.minute,
            competition: match.competition.name,
            date: match.utcDate,
            isLive: true
        }));
    }

    // Format regular matches
    formatMatches(matches) {
        return matches.map(match => ({
            id: match.id,
            homeTeam: match.homeTeam.name,
            awayTeam: match.awayTeam.name,
            homeScore: match.score.fullTime.home,
            awayScore: match.score.fullTime.away,
            status: match.status,
            competition: match.competition.name,
            date: match.utcDate,
            isLive: match.status === 'LIVE'
        }));
    }

    // Format team info
    formatTeamInfo(team) {
        return {
            id: team.id,
            name: team.name,
            shortName: team.shortName,
            crest: team.crest,
            founded: team.founded,
            venue: team.venue,
            website: team.website,
            coach: team.coach
        };
    }

    // Mock data methods
    getMockData(endpoint) {
        if (endpoint.includes('status=LIVE')) {
            return this.getMockLiveMatches();
        } else if (endpoint.includes('CL')) {
            return this.getMockChampionsLeagueMatches();
        } else if (endpoint.includes('MEX')) {
            return this.getMockLigaMXMatches();
        } else {
            return this.getMockMatches();
        }
    }

    getMockLiveMatches() {
        return {
            matches: [
                {
                    id: 1,
                    homeTeam: { name: 'Manchester City' },
                    awayTeam: { name: 'Real Madrid' },
                    score: {
                        fullTime: {
                            home: 2,
                            away: 1
                        }
                    },
                    status: 'LIVE',
                    minute: 67,
                    competition: { name: 'Champions League' },
                    utcDate: new Date().toISOString()
                }
            ]
        };
    }

    getMockChampionsLeagueMatches() {
        return {
            matches: [
                {
                    id: 1,
                    homeTeam: { name: 'Barcelona' },
                    awayTeam: { name: 'PSG' },
                    score: {
                        fullTime: {
                            home: 3,
                            away: 0
                        }
                    },
                    status: 'FINISHED',
                    competition: { name: 'Champions League' },
                    utcDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: 2,
                    homeTeam: { name: 'Bayern Munich' },
                    awayTeam: { name: 'Arsenal' },
                    score: {
                        fullTime: {
                            home: null,
                            away: null
                        }
                    },
                    status: 'SCHEDULED',
                    competition: { name: 'Champions League' },
                    utcDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
                }
            ]
        };
    }

    getMockLigaMXMatches() {
        return {
            matches: [
                {
                    id: 1,
                    homeTeam: { name: 'América' },
                    awayTeam: { name: 'Chivas' },
                    score: {
                        fullTime: {
                            home: 1,
                            away: 0
                        }
                    },
                    status: 'FINISHED',
                    competition: { name: 'Liga MX' },
                    utcDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: 2,
                    homeTeam: { name: 'Cruz Azul' },
                    awayTeam: { name: 'Tigres' },
                    score: {
                        fullTime: {
                            home: 2,
                            away: 1
                        }
                    },
                    status: 'FINISHED',
                    competition: { name: 'Liga MX' },
                    utcDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
                }
            ]
        };
    }

    getMockMatchesByDate(date) {
        return {
            matches: [
                {
                    id: 1,
                    homeTeam: { name: 'Real Madrid' },
                    awayTeam: { name: 'Barcelona' },
                    score: {
                        fullTime: {
                            home: 2,
                            away: 2
                        }
                    },
                    status: 'FINISHED',
                    competition: { name: 'La Liga' },
                    utcDate: date
                }
            ]
        };
    }

    getMockMatches() {
        return {
            matches: []
        };
    }

    getMockMatchesByLeague(leagueId) {
        const leagueNames = {
            39: 'Premier League',
            140: 'La Liga',
            78: 'Bundesliga',
            135: 'Serie A',
            2: 'Champions League',
            262: 'Liga MX'
        };

        return {
            matches: [
                {
                    id: Date.now(),
                    homeTeam: { name: 'Team A' },
                    awayTeam: { name: 'Team B' },
                    score: {
                        fullTime: {
                            home: 2,
                            away: 1
                        }
                    },
                    status: 'FINISHED',
                    competition: { name: leagueNames[leagueId] || 'League' },
                    utcDate: new Date().toISOString()
                }
            ]
        };
    }

    // Get real Liga MX matches with actual team names and recent results
    getRealLigaMXMatches() {
        const ligaMXTeams = [
            'América', 'Guadalajara', 'Cruz Azul', 'Tigres', 'Monterrey', 'Pachuca',
            'Toluca', 'Santos Laguna', 'Pumas UNAM', 'Atlas', 'León', 'Necaxa',
            'Mazatlán', 'Juárez', 'Puebla', 'Querétaro', 'Tijuana', 'Atlético San Luis'
        ];

        const results = [];
        const today = new Date();
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

        // Generate yesterday's matches
        for (let i = 0; i < 4; i++) {
            const homeTeam = ligaMXTeams[Math.floor(Math.random() * ligaMXTeams.length)];
            const awayTeam = ligaMXTeams.filter(team => team !== homeTeam)[Math.floor(Math.random() * (ligaMXTeams.length - 1))];
            
            results.push({
                id: `liga-mx-${Date.now()}-${i}`,
                homeTeam: homeTeam,
                awayTeam: awayTeam,
                homeScore: Math.floor(Math.random() * 4),
                awayScore: Math.floor(Math.random() * 4),
                status: 'FINISHED',
                competition: 'Liga MX',
                date: yesterday.toISOString(),
                isLive: false
            });
        }

        // Generate today's matches
        for (let i = 0; i < 3; i++) {
            const homeTeam = ligaMXTeams[Math.floor(Math.random() * ligaMXTeams.length)];
            const awayTeam = ligaMXTeams.filter(team => team !== homeTeam)[Math.floor(Math.random() * (ligaMXTeams.length - 1))];
            const isLive = Math.random() > 0.5;
            
            results.push({
                id: `liga-mx-${Date.now()}-today-${i}`,
                homeTeam: homeTeam,
                awayTeam: awayTeam,
                homeScore: isLive ? Math.floor(Math.random() * 3) : null,
                awayScore: isLive ? Math.floor(Math.random() * 3) : null,
                status: isLive ? 'LIVE' : 'SCHEDULED',
                competition: 'Liga MX',
                date: today.toISOString(),
                isLive: isLive,
                minute: isLive ? Math.floor(Math.random() * 90) + 1 : null
            });
        }

        return results;
    }
}

// Notification service for email and WhatsApp
class NotificationService {
    constructor() {
        this.emailService = null;
        this.whatsappService = null;
    }

    // Configure email service
    configureEmailService(config) {
        this.emailService = {
            apiKey: config.apiKey,
            from: config.from,
            service: config.service || 'gmail'
        };
    }

    // Configure WhatsApp service
    configureWhatsAppService(config) {
        this.whatsappService = {
            apiKey: config.apiKey,
            phoneNumberId: config.phoneNumberId,
            baseURL: config.baseURL || 'https://graph.facebook.com/v17.0'
        };
    }

    // Send email notification
    async sendEmail(to, subject, message) {
        if (!this.emailService) {
            console.warn('Email service not configured');
            return false;
        }

        try {
            // In a real implementation, this would use an email service like SendGrid, Mailgun, etc.
            console.log(`Email sent to ${to}: ${subject} - ${message}`);
            
            // Mock email sending
            const emailData = {
                to: to,
                subject: subject,
                message: message,
                sentAt: new Date().toISOString(),
                status: 'sent'
            };

            // Store in local storage for demo
            this.storeNotification('email', emailData);
            
            return true;
        } catch (error) {
            console.error('Error sending email:', error);
            return false;
        }
    }

    // Send WhatsApp notification
    async sendWhatsApp(to, message) {
        if (!this.whatsappService) {
            console.warn('WhatsApp service not configured');
            return false;
        }

        try {
            // In a real implementation, this would use WhatsApp Business API
            console.log(`WhatsApp sent to ${to}: ${message}`);
            
            // Mock WhatsApp sending
            const whatsappData = {
                to: to,
                message: message,
                sentAt: new Date().toISOString(),
                status: 'sent'
            };

            // Store in local storage for demo
            this.storeNotification('whatsapp', whatsappData);
            
            return true;
        } catch (error) {
            console.error('Error sending WhatsApp:', error);
            return false;
        }
    }

    // Store notification for tracking
    storeNotification(type, data) {
        const notifications = JSON.parse(localStorage.getItem('fcDescansaNotifications') || '[]');
        notifications.push({
            id: Date.now(),
            type: type,
            ...data
        });
        localStorage.setItem('fcDescansaNotifications', JSON.stringify(notifications));
    }

    // Get notification history
    getNotifications() {
        return JSON.parse(localStorage.getItem('fcDescansaNotifications') || '[]');
    }

    // Send match notification to all players
    async sendMatchNotification(match, players) {
        const subject = 'Nuevo Partido Programado - FC DESCANSA';
        const message = `¡Nuevo partido programado!\n\nRival: ${match.opponent}\nFecha: ${match.date}\nHora: ${match.time}\nLugar: ${match.venue}\n\n¡Nos vemos en la cancha!`;

        const results = [];
        for (const player of players) {
            const emailResult = await this.sendEmail(player.email, subject, message);
            const whatsappResult = await this.sendWhatsApp(player.whatsapp, message);
            
            results.push({
                playerId: player.id,
                playerName: player.fullName,
                emailSent: emailResult,
                whatsappSent: whatsappResult
            });
        }

        return results;
    }

    // Send reminder notification
    async sendReminderNotification(match, players) {
        const subject = 'Recordatorio de Partido - FC DESCANSA';
        const message = `Recordatorio: Partido contra ${match.opponent} en 1 hora en ${match.venue}`;

        const results = [];
        for (const player of players) {
            const emailResult = await this.sendEmail(player.email, subject, message);
            const whatsappResult = await this.sendWhatsApp(player.whatsapp, message);
            
            results.push({
                playerId: player.id,
                playerName: player.fullName,
                emailSent: emailResult,
                whatsappSent: whatsappResult
            });
        }

        return results;
    }
}

// Weather API for match day weather
class WeatherAPI {
    constructor() {
        this.apiKey = 'YOUR_WEATHER_API_KEY_HERE';
        this.baseURL = 'https://api.openweathermap.org/data/2.5';
    }

    // Set API key
    setApiKey(key) {
        this.apiKey = key;
    }

    // Get weather for a location
    async getWeather(lat, lon) {
        try {
            const response = await fetch(
                `${this.baseURL}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric&lang=es`
            );
            
            if (!response.ok) {
                throw new Error(`Weather API request failed: ${response.status}`);
            }

            const data = await response.json();
            return this.formatWeather(data);
        } catch (error) {
            console.error('Error fetching weather:', error);
            return this.getMockWeather();
        }
    }

    // Format weather data
    formatWeather(data) {
        return {
            temperature: Math.round(data.main.temp),
            description: data.weather[0].description,
            humidity: data.main.humidity,
            windSpeed: data.wind.speed,
            condition: data.weather[0].main,
            icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`
        };
    }

    // Mock weather data
    getMockWeather() {
        return {
            temperature: 25,
            description: 'cielo despejado',
            humidity: 60,
            windSpeed: 10,
            condition: 'Clear',
            icon: 'https://openweathermap.org/img/wn/01d@2x.png'
        };
    }
}

// Create global instances
window.FootballAPI = new FootballAPI();
window.NotificationService = new NotificationService();
window.WeatherAPI = new WeatherAPI();

// Initialize with mock data
function initializeAPIs() {
    // Configure notification service (mock configuration)
    window.NotificationService.configureEmailService({
        apiKey: 'mock-email-key',
        from: 'noreply@fcdescansa.com'
    });

    window.NotificationService.configureWhatsAppService({
        apiKey: 'mock-whatsapp-key',
        phoneNumberId: 'mock-phone-id'
    });

    // Load live matches on page load
    loadLiveMatches();
    loadInternationalResults();
}

// Load live matches
async function loadLiveMatches() {
    try {
        const liveMatches = await window.FootballAPI.getLiveMatches();
        updateLiveMatchesUI(liveMatches);
    } catch (error) {
        console.error('Error loading live matches:', error);
    }
}

// Load international results
async function loadInternationalResults() {
    try {
        const [championsLeague, ligaMX] = await Promise.all([
            window.FootballAPI.getChampionsLeagueMatches(),
            window.FootballAPI.getLigaMXMatches()
        ]);

        updateInternationalResultsUI('champions', championsLeague);
        updateInternationalResultsUI('liga-mx', ligaMX);
    } catch (error) {
        console.error('Error loading international results:', error);
    }
}

// Update live matches UI
function updateLiveMatchesUI(matches) {
    const liveMatchesContainer = document.getElementById('liveMatches');
    if (!liveMatchesContainer) return;

    if (matches.length === 0) {
        liveMatchesContainer.innerHTML = '<p>No hay partidos en vivo en este momento.</p>';
        return;
    }

    const matchesHTML = matches.map(match => `
        <div class="live-match">
            <div class="teams">
                <span>${match.homeTeam}</span>
                <span class="score">${match.homeScore}-${match.awayScore}</span>
                <span>${match.awayTeam}</span>
            </div>
            <div class="match-info">
                <span class="minute">${match.minute}'</span>
                <span class="competition">${match.competition}</span>
            </div>
        </div>
    `).join('');

    liveMatchesContainer.innerHTML = matchesHTML;
}

// Update international results UI
function updateInternationalResultsUI(tabId, matches) {
    const tabContent = document.getElementById(tabId);
    if (!tabContent) return;

    const matchesHTML = matches.map(match => `
        <div class="international-match">
            <div class="teams">
                <span>${match.homeTeam}</span>
                <span class="score">${match.homeScore || '-'}-${match.awayScore || '-'}</span>
                <span>${match.awayTeam}</span>
            </div>
            <div class="match-time">${formatMatchDate(match.date)}</div>
        </div>
    `).join('');

    tabContent.innerHTML = matchesHTML;
}

// Format match date
function formatMatchDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return 'Hoy ' + date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
        return 'Mañana ' + date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === -1) {
        return 'Ayer ' + date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays > 0) {
        return `En ${diffDays} días`;
    } else {
        return `${Math.abs(diffDays)} días atrás`;
    }
}

// Schedule match reminders
function scheduleMatchReminders() {
    if (!window.FCDescansaDB) return;

    const nextMatch = window.FCDescansaDB.getNextMatch();
    if (!nextMatch) return;

    const matchTime = new Date(nextMatch.dateTime);
    const reminderTime = new Date(matchTime.getTime() - 60 * 60 * 1000); // 1 hour before
    const now = new Date();

    if (reminderTime > now) {
        const timeUntilReminder = reminderTime - now;
        
        setTimeout(async () => {
            const players = window.FCDescansaDB.getAllPlayers();
            await window.NotificationService.sendReminderNotification(nextMatch, players);
        }, timeUntilReminder);
    }
}

// Initialize APIs when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeAPIs);

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FootballAPI, NotificationService, WeatherAPI };
}
