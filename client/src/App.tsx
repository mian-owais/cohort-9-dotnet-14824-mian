import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import TaskListPage from './pages/tasks/TaskListPage';
import TaskFormPage from './pages/tasks/TaskFormPage';
import TaskDetailPage from './pages/tasks/TaskDetailPage';
import ProfilePage from './pages/profile/ProfilePage';
import AboutPage from './pages/info/AboutPage';
import ContactPage from './pages/info/ContactPage';
import FloatingChat from './components/FloatingChat';

const App: React.FC = () => {
  return (
    <Router>
      <FloatingChat />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/tasks" element={<TaskListPage />} />
        <Route path="/tasks/new" element={<TaskFormPage />} />
        <Route path="/tasks/:id/edit" element={<TaskFormPage />} />
        <Route path="/tasks/:id" element={<TaskDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
