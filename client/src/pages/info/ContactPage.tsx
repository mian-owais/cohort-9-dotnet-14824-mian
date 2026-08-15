import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { contactService } from '../../services/contact.service';
import './Contact.css';

const ContactPage: React.FC = () => {
  const navigate = useNavigate();
  const [problem, setProblem] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problem.trim() || !description.trim()) return;

    setIsLoading(true);
    setStatusMsg(null);

    try {
      await contactService.sendEmail(problem, description);
      setStatusMsg({ type: 'success', text: 'Problem reported successfully! The email has been sent.' });
      setProblem('');
      setDescription('');
    } catch (error) {
      setStatusMsg({ type: 'error', text: 'Failed to send report. Please check the backend SMTP configuration.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <Navbar title="Contact Us" />

      <main className="contact-page-container">
        <div className="contact-header">
          <h2>Get In Touch</h2>
          <p>
            Have a question or need support? We'd love to hear from you. Please reach out using the contact details below or send us a message directly.
          </p>
        </div>

        <div className="contact-grid">

          {/* Left Column: Contact Info */}
          <div className="contact-info-card">
            <div className="info-item">
              <h4>📧 Email</h4>
              <p>u2023316@giki.edu.pk</p>
            </div>
            <div className="info-item">
              <h4>📞 Phone</h4>
              <p>+92 (337) 9677695</p>
            </div>
            <div className="info-item">
              <h4>📍 Address</h4>
              <p>Room 66, Hostel 6, Ghulam Ishaq Khan Institute of Engineering Sciences and Technology, Topi, Swabi, KPK, PAKISTAN</p>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="contact-form-card">
            <h3>Report a Problem</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="problem">Problem Subject</label>
                <input
                  id="problem"
                  type="text"
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  placeholder="Subject..."
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide more details about the problem..."
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="submit-btn"
              >
                {isLoading ? 'Sending...' : 'Submit Problem'}
              </button>

              {statusMsg && (
                <div className={`status-message ${statusMsg.type === 'success' ? 'status-success' : 'status-error'}`}>
                  {statusMsg.text}
                </div>
              )}
            </form>
          </div>

        </div>
      </main>
    </div>
  );
};

export default ContactPage;
