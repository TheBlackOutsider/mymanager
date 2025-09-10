<<<<<<< HEAD
# HR Event & Leave Management System

A comprehensive HR management tool built with React.js, TypeScript, FastAPI, and PostgreSQL. This system enables HR teams and employees to efficiently manage events, leave requests, and generate insightful reports.

## 🚀 Features

### Core Functionality
- **Employee Management**: Complete CRUD operations with search and filtering
- **Event Management**: Create, manage, and track training sessions, seminars, onboarding, and team-building events
- **Leave Management**: Request, approve, and track leave requests with multi-level approval workflow
- **Calendar View**: Visual calendar interface for events and leave schedules
- **Reports & Analytics**: Comprehensive reporting with charts and export capabilities
- **Notifications**: Real-time notifications for events and leave approvals

### Technical Features
- **Responsive Design**: Mobile-first design that works on all devices
- **PWA Ready**: Can be installed as a Progressive Web App
- **Real-time Updates**: Live notifications and data synchronization
- **Export Capabilities**: PDF and CSV export for reports
- **Role-based Access**: Different permissions for HR managers and employees
- **WCAG Compliant**: Accessible design following web accessibility guidelines

## 🛠️ Tech Stack

### Frontend
- **React.js 18** with TypeScript
- **Redux Toolkit** for state management
- **React Router v6** for navigation
- **TailwindCSS** for styling
- **Recharts** for data visualization
- **Axios** for API communication
- **Date-fns** for date manipulation
- **Lucide React** for icons

### Backend
- **FastAPI** with Python 3.11
- **SQLAlchemy** ORM with PostgreSQL
- **Pydantic** for data validation
- **JWT** authentication
- **Alembic** for database migrations
- **Uvicorn** ASGI server

### Infrastructure
- **Docker** & Docker Compose
- **PostgreSQL 15** database
- **Nginx** (production)

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+
- Python 3.11+
- Docker & Docker Compose
- PostgreSQL 15+ (if running locally)

### Quick Start with Docker

1. **Clone the repository**
```bash
git clone <repository-url>
cd hr-management-system
```

2. **Start all services**
```bash
docker-compose up -d
```

3. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### Local Development Setup

#### Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Set environment variables**
```bash
export DATABASE_URL="postgresql://user:password@localhost:5432/hrmanagement"
export JWT_SECRET_KEY="your-secret-key-here"
```

5. **Run database migrations**
```bash
alembic upgrade head
```

6. **Start the server**
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup

1. **Install dependencies**
```bash
npm install
```

2. **Set environment variables**
```bash
echo "VITE_API_URL=http://localhost:8000/api" > .env
```

3. **Start development server**
```bash
npm run dev
```

## 🏗️ Project Structure

```
hr-management-system/
├── src/                          # Frontend source code
│   ├── components/              # Reusable React components
│   │   ├── Common/             # Generic components (Button, Modal, Table)
│   │   ├── Events/             # Event-specific components
│   │   ├── Leaves/             # Leave-specific components
│   │   └── Layout/             # Layout components (Header, Sidebar)
│   ├── pages/                  # Page components
│   ├── store/                  # Redux store and slices
│   ├── services/               # API services
│   ├── hooks/                  # Custom React hooks
│   ├── types/                  # TypeScript type definitions
│   └── utils/                  # Utility functions
├── backend/                     # FastAPI backend
│   ├── main.py                 # Main application file
│   ├── models/                 # Database models
│   ├── schemas/                # Pydantic schemas
│   ├── routers/                # API route handlers
│   ├── services/               # Business logic
│   └── utils/                  # Utility functions
├── docs/                       # Documentation
├── docker-compose.yml          # Docker services configuration
└── README.md                   # This file
```

## 📚 API Documentation

The API follows RESTful conventions and includes comprehensive OpenAPI documentation.

### Key Endpoints

#### Employees
- `GET /api/employees` - List employees with pagination and filters
- `POST /api/employees` - Create new employee
- `GET /api/employees/{id}` - Get employee details
- `PUT /api/employees/{id}` - Update employee
- `DELETE /api/employees/{id}` - Delete employee

#### Events
- `GET /api/events` - List events with pagination and filters
- `POST /api/events` - Create new event
- `GET /api/events/{id}` - Get event details
- `PUT /api/events/{id}` - Update event
- `DELETE /api/events/{id}` - Delete event

#### Leave Requests
- `GET /api/leaves` - List leave requests
- `POST /api/leaves` - Create leave request
- `PUT /api/leaves/{id}` - Update leave request
- `POST /api/leaves/{id}/approve` - Approve leave request
- `POST /api/leaves/{id}/reject` - Reject leave request

#### Reports
- `GET /api/reports` - Get available reports
- `POST /api/reports/generate` - Generate new report
- `GET /api/reports/analytics` - Get analytics data
- `GET /api/reports/{id}/export/{format}` - Export report

### Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 🎨 UI/UX Features

### Design System
- **Consistent Color Palette**: Professional blue and gray theme
- **Typography**: Clear hierarchy with proper font weights and sizes
- **Spacing**: 8px grid system for consistent layouts
- **Components**: Reusable components with consistent styling

### Responsive Design
- **Mobile First**: Optimized for mobile devices
- **Breakpoints**: Tailored layouts for different screen sizes
- **Touch Friendly**: Appropriate touch targets and gestures

### Accessibility
- **WCAG 2.1 AA Compliant**: Meets accessibility standards
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Color Contrast**: Sufficient contrast ratios for readability

## 📱 Mobile & PWA Support

### Progressive Web App Features
- **Installable**: Can be installed on mobile devices and desktops
- **Offline Support**: Basic offline functionality
- **Push Notifications**: Real-time notifications
- **App-like Experience**: Native app feel and performance

### React Native Compatibility
The codebase is structured to support React Native compilation:
- Shared business logic and state management
- Platform-specific UI components
- Native navigation and styling

## 🔧 Configuration

### Environment Variables

#### Frontend (.env)
```
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=HR Management System
VITE_ENABLE_PWA=true
```

#### Backend
```
DATABASE_URL=postgresql://user:password@localhost:5432/hrmanagement
JWT_SECRET_KEY=your-secret-key-here
JWT_ALGORITHM=HS256
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
```

## 🚀 Deployment

### Production Build

#### Frontend
```bash
npm run build
```

#### Backend
```bash
# Using Docker
docker build -t hr-backend ./backend

# Or using pip
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Docker Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Cloud Deployment
The application is ready for deployment on:
- **AWS**: ECS, Lambda, RDS
- **Google Cloud**: Cloud Run, Cloud SQL
- **Azure**: Container Instances, Azure Database
- **Heroku**: Web dynos, Postgres add-on

## 🧪 Testing

### Frontend Testing
```bash
npm run test              # Run unit tests
npm run test:e2e         # Run end-to-end tests
npm run test:coverage    # Generate coverage report
```

### Backend Testing
```bash
pytest                   # Run all tests
pytest --cov            # Run with coverage
pytest tests/unit       # Run unit tests only
pytest tests/integration # Run integration tests
```

## 📈 Performance

### Frontend Optimizations
- **Code Splitting**: Lazy loading of routes and components
- **Bundle Optimization**: Tree shaking and minification
- **Caching**: Service worker caching strategies
- **Image Optimization**: Responsive images and lazy loading

### Backend Optimizations
- **Database Indexing**: Optimized queries with proper indexes
- **Caching**: Redis caching for frequently accessed data
- **Connection Pooling**: Efficient database connections
- **Async Processing**: Background tasks for heavy operations

## 🔒 Security

### Frontend Security
- **XSS Protection**: Sanitized user inputs
- **CSRF Protection**: Token-based protection
- **Secure Storage**: Encrypted local storage for sensitive data

### Backend Security
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Comprehensive input sanitization
- **SQL Injection Protection**: Parameterized queries
- **Rate Limiting**: API rate limiting and throttling
- **HTTPS Only**: Secure communication protocols

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Follow the existing code style
- Update documentation for new features
- Ensure accessibility compliance

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation in `/docs`
- Review the API documentation at `/docs` endpoint

## 🗺️ Roadmap

### Upcoming Features
- [ ] Advanced reporting with custom filters
- [ ] Integration with external calendar systems
- [ ] Mobile app (React Native)
- [ ] Advanced notification system
- [ ] Multi-language support
- [ ] Advanced role-based permissions
- [ ] Integration with HR systems (HRIS)
- [ ] Advanced analytics and insights

### Version History
- **v1.0.0** - Initial release with core features
- **v1.1.0** - Enhanced reporting and analytics
- **v1.2.0** - Mobile responsiveness improvements
- **v2.0.0** - PWA support and offline capabilities

---

Built with ❤️ by the HR Management Team
=======
# mymanager
An SaaS mobile /desktop app defined for HR management focus on events which related to employees.
>>>>>>> 83dda5a11cd1d81f670ba228a67d6ba5246634a8
