# Project Documentation: Dashboard Turismo Badajoz

## 1. Technology Stack
- **Backend**: Node.js with Express framework.
- **Database**: MySQL hosted on AWS RDS.
- **Frontend**: React (Version 18+) powered by Vite and TypeScript.
- **Styling**: Tailwind CSS for responsive UI and Dark Mode.
- **Data Visualization**: Chart.js for data quality metrics.
- **Reporting**: ExcelJS for dynamic professional Excel generation.
- **AI Integration**: Claude API (Anthropic) for dynamic field categorization.

## 2. Architecture & Conventions
- **Client-Server Model**: Separation of concerns between the API (Backend) and the SPA (Frontend).
- **Naming Conventions**:
    - Variables & Functions: `camelCase`
    - Constants & Global Variables: `UPPER_CASE`
    - Components: `PascalCase`
- **Database Access**: All queries must use the `pool` connection with `mysql2/promise` to handle asynchronous operations.
- **Data Safety**: Direct string interpolation in SQL is forbidden. Always use prepared statements (placeholders `?` or `??`).

## 3. Workflow & Basic Commands
### Installation
- **Backend**: `cd backend && npm install`
- **Frontend**: `cd frontend && npm install`

### Local Development
- **Run Backend**: `npm start` (Runs on port 3000 by default).
- **Run Frontend**: `npm run dev` (Vite development server).

### Environment Configuration
A `.env` file must exist in the `/backend` folder with the following variables:
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` (AWS RDS Credentials).
- `ANTHROPIC_API_KEY` (For field categorization).
- `JWT_SECRET` (For production authentication).

## 4. Security Rules & Prohibitions
- **Table Whitelist**: Only tables defined in the `TABLAS_PERMITIDAS` constant in `server.js` can be queried via the API.
- **Excluded Fields**: Sensitive or system fields (IDs, audit logs, timestamps) defined in `EXCLUDED_FIELDS` must be filtered out from data analysis and Excel reports.
- **Authentication**: All `/api/` routes (except login) must be protected by the `authenticateToken` middleware.
- **Mock vs Prod**: In development, mock tokens are allowed. For production deployment, the JWT verification block in `server.js` must be uncommented.