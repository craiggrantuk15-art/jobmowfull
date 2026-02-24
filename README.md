# JobMow - Lawn Care Management System

JobMow is a comprehensive web application designed to streamline lawn care business operations. Built with React, Vite, and Supabase, it provides a robust platform for managing jobs, customers, scheduling, and finances.

## features

### 🚜 Core Operations

- **Dashboard**: Real-time overview of business performance, upcoming jobs, and financial metrics.
- **Job Management**: Create, track, and manage lawn care jobs from lead to completion.
- **Scheduling**: Drag-and-drop calendar interface for efficient job scheduling and team coordination.
- **Lead Tracking**: Capture and manage potential customer leads.

### 👥 Customer & Team Management

- **Customer Database**: Centralized repository for customer details.
- **Postcode Lookup**: Integrated UK postcode lookup for accurate address entry.
- **Team Management**: Invite and manage team members with role-based access.

### 💰 Finance

- **Invoicing**: Generate and track invoices.
- **Expense Tracking**: Monitor business expenses.
- **Quoting**: Create and send quotes to customers.

### ⚙️ Intelligence & Configuration

- **Mowability Score**: AI-powered weather analysis to determine optimal mowing conditions based on wind, humidity, and precipitation.
- **Service Configuration**: Customizable list of services and pricing.
- **Super Admin**: Advanced administrative controls.

## Tech Stack

- **Frontend**: React 19, Vite, TypeScript
- **Backend/Database**: Supabase (PostgreSQL, Auth, Edge Functions)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **AI Integration**: Google Gemini AI (for intelligent features)
- **Charts**: Recharts

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- A Supabase project

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd jobmow
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory based on `.env.example`:

   ```bash
   cp .env.example .env.local
   ```

   Fill in your API keys:

   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   GEMINI_API_KEY=your_gemini_api_key
   VITE_GETADDRESS_API_KEY=your_getaddress_api_key
   VITE_GETADDRESS_ADMIN_KEY=your_getaddress_admin_key
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

## Key Components

- **`src/pages/`**: Main application views (Dashboard, Jobs, Customers, etc.)
- **`src/components/`**: Reusable UI components.
- **`src/context/`**: React Context for state management (Auth, Jobs, Services).
- **`src/lib/`**: Utility functions and Supabase client configuration.
- **`supabase/`**: Database migrations and Edge Functions.

## License

Private Project.
