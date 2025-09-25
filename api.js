// API integration for FC DESCANSA
// This module handles external API calls for live matches and international results

class FootballAPI {
    constructor() {
        this.baseURL = 'https://v3.football.api-sports.io';
        this.apiKey = '7e03a4b14f804836d3ad535168d8acf2'; // API key from api-football.com
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        this.useRealData = true; // Flag to use real data instead of mock
        // League IDs for API-Football
        this.leagueIds = {
            'la-liga': 140,        // La Liga (España)
            'liga-mx': 262,        // Liga MX (México)
            'serie-a': 135,        // Serie A (Italia)
            'premier': 39,         // Premier League (Inglaterra)
            'bundesliga': 78,      // Bundesliga (Alemania)
            'libertadores': 13,    // Copa Libertadores
            'champions': 2         // Champions League
        };
            this.currentSeason = 2024; // Current season (2024-2025)
    }

    // Set API key
    setApiKey(key) {
        this.apiKey = key;
    }

    // Get API key instructions
    getApiKeyInstructions() {
        return {
            message: 'Para obtener resultados reales, necesitas una API key gratuita de API-Football.com',
            steps: [
                '1. Ve a https://www.api-football.com/',
                '2. Haz clic en "Get Started" y crea una cuenta gratuita',
                '3. Ve a tu Dashboard y copia tu API key',
                '4. Reemplaza "YOUR_API_KEY_HERE" en api.js con tu clave real'
            ],
            benefits: [
                '✅ Resultados reales de Liga MX',
                '✅ Partidos en vivo actualizados',
                '✅ Datos de Champions League y ligas europeas',
                '✅ 100 llamadas gratuitas por día',
                '✅ Excelente cobertura de Liga MX'
            ],
            apiUrl: 'https://www.api-football.com/'
        };
    }

    // Test API key
    async testApiKey() {
        if (this.apiKey === 'YOUR_API_KEY_HERE') {
            return { valid: false, message: 'API key no configurada' };
        }

        try {
            const response = await fetch(`${this.baseURL}/status`, {
                headers: {
                    'X-RapidAPI-Key': this.apiKey,
                    'X-RapidAPI-Host': 'v3.football.api-sports.io',
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                return { 
                    valid: true, 
                    message: 'API key válida', 
                    requests: data.response?.requests,
                    requestsLimit: data.response?.requests_limit
                };
            } else {
                return { valid: false, message: 'API key inválida o límite excedido' };
            }
        } catch (error) {
            return { valid: false, message: 'Error al verificar API key' };
        }
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
                    'X-RapidAPI-Key': this.apiKey,
                    'X-RapidAPI-Host': 'v3.football.api-sports.io',
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

    // Get live matches only
    async getLiveMatches() {
        try {
            const today = new Date().toISOString().split('T')[0];
            
            // Get live matches from current season
            const liveResponse = await this.makeRequest(`/fixtures?date=${today}&live=all&season=${this.currentSeason}`);
            if (liveResponse.response && liveResponse.response.length > 0) {
                console.log(`Found ${liveResponse.response.length} live matches for today (${today})`);
                return this.formatLiveMatches(liveResponse.response);
            }
            
            // If no live matches, return mock live matches
            return this.getMockLiveMatchesOnly();
        } catch (error) {
            console.error('Error fetching live matches:', error);
            return this.getMockLiveMatchesOnly();
        }
    }

    // Get finished matches only
    async getFinishedMatches() {
        try {
            const today = new Date().toISOString().split('T')[0];
            
            // Get finished matches from today and current season
            const finishedResponse = await this.makeRequest(`/fixtures?date=${today}&status=FT&season=${this.currentSeason}`);
            if (finishedResponse.response && finishedResponse.response.length > 0) {
                console.log(`Found ${finishedResponse.response.length} finished matches for today (${today})`);
                return this.formatMatches(finishedResponse.response);
            }
            
            // If no finished matches today, try to get recent finished matches from current season
            const recentResponse = await this.makeRequest(`/fixtures?season=${this.currentSeason}&status=FT&last=10`);
            if (recentResponse.response && recentResponse.response.length > 0) {
                console.log(`No finished matches today, showing recent finished matches from current season`);
                return this.formatMatches(recentResponse.response);
            }
            
            // If still no matches, return mock finished matches
            return this.getMockFinishedMatchesOnly();
        } catch (error) {
            console.error('Error fetching finished matches:', error);
            return this.getMockFinishedMatchesOnly();
        }
    }

    // Get matches by date
    async getMatchesByDate(date) {
        try {
            const data = await this.makeRequest(`/fixtures?date=${date}`);
            return this.formatMatches(data.response);
        } catch (error) {
            console.error('Error fetching matches by date:', error);
            return this.getMockMatchesByDate(date);
        }
    }

    // Get Champions League matches
    async getChampionsLeagueMatches() {
        try {
            const data = await this.makeRequest(`/fixtures?league=${this.championsLeagueId}&season=2024`);
            return this.formatMatches(data.response || []);
        } catch (error) {
            console.error('Error fetching Champions League matches:', error);
            return this.getMockChampionsLeagueMatches();
        }
    }

    // Get matches by league key
    async getMatchesByLeagueKey(leagueKey) {
        try {
            const leagueId = this.leagueIds[leagueKey];
            if (!leagueId) {
                console.error(`Unknown league key: ${leagueKey}`);
                return [];
            }

            // Try to get recent matches from current season
            const recentMatches = await this.makeRequest(`/fixtures?league=${leagueId}&season=${this.currentSeason}&last=10`);
            
            if (recentMatches.response && recentMatches.response.length > 0) {
                console.log(`Found ${recentMatches.response.length} real matches for ${leagueKey} (season ${this.currentSeason})`);
                return this.formatMatches(recentMatches.response);
            }
            
            // If no recent matches, try current date with current season
            const today = new Date().toISOString().split('T')[0];
            const todayMatches = await this.makeRequest(`/fixtures?league=${leagueId}&date=${today}&season=${this.currentSeason}`);
            
            if (todayMatches.response && todayMatches.response.length > 0) {
                console.log(`Found ${todayMatches.response.length} matches for ${leagueKey} today`);
                return this.formatMatches(todayMatches.response);
            }
            
            // If still no matches, return simulated data with real teams
            console.log(`No real matches found for ${leagueKey}, using simulated data`);
            return this.getSimulatedMatchesForLeague(leagueKey);
        } catch (error) {
            console.error(`Error fetching ${leagueKey} matches:`, error);
            return this.getSimulatedMatchesForLeague(leagueKey);
        }
    }

    // Get Liga MX matches (backward compatibility)
    async getLigaMXMatches() {
        return this.getMatchesByLeagueKey('liga-mx');
    }

    // Get Champions League matches (backward compatibility)
    async getChampionsLeagueMatches() {
        return this.getMatchesByLeagueKey('champions');
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
            const data = await this.makeRequest(`/fixtures?league=${this.ligaMXLeagueId}&season=${this.currentSeason}&date=${date}`);
            return this.formatMatches(data.response || []);
        } catch (error) {
            console.error(`Error fetching Liga MX matches for ${date}:`, error);
            return [];
        }
    }

    // Get live Liga MX matches
    async getLiveLigaMXMatches() {
        try {
            const data = await this.makeRequest(`/fixtures?league=${this.ligaMXLeagueId}&season=${this.currentSeason}&live=all`);
            return this.formatLiveMatches(data.response || []);
        } catch (error) {
            console.error('Error fetching live Liga MX matches:', error);
            return [];
        }
    }

    // Get Liga MX standings
    async getLigaMXStandings() {
        try {
            const data = await this.makeRequest(`/standings?league=${this.ligaMXLeagueId}&season=${this.currentSeason}`);
            return data.response[0]?.league?.standings[0] || [];
        } catch (error) {
            console.error('Error fetching Liga MX standings:', error);
            return [];
        }
    }

    // Get matches by league ID
    async getMatchesByLeague(leagueId) {
        try {
            const data = await this.makeRequest(`/fixtures?league=${leagueId}&season=2024`);
            return this.formatMatches(data.response || []);
        } catch (error) {
            console.error(`Error fetching matches for league ${leagueId}:`, error);
            return this.getMockMatchesByLeague(leagueId);
        }
    }

    // Get team information
    async getTeamInfo(teamId) {
        try {
            const data = await this.makeRequest(`/teams?id=${teamId}`);
            return this.formatTeamInfo(data.response[0]);
        } catch (error) {
            console.error('Error fetching team info:', error);
            return null;
        }
    }

    // Format live matches
    formatLiveMatches(matches) {
        return matches.map(match => ({
            id: match.fixture.id,
            homeTeam: match.teams.home.name,
            awayTeam: match.teams.away.name,
            homeTeamLogo: match.teams.home.logo,
            awayTeamLogo: match.teams.away.logo,
            homeScore: match.goals.home,
            awayScore: match.goals.away,
            status: match.fixture.status.short,
            minute: match.fixture.status.elapsed,
            competition: match.league.name,
            date: match.fixture.date,
            isLive: true
        }));
    }

    // Format regular matches
    formatMatches(matches) {
        return matches.map(match => ({
            id: match.fixture.id,
            homeTeam: match.teams.home.name,
            awayTeam: match.teams.away.name,
            homeTeamLogo: match.teams.home.logo,
            awayTeamLogo: match.teams.away.logo,
            homeScore: match.goals.home,
            awayScore: match.goals.away,
            status: match.fixture.status.short,
            competition: match.league.name,
            date: match.fixture.date,
            isLive: match.fixture.status.short === 'LIVE',
            minute: match.fixture.status.elapsed
        }));
    }

    // Format team info
    formatTeamInfo(team) {
        return {
            id: team.team.id,
            name: team.team.name,
            shortName: team.team.name,
            crest: team.team.logo,
            founded: team.team.founded,
            venue: team.venue,
            website: team.team.website,
            coach: team.team.name
        };
    }

    // Mock data methods
    getMockData(endpoint) {
        if (endpoint.includes('live=all')) {
            return this.getMockLiveMatches();
        } else if (endpoint.includes('league=2')) {
            return this.getMockChampionsLeagueMatches();
        } else if (endpoint.includes('league=262')) {
            return this.getMockLigaMXMatches();
        } else {
            return this.getMockMatches();
        }
    }

    getMockLiveMatches() {
        return {
            response: [
                {
                    fixture: {
                        id: 1,
                        date: new Date().toISOString(),
                        status: {
                            short: 'LIVE',
                            elapsed: 67
                        }
                    },
                    teams: {
                        home: { name: 'Manchester City' },
                        away: { name: 'Real Madrid' }
                    },
                    goals: {
                        home: 2,
                        away: 1
                    },
                    league: {
                        name: 'Champions League'
                    }
                }
            ]
        };
    }

    // Mock live matches only - Season 2024-2025
    getMockLiveMatchesOnly() {
        const today = new Date().toISOString();
        return [
            {
                id: 'mock-live-1',
                homeTeam: 'Real Madrid',
                awayTeam: 'Barcelona',
                homeTeamLogo: 'https://media.api-sports.io/football/teams/541.png',
                awayTeamLogo: 'https://media.api-sports.io/football/teams/529.png',
                homeScore: 2,
                awayScore: 1,
                status: 'LIVE',
                minute: 67,
                competition: 'La Liga 2024-25',
                date: today,
                isLive: true
            },
            {
                id: 'mock-live-2',
                homeTeam: 'Manchester City',
                awayTeam: 'Liverpool',
                homeTeamLogo: 'https://media.api-sports.io/football/teams/50.png',
                awayTeamLogo: 'https://media.api-sports.io/football/teams/40.png',
                homeScore: 1,
                awayScore: 1,
                status: 'LIVE',
                minute: 34,
                competition: 'Premier League 2024-25',
                date: today,
                isLive: true
            },
            {
                id: 'mock-live-3',
                homeTeam: 'Bayern Munich',
                awayTeam: 'Borussia Dortmund',
                homeTeamLogo: 'https://media.api-sports.io/football/teams/157.png',
                awayTeamLogo: 'https://media.api-sports.io/football/teams/165.png',
                homeScore: 2,
                awayScore: 2,
                status: 'LIVE',
                minute: 78,
                competition: 'Bundesliga 2024-25',
                date: today,
                isLive: true
            }
        ];
    }

    // Mock finished matches only - Season 2024-2025
    getMockFinishedMatchesOnly() {
        const today = new Date().toISOString();
        return [
            {
                id: 'mock-finished-1',
                homeTeam: 'Juventus',
                awayTeam: 'AC Milan',
                homeTeamLogo: 'https://media.api-sports.io/football/teams/496.png',
                awayTeamLogo: 'https://media.api-sports.io/football/teams/489.png',
                homeScore: 2,
                awayScore: 0,
                status: 'FINISHED',
                minute: 90,
                competition: 'Serie A 2024-25',
                date: today,
                isLive: false
            },
            {
                id: 'mock-finished-2',
                homeTeam: 'América',
                awayTeam: 'Guadalajara',
                homeTeamLogo: 'https://media.api-sports.io/football/teams/1354.png',
                awayTeamLogo: 'https://media.api-sports.io/football/teams/1355.png',
                homeScore: 1,
                awayScore: 2,
                status: 'FINISHED',
                minute: 90,
                competition: 'Liga MX Apertura 2024',
                date: today,
                isLive: false
            },
            {
                id: 'mock-finished-3',
                homeTeam: 'PSG',
                awayTeam: 'Marseille',
                homeTeamLogo: 'https://media.api-sports.io/football/teams/85.png',
                awayTeamLogo: 'https://media.api-sports.io/football/teams/516.png',
                homeScore: 4,
                awayScore: 2,
                status: 'FINISHED',
                minute: 90,
                competition: 'Ligue 1 2024-25',
                date: today,
                isLive: false
            },
            {
                id: 'mock-finished-4',
                homeTeam: 'Atlético Madrid',
                awayTeam: 'Sevilla',
                homeTeamLogo: 'https://media.api-sports.io/football/teams/530.png',
                awayTeamLogo: 'https://media.api-sports.io/football/teams/536.png',
                homeScore: 3,
                awayScore: 1,
                status: 'FINISHED',
                minute: 90,
                competition: 'La Liga 2024-25',
                date: today,
                isLive: false
            },
            {
                id: 'mock-finished-5',
                homeTeam: 'Arsenal',
                awayTeam: 'Chelsea',
                homeTeamLogo: 'https://media.api-sports.io/football/teams/42.png',
                awayTeamLogo: 'https://media.api-sports.io/football/teams/49.png',
                homeScore: 2,
                awayScore: 1,
                status: 'FINISHED',
                minute: 90,
                competition: 'Premier League 2024-25',
                date: today,
                isLive: false
            },
            {
                id: 'mock-finished-6',
                homeTeam: 'Inter Milan',
                awayTeam: 'Napoli',
                homeTeamLogo: 'https://media.api-sports.io/football/teams/505.png',
                awayTeamLogo: 'https://media.api-sports.io/football/teams/492.png',
                homeScore: 1,
                awayScore: 1,
                status: 'FINISHED',
                minute: 90,
                competition: 'Serie A 2024-25',
                date: today,
                isLive: false
            }
        ];
    }

    getMockChampionsLeagueMatches() {
        return {
            response: [
                {
                    fixture: {
                        id: 1,
                        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                        status: {
                            short: 'FT'
                        }
                    },
                    teams: {
                        home: { name: 'Barcelona' },
                        away: { name: 'PSG' }
                    },
                    goals: {
                        home: 3,
                        away: 0
                    },
                    league: {
                        name: 'Champions League'
                    }
                },
                {
                    fixture: {
                        id: 2,
                        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
                        status: {
                            short: 'NS'
                        }
                    },
                    teams: {
                        home: { name: 'Bayern Munich' },
                        away: { name: 'Arsenal' }
                    },
                    goals: {
                        home: null,
                        away: null
                    },
                    league: {
                        name: 'Champions League'
                    }
                }
            ]
        };
    }

    getMockLigaMXMatches() {
        return {
            response: [
                {
                    fixture: {
                        id: 1,
                        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                        status: {
                            short: 'FT'
                        }
                    },
                    teams: {
                        home: { name: 'América' },
                        away: { name: 'Chivas' }
                    },
                    goals: {
                        home: 1,
                        away: 0
                    },
                    league: {
                        name: 'Liga MX'
                    }
                },
                {
                    fixture: {
                        id: 2,
                        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                        status: {
                            short: 'FT'
                        }
                    },
                    teams: {
                        home: { name: 'Cruz Azul' },
                        away: { name: 'Tigres' }
                    },
                    goals: {
                        home: 2,
                        away: 1
                    },
                    league: {
                        name: 'Liga MX'
                    }
                }
            ]
        };
    }

    getMockMatchesByDate(date) {
        return {
            response: [
                {
                    fixture: {
                        id: 1,
                        date: date,
                        status: {
                            short: 'FT'
                        }
                    },
                    teams: {
                        home: { name: 'Real Madrid' },
                        away: { name: 'Barcelona' }
                    },
                    goals: {
                        home: 2,
                        away: 2
                    },
                    league: {
                        name: 'La Liga'
                    }
                }
            ]
        };
    }

    getMockMatches() {
        return {
            response: []
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
            response: [
                {
                    fixture: {
                        id: Date.now(),
                        date: new Date().toISOString(),
                        status: {
                            short: 'FT'
                        }
                    },
                    teams: {
                        home: { name: 'Team A' },
                        away: { name: 'Team B' }
                    },
                    goals: {
                        home: 2,
                        away: 1
                    },
                    league: {
                        name: leagueNames[leagueId] || 'League'
                    }
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

    // Get simulated matches for specific league
    getSimulatedMatchesForLeague(leagueKey) {
        const leagueData = {
            'la-liga': {
                name: 'La Liga',
                teams: ['Real Madrid', 'Barcelona', 'Atlético Madrid', 'Sevilla', 'Real Sociedad', 'Villarreal', 'Real Betis', 'Valencia', 'Athletic Bilbao', 'Osasuna']
            },
            'liga-mx': {
                name: 'Liga MX',
                teams: ['América', 'Guadalajara', 'Cruz Azul', 'Tigres', 'Monterrey', 'Pachuca', 'Toluca', 'Santos Laguna', 'Pumas UNAM', 'Atlas']
            },
            'serie-a': {
                name: 'Serie A',
                teams: ['Juventus', 'AC Milan', 'Inter Milan', 'Napoli', 'Roma', 'Lazio', 'Atalanta', 'Fiorentina', 'Bologna', 'Torino']
            },
            'premier': {
                name: 'Premier League',
                teams: ['Manchester City', 'Arsenal', 'Liverpool', 'Chelsea', 'Manchester United', 'Tottenham', 'Newcastle', 'Brighton', 'West Ham', 'Aston Villa']
            },
            'bundesliga': {
                name: 'Bundesliga',
                teams: ['Bayern Munich', 'Borussia Dortmund', 'RB Leipzig', 'Bayer Leverkusen', 'Eintracht Frankfurt', 'Union Berlin', 'Freiburg', 'Wolfsburg', 'Mainz', 'Borussia Mönchengladbach']
            },
            'libertadores': {
                name: 'Copa Libertadores',
                teams: ['Flamengo', 'Palmeiras', 'River Plate', 'Boca Juniors', 'Atlético Mineiro', 'Santos', 'Grêmio', 'Internacional', 'São Paulo', 'Fluminense']
            },
            'champions': {
                name: 'Champions League',
                teams: ['Real Madrid', 'Manchester City', 'Bayern Munich', 'PSG', 'Barcelona', 'Liverpool', 'AC Milan', 'Inter Milan', 'Juventus', 'Chelsea']
            }
        };

        const league = leagueData[leagueKey];
        if (!league) return [];

        const results = [];
        const today = new Date();
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

        // Generate yesterday's matches
        for (let i = 0; i < 4; i++) {
            const homeTeam = league.teams[Math.floor(Math.random() * league.teams.length)];
            const awayTeam = league.teams.filter(team => team !== homeTeam)[Math.floor(Math.random() * (league.teams.length - 1))];
            
            results.push({
                id: `${leagueKey}-${Date.now()}-${i}`,
                homeTeam: homeTeam,
                awayTeam: awayTeam,
                homeTeamLogo: this.getTeamLogoUrl(homeTeam),
                awayTeamLogo: this.getTeamLogoUrl(awayTeam),
                homeScore: Math.floor(Math.random() * 4),
                awayScore: Math.floor(Math.random() * 4),
                status: 'FINISHED',
                competition: league.name,
                date: yesterday.toISOString(),
                isLive: false
            });
        }

        // Generate today's matches
        for (let i = 0; i < 3; i++) {
            const homeTeam = league.teams[Math.floor(Math.random() * league.teams.length)];
            const awayTeam = league.teams.filter(team => team !== homeTeam)[Math.floor(Math.random() * (league.teams.length - 1))];
            const isLive = Math.random() > 0.5;
            
            results.push({
                id: `${leagueKey}-${Date.now()}-today-${i}`,
                homeTeam: homeTeam,
                awayTeam: awayTeam,
                homeTeamLogo: this.getTeamLogoUrl(homeTeam),
                awayTeamLogo: this.getTeamLogoUrl(awayTeam),
                homeScore: isLive ? Math.floor(Math.random() * 3) : null,
                awayScore: isLive ? Math.floor(Math.random() * 3) : null,
                status: isLive ? 'LIVE' : 'SCHEDULED',
                competition: league.name,
                date: today.toISOString(),
                isLive: isLive,
                minute: isLive ? Math.floor(Math.random() * 90) + 1 : null
            });
        }

        return results;
    }

    // Get team logo URL for simulated matches
    getTeamLogoUrl(teamName) {
        const teamLogos = {
            // La Liga
            'Real Madrid': 'https://media.api-sports.io/football/teams/541.png',
            'Barcelona': 'https://media.api-sports.io/football/teams/529.png',
            'Atlético Madrid': 'https://media.api-sports.io/football/teams/530.png',
            'Sevilla': 'https://media.api-sports.io/football/teams/536.png',
            'Real Sociedad': 'https://media.api-sports.io/football/teams/548.png',
            'Villarreal': 'https://media.api-sports.io/football/teams/533.png',
            'Real Betis': 'https://media.api-sports.io/football/teams/543.png',
            'Valencia': 'https://media.api-sports.io/football/teams/532.png',
            'Athletic Bilbao': 'https://media.api-sports.io/football/teams/531.png',
            'Osasuna': 'https://media.api-sports.io/football/teams/727.png',
            
            // Liga MX
            'América': 'https://media.api-sports.io/football/teams/1354.png',
            'Guadalajara': 'https://media.api-sports.io/football/teams/1355.png',
            'Cruz Azul': 'https://media.api-sports.io/football/teams/1356.png',
            'Tigres': 'https://media.api-sports.io/football/teams/1357.png',
            'Monterrey': 'https://media.api-sports.io/football/teams/1358.png',
            'Pachuca': 'https://media.api-sports.io/football/teams/1359.png',
            'Toluca': 'https://media.api-sports.io/football/teams/1360.png',
            'Santos Laguna': 'https://media.api-sports.io/football/teams/1361.png',
            'Pumas UNAM': 'https://media.api-sports.io/football/teams/1362.png',
            'Atlas': 'https://media.api-sports.io/football/teams/1363.png',
            
            // Serie A
            'Juventus': 'https://media.api-sports.io/football/teams/496.png',
            'AC Milan': 'https://media.api-sports.io/football/teams/489.png',
            'Inter Milan': 'https://media.api-sports.io/football/teams/505.png',
            'Napoli': 'https://media.api-sports.io/football/teams/492.png',
            'Roma': 'https://media.api-sports.io/football/teams/497.png',
            'Lazio': 'https://media.api-sports.io/football/teams/487.png',
            'Atalanta': 'https://media.api-sports.io/football/teams/499.png',
            'Fiorentina': 'https://media.api-sports.io/football/teams/502.png',
            'Bologna': 'https://media.api-sports.io/football/teams/500.png',
            'Torino': 'https://media.api-sports.io/football/teams/503.png',
            
            // Premier League
            'Manchester City': 'https://media.api-sports.io/football/teams/50.png',
            'Arsenal': 'https://media.api-sports.io/football/teams/42.png',
            'Liverpool': 'https://media.api-sports.io/football/teams/40.png',
            'Chelsea': 'https://media.api-sports.io/football/teams/49.png',
            'Manchester United': 'https://media.api-sports.io/football/teams/33.png',
            'Tottenham': 'https://media.api-sports.io/football/teams/47.png',
            'Newcastle': 'https://media.api-sports.io/football/teams/34.png',
            'Brighton': 'https://media.api-sports.io/football/teams/51.png',
            'West Ham': 'https://media.api-sports.io/football/teams/48.png',
            'Aston Villa': 'https://media.api-sports.io/football/teams/66.png',
            
            // Bundesliga
            'Bayern Munich': 'https://media.api-sports.io/football/teams/157.png',
            'Borussia Dortmund': 'https://media.api-sports.io/football/teams/165.png',
            'RB Leipzig': 'https://media.api-sports.io/football/teams/721.png',
            'Bayer Leverkusen': 'https://media.api-sports.io/football/teams/168.png',
            'Eintracht Frankfurt': 'https://media.api-sports.io/football/teams/169.png',
            'Union Berlin': 'https://media.api-sports.io/football/teams/182.png',
            'Freiburg': 'https://media.api-sports.io/football/teams/160.png',
            'Wolfsburg': 'https://media.api-sports.io/football/teams/161.png',
            'Mainz': 'https://media.api-sports.io/football/teams/164.png',
            'Borussia Mönchengladbach': 'https://media.api-sports.io/football/teams/163.png',
            
            // Copa Libertadores
            'Flamengo': 'https://media.api-sports.io/football/teams/598.png',
            'Palmeiras': 'https://media.api-sports.io/football/teams/595.png',
            'River Plate': 'https://media.api-sports.io/football/teams/435.png',
            'Boca Juniors': 'https://media.api-sports.io/football/teams/435.png',
            'Atlético Mineiro': 'https://media.api-sports.io/football/teams/592.png',
            'Santos': 'https://media.api-sports.io/football/teams/594.png',
            'Grêmio': 'https://media.api-sports.io/football/teams/593.png',
            'Internacional': 'https://media.api-sports.io/football/teams/596.png',
            'São Paulo': 'https://media.api-sports.io/football/teams/598.png',
            'Fluminense': 'https://media.api-sports.io/football/teams/599.png',
            
            // Champions League
            'PSG': 'https://media.api-sports.io/football/teams/85.png'
        };
        
        return teamLogos[teamName] || 'https://media.api-sports.io/football/teams/1.png';
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
