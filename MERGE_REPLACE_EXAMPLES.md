# 🔄 MERGE vs REPLACE Mode - Detailed Examples

## Understanding the Two Modes

### ✅ MERGE Mode (Smart Update)
**Purpose:** Update only specific fields while keeping old data intact  
**Use Case:** Semester-by-semester updates, clearing referred subjects, partial corrections

### ⚠️ REPLACE Mode (Total Overwrite)
**Purpose:** Completely replace the entire record  
**Use Case:** Full record updates, starting fresh, correcting multiple errors

---

## 📚 MERGE Mode Examples

### Example 1: Partial Semester Update
**Scenario:** Student took only 2nd semester exam, update only g2

**Existing Data:**
```
888888|g1:2.93,g2:2.84,g3:3.25
```

**Upload (MERGE):**
```
888888|g2:3.10
```

**Result:**
```
888888|g1:2.93,g2:3.10,g3:3.25
```
✅ Only g2 updated, g1 and g3 remain unchanged

---

### Example 2: Clear Referred Subject
**Scenario:** Student cleared a referred subject in re-exam

**Existing Data:**
```
888888|g1:r,g2:2.84|s:25912
```

**Upload (MERGE):**
```
888888|g1:2.93|s:
```

**Result:**
```
888888|g1:2.93,g2:2.84|s:
```
✅ g1 cleared from 'r' to 2.93, subjects removed (s: is empty), g2 unchanged

---

### Example 3: Add New Referred Subjects
**Scenario:** Student failed in new semester

**Existing Data:**
```
888888|g1:2.93,g2:2.84
```

**Upload (MERGE):**
```
888888|g3:r|s:52678,63782
```

**Result:**
```
888888|g1:2.93,g2:2.84,g3:r|s:52678,63782
```
✅ g3 added with referred status, subjects added, g1 & g2 unchanged

---

### Example 4: Mixed Update
**Scenario:** One semester clear, one semester failed

**Existing Data:**
```
888888|g1:r,g2:r|s:25912,26731
```

**Upload (MERGE):**
```
888888|g1:2.93,g2:r|s:26731
```

**Result:**
```
888888|g1:2.93,g2:r|s:26731
```
✅ g1 cleared, g2 still referred, subjects updated to only 26731

---

### Example 5: Add CGPA to Existing Record
**Scenario:** Final semester completed, add overall CGPA

**Existing Data:**
```
888888|g1:2.93,g2:2.84,g3:3.25,g4:3.17,g5:2.90,g6:3.05,g7:3.24,g8:3.17
```

**Upload (MERGE):**
```
888888|c:3.06
```

**Result:**
```
888888|c:3.06|g1:2.93,g2:2.84,g3:3.25,g4:3.17,g5:2.90,g6:3.05,g7:3.24,g8:3.17
```
✅ Only CGPA added, all GPAs unchanged

---

### Example 6: Update Multiple Semesters
**Scenario:** Update 3 specific semesters

**Existing Data:**
```
888888|g1:2.93,g2:2.84,g3:3.25,g4:3.17,g5:2.90
```

**Upload (MERGE):**
```
888888|g2:3.00,g4:3.25,g5:3.10
```

**Result:**
```
888888|g1:2.93,g2:3.00,g3:3.25,g4:3.25,g5:3.10
```
✅ g2, g4, g5 updated, g1 & g3 unchanged

---

## 🔥 REPLACE Mode Examples

### Example 1: Complete Record Overwrite
**Scenario:** Replace entire record with new data

**Existing Data:**
```
888888|c:3.06|g1:2.93,g2:2.84,g3:3.25,g4:3.17,g5:2.90,g6:3.05,g7:3.24,g8:3.17|s:25912
```

**Upload (REPLACE):**
```
888888|g1:2.93,g2:2.84
```

**Result:**
```
888888|g1:2.93,g2:2.84
```
⚠️ **EVERYTHING DELETED!** Only g1 & g2 remain. CGPA, g3-g8, and subjects all GONE!

---

### Example 2: Fresh Start
**Scenario:** Start fresh with only first semester

**Existing Data:**
```
888888|c:2.50|g1:r,g2:r,g3:2.00|s:25912,26731,52678
```

**Upload (REPLACE):**
```
888888|g1:3.00
```

**Result:**
```
888888|g1:3.00
```
⚠️ Old CGPA, g2, g3, and all subjects completely removed

---

### Example 3: Complete Update
**Scenario:** Upload all 8 semesters at once

**Existing Data:**
```
888888|g1:2.93,g2:2.84
```

**Upload (REPLACE):**
```
888888|c:3.06|g1:2.93,g2:2.84,g3:3.25,g4:3.17,g5:2.90,g6:3.05,g7:3.24,g8:3.17
```

**Result:**
```
888888|c:3.06|g1:2.93,g2:2.84,g3:3.25,g4:3.17,g5:2.90,g6:3.05,g7:3.24,g8:3.17
```
✅ Old record completely replaced with new complete record

---

## 🎯 Decision Guide: Which Mode to Use?

### Use **MERGE** Mode When:
- ✅ Updating one or two semesters only
- ✅ Clearing referred subjects after re-exam
- ✅ Adding new semester results
- ✅ Fixing specific GPA values
- ✅ You want to KEEP existing data

### Use **REPLACE** Mode When:
- ⚠️ You have the COMPLETE student record
- ⚠️ You want to START FRESH
- ⚠️ You need to REMOVE old semesters
- ⚠️ You're doing bulk complete updates
- ⚠️ You want to DELETE everything and start over

---

## 🧪 Test Scenarios

### Test 1: Partial Update (MERGE)
1. Upload in REPLACE mode:
   ```
   888888|g1:2.93,g2:2.84,g3:3.25,g4:3.17,g5:2.90,g6:3.05,g7:3.24,g8:3.17
   ```

2. Switch to MERGE mode and upload:
   ```
   888888|g2:3.00
   ```

3. **Expected Result:**
   ```
   888888|g1:2.93,g2:3.00,g3:3.25,g4:3.17,g5:2.90,g6:3.05,g7:3.24,g8:3.17
   ```

---

### Test 2: Clear Subjects (MERGE)
1. Upload in REPLACE mode:
   ```
   888888|g1:r,g2:2.84|s:25912,26731
   ```

2. Switch to MERGE mode and upload:
   ```
   888888|g1:2.93|s:
   ```

3. **Expected Result:**
   ```
   888888|g1:2.93,g2:2.84|s:
   ```

---

### Test 3: Total Overwrite (REPLACE)
1. Upload in REPLACE mode:
   ```
   888888|c:3.06|g1:2.93,g2:2.84,g3:3.25,g4:3.17,g5:2.90,g6:3.05,g7:3.24,g8:3.17
   ```

2. Stay in REPLACE mode and upload:
   ```
   888888|g1:2.93,g2:2.84
   ```

3. **Expected Result:**
   ```
   888888|g1:2.93,g2:2.84
   ```
   (CGPA and g3-g8 deleted!)

---

## ⚠️ Common Mistakes to Avoid

### Mistake 1: Using REPLACE for Partial Updates
❌ **Wrong:**
```
Mode: REPLACE
Upload: 888888|g2:3.00
```
This will DELETE all other semesters!

✅ **Correct:**
```
Mode: MERGE
Upload: 888888|g2:3.00
```

---

### Mistake 2: Forgetting to Clear Subjects
❌ **Wrong:**
```
Mode: MERGE
Upload: 888888|g1:2.93
```
If g1 was referred, subjects remain in database!

✅ **Correct:**
```
Mode: MERGE
Upload: 888888|g1:2.93|s:
```
Explicitly clear subjects with `s:`

---

### Mistake 3: Using MERGE Without Subject Field
**Scenario:** Student cleared referred subject

❌ **Wrong:**
```
Mode: MERGE
Upload: 888888|g1:2.93
```
Old subjects still there!

✅ **Correct:**
```
Mode: MERGE
Upload: 888888|g1:2.93|s:
```
Must specify `s:` to remove subjects

---

## 📊 Summary Table

| Scenario | Mode | Upload Format | Old Data Kept? |
|----------|------|---------------|----------------|
| Update 1 semester | MERGE | `888888\|g2:3.00` | ✅ Yes |
| Clear referred | MERGE | `888888\|g1:2.93\|s:` | ✅ Yes |
| Add new semester | MERGE | `888888\|g5:3.10` | ✅ Yes |
| Update multiple | MERGE | `888888\|g2:3.00,g4:3.25` | ✅ Yes |
| Complete record | REPLACE | `888888\|c:3.06\|g1:...\|g8:...` | ❌ No |
| Delete old data | REPLACE | `888888\|g1:2.93` | ❌ No |

---

## 🎓 Best Practices

1. **Always use MERGE by default** - Safer for most operations
2. **Use REPLACE only when you're 100% sure** - It deletes data!
3. **Always specify subjects field** when clearing referred status
4. **Test with one record first** before bulk upload
5. **Download backup** before using REPLACE mode
6. **Double-check the mode indicator** before clicking Upload

---

**Remember:** 
- 🟢 MERGE = Add/Update (Safe)
- 🔴 REPLACE = Delete & Replace (Dangerous)

Choose wisely! 🎯
