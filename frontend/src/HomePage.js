import React, { useEffect, useState } from "react";
import axios from "axios";
import GameCapsuleList from "./GameCapsuleList";
import apiRoutes from "./apiRoutes";

export default function HomePage({ searchQuery }) {
    const [user, setUser]     = useState(null);
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        axios
            .get(apiRoutes.getUser, { withCredentials: true })
            .then(res => {
                setUser(res.data);
            })
            .catch(() => {
                setUser(null);
            })
            .finally(() => {
                setChecked(true);
            });
    }, []);

    // 1) still waiting on the /api/me check?
    if (!checked) {
        return <p>Loading…</p>;
    }

    // 2) checked AND no user → prompt login
    if (!user) {
        return (
            <p style={{ fontStyle: "italic", color: "#777", textAlign: "center" }}>
                Please log in to view your game library.
            </p>
        );
    }

    // 3) we have a user → show games
    return <GameCapsuleList searchQuery={searchQuery} />;
}