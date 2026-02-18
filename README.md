# Smart Vendor Management System (SPVMS)

A comprehensive web-based platform designed to streamline vendor management, purchase requisitions, and purchase order processing for organizations.

## 🚀 Key Features

- **Vendor Management**: Maintain a database of vendors, including contact details, ratings, and active status.
- **Purchase Requisitions (PR)**: Create and track purchase requisitions for efficient procurement workflows.
- **Purchase Orders (PO)**: Generate professional POs (PDF/Excel) and manage their lifecycle.
- **Automated Reporting**: Generate and schedule reports (Daily/Weekly) for procurement analysis.
- **Email Notifications**: Integrated email system for sending POs and scheduled reports to stakeholders.
- **User Management**: Role-based access control (RBAC) with secure JWT-based authentication and inactive account protection.
- **Premium UI/UX**: Redesigned role selection and onboarding with modern, centered layouts and smooth aesthetics.
- **Help Us AI Chatbot**: Sticky project assistant with a specialized knowledge base to guide users through procurement workflows.

## 🛠 Tech Stack

### Backend
- **Framework**: Spring Boot 4.0.0
- **Language**: Java 17
- **Database**: MySQL
- **ORM**: Spring Data JPA (Hibernate)
- **Security**: Spring Security + JWT
- **Migration**: Flyway
- **Reporting**: JasperReports & iText PDF
- **Documentation**: SpringDoc OpenAPI (Swagger UI)

### Frontend
- **Library**: React 18
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **Styling**: Vanilla CSS

## 📋 Prerequisites

- **Java JDK 17** or higher
- **Node.js** (v18+) & **npm**
- **MySQL Server** (Running locally on port 3306)
- **Maven** (optional, `mvnw` included)

## ⚙️ Setup and Installation

### Backend Configuration
1. Navigate to `infosys_project_team_2/src/main/resources/application.yml`.
2. Configure your MySQL credentials:
   ```yaml
   spring:
     datasource:
       url: jdbc:mysql://localhost:3306/spvms
       username: your_username
       password: your_password
   ```
3. Update Google App Password for Email functionality:
   ```yaml
   spring:
     mail:
       username: your_email@gmail.com
       password: your_app_password
   ```

### Running the Application
1. **Start Backend**:
   ```bash
   cd infosys_project_team_2
   ./mvnw spring-boot:run
   ```
2. **Start Frontend**:
   ```bash
   cd infosys_project_team_2/frontend
   npm install
   npm run dev
   ```

## 📂 Project Structure

```text
infosys_project_team_2/
├── frontend/             # React application (Vite)
├── src/main/java/com/example/svmps/
│   ├── controller/      # API Endpoints
│   ├── entity/          # JPA Entities
│   ├── repository/      # Data Access Layer
│   ├── service/         # Business Logic
│   └── security/        # JWT Configuration
├── src/main/resources/
│   ├── reports/         # JasperReport Templates (.jrxml)
│   └── application.yml  # System Configuration
└── pom.xml               # Backend Dependencies
```

## 🛡 API Documentation
Once the backend is running, access the Swagger UI at:
`http://localhost:8082/swagger-ui.html`