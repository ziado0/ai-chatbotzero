class ChatBot {
    constructor() {
        // Hugging Face API - Truly free, no credit card required
        // Get free API key from: https://huggingface.co/settings/tokens
        this.apiKey = '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';
        this.apiEndpoint = 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-large';
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
            
            if (response && Array.isArray(response) && response.length > 0) {
                let botMessage = response[0].generated_text || 'I understand. How else can I help?';
                
                // Clean up the response (remove the input text)
                botMessage = botMessage.replace(message, '').trim();
                if (!botMessage) botMessage = 'I understand. How else can I help?';
                
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
            } else if (error.message.includes('429')) {
                errorMessage += 'Rate limit exceeded. Please wait a moment.';
            } else if (error.message.includes('CORS')) {
                errorMessage += 'Browser security error.';
            } else {
                errorMessage += `Error: ${error.message}`;
            }
            
            this.addMessage('bot', errorMessage);
        }

        this.sendButton.disabled = false;
    }

    async callHuggingFaceAPI() {
        const response = await fetch(this.apiEndpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                inputs: this.messages[this.messages.length - 1].content,
                parameters: {
                    max_length: 100,
                    temperature: 0.7,
                    do_sample: true,
                    return_full_text: false
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
