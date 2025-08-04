import fs from "fs";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { URL } from "url";

dotenv.config();

// Build pool config: prefer MYSQL_URL in production, else fallback to DB_* vars in .env
const connectionString = process.env.MYSQL_URL;
let poolConfig;

if (connectionString && connectionString.startsWith("mysql://")) {
    // Production: parse Railway's single URL
    const dbUrl = new URL(connectionString);
    poolConfig = {
        host: dbUrl.hostname,
        port: Number(dbUrl.port),
        user: dbUrl.username,
        password: dbUrl.password,
        database: dbUrl.pathname.replace(/^\//, ""),
        waitForConnections: true,
        connectionLimit: 10,
    };
} else {
    // Development fallback: read individual DB_* vars
    const { DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME } = process.env;
    if (!DB_USER || !DB_PASS) {
        throw new Error("Missing local DB_USER/DB_PASS in .env");
    }
    poolConfig = {
        host: DB_HOST,
        port: Number(DB_PORT),
        user: DB_USER,
        password: DB_PASS,
        database: DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
    };
}

// Export a connection pool
export const pool = mysql.createPool(poolConfig);

/**
 * Run init.sql statements on startup to ensure schema exists.
 * Splits on ';', trims whitespace, and skips comments (#).
 */
export async function initSchema(sqlFilePath) {
    const connection = await mysql.createConnection(poolConfig);
    const sql = fs.readFileSync(sqlFilePath, "utf8");
    const statements = sql
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length && !stmt.startsWith('#'));

    for (const stmt of statements) {
        await connection.query(stmt);
    }

    await connection.end();
}

/* Ensure a user row exists. */
export async function ensureUser(conn, steamID, displayName) {
  await conn.query(
    ` INSERT IGNORE INTO users (steam_id, display_name)
        VALUES (?, ?)`,
    [steamID, displayName || null]
  );
}

/* Upsert a game record. */
export async function upsertGame(conn, { appid, title, imageUrl, category }) {
  await conn.query(
    ` INSERT INTO games (appid, title, image_url, category)
        VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        title     = VALUES(title),
        image_url = VALUES(image_url),
        category  = VALUES(category)`,
    [appid, title, imageUrl, category]
  );
}

/* Link a user to a game. */
export async function linkUserGame(conn, steamID, appid) {
  await conn.query(
    ` INSERT IGNORE INTO user_games (steam_id, appid)
        VALUES (?, ?)`,
    [steamID, appid]
  );
}

/* Get all games for a user. */
export async function getUserGames(pool, steamID) {
  const [rows] = await pool.query(
    ` SELECT
        g.appid,
        g.title,
        g.image_url AS imageUrl,
        g.category
      FROM games g
      JOIN user_games ug ON ug.appid = g.appid
      WHERE ug.steam_id = ?`,
    [steamID]
  );
  return rows;
}

/* Update a user's Steam profile fields. */
export async function upsertUserProfile(
  conn,
  steamID,
  { personaname, avatar, profileurl }
) {
  await conn.query(
    ` UPDATE users
        SET persona_name = ?,
            avatar       = ?,
            profile_url  = ?
      WHERE steam_id = ?`,
    [personaname, avatar, profileurl, steamID]
  );
}
