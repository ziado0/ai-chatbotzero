class ChatBot {
    constructor() {
        // OpenRouter API - Free tier available, browser compatible
        // Get free API key from: https://openrouter.ai/keys
        this.apiKey = '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';
        this.apiEndpoint = 'https://openrouter.ai/api/v1/chat/completions';
        this.messages = [];
        
        this.initializeElements();
        this.initializeEventListeners();
        this.checkApiKey();
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
        if (!this.apiKey || this.apiKey === 'your_openrouter_api_key_here') {
            this.addMessage('bot', 'Please get a free API key from https://openrouter.ai/keys and update it in script.js line 5 to start chatting!');
        } else {
            this.addMessage('bot', 'Hello! I\'m your AI assistant powered by OpenRouter. How can I help you today?');
        }
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message || !this.apiKey || this.apiKey === 'your_openrouter_api_key_here') return;

        this.messageInput.value = '';
        this.sendButton.disabled = true;

        // Add user message to chat
        this.addMessage('user', message);
        
        // Add to conversation history
        this.messages.push({
            role: 'user',
            content: message
        });

        // Show typing indicator
        this.showTypingIndicator();

        try {
            const response = await this.callOpenRouterAPI();
            this.hideTypingIndicator();
            
            if (response && response.choices && response.choices[0]) {
                const botMessage = response.choices[0].message.content;
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
            console.error('Error:', error);
            
            let errorMessage = 'Sorry, something went wrong. ';
            if (error.message.includes('401') || error.message.includes('403')) {
                errorMessage += 'Please check your API key.';
            } else if (error.message.includes('429')) {
                errorMessage += 'Rate limit exceeded. Please wait a moment.';
            } else {
                errorMessage += 'Please try again later.';
            }
            
            this.addMessage('bot', errorMessage);
        }

        this.sendButton.disabled = false;
    }

    async callOpenRouterAPI() {
        const response = await fetch(this.apiEndpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.href,
                'X-Title': 'AI Chatbot'
            },
            body: JSON.stringify({
                model: 'microsoft/DialoGPT-medium', // Free model
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful AI assistant. Be concise, friendly, and helpful in your responses.'
                    },
                    ...this.messages
                ],
                max_tokens: 150,
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