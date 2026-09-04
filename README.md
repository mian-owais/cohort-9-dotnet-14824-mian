# Task Management System - Fullstack (.NET + ReactJS)

Cohort 9 — .NET Fullstack assignment for **Mian Muhammad Owais**

## 🚀 Overview
This is a production-ready, full-stack Task Management application built using **.NET 8 (Clean Architecture)** for the backend and **ReactJS (Vite + TypeScript)** for the frontend. 

## 🔐 How to Log In & Test Roles

The application uses an automated role-assignment system during registration based on the email provided. 

### To log in as an **Admin**:
1. Go to the Registration page.
2. Register an account using any email address that contains the word **"admin"**.
   - *Example:* `admin@example.com` or `superadmin@test.com`
3. As an Admin, you will have access to the Dashboard metrics, the ability to view all users' tasks, assign tasks to specific users, and delete any task.

### To log in as a **Normal User**:
1. Go to the Registration page.
2. Register an account using an email address that **does NOT contain** the word "admin".
   - *Example:* `john@example.com` or `user123@test.com`
3. As a normal User, you will only see your own tasks, and you cannot assign tasks to other people or view the global dashboard metrics.

---

## 🛠️ Features Implemented
- **Clean Architecture Backend**: Separation of concerns into `Core`, `Infrastructure`, and `API` layers.
- **JWT Authentication & Authorization**: Secure `HttpOnly` cookies for managing sessions and Role-Based Access Control (RBAC).
- **AI Chat Module**: Integrated with Google Gemini API to ask questions about your tasks.
- **Dynamic Dashboard**: Visual representation of task statuses (Completed, In Progress, Pending).
- **Fully Tested**: Includes a robust suite of xUnit backend tests and Vitest frontend tests.

## 🏃 How to Run Locally

### 1. Start the Backend (.NET 8)
```bash
cd TaskManagement.API
dotnet run
```
*The Swagger API documentation will be available at `http://localhost:5224/swagger`*

### 2. Start the Frontend (ReactJS)
```bash
cd client
npm install
npm run dev
```
*The frontend will run at `http://localhost:5173`*
