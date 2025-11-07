# Diploma Result Checker - MongoDB Edition

A fast and optimized web application for checking diploma results with MongoDB Atlas backend.

## Features

- Universal format support for all result types
- Batch upload with real-time progress tracking
- Optimized short format for 60% faster uploads
- MongoDB Atlas cloud database
- Automatic format detection and conversion
- Support for up to 8 semesters
- CGPA tracking
- Referred subjects tracking
- Status detection (Passed/Failed/Dropped Out)

## Quick Start

```bash
npm install
npm start
```

Visit `http://localhost:3000`

## File Structure

### Core Files (Keep These)

- **index.html** - Home page
- **student1.html** - Student result checker (OPTIMIZED)
- **admin-login.html** - Admin authentication
- **admin.html** - Result upload interface (OPTIMIZED)
- **format.html** - Universal format converter (OPTIMIZED)
- **server.js** - Express + MongoDB backend
- **db-config.js** - API client
- **.env** - Database configuration

### Old Files (Removed)

- student.html, format1.html, admin2.html, proadmin.html
- All duplicate admin/student pages

## Format Guide

### Input Formats Supported

#### 1. Referred Format

```
731559 { gpa8: 3.17, gpa7: 3.10, gpa6: 3.25, gpa5: 3.00, gpa4: 2.76, gpa3: 2.85, gpa2: ref, gpa1: 3.00, ref_sub: 25912(T), 26731(T) }
```

#### 2. Passed Format

```
731625 (gpa5: 2.76, gpa4: 3.25, gpa3: 2.76, gpa2: 3.30, gpa1: 3.06)
```

#### 3. Final Result with CGPA

```
500104 cgpa: 3.52 (gpa8: 4.00, gpa7: 3.45, gpa6: 3.36, gpa5: 3.51, gpa4: 3.29, gpa3: 2.67, gpa2: 3.05, gpa1: 3.24)
```

#### 4. Dropped Out Format

```
632783 { gpa4: ref, gpa3: ref, gpa2: ref, gpa1: ref, ref_sub: 25912(T), 25921(T), 26711(T) }
```

### Short Format (For Upload)

**Format:** `roll|c:cgpa|g1:gpa1,g2:gpa2,...|s:subjects`

**Examples:**

```
731559|c:3.25|g1:3.00,g2:r,g3:2.85,g4:2.76|s:25912,26731
731625|g1:3.06,g2:3.30,g3:2.76,g4:3.25,g5:2.76
500104|c:3.52|g1:3.24,g2:3.05,g3:2.67,g4:3.29,g5:3.51,g6:3.36,g7:3.45,g8:4.00
632783|g1:r,g2:r,g3:r,g4:r|s:25912,25921,26711
```

**Legend:**

- `c` = CGPA
- `g1-g8` = GPA for semesters 1-8
- `r` = Referred
- `n` = Not Published Yet
- `s` = Referred Subjects

## Usage

### For Admins

1. **Format Results**

   - Open `format.html`
   - Paste any format results
   - Click "Convert to Short Format"
   - Copy the output

2. **Login**

   - Open `admin-login.html`
   - Enter admin email
   - Click Login

3. **Upload Results**
   - Paste short format results
   - Click Upload
   - Watch the terminal log and progress bar
   - Results upload in batches of 1000

### For Students

1. Open `student1.html`
2. Enter your roll number
3. Click "Check Result"
4. View your CGPA, semester GPAs, and status

## Database Configuration

MongoDB Atlas connection is configured in `.env`:

```
MONGODB_URI=mongodb+srv://resultweb:nafijpro@resultweb.jagonmx.mongodb.net/resultweb?retryWrites=true&w=majority
PORT=3000
```

## API Endpoints

### POST /api/auth/login

Admin authentication

### POST /api/results/bulk

Bulk upload results

### GET /api/results/:rollNumber

Get single result

## Performance

- **Upload Speed**: 1000 records in ~5 seconds
- **Format Size**: 60% smaller than old format
- **Database**: MongoDB Atlas with indexing
- **Response Time**: < 100ms for single queries

## Features Explained

### Auto Format Detection

The system automatically detects:

- Short form codes (c, g1-g8, r, n, s)
- Full descriptions (CGPA, GPA, Referred, Not Published Yet)
- Multiple input formats
- Referred subjects

### Status Detection

- **Passed**: No referred subjects
- **Failed**: Has referred subjects
- **Dropped Out**: Multiple semesters with "ref"

### Visual Indicators

- Green border = Passed
- Red border = Failed
- Yellow badge = Referred subjects

## Admin Emails

```
nafijrahaman2026@gmail.com
nafijrahaman19721@gmail.com
nafijrahaman2022@gmail.com
```

## Technology Stack

- **Frontend**: HTML5, CSS3, ES6 Modules
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Features**: Real-time progress, batch processing, format conversion

## Support

For issues or questions:

- Email: nafijrahaman2022@gmail.com
- Facebook: [NAFIJ RAHAMAN](https://m.facebook.com/nafijrahaman2023)

---

Made with dedication for Magura Polytechnic Institute students
