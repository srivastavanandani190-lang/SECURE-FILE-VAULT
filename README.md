# Secure File Handling & Sharing System (AAA+ Architecture)

## Overview

In standard web applications, file sharing often relies on insecure paradigms—files are stored in plaintext on disk, accessible via easily guessable sequential IDs, and shared with permanent links that lack strict access control. This introduces severe vulnerabilities such as unauthorized access, data breaches, and a complete lack of auditability. 

The **Secure File Handling & Sharing System** solves these critical flaws. Built with an AAA+ security architecture (Authentication, Authorization, and Accounting), this platform provides end-to-end secure ingestion, AES-256-GCM encryption at rest, Role-Based Access Control (RBAC), and cryptographically secure zero-trust sharing pipelines. It ensures that sensitive data is completely isolated, strictly governed, and forensically auditable.

---

## The Tech Stack

This project was built using modern, robust technologies specifically chosen to support a high-security posture:

| Component | Technology | Security Rationale |
| :--- | :--- | :--- |
| **Frontend** | React.js, Vite, Tailwind CSS | Fast, predictable UI state management with minimal attack surfaces. Tailwind ensures clean styling without bloating the DOM. |
| **Backend** | Node.js, Express.js | Event-driven architecture capable of streaming file buffers efficiently without causing memory leaks or storing plaintext temporarily. |
| **Database** | SQLite (via Sequelize ORM) | Prevents SQL injection out-of-the-box through parameterized queries. Easily swappable to PostgreSQL for production scaling. |
| **Crypto** | AES-256-GCM, bcrypt, JWT | Military-grade authenticated encryption. Bcrypt secures passwords. JWTs provide stateless, cryptographically signed session management. |

---

## Core Security Features

### 🛡️ Authentication & RBAC (Role-Based Access Control)
The system strictly segregates user privileges into distinct roles (e.g., `Student` for uploading, `Professor` for receiving). JWT (JSON Web Tokens) are used to maintain stateless, tamper-proof session identity. API endpoints enforce strict authorization checks, guaranteeing that an authenticated user can only perform actions explicitly granted to their role.

### 🔒 Encryption at Rest (AES-256-GCM)
Files are **never** written to the disk in plaintext. When a file is uploaded, the memory buffer is instantly encrypted using `AES-256-GCM` before it touches the file system. The unique Initialization Vector (IV) and Authentication Tag are saved in the database alongside the metadata. If a malicious actor gains access to the storage server, the files remain mathematically impossible to read without the database keys, and any tampering is instantly detected via the Auth Tag.

### 🔗 Zero-Trust File Sharing
Instead of sharing files via predictable database IDs (which are vulnerable to IDOR / Insecure Direct Object Reference attacks), this system generates cryptographically secure, random hash tokens. These share links are bound directly to the recipient's identity, are strictly time-limited (expiring after a set duration), and can be revoked. 

---

## The End-to-End Pipeline (How It Works)

### Phase 1: Ingestion & Encryption
1. **Upload:** A Student uploads a sensitive document via the React frontend.
2. **Validate & Buffer:** The Node.js backend receives the file and holds it strictly in memory (RAM).
3. **AES-256 Encrypt:** The crypto engine encrypts the buffer using AES-256-GCM, generating a unique IV and an Authentication Tag.
4. **Store Ciphertext:** Only the resulting encrypted binary data (ciphertext) is written to the isolated storage vault.
5. **Save Metadata:** The file's metadata, alongside the IV and Auth Tag, are securely stored in the SQL database.

### Phase 2: Secure Link Generation
1. **Select Recipient:** The file owner selects a Professor to share the file with and sets an expiration limit (e.g., 60 minutes).
2. **Generate Crypto Token:** The backend generates a cryptographically secure random token and hashes it.
3. **Save to DB:** The token hash, expiration timestamp, and the specific `recipient_id` are saved to the `Shares` table.
4. **Link Dispatch:** A unique URL containing the plain token is generated for the Professor.

### Phase 3: Decryption & Download
1. **Professor Clicks Link:** The Professor opens the link in their dashboard.
2. **Auth & RBAC Check:** The backend intercepts the request, verifies the Professor's JWT, and asserts that `share.recipient_id === req.user.id`.
3. **Token & Expiry Check:** The provided token is hashed and compared against the database. The system verifies the token is neither expired nor revoked.
4. **Read Ciphertext:** The encrypted file is read from the vault into memory.
5. **AES-256 Decrypt:** The crypto engine uses the stored IV and Auth Tag to decrypt the file. If the Auth Tag fails validation, a `SEVERE_SECURITY_ERROR` is thrown, indicating tampering.
6. **Stream to Browser:** The plaintext buffer is streamed securely to the Professor's browser via a Blob, maintaining the original filename.

---

## Getting Started (Local Setup)

Follow these steps to run the Secure File Vault on your local machine.

### Prerequisites
* **Node.js** (v18 or higher recommended)
* **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/secure-file-vault.git
cd secure-file-vault
```

### 2. Backend Setup
Open a terminal and navigate to the backend directory:
```bash
cd backend
npm install
```

**Environment Variables:**
Create a `.env` file in the `backend` directory with the following variables:
```env
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_here
ENCRYPTION_KEY=32_character_super_secret_key_!!!
```

**Initialize Database & Seed Data:**
This command will create the SQLite database and populate it with sample users (Students and Professors):
```bash
npm run seed
```

**Start the Backend Server:**
```bash
npm run dev
```

### 3. Frontend Setup
Open a second terminal window and navigate to the frontend directory:
```bash
cd frontend
npm install
```

**Start the Frontend Server:**
```bash
npm run dev
```

### 4. Access the Application
* Open your browser and navigate to: **http://localhost:5173**
* **Demo Accounts (from seed.js):**
  * Student: `student@university.edu` / `password123`
  * Professor: `professor@university.edu` / `password123`

---
*Architected and developed with a focus on modern web security principles.*
