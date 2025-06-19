import requests
import re

# Replace with the actual game Universe ID (not place ID)
GAME_UNIVERSE_ID = "7709344486"  # Steal a Brainrot

def get_game_data(universe_id):
    url = f"https://games.roblox.com/v1/games?universeIds={universe_id}"
    response = requests.get(url)

    if response.status_code == 200:
        data = response.json()
        game_data = data['data'][0]
        description = game_data['description']
        current_likes = game_data['favoritedCount']
        return description, current_likes
    else:
        raise Exception(f"Failed to fetch game data: {response.status_code}")

def extract_milestone(description):
    # Updated pattern to match "Next Guaranteed Brainrot God Spawns at:"
    match = re.search(r"Next Guaranteed Brainrot God Spawns at: ([\d,]+) LIKES", description)
    if match:
        likes_text = match.group(1).replace(",", "")
        return int(likes_text)
    return None

# --- MAIN ---
try:
    description, current_likes = get_game_data(GAME_UNIVERSE_ID)
    milestone = extract_milestone(description)

    if milestone:
        likes_needed = milestone - current_likes
        if likes_needed > 0:
            print(f"{likes_needed:,} likes needed to reach milestone ({current_likes:,}/{milestone:,})")
        else:
            print(f"✅ Milestone reached! Current likes: {current_likes:,} (Target: {milestone:,})")
    else:
        print("❌ Milestone not found in the description.")

except Exception as e:
    print(f"Error: {e}")