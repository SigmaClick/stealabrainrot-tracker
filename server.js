const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000; // Changed this line for Render

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve static files from public directory

const GAME_UNIVERSE_ID = "7709344486";

// Function to extract milestone from description
function extractMilestone(description) {
    const match = description.match(/Next Guaranteed Brainrot God Spawns at: ([\d,]+) LIKES/);
    if (match) {
        return parseInt(match[1].replace(/,/g, ''));
    }
    return null;
}

// API endpoint to get game data
app.get('/api/game-data', async (req, res) => {
    try {
        const fetch = (await import('node-fetch')).default;
        
        // First, get the game info
        const gameResponse = await fetch(`https://games.roblox.com/v1/games?universeIds=${GAME_UNIVERSE_ID}`);
        
        if (!gameResponse.ok) {
            throw new Error(`HTTP error! status: ${gameResponse.status}`);
        }
        
        const gameData = await gameResponse.json();
        const game = gameData.data[0];
        
        if (!game) {
            throw new Error('Game not found');
        }
        
        const description = game.description;
        
        // Now get the voting data using the universe ID
        const votingResponse = await fetch(`https://games.roblox.com/v1/games/votes?universeIds=${GAME_UNIVERSE_ID}`);
        
        if (!votingResponse.ok) {
            throw new Error(`HTTP error getting votes! status: ${votingResponse.status}`);
        }
        
        const votingData = await votingResponse.json();
        const gameVotes = votingData.data[0];
        
        if (!gameVotes) {
            throw new Error('Voting data not found');
        }
        
        const currentLikes = gameVotes.upVotes;
        const milestone = extractMilestone(description);
        
        if (!milestone) {
            throw new Error('Milestone not found in game description');
        }
        
        const likesNeeded = Math.max(0, milestone - currentLikes);
        const progressPercent = Math.min(100, (currentLikes / milestone) * 100);
        
        res.json({
            success: true,
            data: {
                currentLikes,
                milestone,
                likesNeeded,
                progressPercent: Math.round(progressPercent * 10) / 10, // Round to 1 decimal
                milestoneReached: likesNeeded === 0
            }
        });
        
    } catch (error) {
        console.error('Error fetching game data:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Tracking Roblox game: ${GAME_UNIVERSE_ID}`);
});