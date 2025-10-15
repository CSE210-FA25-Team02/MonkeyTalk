```
 __       __                      __                          ________          __  __       
|  \     /  \                    |  \                        |        \        |  \|  \      
| $$\   /  $$  ______   _______  | $$   __   ______   __    __\$$$$$$$$______  | $$| $$   __ 
| $$$\ /  $$$ /      \ |       \ | $$  /  \ /      \ |  \  |  \ | $$  |      \ | $$| $$  /  \
| $$$$\  $$$$|  $$$$$$\| $$$$$$$\| $$_/  $$|  $$$$$$\| $$  | $$ | $$   \$$$$$$\| $$| $$_/  $$
| $$\$$ $$ $$| $$  | $$| $$  | $$| $$   $$ | $$    $$| $$  | $$ | $$  /      $$| $$| $$   $$ 
| $$ \$$$| $$| $$__/ $$| $$  | $$| $$$$$$\ | $$$$$$$$| $$__/ $$ | $$ |  $$$$$$$| $$| $$$$$$\ 
| $$  \$ | $$ \$$    $$| $$  | $$| $$  \$$\ \$$     \ \$$    $$ | $$  \$$    $$| $$| $$  \$$\
 \$$      \$$  \$$$$$$  \$$   \$$ \$$   \$$  \$$$$$$$ _\$$$$$$$  \$$   \$$$$$$$ \$$ \$$   \$$
                                                     |  \__| $$                              
                                                      \$$    $$                              
                                                       \$$$$$$                                                         
```

# MonkeyTalk 🐵💬

**Boomer-to-GenZ-Translator: Elevate Your Lingo, One Emoji at a Time** 👵➡️✨

A web application that translates between natural language text and emoji expressions.


## 🛠️ Tech Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Styling**: CSS Custom Properties (CSS Variables) for theming
- **AI Service**: Google Gemini 2.5 Flash API

## 📁 Project Structure

```
MonkeyTalk/
├── src/
│   ├── index.html              # Main HTML file
│   ├── js/
│   │   ├── main.js            # Application entry point
│   │   ├── constants.js       # Configuration and API keys
│   │   └── modules/
│   │       ├── ai-service.js  # Google Gemini API integration
│   │       ├── iclprompt.js   # In-context learning prompts
│   │       ├── translator.js  # Core translation logic
│   │       └── ui-controller.js # DOM manipulation and events
│   └── css/
│       ├── main.css           # Main stylesheet
│       ├── variables.css      # CSS custom properties
│       └── components/
│           └── translator.css # Component-specific styles
└── artifacts/
    └── documentation/
        ├── emoji-generator-design.md
        ├── project-guidelines.md
        └── Design.md          # System architecture and flow diagrams

```

## 🚀 Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Google Gemini API key (get one from [Google AI Studio](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/MonkeyTalk.git
   cd MonkeyTalk
   ```

2. **Configure API Key**
   - Open `src/js/constants.js`
   - Replace `'GEMINI_API_KEY'` with your actual Gemini API key

3. **Run the Application**
   - Open `src/index.html` in your web browser

## 🎯 How to Use

1. **Choose Translation Mode**
   - Select "Text to Emoji" to convert natural language to emoji expressions
   - Select "Emoji to Text" to decode emoji sequences back to text

2. **Enter Your Input**
   - Type your text or emoji sequence in the input area

3. **Translate**
   - Click the "🔄 Translate" button to process your input
