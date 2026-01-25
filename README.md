# OpenSourceCRMApp 🚀
A lightweight, powerful, and customizable Customer Relationship Management (CRM) application designed for small teams and developers. Manage your leads, track interactions, and organize your sales pipeline with ease.

## ✨ Features
Lead Management: Track potential clients from first contact to close.

Contact Database: Centralized storage for all customer information.

Supabase Integration: Real-time database updates and secure authentication.

Responsive UI: Built to work on desktop and mobile browsers.

## 🛠 Tech Stack
Frontend: React / Next.js

Database: Supabase

Backend hosting: Render

## 🚀 Getting Started
1. Database Setup (Supabase)
This app uses Supabase for the database, authentication, and storage.

Create a new project on Supabase.

Go to the SQL Editor in your Supabase dashboard.

Copy the contents of the database.sql file (found in this repo) and run it to create the necessary tables (leads, contacts, tasks, etc.).

Navigate to Project Settings > API to find your SUPABASE_URL and SUPABASE_ANON_KEY.

## 🌐 Backend
Deploying to Render
Log in to Render.

Click New + and select Web Service.

Make a GitHub repository using the backend folder and connect it.

Configure the following settings:

Runtime: Node

Build Command: npm install && npm run build

Start Command: npm start

Add your environment variables (SUPABASE_URL, etc.) in the Environment tab.

## 🖥️ Deploying as a Static Site
Clone this repo and go into the frontend folder. 

Go into JS -> config.js and add your render url("abcdefg.onrender.com/api") in the api section and add your supabase website and service key

Now jsut deploy to a static hosting website, like Firebase or Vercel, only using the files inside of frontend.
