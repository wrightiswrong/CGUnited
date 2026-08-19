// ---------------------------------------------------------------------------
// Storage abstraction. Any backend (localStorage today, Firebase/Supabase/SQL
// tomorrow) implements this interface. Nothing in the game/UI layers should
// ever import a concrete storage class directly — only this shape.
// ---------------------------------------------------------------------------

/**
 * @typedef {object} GameSession
 * @property {string} sessionId
 * @property {number} playedAt - epoch ms
 * @property {string[]} insuredAssets
 * @property {number} premiumsSpent
 * @property {number} budget
 * @property {string} disasterKey
 * @property {number} totalLoss
 * @property {number} totalPaid
 * @property {number} totalSaved
 * @property {number} score
 */

/**
 * @typedef {object} PlayerRecord
 * @property {string} email - unique key
 * @property {string} name  - most recent display name used
 * @property {number} firstSeenAt
 * @property {number} lastSeenAt
 * @property {GameSession[]} sessions
 */

// eslint-disable-next-line no-unused-vars
export class PlayerRepository {
  /** @returns {Promise<PlayerRecord|null>} */
  async getPlayerByEmail(_email) {
    throw new Error('Not implemented');
  }

  /**
   * Append a new session to a player, creating the player record if this is
   * their first time playing. Never creates a duplicate player for the same
   * email — always append-and-merge.
   * @param {{name:string, email:string}} playerInfo
   * @param {GameSession} session
   * @returns {Promise<PlayerRecord>}
   */
  async recordSession(_playerInfo, _session) {
    throw new Error('Not implemented');
  }

  /** @returns {Promise<PlayerRecord[]>} all players, unsorted */
  async getAllPlayers() {
    throw new Error('Not implemented');
  }

  /**
   * Best single session per player, sorted descending by score.
   * @param {number} limit
   * @returns {Promise<Array<{name:string,email:string,score:number,playedAt:number}>>}
   */
  async getLeaderboard(_limit = 20) {
    throw new Error('Not implemented');
  }

  /** @returns {Promise<string>} CSV text of every player + their best session */
  async exportCSV() {
    throw new Error('Not implemented');
  }

  /** Danger: wipes all stored data. Used only from the admin panel. */
  async clearAll() {
    throw new Error('Not implemented');
  }
}
