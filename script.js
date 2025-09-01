class ChatBot {
    constructor() {
        // Environment variable approach for secure deployment
        this.apiKey = this.getApiKey();
        this.apiEndpoint = 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-small';
        this.messages = [];
        
        this.initializeElements();
        this.initializeEventListeners();
        this.checkApiKey();
    }

    getApiKey() {
        // Try multiple methods to get the API key securely
        
        // Method 1: Check if running on Netlify with environment variables
        if (typeof process !== 'undefined' && process.env && process.env.HUGGINGFACE_API_KEY) {
            return process.env.HUGGINGFACE_API_KEY;
        }
        
        // Method 2: Check for a config file (for local development)
        if (window.CONFIG && window.CONFIG.HUGGINGFACE_API_KEY) {
            return window.CONFIG.HUGGINGFACE_API_KEY;
        }
        
        // Method 3: Prompt user for API key and store locally
        let storedKey = localStorage.getItem('hf_api_key');
        if (!storedKey) {
            storedKey = prompt('Please enter your Hugging Face API token (get it from https://huggingface.co/settings/tokens):');
            if (storedKey) {
                localStorage.setItem('hf_api_key', storedKey);
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
        if (!this.apiKey || this.apiKey === 'hf_your_token_here') {
            this.addMessage('bot', 'Please get a free token from https://huggingface.co/settings/tokens and update it in script.js line 5 to start chatting!');
        } else {
            this.addMessage('bot', 'Hello! I\'m your AI assistant powered by Hugging Face. How can I help you today?');
        }
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message || !this.apiKey || this.apiKey === 'hf_your_token_here') return;

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
            const response = await this.callHuggingFaceAPI();
            this.hideTypingIndicator();
            
            if (response && response.generated_text) {
                let botMessage = response.generated_text.trim();
                
                if (!botMessage || botMessage.length < 3) {
                    botMessage = 'I understand your question. How else can I help you?';
                }
                
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

    async callHuggingFaceAPI() {
        const userMessage = this.messages[this.messages.length - 1].content;
        
        // Get conversation context
        const pastInputs = this.messages.filter(m => m.role === 'user').slice(-2).map(m => m.content);
        const pastResponses = this.messages.filter(m => m.role === 'assistant').slice(-2).map(m => m.content);
        
        const response = await fetch(this.apiEndpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                inputs: {
                    past_user_inputs: pastInputs,
                    generated_responses: pastResponses,
                    text: userMessage
                }
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