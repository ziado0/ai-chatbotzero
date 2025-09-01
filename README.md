# AI Chatbot

A simple, elegant AI chatbot powered by DeepSeek API, designed to be hosted on GitHub Pages.

## Features

- 🤖 Powered by DeepSeek AI (free API with millions of tokens)
- 💬 Clean, responsive chat interface
- 🔐 Secure API key storage (stored locally in your browser)
- 📱 Mobile-friendly design
- ⚡ Fast and lightweight

## How to Use

1. **Get your DeepSeek API key:**
   - Go to [platform.deepseek.com](https://platform.deepseek.com)
   - Sign up for a free account
   - Get your API key from the dashboard

2. **Use the chatbot:**
   - Enter your API key when prompted
   - Start chatting with the AI assistant
   - Your API key is stored securely in your browser

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