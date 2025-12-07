# TaskTracker - Full-Stack Task Management App

A modern, full-stack task management application built with Next.js 14, TypeScript, Tailwind CSS, and MongoDB, with an optional Express.js backend.

## Features

- **Authentication**: JWT-based auth with secure password hashing (bcrypt)
- **Task CRUD**: Create, read, update, delete tasks
- **Task Properties**: Title, description, due date, priority (Low/Medium/High), status (To Do/In Progress/Done)
- **User Isolation**: Each user only sees their own tasks
- **Advanced Filtering**: Filter by status, priority, date range
- **Sorting**: Sort by date created, due date, priority, or title
- **Debounced Search**: 300ms debounce for smooth search experience
- **Pagination**: Navigate through tasks with pagination controls
- **Responsive UI**: Works on all screen sizes with equally spaced buttons
- **Toast Notifications**: Feedback for all actions
- **Delete Confirmation**: Confirmation dialog before deleting tasks

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- SWR for data fetching
- Zustand for state management

### Backend (Next.js API Routes)
- Next.js API Routes
- MongoDB Atlas
- JWT (jose library)
- bcryptjs for password hashing
- Zod for validation

### Backend (Express.js - Optional)
- Express.js
- Mongoose ODM
- JWT (jsonwebtoken)
- bcryptjs for password hashing
- Zod for validation
- Jest + Supertest for testing

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
│   │   ├── stats-cards.tsx
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
├── server/                    # Express.js Backend
│   ├── index.js              # Server entry point
│   ├── package.json          # Backend dependencies
│   ├── models/
│   │   ├── User.js
│   │   └── Task.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── validate.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── tasks.js
│   └── tests/
│       ├── auth.test.js
│       └── tasks.test.js
└── README.md
\`\`\`

## Environment Variables

Add these in the **Vars** section of the v0 sidebar:

\`\`\`env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
\`\`\`

For Express.js backend (.env file):

\`\`\`env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5000
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
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
- `GET /api/tasks/stats` - Get task statistics (Express.js only)

## Query Parameters for GET /api/tasks

| Parameter | Description | Default |
|-----------|-------------|---------|
| `page` | Page number | 1 |
| `limit` | Items per page | 10 |
| `status` | Filter by status (To Do, In Progress, Done) | All |
| `priority` | Filter by priority (Low, Medium, High) | All |
| `search` | Search in title and description | - |
| `sortBy` | Sort field (createdAt, dueDate, priority, title) | createdAt |
| `sortOrder` | Sort direction (asc, desc) | desc |
| `dueDateFrom` | Filter tasks due after this date | - |
| `dueDateTo` | Filter tasks due before this date | - |

## Deployment

### Vercel (Frontend + API)
1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Express.js Backend (Render)
1. Navigate to `/server` directory
2. Push to separate GitHub repo or subdirectory
3. Create new Web Service on Render
4. Set build command: `npm install`
5. Set start command: `npm start`
6. Add environment variables
7. Deploy

### MongoDB Atlas
1. Create cluster at mongodb.com/atlas
2. Create database user
3. Whitelist IP addresses (or allow from anywhere for Vercel/Render)
4. Get connection string

## Local Development

### Frontend (Next.js)
\`\`\`bash
# Install dependencies
npm install

# Run development server
npm run dev
\`\`\`

### Backend (Express.js)
\`\`\`bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Run development server
npm run dev
\`\`\`

## Testing

### Express.js Backend Tests
\`\`\`bash
cd server
npm test
\`\`\`

## MongoDB Schema

### User
\`\`\`javascript
{
  name: String (required, min 2 chars),
  email: String (required, unique, lowercase),
  password: String (required, hashed, min 6 chars),
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

### Task
\`\`\`javascript
{
  title: String (required, max 100 chars),
  description: String (max 500 chars),
  dueDate: Date,
  priority: "Low" | "Medium" | "High" (default: "Medium"),
  status: "To Do" | "In Progress" | "Done" (default: "To Do"),
  tags: [String],
  userId: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

## License

MIT
