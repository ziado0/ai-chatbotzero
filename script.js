class ChatBot {
    constructor() {
        this.apiKey = localStorage.getItem('deepseek_api_key');
        this.apiEndpoint = 'https://api.deepseek.com/v1/chat/completions';
        this.messages = [];
        
        this.initializeElements();
        this.initializeEventListeners();
        this.checkApiKey();
    }

    initializeElements() {
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.apiSetup = document.getElementById('apiSetup');
        this.apiKeyInput = document.getElementById('apiKeyInput');
        this.saveApiKeyButton = document.getElementById('saveApiKey');
    }

    initializeEventListeners() {
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        this.saveApiKeyButton.addEventListener('click', () => this.saveApiKey());
        this.apiKeyInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.saveApiKey();
            }
        });
    }

    checkApiKey() {
        if (!this.apiKey) {
            this.apiSetup.style.display = 'flex';
        } else {
            this.apiSetup.style.display = 'none';
        }
    }

    saveApiKey() {
        const key = this.apiKeyInput.value.trim();
        if (key) {
            this.apiKey = key;
            localStorage.setItem('deepseek_api_key', key);
            this.apiSetup.style.display = 'none';
            this.apiKeyInput.value = '';
            this.addMessage('bot', 'Great! API key saved. You can now start chatting with me!');
        } else {
            alert('Please enter a valid API key');
        }
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message || !this.apiKey) return;

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
            const response = await this.callDeepSeekAPI();
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

    async callDeepSeekAPI() {
        const response = await fetch(this.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful AI assistant. Be concise, friendly, and helpful in your responses.'
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