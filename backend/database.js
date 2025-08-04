// database.js
import mysql  from "mysql2/promise";
import fs     from "fs";
import path   from "path";
import dotenv from "dotenv";
dotenv.config();

const connectionSource = process.env.MYSQL_URL
    ? process.env.MYSQL_URL
    : {
        host:     process.env.DB_HOST,
        port:     Number(process.env.DB_PORT),
        user:     process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
    };

export const pool = mysql.createPool(connectionSource);

export async function initSchema(connection, sqlFilePath) {
    // `connection` may be a URL string or config object.
    const conn = await mysql.createConnection(connection);
    const sql  = fs.readFileSync(sqlFilePath, "utf8");
    await conn.query(sql);
    await conn.end();
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
