# WK Time

WK Time is a shift scheduling web app built with Spring Boot (backend) and React (frontend).

## Core Features
- Employee signup with **pending approval** status.
- Admin can approve/reject pending accounts.
- Role-based login (Admin / Employee).
- Admin shift management with publish and open-shift support.
- Employee schedule view with cover-request requests.
- Weekly availability submission grid.
- Open shift workflow with admin approval.
- In-app notifications for schedule and approval updates.
- Optional email notifications through SMTP.
- Branding based on your selected palette:
  - `#C87740`
  - `#2E1F26`

## Default Admin
- Email: `admin@wktime.local`
- Password: `Admin@123`

## Backend Run
1. Open terminal in:
   `WK-Time/backend`
2. Run:
   `mvn spring-boot:run`

Backend URL:
`http://localhost:8080`

## Frontend Run
1. Open terminal in:
   `WK-Time/frontend`
2. Install:
   `npm install`
3. Run:
   `npm run dev`

Frontend URL:
`http://localhost:5173`

## API Overview
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/admin/pending-users` (admin)
- `PATCH /api/admin/users/{id}/approve` (admin)
- `PATCH /api/admin/users/{id}/reject` (admin)
- `GET /api/users/active-employees` (admin)
- `GET /api/availability/mine`
- `POST /api/availability/mine`
- `GET /api/availability` (admin)
- `GET /api/shifts` (admin)
- `POST /api/shifts` (admin)
- `PUT /api/shifts/{id}` (admin)
- `DELETE /api/shifts/{id}` (admin)
- `PATCH /api/shifts/{id}/publish` (admin)
- `POST /api/shifts/{id}/request-cover`
- `GET /api/shifts/open`
- `GET /api/shifts/mine` (employee)
- `GET /api/shift-requests/mine`
- `GET /api/shift-requests` (admin)
- `POST /api/shift-requests/{shiftId}/take`
- `PATCH /api/shift-requests/{id}/approve` (admin)
- `PATCH /api/shift-requests/{id}/reject` (admin)
- `GET /api/notifications/mine`
- `PATCH /api/notifications/{id}/read`

## Email Notifications
Email sending is disabled by default.

To enable it, update [application.yml](C:/Users/lenovo/Documents/Codex/2026-04-27/files-mentioned-by-the-user-shift/WK_Time_v1/backend/src/main/resources/application.yml):
- Set `app.mail.enabled: true`
- Set `app.mail.from` to your sender address
- Fill `spring.mail.username` and `spring.mail.password`
- Change `spring.mail.host` and `spring.mail.port` if you are not using Gmail SMTP
