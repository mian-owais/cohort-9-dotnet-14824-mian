import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { taskService } from '../services/task.service';

const FloatingChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  
  const location = useLocation();

  // Determine if we are on a specific task page by parsing the URL
  const taskIdMatch = location.pathname.match(/\/tasks\/(\d+)/);
  const taskId = taskIdMatch ? Number(taskIdMatch[1]) : null;

  const handleAskChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const message = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: message }]);
    setIsChatLoading(true);

    try {
      const response = await taskService.askChat(taskId, message);
      setChatMessages(prev => [...prev, { role: 'ai', content: response }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'ai', content: 'Sorry, I encountered an error. Please try again later.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
      
      {isOpen && (
        <div style={{ 
          backgroundColor: 'var(--bg-card)', 
          border: '2px solid var(--sage-green)', 
          borderRadius: '16px', 
          width: '350px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          marginBottom: '1rem',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <div style={{ backgroundColor: 'var(--sage-green)', color: 'white', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🤖 Global AI Assistant
            </h4>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem', padding: 0 }}>×</button>
          </div>

          <div className="chat-history" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '300px', overflowY: 'auto', backgroundColor: '#fafafa' }}>
            {chatMessages.length === 0 && (
              <p style={{ color: 'var(--text-p)', fontStyle: 'italic', textAlign: 'center', margin: 'auto' }}>
                {taskId ? "Ask me anything about this task!" : "Ask me a general question about task management!"}
              </p>
            )}
            {chatMessages.map((msg, index) => (
              <div key={index} style={{ 
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                backgroundColor: msg.role === 'user' ? 'var(--terracotta)' : '#e0e0e0',
                color: msg.role === 'user' ? '#fff' : 'var(--text)',
                padding: '0.5rem 0.75rem',
                borderRadius: '12px',
                maxWidth: '85%',
                fontSize: '0.9rem'
              }}>
                <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
              </div>
            ))}
            {isChatLoading && (
              <div style={{ alignSelf: 'flex-start', color: 'var(--text-p)', fontStyle: 'italic', fontSize: '0.8rem' }}>AI is typing...</div>
            )}
          </div>

          <form onSubmit={handleAskChat} style={{ display: 'flex', padding: '0.75rem', borderTop: '1px solid #eee', backgroundColor: 'white' }}>
            <input 
              type="text" 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type a message..." 
              style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc', outline: 'none' }}
              disabled={isChatLoading}
            />
            <button 
              type="submit" 
              disabled={isChatLoading || !chatInput.trim()}
              style={{ backgroundColor: 'var(--terracotta)', color: 'white', padding: '0 1rem', borderRadius: '8px', border: 'none', marginLeft: '0.5rem', cursor: isChatLoading ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
            >
              ➤
            </button>
          </form>
        </div>
      )}

      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          cursor: 'pointer',
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          backgroundColor: 'white',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          border: '3px solid var(--terracotta)',
          transition: 'transform 0.2s ease-in-out',
          transform: isOpen ? 'scale(0.9)' : 'scale(1)'
        }}
      >
        <img src="/bot-icon.png" alt="AI Chat Bot" style={{ width: '55px', height: '55px', objectFit: 'contain' }} />
      </div>

    </div>
  );
};

export default FloatingChat;
