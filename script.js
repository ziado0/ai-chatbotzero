class ChatBot {
    constructor() {
        // Using Groq API - reliable and free for testing
        // Get free API key from: https://console.groq.com/keys
        this.apiKey = this.getApiKey();
        this.apiEndpoint = 'https://api.groq.com/openai/v1/chat/completions';
        this.messages = [];
        
        this.initializeElements();
        this.initializeEventListeners();
        this.checkApiKey();
    }

    getApiKey() {
        // Try multiple methods to get the API key securely
        
        // Method 1: Check for hardcoded key (replace YOUR_GROQ_API_KEY_HERE with actual key)
        const hardcodedKey = 'YOUR_GROQ_API_KEY_HERE';
        if (hardcodedKey && hardcodedKey !== 'YOUR_GROQ_API_KEY_HERE') {
            return hardcodedKey;
        }
        
        // Method 2: Check for a config file (for local development)
        if (window.CONFIG && window.CONFIG.GROQ_API_KEY) {
            return window.CONFIG.GROQ_API_KEY;
        }
        
        // Method 3: Prompt user for API key and store locally
        let storedKey = localStorage.getItem('groq_api_key');
        if (!storedKey) {
            storedKey = prompt('Please enter your Groq API key (get it from https://console.groq.com/keys - it\'s free!):');
            if (storedKey) {
                localStorage.setItem('groq_api_key', storedKey);
            }
        }
        
        return storedKey;
    }

    initializeElements() {
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
    }

    initializeEventListeners() {
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
    }

    checkApiKey() {
        if (!this.apiKey) {
            this.addMessage('bot', 'Please get a free API key from https://console.groq.com/keys to start chatting!');
        } else {
            this.addMessage('bot', 'Hello! أهلاً وسهلاً! I\'m your bilingual AI assistant. I can help you in both English and Arabic. How can I assist you today? كيف يمكنني مساعدتك اليوم؟');
        }
    }

    detectLanguage(text) {
        // Simple Arabic detection - if text contains Arabic characters
        const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
        return arabicRegex.test(text) ? 'arabic' : 'english';
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message || !this.apiKey) return;

        this.messageInput.value = '';
        this.sendButton.disabled = true;

        // Add user message to chat
        this.addMessage('user', message);
        
        // Detect language for enhanced prompt
        const userLanguage = this.detectLanguage(message);
        
        // Add to conversation history
        this.messages.push({
            role: 'user',
            content: message
        });

        // Show typing indicator
        this.showTypingIndicator();

        try {
            const response = await this.callGroqAPI(userLanguage);
            this.hideTypingIndicator();
            
            if (response && response.choices && response.choices[0] && response.choices[0].message) {
                const botMessage = response.choices[0].message.content.trim();
                
                this.addMessage('bot', botMessage);
                
                // Add to conversation history
                this.messages.push({
                    role: 'assistant',
                    content: botMessage
                });
            } else {
                throw new Error('Invalid response format');
            }
            
        } catch (error) {
            this.hideTypingIndicator();
            console.error('Full error:', error);
            console.error('Error message:', error.message);
            
            let errorMessage = 'Sorry, something went wrong. ';
            if (error.message.includes('401')) {
                errorMessage += 'API key is invalid or expired.';
            } else if (error.message.includes('402')) {
                errorMessage += 'Insufficient credits. Try a free model.';
            } else if (error.message.includes('403')) {
                errorMessage += 'API key lacks permission for this model.';
            } else if (error.message.includes('404')) {
                errorMessage += 'Model not found. The model might be loading - try again in a moment.';
            } else if (error.message.includes('429')) {
                errorMessage += 'Rate limit exceeded. Please wait a moment.';
            } else if (error.message.includes('503')) {
                errorMessage += 'Model is loading. Please wait 20 seconds and try again.';
            } else if (error.message.includes('CORS')) {
                errorMessage += 'Browser security error.';
            } else {
                errorMessage += `Error: ${error.message}`;
            }
            
            this.addMessage('bot', errorMessage);
            
            // If it's a model loading issue, suggest trying again
            if (error.message.includes('404') || error.message.includes('503')) {
                setTimeout(() => {
                    this.addMessage('bot', 'You can try sending your message again - the model should be ready now.');
                }, 2000);
            }
        }

        this.sendButton.disabled = false;
    }

    async callGroqAPI(userLanguage) {
        // Create language-specific system prompt
        const systemPrompts = {
            arabic: 'أنت مساعد ذكي مفيد. يجب أن تجيب باللغة العربية فقط. لا تستخدم أي كلمات أو أحرف إنجليزية في إجابتك. كن مفيدًا ومفصلاً في إجاباتك.',
            english: 'You are a helpful AI assistant. You must respond ONLY in English. Do not use any Arabic words or characters in your response. Be helpful and provide detailed responses.'
        };

        const systemContent = systemPrompts[userLanguage] || systemPrompts.english;

        const response = await fetch(this.apiEndpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant', // Current supported model
                messages: [
                    {
                        role: 'system',
                        content: systemContent
                    },
                    ...this.messages
                ],
                max_tokens: 1000,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        return await response.json();
    }

    addMessage(sender, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.textContent = content;
        
        messageDiv.appendChild(messageContent);
        this.chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message';
        typingDiv.id = 'typing-indicator';
        
        const typingContent = document.createElement('div');
        typingContent.className = 'typing-indicator';
        
        const typingText = document.createElement('span');
        typingText.textContent = 'AI is typing';
        
        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'typing-dots';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'typing-dot';
            dotsContainer.appendChild(dot);
        }
        
        typingContent.appendChild(typingText);
        typingContent.appendChild(dotsContainer);
        typingDiv.appendChild(typingContent);
        
        this.chatMessages.appendChild(typingDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
}

// Initialize the chatbot when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ChatBot();
});