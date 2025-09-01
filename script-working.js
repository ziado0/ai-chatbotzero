// WORKING VERSION - No API keys required
// This version uses a free public API that doesn't need authentication

class ChatBot {
    constructor() {
        // Using a free public API - no keys needed
        this.apiEndpoint = 'https://api.adviceslip.com/advice';
        this.messages = [];
        
        this.initializeElements();
        this.initializeEventListeners();
        this.addMessage('bot', 'Hello! I\'m your AI assistant. Ask me anything and I\'ll do my best to help!');
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

    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;

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
            const response = await this.getAIResponse(message);
            this.hideTypingIndicator();
            
            this.addMessage('bot', response);
            
            // Add to conversation history
            this.messages.push({
                role: 'assistant',
                content: response
            });
            
        } catch (error) {
            this.hideTypingIndicator();
            console.error('Error:', error);
            this.addMessage('bot', 'I\'m having trouble connecting right now. Let me try to help you anyway!');
            
            // Fallback to local responses
            const fallbackResponse = this.getFallbackResponse(message);
            this.addMessage('bot', fallbackResponse);
        }

        this.sendButton.disabled = false;
    }

    async getAIResponse(message) {
        // Simple keyword-based intelligent responses
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
            return 'Hello! Great to meet you. What would you like to talk about?';
        }
        
        if (lowerMessage.includes('how are you')) {
            return 'I\'m doing wonderfully, thank you for asking! How has your day been going?';
        }
        
        if (lowerMessage.includes('name')) {
            return 'I\'m an AI assistant created to help answer questions and have conversations. What\'s your name?';
        }
        
        if (lowerMessage.includes('weather')) {
            return 'I don\'t have access to real-time weather data, but I\'d recommend checking a weather app or website for current conditions in your area!';
        }
        
        if (lowerMessage.includes('time')) {
            const currentTime = new Date().toLocaleTimeString();
            return `The current time is ${currentTime}. Is there something time-sensitive I can help you with?`;
        }
        
        if (lowerMessage.includes('help')) {
            return 'I\'m here to help! You can ask me questions, have conversations, get advice, or just chat. What do you need assistance with?';
        }
        
        if (lowerMessage.includes('thank')) {
            return 'You\'re very welcome! I\'m happy to help anytime. Is there anything else you\'d like to discuss?';
        }
        
        if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye')) {
            return 'Goodbye! It was great chatting with you. Have a wonderful day and feel free to come back anytime!';
        }
        
        // Try to get advice from a free API for variety
        try {
            const adviceResponse = await fetch('https://api.adviceslip.com/advice');
            if (adviceResponse.ok) {
                const adviceData = await adviceResponse.json();
                return `Here's my response to "${message}": ${adviceData.slip.advice}. What do you think about that?`;
            }
        } catch (e) {
            // Fall through to contextual responses
        }
        
        // Contextual responses based on message content
        if (lowerMessage.includes('?')) {
            return `That's a great question about "${message}". While I may not have all the specific details, I'd be happy to discuss this topic with you. What aspects are you most curious about?`;
        }
        
        if (lowerMessage.includes('problem') || lowerMessage.includes('issue')) {
            return `I understand you're dealing with something challenging. While I can't solve every problem, I'm here to listen and help think through it. Can you tell me more about the situation?`;
        }
        
        if (lowerMessage.includes('learn') || lowerMessage.includes('study')) {
            return `Learning is wonderful! I'd love to help you explore this topic. What specifically would you like to know more about regarding "${message}"?`;
        }
        
        // Generic but engaging responses
        const contextualResponses = [
            `That's really interesting! I'd love to hear more about your thoughts on "${message}".`,
            `Thanks for sharing that with me. What made you think about "${message}"?`,
            `I find that topic fascinating. What's your experience been with "${message}"?`,
            `That brings up some good points about "${message}". How do you see it?`,
            `I appreciate you bringing that up. What would you like to explore about "${message}"?`
        ];
        
        return contextualResponses[Math.floor(Math.random() * contextualResponses.length)];
    }
    
    getFallbackResponse(message) {
        const fallbacks = [
            `I understand you're asking about "${message}". Even though I'm having connection issues, I'm here to chat with you!`,
            `That's an interesting point about "${message}". I'd love to discuss this more with you.`,
            `Thanks for sharing "${message}" with me. What would you like to explore about this topic?`
        ];
        
        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
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