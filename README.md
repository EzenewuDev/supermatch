# Supermatch

Supermatch is a comprehensive academic allocation platform designed to streamline the process of matching university students with academic supervisors. It replaces manual, error-prone assignment processes with an intelligent, preference-based matching system, ensuring fairness and optimal distribution of supervisory workload.

## Features

### For Students
- **Dashboard Overview**: Track your CGPA, current allocation status, and preferences at a glance.
- **Profile Management**: Easily create and maintain your student profile with your academic details.
- **Preference Selection**: Rank your preferred supervisors based on their research interests, department, and available capacity.
- **Real-time Status Updates**: Get instant feedback on your allocation results as soon as they are finalized by the administration.

### For Supervisors
- **Capacity Management**: Set your maximum student capacity to ensure you are not overwhelmed.
- **Availability Toggle**: Indicate whether you are currently taking on new students.
- **Student Overviews**: View assigned students and track their progress effortlessly.

### For Administrators
- **System Dashboard**: Get a birds-eye view of total students, supervisors, and pending allocations.
- **Automated Matching Algorithm**: Run a smart matching algorithm that considers student CGPA, preferences, and supervisor capacity to generate fair allocations.
- **Manual Overrides**: Administrators can review and adjust allocations before finalizing them.
- **User Management**: Manage student and supervisor accounts and monitor system health.

## Technology Stack

Supermatch is built using a modern, robust, and type-safe technology stack:

- **Frontend**: [React](https://react.dev/) with [Vite](https://vitejs.dev/)
- **Routing**: [React Router](https://reactrouter.com/) (v7)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with custom animations and [Radix UI](https://www.radix-ui.com/) primitives for accessible components.
- **API & Data Fetching**: [tRPC](https://trpc.io/) and [React Query](https://tanstack.com/query/latest) for end-to-end type-safe API calls.
- **Database ORM**: [Drizzle ORM](https://orm.drizzle.team/) interacting with a SQLite database.
- **Icons**: [Lucide React](https://lucide.dev/)

## Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <repository-url>
   cd Supermatch
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Database Setup**:
   Generate the SQLite database and push the schema using Drizzle:
   ```bash
   npm run db:generate
   npm run db:push
   ```

4. **Environment Variables**:
   Copy `.env.example` to `.env` (if applicable) and fill in any required variables.

### Running the Application

To start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### Building for Production

To create a production build:

```bash
npm run build
```

You can preview the built application locally using:

```bash
npm run preview
```

## Contributing

We welcome contributions to Supermatch! Please read our contributing guidelines and ensure that all new features include appropriate type safety and fallbacks.

## License

This project is licensed under the MIT License.
