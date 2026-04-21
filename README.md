# S Four Traders - Invoice Management System

A modern web-based invoice management system built with Spring Boot (backend) and React (frontend) for S Four Traders business.

## 📋 Overview

This application allows you to:
- Create, edit, and manage invoices
- Generate PDF invoices
- Export invoice data to Excel
- Search and filter invoices
- Secure authentication system

## 🛠 Tech Stack

### Backend
- **Java 21**
- **Spring Boot 3.2.3**
- **Spring Security** (JWT Authentication)
- **Spring Data JPA** (Database ORM)
- **PostgreSQL** (Database)
- **Maven** (Build tool)

### Frontend
- **React 18**
- **Vite** (Build tool)
- **Axios** (HTTP client)
- **CSS** (Styling)

## 📁 Project Structure

```
E_SforuTraders/
├── invoice-backend/                 # Spring Boot Backend
│   ├── src/main/java/com/sfourtraders/
│   │   ├── InvoiceBackendApplication.java
│   │   ├── config/
│   │   │   ├── JwtFilter.java       # JWT Authentication Filter
│   │   │   ├── JwtUtil.java         # JWT Token Utilities
│   │   │   └── SecurityConfig.java  # Security Configuration
│   │   ├── controller/
│   │   │   ├── AuthController.java  # Login/Authentication
│   │   │   └── InvoiceController.java # Invoice CRUD Operations
│   │   ├── model/
│   │   │   ├── Invoice.java         # Invoice Entity
│   │   │   └── InvoiceItem.java     # Invoice Item Entity
│   │   ├── repository/
│   │   │   └── InvoiceRepository.java # Database Repository
│   │   └── service/
│   │       ├── ExcelService.java    # Excel Export Service
│   │       ├── InvoiceService.java  # Invoice Business Logic
│   │       └── PdfService.java      # PDF Generation Service
│   └── src/main/resources/
│       └── application.properties   # Database & App Config
│
├── invoice-frontend/                # React Frontend
│   ├── src/
│   │   ├── api.js                  # Axios API Configuration
│   │   ├── App.jsx                 # Main App Component
│   │   ├── main.jsx                # App Entry Point
│   │   ├── index.css               # Global Styles
│   │   └── pages/                  # Page Components
│   │       ├── Login.jsx           # Login Page
│   │       ├── Dashboard.jsx       # Dashboard
│   │       ├── InvoiceForm.jsx     # Invoice Creation/Edit
│   │       ├── InvoiceList.jsx     # Invoice List View
│   │       └── ExcelExport.jsx     # Excel Export Page
│   ├── public/                     # Static Assets
│   ├── package.json                # Dependencies
│   ├── vite.config.js              # Vite Configuration
│   └── eslint.config.js            # ESLint Configuration
│
└── README.md                       # This file
```

## 🔧 Prerequisites

Before running this application, make sure you have:

1. **Java 21** or higher
   ```bash
   java -version
   ```

2. **Node.js 18+** and **npm**
   ```bash
   node -version
   npm -version
   ```

3. **PostgreSQL Database**
   - Install PostgreSQL
   - Create a database named `postgres`
   - Update connection details in `application.properties`

4. **Maven** (usually comes with Java IDEs)

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd E_SforuTraders
```

### 2. Database Setup
Create a PostgreSQL database and update the connection in `invoice-backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/postgres
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### 3. Backend Setup
```bash
cd invoice-backend

# Install dependencies and compile
./mvnw clean compile

# Run the backend server
./mvnw spring-boot:run
```

Backend will start on `http://localhost:8080`

### 4. Frontend Setup
```bash
cd ../invoice-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will start on `http://localhost:5173` or `http://localhost:5174`

## 🔐 Authentication

Default login credentials:
- **Username:** `admin`
- **Password:** `sfour2024`

## 📡 API Endpoints

### Authentication
- `POST /api/login` - User login

### Invoices
- `GET /api/invoices` - Get all invoices (with optional search)
- `GET /api/invoices/{id}` - Get specific invoice
- `POST /api/invoices` - Create new invoice
- `PUT /api/invoices/{id}` - Update invoice
- `DELETE /api/invoices/{id}` - Delete invoice
- `GET /api/invoices/next-number` - Get next invoice number
- `GET /api/invoices/{id}/pdf` - Download PDF
- `GET /api/invoices/excel` - Export to Excel

## 🎯 How to Use

1. **Login** with admin credentials
2. **Create Invoice:**
   - Click "New Invoice" from dashboard
   - Fill party details (billed to/shipped to)
   - Add invoice items with description, HSN, quantity, rate
   - Set GST rates (SGST/CGST/IGST)
   - Save invoice
3. **View Invoices:**
   - Go to "All Invoices" page
   - Search by party name or invoice number
   - Edit or delete invoices
   - Download PDFs
4. **Export Data:**
   - Use "Excel Export" page for bulk data export

## 🔧 Configuration

### Backend Configuration (`application.properties`)
```properties
# Production database (Supabase PostgreSQL)
spring.datasource.url=jdbc:postgresql://aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require
spring.datasource.username=postgres.gupesksjdhebaonvtrfx
spring.datasource.password=your_supabase_password

# JWT
jwt.secret=SFourTradersSecretKey2024VeryLongStringForSecurity123456
jwt.expiration=86400000

# Server
server.port=8080
allowed.origins=http://localhost:5173,http://localhost:5174

# App Credentials
app.username=admin
app.password=sfour2024
```

### Frontend Configuration (`src/api.js`)
```javascript
const API = axios.create({
   baseURL: 'https://e-sforutraders.onrender.com', // Deployed backend API
  headers: {
    'Content-Type': 'application/json',
  },
});
```

## 🐛 Troubleshooting

### Backend Issues
1. **Port already in use:**
   ```bash
   # Kill process on port 8080
   sudo lsof -ti:8080 | xargs kill -9
   ```

2. **Database connection failed:**
   - Ensure PostgreSQL is running
   - Check database credentials in `application.properties`

3. **JWT Authentication fails:**
   - Check token in browser localStorage
   - Verify JWT secret key matches

### Frontend Issues
1. **CORS errors:**
   - Ensure backend allows frontend origin
   - Check `allowed.origins` in `application.properties`

2. **API calls fail:**
   - Verify backend is running on port 8080
   - Check network tab in browser DevTools

3. **Login not working:**
   - Clear browser localStorage
   - Try default credentials: `admin` / `sfour2024`

### Common Fixes
```bash
# Restart backend
cd invoice-backend
./mvnw spring-boot:run

# Restart frontend
cd ../invoice-frontend
npm run dev

# Clear frontend cache
rm -rf node_modules package-lock.json
npm install
```

## 📊 Database Schema

### Invoice Table
- `id` (Primary Key)
- `invoice_no` (Unique)
- `invoice_date`
- `reverse_charge`
- `vehicle_no`, `supply_date`, `place_of_supply`
- Billing & Shipping details
- GST rates and amounts
- `subtotal`, `grand_total`
- Timestamps

### Invoice Items Table
- `id` (Primary Key)
- `invoice_id` (Foreign Key)
- `sno` (Serial Number)
- `description`, `hsn_code`, `uom`
- `quantity`, `rate`, `value`

## 🚀 Deployment

### Live Deployment Links
- **Frontend (Vercel):** https://e-sforu-traders-git-master-mohd-shan-s-projects.vercel.app/
- **Backend (Render):** https://e-sforutraders.onrender.com
- **Database (Supabase PostgreSQL):** aws-1-ap-southeast-1.pooler.supabase.com:5432

### Backend Deployment
```bash
# Build JAR
./mvnw clean package -DskipTests

# Run JAR
java -jar target/invoice-backend-0.0.1-SNAPSHOT.jar
```

### Frontend Deployment
```bash
# Build for production
npm run build

# Serve static files
npm run preview
```

## 📞 Support

For issues or questions:
1. Check this README
2. Review application logs
3. Check browser DevTools Network tab
4. Verify database connectivity

## 📝 License

This project is proprietary software for S Four Traders.