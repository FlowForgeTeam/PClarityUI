const fs = require('fs');
const path = require('path');

// Adjust this path to match your Sessions_data folder location
const SESSIONS_DATA_PATH = path.join(process.cwd(), 'Sessions_data');

class SessionDataService {
    constructor() {
        this.sessionsCache = new Map();
        this.lastCacheUpdate = 0;
        this.cacheExpiry = 30000; // 30 seconds
    }

    // Convert Windows path to filename format (same as C++ function)
    convertPathToWindowsFilename(pathToBeChanged) {
        if (!pathToBeChanged) return '';
        
        return pathToBeChanged
            .replace(/\\/g, '-')  // \ to -
            .replace(/:/g, '~');  // : to ~
    }

    // Find session file for a given app path
    findSessionFileForApp(appPath) {
        if (!appPath) return null;
        
        const convertedName = this.convertPathToWindowsFilename(appPath);
        const possibleExtensions = ['.csv', '.json'];
        
        for (const ext of possibleExtensions) {
            const fileName = convertedName + ext;
            const fullPath = path.join(SESSIONS_DATA_PATH, fileName);
            
            if (fs.existsSync(fullPath)) {
                return { fileName, fullPath, extension: ext };
            }
        }
        
        return null;
    }

    // Parse session file based on extension
    parseSessionFile(filePath, extension) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            
            if (extension === '.json') {
                return JSON.parse(content);
            } else if (extension === '.csv') {
                // Parse your specific CSV format:
                // duration_in_seconds, start_time_in_seconds_since_unix_epoch, end_time_in_seconds_since_unix_epoch
                const lines = content.trim().split('\n');
                const sessions = [];
                
                // Skip header line and process data
                for (let i = 1; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (!line) continue;
                    
                    const values = line.split(',').map(v => v.trim());
                    
                    if (values.length >= 3) {
                        const duration = parseInt(values[0]);
                        const startTime = parseInt(values[1]);
                        const endTime = parseInt(values[2]);
                        
                        // Validate the data
                        if (!isNaN(duration) && !isNaN(startTime) && !isNaN(endTime)) {
                            sessions.push({
                                duration_in_seconds: duration,
                                start_time: startTime,
                                end_time: endTime,
                                app_name: this.extractAppNameFromFilename(filePath)
                            });
                        }
                    }
                }
                
                return sessions;
            }
            
            return [];
        } catch (error) {
            console.error(`Error parsing session file ${filePath}:`, error);
            return [];
        }
    }

    // Extract app name from the encoded filename
    extractAppNameFromFilename(filePath) {
        try {
            const fileName = path.basename(filePath, path.extname(filePath));
            
            // For filename like "C~-Program Files-Google-Chrome-Application-chrome.exe"
            // Extract the last meaningful part
            const parts = fileName.split('-');
            
            if (parts.length > 0) {
                // Get the last part and clean it up
                let appName = parts[parts.length - 1];
                
                // Remove .exe if present
                appName = appName.replace(/\.exe$/i, '');
                
                // Capitalize first letter
                appName = appName.charAt(0).toUpperCase() + appName.slice(1);
                
                return appName;
            }
            
            return 'Unknown App';
        } catch (error) {
            console.error('Error extracting app name from filename:', error);
            return 'Unknown App';
        }
    }

    async getDashboardData() {
        try {
            await this.updateSessionsCache();
            
            const allSessions = Array.from(this.sessionsCache.values()).flat();
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            return {
                weeklyUsage: this.getWeeklyUsage(allSessions),
                todayStats: this.getTodayStats(allSessions, today),
                totalStats: this.getTotalStats(allSessions),
                peakHours: this.getPeakHours(allSessions, today),
                mostUsedToday: this.getMostUsedToday(allSessions, today),
                trackedAppsCount: this.sessionsCache.size
            };
        } catch (error) {
            console.error('Error getting dashboard data:', error);
            return this.getEmptyDashboardData();
        }
    }

    async updateSessionsCache() {
        const now = Date.now();
        if (now - this.lastCacheUpdate < this.cacheExpiry) {
            return; // Cache is still fresh
        }

        try {
            if (!fs.existsSync(SESSIONS_DATA_PATH)) {
                console.warn('Sessions data folder not found:', SESSIONS_DATA_PATH);
                return;
            }

            const files = fs.readdirSync(SESSIONS_DATA_PATH);
            this.sessionsCache.clear();

            for (const file of files) {
                if (file.endsWith('.json') || file.endsWith('.csv')) {
                    const filePath = path.join(SESSIONS_DATA_PATH, file);
                    const extension = path.extname(file);
                    const appName = file.replace(extension, '');
                    
                    try {
                        const sessions = this.parseSessionFile(filePath, extension);
                        this.sessionsCache.set(appName, sessions);
                    } catch (fileError) {
                        console.error(`Error reading session file ${file}:`, fileError);
                    }
                }
            }

            this.lastCacheUpdate = now;
            console.log(`Loaded session data for ${this.sessionsCache.size} apps`);
        } catch (error) {
            console.error('Error updating sessions cache:', error);
        }
    }

    getWeeklyUsage(sessions) {
        const weekData = {};
        const today = new Date();
        
        // Last 7 days
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            weekData[dateStr] = 0;
        }

        sessions.forEach(session => {
            if (session.start_time && session.end_time) {
                const sessionDate = new Date(session.start_time * 1000);
                const dateStr = sessionDate.toISOString().split('T')[0];
                
                if (dateStr in weekData) {
                    const duration = (session.end_time - session.start_time) / 3600; // hours
                    weekData[dateStr] += duration;
                }
            }
        });

        return Object.entries(weekData).map(([date, hours]) => ({
            date,
            hours: Math.round(hours * 10) / 10 // Round to 1 decimal
        }));
    }

    getTodayStats(sessions, today) {
        const todayStart = today.getTime() / 1000;
        const todayEnd = todayStart + 24 * 3600;
        
        let totalSeconds = 0;
        
        sessions.forEach(session => {
            if (session.start_time && session.end_time &&
                session.start_time < todayEnd && session.end_time > todayStart) {
                
                const sessionStart = Math.max(session.start_time, todayStart);
                const sessionEnd = Math.min(session.end_time, todayEnd);
                totalSeconds += (sessionEnd - sessionStart);
            }
        });

        return {
            totalSeconds,
            formatted: this.formatDuration(totalSeconds)
        };
    }

    getTotalStats(sessions) {
        let totalSeconds = 0;
        let totalSessions = 0;
        const dayUsage = {};

        sessions.forEach(session => {
            if (session.start_time && session.end_time) {
                const duration = session.end_time - session.start_time;
                totalSeconds += duration;
                totalSessions++;

                const date = new Date(session.start_time * 1000).toISOString().split('T')[0];
                dayUsage[date] = (dayUsage[date] || 0) + duration;
            }
        });

        const uniqueDays = Object.keys(dayUsage).length;
        const averagePerDay = uniqueDays > 0 ? totalSeconds / uniqueDays : 0;

        return {
            totalTime: this.formatDuration(totalSeconds),
            averagePerDay: this.formatDuration(averagePerDay),
            totalSessions,
            uniqueDays
        };
    }

    getPeakHours(sessions, today) {
        const hourUsage = new Array(24).fill(0);
        const todayStart = today.getTime() / 1000;
        const todayEnd = todayStart + 24 * 3600;

        sessions.forEach(session => {
            if (session.start_time && session.end_time &&
                session.start_time < todayEnd && session.end_time > todayStart) {
                
                const sessionStart = Math.max(session.start_time, todayStart);
                const sessionEnd = Math.min(session.end_time, todayEnd);
                
                for (let time = sessionStart; time < sessionEnd; time += 3600) {
                    const hour = new Date(time * 1000).getHours();
                    const hourEnd = Math.min(time + 3600, sessionEnd);
                    hourUsage[hour] += (hourEnd - time) / 3600;
                }
            }
        });

        const peakHour = hourUsage.indexOf(Math.max(...hourUsage));
        const peakValue = Math.max(...hourUsage);
        
        return {
            peakHour,
            peakValue,
            hourlyData: hourUsage.map((usage, hour) => ({
                hour,
                usage: Math.round(usage * 100) / 100
            }))
        };
    }

    getMostUsedToday(sessions, today) {
        const todayStart = today.getTime() / 1000;
        const todayEnd = todayStart + 24 * 3600;
        const appUsage = {};

        sessions.forEach(session => {
            if (session.start_time && session.end_time &&
                session.start_time < todayEnd && session.end_time > todayStart) {
                
                const appName = session.app_name || 'Unknown';
                const sessionStart = Math.max(session.start_time, todayStart);
                const sessionEnd = Math.min(session.end_time, todayEnd);
                
                appUsage[appName] = (appUsage[appName] || 0) + (sessionEnd - sessionStart);
            }
        });

        const mostUsed = Object.entries(appUsage)
            .sort(([,a], [,b]) => b - a)[0];

        if (mostUsed) {
            return {
                appName: mostUsed[0],
                duration: this.formatDuration(mostUsed[1])
            };
        }

        return {
            appName: 'No apps',
            duration: '0m'
        };
    }

    formatDuration(seconds) {
        if (seconds < 60) {
            return `${Math.round(seconds)}s`;
        }
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        
        return `${minutes}m`;
    }

    getEmptyDashboardData() {
        return {
            weeklyUsage: [],
            todayStats: { totalSeconds: 0, formatted: '0m' },
            totalStats: {
                totalTime: '0m',
                averagePerDay: '0m',
                totalSessions: 0,
                uniqueDays: 0
            },
            peakHours: {
                peakHour: 12,
                peakValue: 0,
                hourlyData: []
            },
            mostUsedToday: {
                appName: 'No apps',
                duration: '0m'
            },
            trackedAppsCount: 0
        };
    }
}

const sessionDataService = new SessionDataService();

module.exports = sessionDataService;