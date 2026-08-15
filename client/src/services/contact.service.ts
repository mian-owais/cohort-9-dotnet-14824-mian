import api from './api';

export const contactService = {
  sendEmail: async (subject: string, description: string): Promise<void> => {
    await api.post('/contact/send', { subject, description });
  }
};
