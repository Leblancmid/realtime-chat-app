# Real-time Chat App

One-to-one messaging that updates live over WebSockets: messages, typing indicators, online
status, read receipts and reactions appear instantly, without refreshing.

**Laravel 13 · Laravel Reverb (WebSockets) · Sanctum · React 19 · TypeScript · Tailwind 4**

## Features

- **Live messaging** over Laravel Reverb and Laravel Echo: `MessageSent`, `UserTyping` and
  `MessageSeen` are broadcast to each user's `chat.{id}` channel.
- **Typing indicator, online status and "last seen"**.
- **Read receipts:** messages are marked seen when the other person opens the chat.
- **Reactions** on any message (add or remove).
- **Images, GIFs, stickers and emoji:** image uploads with a full-size preview.
- **Accounts:** register, sign in, edit profile and change password (Sanctum tokens).
- Toast notifications and protected/guest-only routes on the frontend.

## Structure

```
backend/    Laravel API + Reverb WebSocket server
  app/Events            MessageSent, UserTyping, MessageSeen (broadcast events)
  app/Models            User, Message, MessageReaction
  routes/api.php        auth, messages, reactions, typing, presence
frontend/   React + Vite SPA
  src/echo.ts           Laravel Echo client for Reverb
  src/hooks/useChat.ts  chat state and live subscriptions
  src/components/chat   sidebar, messages, input, pickers, image preview
```

## Running it locally

Requirements: PHP 8.3+, Composer, Node 20+, MySQL.

```bash
# Backend
cd backend
composer install
cp .env.example .env               # set DB_* and BROADCAST_CONNECTION=reverb
php artisan key:generate
php artisan reverb:install         # writes the REVERB_* keys into .env
php artisan migrate --seed
php artisan serve                  # API on :8000
php artisan reverb:start           # WebSockets on :8080 (another terminal)

# Frontend
cd frontend
cp .env.example .env               # VITE_REVERB_APP_KEY = REVERB_APP_KEY from backend/.env
npm install
npm run dev
```

Open the app in two browsers, sign in as two different users, and chat.
