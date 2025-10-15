
/**
 * Backend server for Emoji Speak Translator
 * Handles API calls to the AI service
 */

import express from 'express';
import cors from 'cors';
import { AIService } from './services/ai-service.js';
import { EmjIsService } from './services/emj-is-service.js';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const aiService = new AIService();
const emjIsService = new EmjIsService();

app.post('/translate', async (req, res) => {
  const { text, mode } = req.body;

  if (!text || !mode) {
    return res.status(400).json({ error: 'Missing text or mode' });
  }

  try {
    let translation;
    if (mode === 'text-to-emoji') {
      try {
        translation = await emjIsService.translateTextToEmoji(text);
      } catch (emjIsError) {
        console.warn('emj.is service failed, falling back to AI service', emjIsError);
        translation = await aiService.translateTextToEmoji(text);
      }
    } else {
      translation = await aiService.translateEmojiToText(text);
    }
    res.json({ translation });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ error: 'Failed to translate' });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
