import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { signupSchema, authService } from '../../services/auth.service';
import type { SignupData } from '../../services/auth.service';
import './Auth.css';

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState('');
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignupData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupData) => {
    try {
      setApiError('');
      await authService.signup(data);
      // Optional: automatically log them in after signup, or just redirect to login
      navigate('/login');
    } catch (err: any) {
      setApiError(err.response?.data?.message || 'Failed to create account. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Create an Account</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
          {apiError && <div className="form-error" style={{ textAlign: 'center', marginBottom: '1rem' }}>{apiError}</div>}
          
          <div className="form-group">
            <label className="form-label" htmlFor="firstName">First Name</label>
            <input 
              id="firstName"
              type="text" 
              className="form-input" 
              placeholder="Enter your first name"
              {...register('firstName')} 
            />
            {errors.firstName && <span className="form-error">{errors.firstName.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="lastName">Last Name</label>
            <input 
              id="lastName"
              type="text" 
              className="form-input" 
              placeholder="Enter your last name"
              {...register('lastName')} 
            />
            {errors.lastName && <span className="form-error">{errors.lastName.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input 
              id="email"
              type="email" 
              className="form-input" 
              placeholder="name@example.com"
              {...register('email')} 
            />
            {errors.email && <span className="form-error">{errors.email.message}</span>}
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input 
              id="password"
              type="password" 
              className="form-input" 
              placeholder="Create a strong password"
              {...register('password')} 
            />
            {errors.password && <span className="form-error">{errors.password.message}</span>}
          </div>
          
          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>
        
        <div className="auth-link">
          Already have an account? <Link to="/login">Log in here</Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
