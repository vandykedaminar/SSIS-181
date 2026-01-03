# SSIS-181: Student Information System

A full-stack web application for managing student information, built with modern technologies.

## 🏗️ Architecture

- **Frontend**: Next.js 15 with React 19, Tailwind CSS, and Supabase authentication
- **Backend**: Flask with psycopg2 and PostgreSQL database
- **Database**: PostgreSQL with Supabase integration for file storage
- **Authentication**: Supabase Auth

## 📁 Project Structure

```
SSIS-181/
├── backend/              # Flask API server
│   ├── app.py           # Main Flask application
│   ├── Pipfile          # Python dependencies
│   └── Pipfile.lock     # Locked dependencies
├── frontend/             # Next.js web application
│   ├── src/
│   │   ├── app/         # Next.js App Router pages
│   │   ├── components/  # Reusable React components
│   │   └── lib/         # Utility functions and configurations
│   ├── package.json     # Node.js dependencies
│   └── tailwind.config.js
└── README.md            # This file
```

## 🚀 Getting Started

### Prerequisites

- Python 3.13+
- Node.js 18+
- PostgreSQL database
- Supabase account

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   pipenv install
   ```

3. Set up your PostgreSQL database and update the connection details in `app.py`

4. Run the backend server:
   ```bash
   pipenv run python app.py
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env.local
   ```
   Update the Supabase credentials in `.env.local`

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🔧 Configuration

### Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Update `frontend/src/lib/supabaseClient.js` with your credentials
4. Create a storage bucket called `student-photos` for file uploads

### Database Setup

The backend uses PostgreSQL. Update the connection details in `backend/app.py`:

```python
DB_CONFIG = {
    'host': 'your-host',
    'port': 5432,
    'user': 'your-username',
    'password': 'your-password',
    'database': 'your-database'
}
```

## 📊 Features

- **Student Management**: Add, edit, delete student records
- **Program Management**: Manage academic programs
- **College Management**: Organize colleges and their programs
- **File Uploads**: Upload and store student photos via Supabase Storage
- **Authentication**: Secure login/logout with Supabase Auth
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

## 🛠️ Development

### Available Scripts

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

**Backend:**
- `pipenv run python app.py` - Start Flask server
- `pipenv run pytest` - Run tests

### Code Style

- **Frontend**: ESLint with Next.js configuration
- **Backend**: Follow PEP 8 Python style guide

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Backend (Railway/Heroku)
1. Set up a Python hosting service
2. Configure environment variables
3. Deploy from your repository

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

This project is licensed under the MIT License.