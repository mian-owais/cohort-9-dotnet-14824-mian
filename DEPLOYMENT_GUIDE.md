# Full-Stack Deployment Guide

This guide provides step-by-step instructions for deploying the **Task Management Application** (React/Vite Frontend + .NET 8 Web API Backend) completely for **free**.

## Architecture Overview
* **Database**: SQL Server (Somee.com - Free Tier)
* **Backend**: .NET 8 Web API (Render - Free Web Service)
* **Frontend**: React + Vite (Vercel - Free Tier)

---

## Step 1: Set up the Database (Somee.com)
The application relies on Microsoft SQL Server. We will use a free managed database.

1. Go to [Somee.com](https://somee.com/) or [MonsterASP.net](https://monsterasp.net/) and sign up for a free account.
2. Navigate to **User Control Panel** -> **Databases** -> **MS SQL**.
3. Click **Create new MS SQL Database**. Give it a name (e.g., `TaskManagementDb`).
4. Once provisioned, click on the database to view its connection details.
5. Locate the **Connection String** provided by the dashboard. It will look something like this:
   ```text
   Server=tcp:someserver.somee.com;Database=TaskManagementDb;User Id=your_username;Password=your_password;TrustServerCertificate=True;
   ```
6. Copy this Connection String. You will need it for the Backend deployment.

---

## Step 2: Deploy the Backend (Render)
We will deploy the .NET 8 API using Docker via Render's free tier.

1. Go to [Render.com](https://render.com/) and create a free account using your GitHub profile.
2. In the Render Dashboard, click **New +** and select **Web Service**.
3. Under **Connect a repository**, select your GitHub repository (`mian-owais/cohort-9-dotnet-14824-mian`).
4. Fill out the service details:
   * **Name**: `task-management-api` (or similar)
   * **Region**: Choose the region closest to you
   * **Branch**: `main`
   * **Environment**: `Docker` (Render will automatically detect the `Dockerfile` in the root of your repo)
   * **Instance Type**: Select **Free**
5. Scroll down to **Environment Variables** and add the following keys to override your local settings safely:
   * Key: `ConnectionStrings__DefaultConnection` -> Value: *Paste the Connection String from Step 1*
   * Key: `JwtSettings__Secret` -> Value: *Enter a long random string (at least 32 characters, e.g. `MySuperSecretKeyForJWTAuth123456789!`)*
   * Key: `GeminiSettings__ApiKey` -> Value: *Paste your Google Gemini API Key*
6. Click **Create Web Service**. 
7. Render will now build the Docker image and deploy it. Once the build finishes, copy the URL provided at the top left of the dashboard (e.g., `https://task-management-api.onrender.com`).
   * *Note: The first time you hit a Render free-tier URL, it might take 30-50 seconds to "wake up".*

---

## Step 3: Deploy the Frontend (Vercel)
The React app is already configured for Vercel deployment with correct SPA routing in `vercel.json`.

1. Go to [Vercel.com](https://vercel.com/) and log in with your GitHub account.
2. From the Vercel dashboard, click **Add New...** -> **Project**.
3. Import your GitHub repository (`mian-owais/cohort-9-dotnet-14824-mian`).
4. Vercel will automatically detect the framework as **Vite**.
5. In the configuration window, open the **Environment Variables** tab.
6. Add the following environment variable to tell the frontend where the deployed backend is located:
   * Name: `VITE_API_URL`
   * Value: *Paste your Render Backend URL followed by `/api`* (e.g., `https://task-management-api.onrender.com/api`)
7. Click **Deploy**.
8. Vercel will build the React application and provide you with a live, public URL.

---

## Step 4: Verify Deployment
1. Open your new Vercel URL in your browser.
2. Register a new user account.
3. Because the backend code includes an Entity Framework Migration step on startup (`app.Services.CreateScope() -> dbContext.Database.MigrateAsync()`), the database tables in your free SQL Server will automatically be created the very first time the API boots up. No manual SQL scripts are required!

## Troubleshooting
* **Frontend shows Network Error on login**: Ensure `VITE_API_URL` is set correctly in Vercel (no trailing slash). Also, remember the Render free tier sleeps after 15 minutes of inactivity. The first login attempt might take 50 seconds while the backend wakes up.
* **Backend fails to build on Render**: Check the Render deployment logs. Ensure you selected the `Docker` environment, as the repo provides a multi-stage `Dockerfile`.
