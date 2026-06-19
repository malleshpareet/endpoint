# Httply

**Httply** is a modern, collaborative API development client built for teams who ship fast. Designed as a lightweight, web-first alternative to tools like Postman or Insomnia, Httply allows developers to test, debug, and share APIs seamlessly from the browser.

                 ![Httply Logo](/public/logo__2_-removebg-preview.png)

---

## 🌟 Key Features

### 1. **Workspaces & Collaboration**
- **Personal & Team Workspaces**: Isolate personal API tests from team projects.
- **Role-Based Access Control (RBAC)**: Assign `ADMIN`, `EDITOR`, or `VIEWER` roles to team members.
- **Email Invites**: Invite team members securely via SMTP-powered email links.

### 2. **API Request Playground**
- **REST Client**: Full support for `GET`, `POST`, `PUT`, `PATCH`, and `DELETE` requests.
- **Advanced Editors**: 
  - Interactive Monaco Editor for JSON request bodies.
  - Dynamic key-value forms for Query Parameters and Headers.
  - Authorization tab (Bearer tokens, Basic Auth, API Keys, etc.).
- **Response Viewer**: Pretty-printed JSON responses, status codes, response times, and size tracking.
- **Code Snippet Generator**: Automatically generate fetch/axios code snippets for your configured requests.

### 3. **Organization & State**
- **Collections**: Group related API requests into logical folders.
- **Environments**: Define multiple environments (e.g., Local, Staging, Production) with specific key-value variables to easily switch contexts.
- **Global & Collection Variables**: Use `{{variable_name}}` syntax in URLs, headers, or bodies to dynamically inject values.
- **Request History**: Automatically tracks past runs of requests for easy debugging and auditing.

### 4. **Realtime Connections**
- Built-in support for establishing and testing Realtime API connections (WebSockets / Server-Sent Events).

---

## 🏗 Architecture & System Design

Httply is built on a modern **Serverless/Edge-compatible Web Architecture** using the Next.js App Router paradigm.

### Tech Stack
- **Framework**: Next.js 14/15 (App Router, Server Actions)
- **Database**: PostgreSQL (containerized via Docker)
- **ORM**: Prisma Client
- **Authentication**: Better Auth / NextAuth
- **State Management**: 
  - **Zustand**: Client-side UI state (e.g., active tabs, playground state).
  - **React Query (@tanstack/react-query)**: Server state management, caching, and optimistic UI updates.
- **Styling**: Tailwind CSS, class-variance-authority, tailwind-merge
- **UI Components**: Radix UI primitives wrapped in Shadcn UI components.
- **Code Editor**: `@monaco-editor/react`

### Design Patterns
- **Module-Based Structure**: The codebase is split into domain-specific modules inside `src/modules/` (e.g., `/authentication`, `/workspace`, `/collections`, `/request`, `/realtime`). This keeps logic deeply cohesive.
- **Server Actions**: Direct database mutations are handled via Next.js `"use server"` actions rather than traditional REST API endpoints, reducing boilerplate and providing end-to-end type safety.
- **Optimistic Updates**: React Query mutations are configured to provide instant UI feedback (e.g., when renaming a collection) before the server confirms the change.
- **Resizable Layout**: Built using `react-resizable-panels` to provide a true IDE-like experience in the browser.

---

## 🗄️ Data Model Workflow

The Prisma schema is designed for multi-tenant isolation and strict relational integrity:

1. **User Identity**: Users authenticate via social providers or email (`User`, `Account`, `Session`).
2. **Tenancy (Workspace)**: Everything lives within a `Workspace`. A Workspace has an `owner`, but allows `WorkspaceMember` relations with specific roles.
3. **Environment State**: `Environment` records belong to a Workspace and store JSON configurations.
4. **API Structuring**: 
   - `Workspace` ⭢ 1:N ⭢ `Collection`
   - `Collection` ⭢ 1:N ⭢ `Request`
5. **Request Execution**: A `Request` defines the template (URL, method, headers). When executed, a `RequestRun` is generated to log the specific outcome (status, duration, body) into the history.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Docker & Docker Compose (for the PostgreSQL database)

### Installation & Setup

1. **Clone the repository & Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

2. **Configure Environment Variables**
   Create a `.env` file in the root directory based on `.env.example`.
   Ensure you have configured:
   - Database credentials
   - Auth secrets (Google/GitHub OAuth clients, Better Auth secrets)
   - SMTP credentials (for workspace email invites)

3. **Start the Database**
   Spin up the local PostgreSQL container:
   \`\`\`bash
   docker-compose up -d
   \`\`\`

4. **Initialize the Schema**
   Push the Prisma schema to the database:
   \`\`\`bash
   npx prisma db push
   \`\`\`

5. **Run the Development Server**
   Start the Next.js Turbopack dev server:
   \`\`\`bash
   npm run dev
   \`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser to start building APIs.

---

## 🛡️ Security & Permissions

Httply implements granular workspace permissions:
- **Server-Side Verification**: Every Prisma query affecting a workspace checks the current user's token against the `WorkspaceMember` table.
- **Roles**:
  - `ADMIN`: Can invite members, delete the workspace, and edit all resources.
  - `EDITOR`: Can create, edit, and delete Collections and Requests.
  - `VIEWER`: Can view Collections and execute requests, but cannot modify the shared workspace state.

---

## 👨‍💻 Developer Workflow

When contributing or adding new features:
1. Identify the domain and place components/hooks/actions in the relevant `src/modules/[domain]/` folder.
2. If modifying the database schema, update `prisma/schema.prisma` and run `npx prisma db push`.
3. Use `lucide-react` for iconography and `shadcn/ui` for new UI components.
4. Always type server actions carefully, as they bridge the client-server boundary.
