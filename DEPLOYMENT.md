# Secure Deployment Guide

## Environment Variables Setup - Multiple Options

### Option 1: Netlify Deployment (Recommended)

1. **Create Netlify Account:**
   - Go to [netlify.com](https://netlify.com) and sign up (free)

2. **Get Your Hugging Face Token:**
   - Go to [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
   - Create a new "Write" access token
   - Copy the token

3. **Deploy to Netlify:**
   - Connect your GitHub repo to Netlify
   - Or drag & drop your project folder to Netlify

4. **Set Environment Variable:**
   - In Netlify dashboard: Site settings → Environment variables
   - Add: `HUGGINGFACE_API_KEY` = `your_token_here`
   - Deploy site

### Option 2: Local Development

1. **Create config.js:**
   ```bash
   cp config.example.js config.js
   ```

2. **Add your token:**
   ```javascript
   window.CONFIG = {
       HUGGINGFACE_API_KEY: 'your_actual_token_here'
   };
   ```

3. **Test locally:**
   - Open index.html in browser
   - Should use your config.js token

### Option 3: User Prompt (Fallback)

- If no environment variable or config file is found
- Users will be prompted to enter their own token
- Token is stored in browser's localStorage
- Most secure for public deployment

## Security Benefits

✅ **No API keys in source code**
✅ **Keys stored securely in environment variables**  
✅ **Safe to commit to GitHub**
✅ **Each user can use their own token**
✅ **Automatic fallback to user input**

## Files Overview

- `netlify.toml` - Netlify configuration
- `config.example.js` - Template for local config
- `.gitignore` - Keeps config.js out of git
- `DEPLOYMENT.md` - This guide

## Deploy Steps

1. Get new Hugging Face token
2. Choose deployment method (Netlify recommended)
3. Set environment variable with your token
4. Deploy - your friends can use it without knowing your token!