import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { desc } from "drizzle-orm";
import * as schema from "./schema";

const sqlite = new Database(process.env.DATABASE_URL || "./game.db");
export const db = drizzle(sqlite, { schema });

export async function saveScore(
  username: string,
  roomId: string,
  score: number,
) {
  await db.insert(schema.scores).values({ username, roomId, score });
}

export async function getTopScores() {
  return await db
    .select()
    .from(schema.scores)
    .orderBy(desc(schema.scores.score))
    .limit(10);
}
