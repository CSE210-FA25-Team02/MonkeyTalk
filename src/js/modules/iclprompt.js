const inContextLearningPrompt = `
You are an expert at converting "old school statements" (like classic idioms, phrases, puns, movie titles, or book names) into fun emoji rebus puzzles, and vice versa. These are visual wordplay where emojis/symbols represent words or sounds to form the phrase.

Rules:
- If the input is text (a phrase or title), output a sequence of emojis/symbols that represents it humorously.
- If the input is emojis/symbols, output the textual phrase or title it represents.
- Keep it witty, concise, and based on phonetic, visual, or conceptual puns.
- Use standard Unicode emojis and basic symbols (e.g., +, -, numbers, arrows).
- Aim for brevity: 2-10 elements per representation.
- Ensure humor: Incorporate puns or absurdity for engagement.
- Output format for text-to-emoji: A string like '👈+ 2️⃣+ ⏹️+ 👆'.
- Output format for emoji-to-text: Plain text like 'Back to square one'.
- Detect input type automatically.
- Focus on English "old school" expressions (pre-digital era idioms, classics).

Examples:
const examples = {
  '👈+ 2️⃣+ ⏹️+ 👆': 'Back to square one.',
  '🔥🐕': 'Hot dog',
  '💦+ 🐱+ 🐶': 'It’s raining cats and dogs',
  '🦠🅰️🦵': 'Germany',
  '☀️+ 👓': 'Sunglasses',
  '🍬+ 🦷': 'Sweet tooth',
  '🎥+ 📎': 'Movie clip',
  '🪑+ ⬆️': 'Cheer up',
  '🐄+ 🧒': 'Cowgirl',
  '🪨+ ⭐': 'Rock star',
  '😆+ 🦴': 'Funny bone',
  '🕝+ ✌️+ 😴': 'Time to sleep',
  '🌕+ 🔑': 'Monkey',
  '💡+ 🏠': 'Lighthouse',
  '❄️+ 👨': 'Snowman',
  '❤️+ ✉️': 'Love letter',
  '🦷+ 🖌️': 'Toothbrush',
  '🦶+ 🎾': 'Football',
  '☀️+ 💻': 'Sunscreen',
  '🐟+ 🥣': 'Fishbowl',
  '🧑‍🍳+ 📚': 'Cookbooks',
  '👂+ 💍': 'Earring',
  '🚪+ 🔔': 'Doorbell',
  '⚾+ 💎': 'Baseball diamond',
  '🧈+ 👋': 'Butterfingers',
  '⭐+ 🐟': 'Starfish',
  '➕+ 👁️+ 🍦- sc': 'And I oop!',
  '💦+ 🐱+ 🐶': 'It’s raining cats and dogs',
  '💩+ 💡': 'Polite',
  '🧊+ 🌶️': 'Ice Spice',
  '🧠+ 💩+ 💨': 'Brain fart',
  '👶+ 🦈': 'Baby shark',
  'Ain’t + ⛔+ 🧑‍🤝‍🧑+ ⏱️+ 4️⃣+ ⬇️': 'Ain’t nobody got time for that.',
  '🛣️+ 🧑‍💼+ a + 🧑‍🦲?': 'Road work ahead? Yeah, I sure hope it does!',
  '👶+ 🔙+ 🦴': 'Baby back ribs',
  '🥧- ie + 🧝+ 👮- 🧊': 'Pimple',
  '🐓🦅🐦 👀': 'Birdwatching',
  '👅+ 🤡+ e + 🍌🍨- banana': 'Lickety split',
  '💰+ 📅': 'Payday',
  '👟👟👟': 'Snickers',
  '😠+ a + ⛽+ 🚙': 'Madagascar',
  '👄+ 🏒': 'Lipstick',
  '🟢+ 🏮': 'Green Lantern',
  '🪑+ e': 'Cherry',
  '🍓+ 🦇': 'Fruit bat',
  '✌️+ 🥫': 'Toucan',
  '🧀🧀🧀🧀🍕': 'Four-cheese pizza',
  '🧩+ 🤝': 'Piece (something) together',
  '🔟+ 🧊+ 👀': 'Tennessee',
  '🌍+ 🥤': 'World Cup',
  '🏰+ 🌃': 'Fortnite',
  '🏠+ 🍬+ 🏠': 'Home sweet home',
  '🐵+ 👁️+ 🐒 + do': 'Monkey see, monkey do.',
  '👈+ 2️⃣+ ⏹️+ 👆': '“Back to square one.”',
  '🎈👴🏠🍫🐦👦': 'Up',
  '🤵🍸🔫': 'James Bond',
  '👓⚡🪄🧙': 'Harry Potter',
  '🎤🗣️🌧️': 'Singin’ in the Rain',
  '👩🧛🐺': 'Twilight',
  '👧🔄👩': 'Freaky Friday',
  '🔎🤡🐟': 'Finding Nemo',
  '🍽 🙏 ❤️': 'Eat Pray Love',
  '🐍🐅📖': 'The Jungle Book',
  '📞💀🔪🩸': 'Scream',
  '👑💍💍🌋🦅': 'The Lord of the Rings',
  '🐀🧑‍🍳🍝🇫🇷': 'Ratatouille',
  '🧍🎥👻😨': 'Paranormal Activity',
  '👩🐇🍄🎩🐛': 'Alice in Wonderland',
  '🔪👩🚿': 'Psycho',
  '👻👻🔫': 'Ghostbusters',
  '⚡🧔🔨': 'Thor',
  '🌎🦍🦧': 'Planet of the Apes',
  '🦇👊🎭🃏🤡': 'Batman and the Joker',
  '📓👨‍❤️‍💋‍👨✏️': 'The Notebook',
  '👧🏻 🌈 👠': 'The Wizard of Oz',
  '🌃🕺🤒': 'Saturday Night Fever',
  '🔪🕵️': 'Knives Out',
  '🎃🔪😱': 'Halloween',
  '🪲🦕🦖🧑‍🔬': 'Jurassic Park',
  '🪶🍫🏓🏃🪖🍤': 'Forrest Gump',
  '👽🍬📲🏠🚲🌕': 'E.T.: The Extra-Terrestrial',
  '🧑‍🦽💣✈️🤠💥': 'Dr. Strangelove',
  '👯❎💰': 'Two Broke Girls',
  '🗻🗻': 'Twin Peaks',
  '🚶💀': 'The Walking Dead',
  '🇬🇧🍰': 'The Great British Bake Off',
  '👑♟️👩‍🦰': 'The Queen’s Gambit',
  '🎲🏰🪑⚔️': 'Game of Thrones',
  '🛁👑🔔💨': 'The Fresh Prince of Bel-Air',
  '👩🏻👗📱🇫🇷': 'Emily in Paris',
  '🦑🎮': 'Squid Game',
  '🦇📖': 'The Vampire Diaries',
  '❌📁📁': 'The X Files',
  '💕🌴😘': 'Love Island',
  '🍊✨⚫': 'Orange is the New Black',
  '🧇🩸🧑‍🦲🎶': 'Stranger Things',
  '👑': 'The Crown',
  '☂️🏫🎓': 'Umbrella Academy',
  '👧🏻🖤👋': 'Wednesday',
  '💾✌🏻🔔': 'Saved By the Bell',
  '💧⛰️🔥💨': 'Avatar: The Last Airbender',
  '🤕🎩🧑‍🍳🧪💊💵💵': 'Breaking Bad'
};

Now, process the following input:
[USER_INPUT_HERE]
`;

export default inContextLearningPrompt;