# Smart Queue

A smart queue management app that replaces physical crowding with digital time slots. Users receive an assigned time and queue number, and are alerted 10 minutes before their turn.

Built with plain **HTML, CSS and JavaScript** (no framework). Installable on a phone as a PWA.

## Roles
- **Super Admin**: created by developers, not self-registerable. Creates and deactivates Admins, sees all queues, can deactivate any queue.
- **Admin**: created by a Super Admin. Creates and manages queues, assigns slots, monitors the queue live, marks users Arrived or Absent, approves reschedule requests.
- **User**: self-registers, receives slots, sees queue number, people ahead and a live countdown, views history, requests reschedules.

## Features
- Onboarding slides, sign up with a verification code, one sign-in screen for all roles
- Create, edit, cancel and close queues; slots auto-calculated from start, end and slot length
- Search users by name or phone and assign, reassign or remove slots
- Live monitor with Pending, Arrived, Absent (released) and Rescheduled states
- Reschedule requests with admin approve or reject; absent slots are released for reuse
- In-app notifications for every event, a 10-minute reminder, optional browser notifications
- Light and dark mode, offline support, home-screen install

## Demo accounts
| Role | Email | Password |
|---|---|---|
| User | user@smartqueue.app | user123 |
| Admin | admin@smartqueue.app | admin123 |
| Super Admin | super@smartqueue.app | super123 |

## Run locally
A service worker needs a web server (not `file://`):

```bash
cd smart-queue-app
python3 -m http.server 8080
# open http://localhost:8080
```

## Deploy
Push to GitHub, then **Settings → Pages → Deploy from branch → main / root**. Netlify, Vercel and Cloudflare Pages also work by uploading the folder.

## Project structure
```
index.html            App markup, styles and all logic
manifest.webmanifest  Home-screen install settings
sw.js                 Service worker (offline support)
icon-192.png          App icon
icon-512.png          App icon
```

## Current limitations (demo version)
- Data is stored in each device's `localStorage`, so users on different phones do not share data.
- The verification code is shown on screen; no SMS or email is sent.
- Reminders and alerts only fire while the app is open.
- Passwords are stored in plain text locally. Do not use real passwords.

## Roadmap
Move to Firebase (Auth, Firestore, Cloud Messaging) for shared real-time data, real OTP and push notifications while the app is closed.
