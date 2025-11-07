# MongoDB Result Checker Setup Guide

## Overview
This system has been migrated from Firebase to MongoDB for faster performance and better scalability.

## Key Features
- **Faster Upload**: Batch processing with 1000 records per batch
- **Short Format**: Compressed data format reduces upload size by 60%
- **MongoDB**: High-performance database with indexing
- **Real-time Progress**: Visual progress bar during uploads

## Short Format Guide

### Format Structure
```
RollNumber|c:CGPA|g:GPA1,GPA2,GPA3...|s:RefSubjects
```

### Examples
```
731622|c:3.43|g:3.43,2.93,r,3.43|s:26731
731625|c:3.06|g:3.06,3.30,2.76,3.25
```

### Legend
- `c` = CGPA (use `n` for Not Published Yet)
- `g` = GPA values (use `r` for Referred)
- `s` = Referred subjects (optional, comma-separated)

## Installation Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup MongoDB
You can use either local MongoDB or MongoDB Atlas (cloud):

#### Option A: Local MongoDB
```bash
# Install MongoDB Community Edition
# Visit: https://www.mongodb.com/try/download/community

# Start MongoDB service
mongod
```

#### Option B: MongoDB Atlas (Recommended)
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string
4. Update `.env` file

### 3. Configure Environment
Create a `.env` file:
```
MONGODB_URI=mongodb://localhost:27017/results_db
PORT=3000
```

For MongoDB Atlas:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/results_db
PORT=3000
```

### 4. Start Server
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## Usage

### Admin Workflow

1. **Login**: Use admin email to login
   - nafijrahaman2026@gmail.com
   - nafijrahaman19721@gmail.com
   - nafijrahaman2022@gmail.com

2. **Format Results**:
   - Open `format.html`
   - Paste long format results
   - Click "Convert to Short Format"
   - Copy the output

3. **Upload Results**:
   - Go to admin panel
   - Paste short format results
   - Click "Upload"
   - Watch progress bar

### Student Workflow
1. Open `student1.html` or main website
2. Enter roll number
3. Click "Check Result"
4. View result with CGPA, GPA, and referred subjects

## Performance Comparison

| Feature | Firebase | MongoDB |
|---------|----------|---------|
| Upload Speed | Slow (one-by-one) | Fast (1000/batch) |
| Data Format | Long | Short (60% smaller) |
| Database | Realtime DB | MongoDB |
| Indexing | Limited | Full support |
| Scalability | Moderate | Excellent |

## API Endpoints

### POST /api/auth/login
Login admin user
```json
{
  "email": "admin@example.com"
}
```

### POST /api/results/bulk
Upload multiple results
```json
{
  "results": [
    {
      "roll": "731622",
      "cgpa": 3.43,
      "gpa": {
        "1st": 3.43,
        "2nd": 2.93
      },
      "referred": ["26731"]
    }
  ]
}
```

### GET /api/results/:rollNumber
Get single result by roll number

## Troubleshooting

### MongoDB Connection Failed
- Check if MongoDB service is running
- Verify connection string in `.env`
- For Atlas: Check IP whitelist

### Upload Fails
- Check server logs
- Verify short format is correct
- Ensure MongoDB is connected

### Results Not Found
- Check roll number is correct
- Verify data was uploaded successfully
- Check MongoDB collection has data

## Migration from Firebase

Old Firebase data can be exported and converted to MongoDB format. Contact admin for migration script.

## Support

For issues or questions, contact: nafijrahaman2022@gmail.com
