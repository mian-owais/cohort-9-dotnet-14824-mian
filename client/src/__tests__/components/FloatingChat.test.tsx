import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FloatingChat from '../../components/FloatingChat';
import { taskService } from '../../services/task.service';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../../services/task.service', () => ({
  taskService: {
    askChat: vi.fn(),
  },
}));

describe('FloatingChat', () => {
  it('should render the closed floating bot icon by default', () => {
    render(
      <BrowserRouter>
        <FloatingChat />
      </BrowserRouter>
    );
    expect(screen.getByAltText('AI Chat Bot')).toBeInTheDocument();
    expect(screen.queryByText('🤖 Global AI Assistant')).not.toBeInTheDocument();
  });

  it('should open the chat box when the icon is clicked', () => {
    render(
      <BrowserRouter>
        <FloatingChat />
      </BrowserRouter>
    );
    const botIcon = screen.getByAltText('AI Chat Bot');
    fireEvent.click(botIcon);
    
    expect(screen.getByText('🤖 Global AI Assistant')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument();
  });

  it('should send a message and display AI response', async () => {
    (taskService.askChat as any).mockResolvedValue('Hello, I am the AI.');
    
    render(
      <BrowserRouter>
        <FloatingChat />
      </BrowserRouter>
    );
    
    // Open chat
    fireEvent.click(screen.getByAltText('AI Chat Bot'));
    
    // Type message
    const input = screen.getByPlaceholderText('Type a message...');
    fireEvent.change(input, { target: { value: 'Hi AI' } });
    
    // Send
    const sendButton = screen.getByText('➤');
    fireEvent.click(sendButton);
    
    // Check user message is displayed
    expect(screen.getByText('Hi AI')).toBeInTheDocument();
    
    // Wait for AI response
    await waitFor(() => {
      expect(screen.getByText('Hello, I am the AI.')).toBeInTheDocument();
    });
  });
});
