<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=C0272D&height=200&section=header&text=S%20Four%20Traders&fontSize=60&fontColor=FAFAF8&fontAlignY=38&desc=Invoice%20Management%20System&descAlignY=58&descColor=C9A84C&descSize=20" width="100%"/>

<br/>

[![Java](https://img.shields.io/badge/Java%2021-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot%203.2-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React%2018-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)](https://jwt.io/)

<br/>

> **Production-ready invoice management system** — PDF generation, Excel exports, and GST-compliant billing built for Muzaffarnagar trade.

<br/>

</div>

---

## ✦ Overview

**S Four Traders Invoice Management System** is a full-stack web application designed specifically for GST-compliant trade businesses. It streamlines invoice creation, PDF generation, Excel reporting, and secure user authentication — all in one platform.

| Feature | Description |
|:---|:---|
| 📄 **PDF Invoices** | Generate print-ready GST invoices in one click |
| 📊 **Excel Reports** | Export filtered invoice data for accounting |
| 🔐 **JWT Auth** | Token-based authentication with 24-hour expiry |
| 🧾 **GST Compliant** | SGST, CGST, IGST auto-calculation with HSN codes |
| 📮 **Pincode Lookup** | Auto city/state fill from postal pincode |
| 🔢 **Auto Numbering** | Sequential invoice number generation |

---

## 🛠 Technology Stack

<table>
<tr>
<td valign="top" width="50%">

### 🔴 Backend — Java / Spring

- **Java 21** + Spring Boot 3.2.3 — Core framework
- **Spring Security** + JWT — Auth & authorization
- **Spring Data JPA** + Hibernate — ORM layer
- **PostgreSQL** — Primary relational database
- **iText PDF** — Invoice PDF generation
- **Apache POI** — Excel report generation
- **Maven** — Dependency & build management

</td>
<td valign="top" width="50%">

### 🟡 Frontend — React / Vite

- **React 18** — UI component framework
- **Vite** — Fast build tool & dev server
- **Axios** — HTTP client with JWT interceptors
- **Postal Pincode API** — Auto city/state lookup
- **CSS / Inline Styles** — Custom styling
- **localStorage** — Client-side token persistence

</td>
</tr>
</table>

---

## 📁 Project Structure

```
E_SforuTraders/
├── invoice-backend/                    # Spring Boot Application
│   └── src/main/java/com/sfourtraders/
│       ├── InvoiceBackendApplication.java   # Entry Point
│       ├── config/
│       │   ├── JwtFilter.java               # JWT Authentication Filter
│       │   ├── JwtUtil.java                 # Token Generation & Validation
│       │   └── SecurityConfig.java          # Spring Security Configuration
│       ├── controller/
│       │   ├── AuthController.java          # Login Endpoint
│       │   └── InvoiceController.java       # Invoice CRUD + PDF + Excel
│       ├── model/
│       │   ├── Invoice.java
│       │   └── InvoiceItem.java
│       ├── repository/
│       │   └── InvoiceRepository.java
│       └── service/
│           ├── InvoiceService.java
│           ├── PdfService.java
│           └── ExcelService.java
│
└── invoice-frontend/                   # React Application
    └── src/
        ├── api.js                       # Axios Config + JWT Interceptor
        ├── App.jsx                      # Root Component + Routing
        └── pages/
            ├── Login.jsx                # Authentication Page
            ├── Dashboard.jsx            # Stats + Recent Invoices
            ├── InvoiceForm.jsx          # Create / Edit Invoice
            ├── InvoiceList.jsx          # Search + Manage Invoices
            └── ExcelExport.jsx          # Bulk Data Export
```

---

## ⚡ Installation & Setup

### Prerequisites

Before you begin, ensure you have the following installed:

- ☕ **Java 21+** — [Download JDK](https://openjdk.org/)
- 🟢 **Node.js 18+** — [Download Node.js](https://nodejs.org/)
- 🐘 **PostgreSQL** — [Download PostgreSQL](https://www.postgresql.org/)

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/E_SforuTraders.git
cd E_SforuTraders
```

### 2️⃣ Database Configuration

Create a PostgreSQL database and update `invoice-backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/postgres
spring.datasource.username=your_username
spring.datasource.password=your_password

jwt.secret=SFourTradersSecretKey2024VeryLongStringForSecurity123456
jwt.expiration=86400000

server.port=8080
allowed.origins=http://localhost:5173

app.username=admin
app.password=sfour2024
```

### 3️⃣ Start the Backend

```bash
cd invoice-backend

# Compile and resolve dependencies
./mvnw clean compile

# Start the backend server on port 8080
./mvnw spring-boot:run
```

### 4️⃣ Start the Frontend

```bash
cd invoice-frontend

# Install all dependencies
npm install

# Start development server on port 5173
npm run dev
```

### ✅ Access the Application

Open your browser and navigate to: **`http://localhost:5173`**

---

## 🔑 Default Credentials

| Field | Value |
|:---|:---|
| **Username** | `admin` |
| **Password** | `sfour2024` |
| **Token Expiry** | 24 hours |

> ⚠️ **Important:** Change these credentials before deploying to production.

---

## 📡 API Reference

All endpoints (except `/api/login`) require a valid JWT token in the `Authorization: Bearer <token>` header.

| Method | Endpoint | Description | Auth |
|:---|:---|:---|:---:|
| `POST` | `/api/login` | User login — returns JWT token | ❌ |
| `GET` | `/api/invoices` | List all invoices (supports search) | ✅ |
| `GET` | `/api/invoices/{id}` | Retrieve a single invoice by ID | ✅ |
| `POST` | `/api/invoices` | Create a new invoice | ✅ |
| `PUT` | `/api/invoices/{id}` | Update an existing invoice | ✅ |
| `DELETE` | `/api/invoices/{id}` | Delete an invoice permanently | ✅ |
| `GET` | `/api/invoices/next-number` | Get next auto-generated invoice number | ✅ |
| `GET` | `/api/invoices/{id}/pdf` | Download invoice as PDF | ✅ |
| `GET` | `/api/invoices/excel` | Export all invoices to Excel | ✅ |

---

## 🚀 Production Build

### Backend — Build JAR

```bash
cd invoice-backend
./mvnw clean package -DskipTests
java -jar target/invoice-backend-0.0.1-SNAPSHOT.jar
```

### Frontend — Build Static Files

```bash
cd invoice-frontend
npm run build      # Creates dist/ folder
npm run preview    # Preview production build locally
```

---

## 🔧 Troubleshooting

<details>
<summary><strong>🔴 Backend Issues</strong></summary>

<br/>

**Port 8080 already in use:**
```bash
sudo lsof -ti:8080 | xargs kill -9
```

**Database connection failed:**
- Verify PostgreSQL is running: `sudo service postgresql status`
- Check credentials in `application.properties`

**JWT auth fails:**
- Check token stored in browser's localStorage
- Verify `jwt.secret` matches in properties file

</details>

<details>
<summary><strong>🟡 Frontend Issues</strong></summary>

<br/>

**CORS errors:**
- Ensure `allowed.origins` in `application.properties` includes your frontend URL

**Login not working:**
```bash
# Clear browser localStorage and retry
```

**API calls fail:**
- Confirm backend is running on port 8080
- Check browser console for error details

**Clean reinstall:**
```bash
rm -rf node_modules package-lock.json && npm install
```

</details>

---

## 🔄 Quick Reset Commands

```bash
# Restart backend
cd invoice-backend && ./mvnw spring-boot:run

# Restart frontend
cd invoice-frontend && npm run dev

# Clean reinstall frontend
rm -rf node_modules package-lock.json && npm install
```

---

<div align="center">

<br/>

**S Four Traders** — Muzaffarnagar, Uttar Pradesh

`GSTIN: 09AGOPA6566D2Z9`

<br/>

*Stack: Spring Boot 3.2 · React 18 · PostgreSQL · JWT*

<br/>

<img src="https://capsule-render.vercel.app/api?type=waving&color=C0272D&height=100&section=footer" width="100%"/>

</div>




<img width="1833" height="956" alt="Screenshot from 2026-06-05 16-41-54" src="https://github.com/user-attachments/assets/5d542422-de74-4d21-b06e-3eaa29024a4c" />



<img width="1833" height="956" alt="Screenshot from 2026-06-05 16-42-02" src="https://github.com/user-attachments/assets/9005aa9c-6c07-420d-83c1-af10ebb9bc8a" />


<img width="840" height="883" alt="image" src="https://github.com/user-attachments/assets/9bfa47c6-47fa-4c06-99f5-f7cca33ab202" />


<img width="1833" height="956" alt="Screenshot from 2026-06-05 16-42-10" src="https://github.com/user-attachments/assets/cc706871-63b8-48fb-a58f-74f454678a22" />



