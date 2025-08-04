// database.js
import mysql  from "mysql2/promise";
import fs     from "fs";
import dotenv from "dotenv";
dotenv.config();

// Use the full URL in prod, fall back to old DB_* in dev
const pool = process.env.MYSQL_URL
    ? mysql.createPool(process.env.MYSQL_URL)
    : mysql.createPool({
        host:     process.env.DB_HOST,
        port:     Number(process.env.DB_PORT),
        user:     process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
    });

export { pool };

export async function initSchema(sqlFilePath) {
    const conn = process.env.MYSQL_URL
        ? await mysql.createConnection(process.env.MYSQL_URL)
        : await mysql.createConnection({
            host:     process.env.DB_HOST,
            port:     Number(process.env.DB_PORT),
            user:     process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
        });

    const sql = fs.readFileSync(sqlFilePath, "utf8");
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
