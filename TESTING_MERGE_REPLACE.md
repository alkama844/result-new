# 🧪 Testing Guide: MERGE vs REPLACE Modes

## Server Status
✅ Server is running on: `http://localhost:10000`

---

## 🎯 Quick Test Instructions

### Step 1: Access Admin Panel
1. Open browser: `http://localhost:10000/admin-login.html`
2. Login with: `nafijrahaman2026@gmail.com`
3. You'll be redirected to admin panel

---

## Test Suite: MERGE Mode

### Test 1: Partial Semester Update ✅

**Setup:** Upload initial data in REPLACE mode
```
888888|g1:2.93,g2:2.84,g3:3.25,g4:3.17
```

**Action:** Switch to MERGE mode and upload
```
888888|g2:3.00
```

**Expected Result:** Search for 888888
```
{
  "roll": "888888",
  "g1": "2.93",    ← unchanged
  "g2": "3.00",    ← updated!
  "g3": "3.25",    ← unchanged
  "g4": "3.17"     ← unchanged
}
```

**How to Verify:**
1. Open `http://localhost:10000/student1.html`
2. Search: `888888`
3. Check that g1, g3, g4 are unchanged
4. Check that g2 is now 3.00

---

### Test 2: Clear Referred Subjects ✅

**Setup:** Upload in REPLACE mode
```
777777|g1:r,g2:2.84|s:25912,26731
```

**Action:** Switch to MERGE mode and upload
```
777777|g1:2.93|s:
```

**Expected Result:** Search for 777777
```
{
  "roll": "777777",
  "g1": "2.93",    ← cleared from 'r'!
  "g2": "2.84",    ← unchanged
  "s": []          ← subjects removed!
}
```

**How to Verify:**
1. Upload first record (g1:r with subjects)
2. Search 777777 - should show "Referred: 25912, 26731"
3. Upload second record (g1:2.93, s: empty)
4. Search again - should show NO referred subjects
5. g2 should still be 2.84

---

### Test 3: Add Referred Subjects ✅

**Setup:** Upload in REPLACE mode
```
666666|g1:2.93,g2:2.84
```

**Action:** Switch to MERGE mode and upload
```
666666|g3:r|s:52678,63782
```

**Expected Result:** Search for 666666
```
{
  "roll": "666666",
  "g1": "2.93",         ← unchanged
  "g2": "2.84",         ← unchanged
  "g3": "r",            ← added!
  "s": ["52678","63782"] ← added!
}
```

**How to Verify:**
1. First upload: g1 and g2 only
2. Search 666666 - no subjects
3. Second upload: add g3:r with subjects
4. Search again - should show subjects
5. g1 and g2 unchanged

---

### Test 4: Mixed Clear and Fail ✅

**Setup:** Upload in REPLACE mode
```
555555|g1:r,g2:r,g3:r|s:25912,26731,52678
```

**Action:** Switch to MERGE mode and upload
```
555555|g1:2.93,g2:r|s:26731
```

**Expected Result:** Search for 555555
```
{
  "roll": "555555",
  "g1": "2.93",      ← cleared!
  "g2": "r",         ← still referred
  "g3": "r",         ← unchanged from setup
  "s": ["26731"]     ← updated to only one subject
}
```

---

### Test 5: Add CGPA Only ✅

**Setup:** Upload in REPLACE mode
```
444444|g1:2.93,g2:2.84,g3:3.25,g4:3.17,g5:2.90,g6:3.05,g7:3.24,g8:3.17
```

**Action:** Switch to MERGE mode and upload
```
444444|c:3.06
```

**Expected Result:** Search for 444444
```
{
  "roll": "444444",
  "c": "3.06",       ← added!
  "g1": "2.93",      ← all unchanged
  "g2": "2.84",
  "g3": "3.25",
  ...
  "g8": "3.17"
}
```

---

## Test Suite: REPLACE Mode

### Test 6: Complete Overwrite ⚠️

**Setup:** Upload in REPLACE mode
```
333333|c:3.06|g1:2.93,g2:2.84,g3:3.25,g4:3.17,g5:2.90,g6:3.05,g7:3.24,g8:3.17|s:25912
```

**Action:** Stay in REPLACE mode and upload
```
333333|g1:2.93,g2:2.84
```

**Expected Result:** Search for 333333
```
{
  "roll": "333333",
  "g1": "2.93",
  "g2": "2.84"
}
```
❌ CGPA gone!
❌ g3-g8 gone!
❌ Subjects gone!

**How to Verify:**
1. First upload: complete record with 8 semesters
2. Search 333333 - should show all data
3. Second upload in REPLACE mode: only g1 and g2
4. Search again - ONLY g1 and g2 remain
5. Everything else deleted!

---

### Test 7: Fresh Start ⚠️

**Setup:** Upload in REPLACE mode
```
222222|c:2.50|g1:r,g2:r,g3:2.00|s:25912,26731,52678
```

**Action:** Stay in REPLACE mode and upload
```
222222|g1:3.00
```

**Expected Result:** Search for 222222
```
{
  "roll": "222222",
  "g1": "3.00"
}
```
❌ Everything else deleted!

---

## 📊 Dashboard Testing

After running the tests above:

1. Open: `http://localhost:10000/dashboard.html`
2. Click "🔄 Refresh Stats"
3. **Expected Statistics:**
   - Total Students: 7 (888888, 777777, 666666, 555555, 444444, 333333, 222222)
   - Check passed vs failed counts
   - Check average CGPA

---

## 🔍 Detailed Verification Steps

### Using Browser Console
1. Open DevTools (F12)
2. Go to Console tab
3. Watch for upload messages:
   ```
   🔀 MERGE mode for 888888: Updated fields, subjects: []
   🔄 REPLACE mode for 333333: Overwriting entire record
   ✅ Upload: X inserted, Y updated
   ```

### Using test-db.html
1. Open: `http://localhost:10000/test-db.html`
2. Click "📈 Get Statistics"
3. Verify total count
4. Check sample data

### Using Student Search
1. Open: `http://localhost:10000/student1.html`
2. Search each roll number
3. Verify the results match expected output

---

## ✅ Success Criteria

### MERGE Mode Tests Pass If:
- [x] Test 1: g2 updated, g1/g3/g4 unchanged
- [x] Test 2: g1 cleared, subjects removed, g2 unchanged
- [x] Test 3: g3 added, subjects added, g1/g2 unchanged
- [x] Test 4: g1 cleared, g2 still referred, subjects updated
- [x] Test 5: CGPA added, all GPAs unchanged

### REPLACE Mode Tests Pass If:
- [x] Test 6: Only g1/g2 remain, everything else deleted
- [x] Test 7: Only g1 remains, everything else deleted

---

## 🐛 If Tests Fail

### Check Server Console
Look for:
```
🔀 MERGE mode for XXXXXX: Updated fields, subjects: [...]
🔄 REPLACE mode for XXXXXX: Overwriting entire record
```

### Check Browser Console
Look for:
```
✅ Upload successful: {inserted: X, updated: Y}
```

### Common Issues

**Issue 1:** Old data not preserved in MERGE
- **Fix:** Check server.js merge logic
- **Verify:** Server console shows "🔀 MERGE mode"

**Issue 2:** REPLACE not deleting old data
- **Fix:** Check server.js replace logic
- **Verify:** Server console shows "🔄 REPLACE mode"

**Issue 3:** Subjects not clearing
- **Fix:** Must upload with `s:` (empty)
- **Verify:** Check if `s:` is in upload data

---

## 📝 Test Data Template

Copy and paste this into admin panel:

### Initial Setup (REPLACE mode)
```
888888|g1:2.93,g2:2.84,g3:3.25,g4:3.17
777777|g1:r,g2:2.84|s:25912,26731
666666|g1:2.93,g2:2.84
555555|g1:r,g2:r,g3:r|s:25912,26731,52678
444444|g1:2.93,g2:2.84,g3:3.25,g4:3.17,g5:2.90,g6:3.05,g7:3.24,g8:3.17
333333|c:3.06|g1:2.93,g2:2.84,g3:3.25,g4:3.17,g5:2.90,g6:3.05,g7:3.24,g8:3.17|s:25912
222222|c:2.50|g1:r,g2:r,g3:2.00|s:25912,26731,52678
```

### MERGE Tests (switch to MERGE mode)
```
888888|g2:3.00
777777|g1:2.93|s:
666666|g3:r|s:52678,63782
555555|g1:2.93,g2:r|s:26731
444444|c:3.06
```

### REPLACE Tests (switch to REPLACE mode)
```
333333|g1:2.93,g2:2.84
222222|g1:3.00
```

---

## 🎉 Expected Final Results

After all tests, searching should show:

| Roll | Mode | Final State |
|------|------|-------------|
| 888888 | MERGE | g1:2.93, g2:3.00 ✅, g3:3.25, g4:3.17 |
| 777777 | MERGE | g1:2.93 ✅, g2:2.84, s:[] ✅ |
| 666666 | MERGE | g1:2.93, g2:2.84, g3:r ✅, s:[52678,63782] ✅ |
| 555555 | MERGE | g1:2.93 ✅, g2:r, g3:r, s:[26731] ✅ |
| 444444 | MERGE | c:3.06 ✅, g1-g8 all present |
| 333333 | REPLACE | g1:2.93, g2:2.84 ONLY ✅ |
| 222222 | REPLACE | g1:3.00 ONLY ✅ |

---

## 🚀 You're All Set!

1. Follow the tests in order
2. Verify each result
3. Check the mode badge before uploading
4. Watch the terminal logs
5. Use search to verify changes

**Good luck! 🎯**
