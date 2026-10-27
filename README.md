# Smart Queue

A smart queue management app that replaces physical crowding with digital time slots. Users receive an assigned time and queue number and are alerted 10 minutes before their turn.

Built with plain **HTML, CSS and JavaScript** (no framework, no build step). Installable on a phone as a PWA.

## Roles
- **Super Admin**: created by developers, not self-registerable. Creates and deactivates Admins, sees all queues, can deactivate any queue.
- **Admin**: created by a Super Admin. Creates and manages queues, assigns slots, monitors the queue live, marks users Arrived or Absent, approves reschedule requests.
- **User**: self-registers, receives slots, sees queue number, people ahead and a live countdown, views history, requests reschedules.

## Features
- Onboarding slides, sign up with a verification code, one sign-in screen for all roles
- Create, edit, cancel and close queues; slots are calculated from start time, end time and slot length
- Search users by name or phone; assign, reassign or remove slots
- Live monitor: Pending, Arrived, Absent (released) and Rescheduled states
- Reschedule requests with admin approve or reject; absent slots are released for reuse
- In-app notifications for every event, a 10-minute reminder, optional browser notifications
- Light and dark mode, home-screen install

## Demo accounts
| Role | Email | Password |
|---|---|---|
| User | user@smartqueue.app | user123 |
| Admin | admin@smartqueue.app | admin123 |
| Super Admin | super@smartqueue.app | super123 |

## Project structure
```
smart-queue/
├── index.html              Page shell: loads the CSS and the four JS files
├── css/
│   └── style.css           All styling, light and dark themes
├── js/
│   ├── utils.js            Helpers: ids, time and date formatting, icons
│   ├── store.js            Data model, seed data, localStorage, navigation, notifications
│   ├── views.js            Every screen (user, admin, super admin, shared) and render()
│   └── actions.js          Button handlers, click wiring, start-up
├── manifest.webmanifest    Home-screen install settings
├── sw.js                   Clears any old offline cache (safe to keep)
├── icon-192.png
├── icon-512.png
└── README.md
```
The JS files are plain scripts loaded in this order; they share one global scope.

## Run locally
```bash
cd smart-queue
python3 -m http.server 8080
# open http://localhost:8080
```

## Deploy
Push to GitHub, then **Settings → Pages → Deploy from branch → main / root**. Vercel, Netlify and Cloudflare Pages also work: upload the folder as is.

## Limitations of this demo version
- Data is stored in each device's `localStorage`, so users on different phones do not share data.
- The verification code is shown on screen; no SMS or email is sent.
- Reminders and alerts only fire while the app is open.
- Passwords are stored in plain text locally. Do not use real passwords.

## Roadmap
Move to Firebase (Auth, Firestore, Cloud Messaging) for shared real-time data, real OTP and push notifications while the app is closed.
