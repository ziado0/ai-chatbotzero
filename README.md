# AI Chatbot

A simple, elegant AI chatbot powered by DeepSeek API, designed to be hosted on GitHub Pages.

## Features

- 🤖 Powered by DeepSeek AI (free API with millions of tokens)
- 💬 Clean, responsive chat interface
- 🔐 Hardcoded API key for easy sharing with friends
- 📱 Mobile-friendly design
- ⚡ Fast and lightweight
- 🔄 Session-only conversations (clears on page refresh)

## Setup Instructions

1. **Get your DeepSeek API key:**
   - Go to [platform.deepseek.com](https://platform.deepseek.com)
   - Sign up for a free account
   - Get your API key from the dashboard

2. **Update the code:**
   - Open `script.js`
   - Find line 4: `this.apiKey = 'YOUR_API_KEY_HERE';`
   - Replace `YOUR_API_KEY_HERE` with your actual API key

3. **Use the chatbot:**
   - Open `index.html` in a browser or deploy to GitHub Pages
   - Start chatting immediately - no setup required for users!

## Deployment to GitHub Pages

1. Create a new repository on GitHub
2. Upload these files: `index.html`, `style.css`, `script.js`
3. Go to Settings → Pages
4. Select "Deploy from a branch" → "main" → "/ (root)"
5. Your chatbot will be available at `https://yourusername.github.io/repository-name`

## Files Structure

```
ai-chatbot/
├── index.html      # Main HTML file
├── style.css       # Styling
├── script.js       # JavaScript functionality
└── README.md       # This file
```

## Technical Details

- Uses DeepSeek's OpenAI-compatible API
- Client-side only (no server required)
- API key stored in localStorage
- Responsive design with CSS Grid and Flexbox
- Error handling for API failures

## Security Note

Your API key is stored only in your browser's local storage and never sent to any server other than DeepSeek's API endpoint.