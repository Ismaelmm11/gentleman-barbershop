// src/components/ChatbotWidget.tsx
import React, { useState, useRef, useEffect } from 'react';
import { sendQuestionToChatbot } from '../services/chatbot.service';

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

export const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false); // Para indicar que el bot está escribiendo
  const chatBodyRef = useRef<HTMLDivElement>(null); // Referencia para hacer scroll

  // Efecto para hacer scroll al final cada vez que hay nuevos mensajes
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Saludo inicial del bot
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
        setMessages([
          {
            text: "¡Saludos! Es un honor darle la bienvenida a Gentleman Barbershop. Soy Mr. Gentleman, su asistente virtual personal, siempre a su entera disposición. ¿En qué le puedo servir el día de hoy, distinguido caballero/dama?",
            sender: 'bot',
          },
        ]);
      }, 500);
    }
  }, [isOpen, messages.length]);


  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  // Función para convertir Markdown básico a HTML
  // Adaptada de tu código original, para usar en React
  const markdownToHtml = (text: string): string => {
    let html = text.replace(/\n/g, '<br>'); // Reemplazar saltos de línea (\n) por <br>

    // Reemplazar ### Encabezado por <h3>Encabezado</h3>
    html = html.replace(/###\s(.+?)(?=<br>|$)/g, '<h3>$1</h3>');

    // Reemplazar **Texto** por <strong>Texto</strong>
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Convertir listas (líneas que empiezan con 1. o -) en <ul><li>
    const lines = html.split('<br>');
    let inList = false;
    let newLines = [];

    for (let line of lines) {
        if (line.match(/^\d+\.\s(.+)/) || line.match(/^-\s(.+)/)) {
            const listItem = line.replace(/^\d+\.\s(.+)/, '$1').replace(/^-\s(.+)/, '$1');
            if (!inList) {
                newLines.push('<ul>');
                inList = true;
            }
            newLines.push(`<li>${listItem}</li>`);
        } else {
            if (inList) {
                newLines.push('</ul>');
                inList = false;
            }
            newLines.push(line);
        }
    }
    if (inList) {
        newLines.push('</ul>');
    }

    html = newLines.join('');
    return html;
  };


  const handleSendMessage = async () => {
    const messageText = inputMessage.trim();
    if (!messageText) return;

    setMessages((prevMessages) => [...prevMessages, { text: messageText, sender: 'user' }]);
    setInputMessage('');
    setIsTyping(true); // El bot está pensando/escribiendo

    try {
      const response = await sendQuestionToChatbot(messageText);
      const botResponse = response[0]?.respuesta || 'Disculpe, no he podido procesar su solicitud en este momento.';

      setMessages((prevMessages) => [...prevMessages, { text: botResponse, sender: 'bot' }]);
    } catch (error) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: 'Error al conectar con Mr. Gentleman. Por favor, inténtelo de nuevo más tarde.', sender: 'bot' },
      ]);
      console.error(error);
    } finally {
      setIsTyping(false); // El bot ha terminado de escribir
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Icono del Chatbot (la bola) */}
      <div className="chat-icon" onClick={toggleChat} title="Abrir Chat con Mr. Gentleman">
        {/* Usamos una imagen para el bigote de Mr. Gentleman */}
        <img src="/barba.gif" alt="Mr. Gentleman" className="chat-icon-image" />
      </div>

      {/* Ventana del Chatbot */}
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <h3>Mr. Gentleman</h3>
            <span className="close-btn" onClick={toggleChat}>×</span>
          </div>
          <div className="chat-body" ref={chatBodyRef}>
            {messages.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.sender}`}>
                {/* Renderizar HTML si es un mensaje del bot (con Markdown) */}
                {msg.sender === 'bot' ? (
                  <div dangerouslySetInnerHTML={{ __html: markdownToHtml(msg.text) }} />
                ) : (
                  msg.text
                )}
              </div>
            ))}
            {isTyping && (
                <div className="chat-message bot typing-indicator">
                    <span>•</span><span>•</span><span>•</span>
                </div>
            )}
          </div>
          <div className="chat-footer">
            <input
              type="text"
              placeholder="Escribe tu pregunta..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isTyping} // Deshabilitar input mientras el bot responde
            />
            <button onClick={handleSendMessage} disabled={isTyping}>
              Enviar
            </button>
          </div>
        </div>
      )}
    </>
  );
};