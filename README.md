# TaskTracker - Full-Stack Task Management App

A modern, full-stack task management application built with Next.js 14, TypeScript, Tailwind CSS, and MongoDB.

## Features

- **Authentication**: JWT-based auth with secure password hashing (bcrypt)
- **Task CRUD**: Create, read, update, delete tasks
- **Task Properties**: Title, description, due date, priority (Low/Medium/High), status (To Do/In Progress/Done)
- **User Isolation**: Each user only sees their own tasks
- **Filtering & Search**: Filter by status, search by title/description
- **Debounced Search**: 300ms debounce for smooth search experience
- **Pagination**: Navigate through tasks with pagination
- **Responsive UI**: Works on all screen sizes
- **Toast Notifications**: Feedback for all actions

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- SWR for data fetching
- Zustand for state management

### Backend
- Next.js API Routes
- MongoDB Atlas
- JWT (jose library)
- bcryptjs for password hashing
- Zod for validation

## Project Structure

\`\`\`
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   ├── logout/route.ts
│   │   │   ├── me/route.ts
│   │   │   └── register/route.ts
│   │   └── tasks/
│   │       ├── [id]/route.ts
│   │       └── route.ts
│   ├── dashboard/page.tsx
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── auth/
│   │   ├── login-form.tsx
│   │   └── register-form.tsx
│   ├── dashboard/
│   │   ├── dashboard-header.tsx
│   │   ├── task-card.tsx
│   │   ├── task-filters.tsx
│   │   ├── task-list.tsx
│   │   └── task-modal.tsx
│   ├── providers/
│   │   └── auth-provider.tsx
│   └── ui/
├── lib/
│   ├── auth/
│   │   ├── jwt.ts
│   │   └── password.ts
│   ├── db/
│   │   ├── mongodb.ts
│   │   └── schemas.ts
│   └── hooks/
│       ├── use-auth.ts
│       ├── use-debounce.ts
│       └── use-tasks.ts
└── README.md
\`\`\`

## Environment Variables

Create a `.env.local` file with:

\`\`\`env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
\`\`\`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Tasks
- `GET /api/tasks` - Get all tasks (with pagination, filtering, search)
- `POST /api/tasks` - Create new task
- `GET /api/tasks/[id]` - Get single task
- `PUT /api/tasks/[id]` - Update task
- `DELETE /api/tasks/[id]` - Delete task

## Query Parameters for GET /api/tasks

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `status` - Filter by status (To Do, In Progress, Done)
- `search` - Search in title and description

## Deployment

### Vercel (Frontend + API)
1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### MongoDB Atlas
1. Create cluster at mongodb.com/atlas
2. Create database user
3. Whitelist IP addresses (or allow from anywhere for Vercel)
4. Get connection string

## Local Development

\`\`\`bash
# Install dependencies
npm install

# Run development server
npm run dev
\`\`\`

## Testing (Optional)

Basic test structure with Jest + Supertest:

\`\`\`bash
npm test
\`\`\`

## License

MIT
\`\`\`
