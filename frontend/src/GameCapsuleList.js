// GameCapsuleList.js
import React, { useEffect, useState } from 'react';
import GameCapsule from "./ui/GameCapsule";

export default function GameCapsuleList() {
    const [games, setGames] = useState([]);
    const apiUrl = process.env.REACT_APP_API_BASE_URL;

    useEffect(() => {
        async function fetchGames() {
            try {
                const res = await fetch(`${apiUrl}/games`);
                const data = await res.json();
                // If the API returns { games: [...] }, unwrap it, otherwise assume the array itself
                const list = Array.isArray(data)
                    ? data
                    : Array.isArray(data.games)
                        ? data.games
                        : [];
                setGames(list);
            } catch (err) {
                console.error('Failed to fetch games:', err);
                setGames([]);
            }
        }
        fetchGames();
    }, [apiUrl]);

    if (!Array.isArray(games)) {
        console.warn('Expected games array but got:', games);
        return null;
    }

    return (
        <div className="game-capsule-list">
            {games.length === 0 && <p>No games found.</p>}
            {games.map(game => (
                <GameCapsule key={game.appid} game={game} />
            ))}
        </div>
    );
}
