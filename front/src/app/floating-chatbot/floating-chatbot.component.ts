

import { Component, OnInit } from '@angular/core';

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

@Component({
  selector: 'app-floating-chatbot',
  templateUrl: './floating-chatbot.component.html',
  styleUrls: ['./floating-chatbot.component.css']
})
export class FloatingChatbotComponent implements OnInit {
  isChatOpen = false;
  messages: Message[] = [];
  currentMessage = '';
  isTyping = false;
  

  // Réponses prédéfinies du chatbot
  private botResponses = [
    "Bonjour ! Comment puis-je vous aider aujourd'hui ?",
    "Je suis là pour vous assister. Que souhaitez-vous savoir ?",
    "Excellente question ! Laissez-moi vous aider avec cela.",
    "Je comprends votre préoccupation. Voici ce que je peux vous dire...",
    "Merci pour votre message. Je vais faire de mon mieux pour vous aider.",
    "C'est un point intéressant. Permettez-moi de vous expliquer...",
    "Je suis désolé, je ne suis pas sûr de comprendre. Pouvez-vous reformuler ?",
    "N'hésitez pas à me poser d'autres questions !"
  ];

  ngOnInit() {
    // Message de bienvenue
    this.messages.push({
      text: "Bonjour ! Je suis votre assistant virtuel. Comment puis-je vous aider ?",
      isUser: false,
      timestamp: new Date()
    });
  }

  toggleChat() {
    this.isChatOpen = !this.isChatOpen;
  }

  sendMessage() {
    if (!this.currentMessage.trim()) return;

    // Ajouter le message de l'utilisateur
    this.messages.push({
      text: this.currentMessage,
      isUser: true,
      timestamp: new Date()
    });

    const userMessage = this.currentMessage;
    this.currentMessage = '';

    // Simuler la frappe du bot
    this.isTyping = true;
    
    setTimeout(() => {
      this.isTyping = false;
      
      // Générer une réponse du bot
      const botResponse = this.generateBotResponse(userMessage);
      this.messages.push({
        text: botResponse,
        isUser: false,
        timestamp: new Date()
      });

      // Scroll vers le bas
      this.scrollToBottom();
    }, 1000 + Math.random() * 2000); // Délai aléatoire entre 1-3 secondes
  }

  private generateBotResponse(userMessage: string): string {
    const message = userMessage.toLowerCase();
    
    // Réponses contextuelles simples
    if (message.includes('bonjour') || message.includes('salut')) {
      return "Bonjour ! Ravi de vous rencontrer. Comment allez-vous ?";
    } else if (message.includes('merci')) {
      return "De rien ! Je suis là pour vous aider. Y a-t-il autre chose que je puisse faire pour vous ?";
    } else if (message.includes('au revoir') || message.includes('bye')) {
      return "Au revoir ! N'hésitez pas à revenir si vous avez d'autres questions.";
    } else if (message.includes('aide') || message.includes('help')) {
      return "Je suis là pour vous aider ! Posez-moi vos questions et je ferai de mon mieux pour y répondre.";
    } else if (message.includes('comment') && message.includes('ça va')) {
      return "Ça va très bien, merci ! Et vous, comment vous portez-vous ?";
    } else {
      // Réponse aléatoire
      const randomIndex = Math.floor(Math.random() * this.botResponses.length);
      return this.botResponses[randomIndex];
    }
  }

  private scrollToBottom() {
    setTimeout(() => {
      const messagesContainer = document.querySelector('.chat-messages');
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }, 100);
  }
}