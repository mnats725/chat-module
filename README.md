# Chat Module

## Назначение

Модуль чата — отдельный сервис на Express + Socket.IO (WebSocket) с интеграцией к REST-бэкенду

Основные возможности:

- Авторизация пользователей по JWT токену (валидация через бекенд-ручку `/api/users/current`).
- Работа с комнатами: создание, получение, вход, выход.
- Управление комнатами: архивирование / разархивирование, блокировка / разблокировка.
- Передача сообщений внутри комнаты.
- Получение истории сообщений через REST API.
- Рассылка событий: вход/выход пользователей, новые сообщения, системные ошибки.

---

## Архитектура
```
chat-module/
├─ src/
│ ├─ chat-server.ts # точка входа: Express + http.Server + initChatSockets
│ ├─ chat-module.ts # initChatSockets: Socket.IO + middleware
│ ├─ handlers/ # хендлеры событий сокета
│ ├─ api/ # запросы к REST (сообщения/комнаты)
│ ├─ auth/ # валидация токена через бекенд
│ ├─ middleware/
│ │ ├─ auth-token.middleware.ts
│ │ └─ socket-debug.middleware.ts
│ ├─ utils/ # утилиты (safeReadError, stripEmpty и др.)
│ ├─ types/ # типы (в т.ч. сгруппированные опции auth/socket)
│ └─ events/ # контракт событий
├─ .env
├─ package.json
├─ tsconfig.json
└─ .gitignore
```
---

## События

### Клиент → Сервер

- **`room:join`** `{ roomId }` — вход в комнату
- **`room:leave`** `{ roomId }` — выход из комнаты
- **`room:create`** `{ title, type, second_id? }` — создать комнату
- **`rooms:get`** `{ page, limit }` — получить список комнат
- **`message:send`** `{ roomId, body, title? }` — отправка сообщения

### Сервер → Клиент

- **`auth:ok`** `{ userId, username }` — успешная аутентификация
- **`room:joined`** `{ roomId }` — подтверждение входа
- **`room:left`** `{ roomId }` — подтверждение выхода
- **`room:user-joined`** `{ roomId, userId, socketId }` — пользователь вошёл
- **`room:user-left`** `{ roomId, userId, socketId }` — пользователь вышел
- **`rooms:list`** `Room[]` — список комнат
- **`messages`** `Message[]` — история сообщений комнаты
- **`message:new`** `Message` — новое сообщение
- **`error`** `{ message }` — ошибка

---

## REST API

### Комнаты

- `GET /api/chat/rooms` — список комнат (с пагинацией)
- `POST /api/chat/rooms` — создать комнату
- `PUT /api/chat/rooms/{id}/archive` — архивировать комнату
- `PUT /api/chat/rooms/{id}/unarchive` — разархивировать комнату
- `PUT /api/chat/rooms/{id}/lock` — заблокировать комнату
- `PUT /api/chat/rooms/{id}/unlock` — разблокировать комнату

### Сообщения

- `GET /api/chat/messages/{roomId}/messages?page&limit` — получить историю сообщений
- `POST /api/chat/messages` — создать сообщение

---

## Жизненный цикл подключения

1. Клиент подключается с JWT токеном.
2. Сервер валидирует токен через `/api/users/current`.
3. При успехе отправляется событие `auth:ok`.
4. Пользователь вызывает `room:join`. Сервер отправляет историю (`messages`).
5. При `message:send` сообщение сохраняется и рассылается всем в комнате (`message:new`).
6. При `room:leave` или `disconnect` сервер уведомляет комнату.

---

## Переменные окружения для chat-module

```env
# Порт чат-сервиса
CHAT_PORT=3001

# Путь Socket.IO/Engine.IO (должен совпасть с клиентским VITE_WS_URL)
IO_PATH=/socket.io

# Бекенд для валидации токена
BACKEND_URL=
AUTH_TIMEOUT_MS=3000

# Разрешённые origin'ы фронта (точные строки)
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# Доп. заголовки к бекенду (опционально, JSON)
# AUTH_HEADERS={"x-service":"chat-module"}

# Отладка сокетов (опционально)
# SOCKET_DEBUG=1
```

## Переменные окружения для frontend

```env
# REST-бэкенд (Axios/baseURL)
VITE_API_URL=

# Socket.IO (полный URL С ПУТЁМ; порт опционален)
# Dev — локальный сокет:
VITE_WS_URL=http://127.0.0.1:3001/socket.io

# Prod — за прокси/Nginx, без порта:
VITE_WS_URL=
```

## Клиентский SDK (пример)

```javascript
import { io } from 'socket.io-client';

// Берём полную ссылку с путём из ENV
const raw = import.meta.env.VITE_WS_URL;
const u = new URL(raw, window.location.origin);

const socket = io(u.origin, {
  path: u.pathname && u.pathname !== '/' ? u.pathname : '/socket.io',
  // withCredentials: true,       // включать ТОЛЬКО если на сервере credentials: true
  auth: { token: jwt }, // основной канал передачи токена
  query: { token: jwt }, // запасной для сервера
});

// Вход в комнату (с ACK)
socket.timeout(8000).emit('room:join', { roomId: 1 }, (err, res) => {
  if (err) return console.error('[room:join] timeout/transport:', err);
  if (!res?.ok) return console.error('[room:join] rejected:', res?.error);
  console.log('[room:join] ok');
});

// Получение сообщений
socket.on('message:new', (msg) => console.log('Новое сообщение:', msg));

// Отправка (с ACK)
socket.timeout(8000).emit('message:send', { roomId: 1, body: 'Привет!' }, (err, res) => {
  if (err) return console.error('[message:send] timeout/transport:', err);
  if (!res?.ok) return console.error('[message:send] rejected:', res?.error);
  console.log('[message:send] ok, id=', res.id);
});
```
