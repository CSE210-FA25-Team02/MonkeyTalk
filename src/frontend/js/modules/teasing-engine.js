/**
 * Simple Teasing Engine for MonkeyTalk
 * Handles pre and post translation humor with clean input/output
 */

export class TeasingEngine {
  constructor() {
    // Pre-translation messages - shown while "thinking"
    this.preTeasers = [
      "🐵 Monkey brain is processing...",
      "🤔 Hmm, let me decode this...",
      "🎭 Preparing emoji magic...",
      "🔮 Consulting the emoji oracle...",
      "🐒 Ooh ooh ah ah... thinking..."
    ];

    // Post-translation reactions - shown after result
    this.postReactions = [
      "🎉 Boom! Emoji-fied!",
      "✨ *Chef's kiss* Perfect!",
      "🏆 Nailed it!",
      "🎪 Ta-da! Emoji circus complete!",
      "🐵 Even monkeys would understand this!"
    ];
  }

  /**
   * Build a pre-translation tease string from optional analysis
   * Falls back to local random tease when analysis not provided
   * @param {{shortTease?:string, tone?:string}} analysis
   */
  buildPreTease(analysis) {
    if (analysis && analysis.shortTease) return analysis.shortTease;
    return this.getPreTranslationTease();
  }

  /**
   * Build a loading tease (post-teasing design you proposed)
   * e.g., show "monkey energy" loading message
   */
  buildLoadingTease(mode) {
    return mode === 'emoji-to-text'
      ? '⚡ Monkey energy syncing with your emojis...'
      : '⚡ Monkey energy syncing with your text...';
  }

  /**
   * Get a random pre-translation teaser
   * @returns {string} Teasing message
   */
  getPreTranslationTease() {
    const randomIndex = Math.floor(Math.random() * this.preTeasers.length);
    return this.preTeasers[randomIndex];
  }

  /**
   * Get a random post-translation reaction
   * @returns {string} Reaction message
   */
  getPostTranslationReaction() {
    const randomIndex = Math.floor(Math.random() * this.postReactions.length);
    return this.postReactions[randomIndex];
  }

  /**
   * Simple delay utility for timing effects
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise} Promise that resolves after delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
