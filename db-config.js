// ✅ FIXED: Auto-detect API URL based on environment
const API_URL = (() => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  
  console.log('🌐 Detecting API URL...');
  console.log('  Hostname:', hostname);
  console.log('  Protocol:', protocol);
  
  // Local development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:10000/api';
  }
  
  // Render.com deployment (backend hosted on Render)
  if (hostname.includes('onrender.com')) {
    return `${protocol}//${hostname}/api`;
  }
  
  // GitHub Pages or custom domain - point to Render backend
  if (hostname.includes('github.io') || hostname.includes('btebresultcheek')) {
    return 'https://result-new.onrender.com/api';
  }
  
  // Default: relative path (same domain)
  return '/api';
})();

console.log('✅ API URL configured:', API_URL);

// Health check cache
let healthCache = null;
let healthCacheTime = 0;
const HEALTH_CACHE_TTL = 30000; // 30 seconds

// ============================================
// HEALTH CHECK
// ============================================
async function checkHealth() {
  const now = Date.now();
  if (healthCache && (now - healthCacheTime) < HEALTH_CACHE_TTL) {
    console.log('📦 Using cached health data');
    return healthCache;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    console.log('🔍 Checking health:', `${API_URL}/health`);

    const response = await fetch(`${API_URL}/health`, {
      signal: controller.signal,
      headers: {
        'Cache-Control': 'no-cache'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }

    const data = await response.json();
    healthCache = data;
    healthCacheTime = now;
    
    console.log('✅ Health check successful:', data);
    return data;
  } catch (error) {
    console.error('❌ Health check error:', error);
    return { status: 'error', database: 'disconnected', error: error.message };
  }
}

// ============================================
// UPLOAD RESULTS (with MERGE/REPLACE support)
// ============================================
export async function uploadResults(results) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 min timeout

  try {
    console.log(`📤 Uploading ${results.length} results to ${API_URL}/results/bulk`);

    const response = await fetch(`${API_URL}/results/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ results }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        error: `HTTP ${response.status}: ${response.statusText}` 
      }));
      throw new Error(errorData.error || errorData.message || 'Failed to upload results');
    }

    const result = await response.json();
    console.log('✅ Upload successful:', result);
    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('❌ Upload error:', error);
    
    if (error.name === 'AbortError') {
      throw new Error('Upload timeout - please try with fewer records');
    }
    throw error;
  }
}

// ============================================
// GET SINGLE RESULT
// ============================================
export async function getResult(rollNumber) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    console.log(`🔍 Fetching result for roll: ${rollNumber}`);

    // Add cache busting to ensure fresh data
    const cacheBuster = `?t=${Date.now()}`;
    const response = await fetch(`${API_URL}/results/${rollNumber}${cacheBuster}`, {
      signal: controller.signal,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 404) {
        console.log('⚠️ Result not found for roll:', rollNumber);
        return null;
      }
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || 'Failed to fetch result');
    }

    const result = await response.json();
    console.log('✅ Result found:', result);
    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('❌ Get result error:', error);
    
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - please try again');
    }
    throw error;
  }
}

// ============================================
// GET ALL RESULTS (for backup)
// ============================================
export async function getAllResults() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 min timeout

  try {
    console.log('📥 Fetching all results from database...');

    const response = await fetch(`${API_URL}/results/all`, {
      signal: controller.signal,
      headers: {
        'Cache-Control': 'no-cache'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || 'Failed to fetch all results');
    }

    const results = await response.json();
    console.log(`✅ Retrieved ${results.length} results`);
    return results;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('❌ Get all results error:', error);
    
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - database might be large, please try again');
    }
    throw error;
  }
}

// ============================================
// GET STATISTICS
// ============================================
export async function getStatistics() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

  try {
    console.log('📊 Fetching statistics from:', `${API_URL}/results/statistics`);

    const response = await fetch(`${API_URL}/results/statistics`, {
      signal: controller.signal,
      headers: {
        'Cache-Control': 'no-cache'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        error: `HTTP ${response.status}: ${response.statusText}` 
      }));
      throw new Error(errorData.error || 'Failed to fetch statistics');
    }

    const stats = await response.json();
    console.log('✅ Statistics loaded:', stats);
    
    // If server doesn't provide complete stats, calculate client-side
    if (stats.total === undefined || stats.total === 0) {
      console.log('⚠️ Server statistics incomplete, calculating client-side...');
      const allResults = await getAllResults();
      return calculateStatistics(allResults);
    }
    
    return stats;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('❌ Statistics error:', error);
    
    if (error.name === 'AbortError') {
      throw new Error('Statistics timeout - please try again');
    }
    
    // Fallback: Calculate from all results
    console.log('⚠️ Falling back to client-side statistics calculation');
    try {
      const allResults = await getAllResults();
      return calculateStatistics(allResults);
    } catch (fallbackError) {
      console.error('❌ Fallback statistics failed:', fallbackError);
      throw new Error('Failed to load statistics: ' + error.message);
    }
  }
}

// ============================================
// CALCULATE STATISTICS (client-side fallback)
// ============================================
function calculateStatistics(results) {
  if (!results || results.length === 0) {
    return {
      total: 0,
      passed: 0,
      failed: 0,
      avgCGPA: 'N/A',
      topSubjects: []
    };
  }

  let passed = 0;
  let failed = 0;
  let cgpaSum = 0;
  let cgpaCount = 0;
  const subjectCounts = {};

  results.forEach(result => {
    // Check if failed/referred
    const hasReferred = result.s && Array.isArray(result.s) && result.s.length > 0;
    const hasRefGPA = ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8']
      .some(key => result[key] === 'r');

    if (hasReferred || hasRefGPA) {
      failed++;
    } else {
      passed++;
    }

    // Calculate CGPA
    if (result.c && result.c !== 'n' && result.c !== null) {
      const cgpa = parseFloat(result.c);
      if (!isNaN(cgpa) && cgpa > 0) {
        cgpaSum += cgpa;
        cgpaCount++;
      }
    }

    // Count subjects
    if (result.s && Array.isArray(result.s)) {
      result.s.forEach(subject => {
        subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
      });
    }
  });

  // Sort subjects by count
  const topSubjects = Object.entries(subjectCounts)
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    total: results.length,
    passed,
    failed,
    avgCGPA: cgpaCount > 0 ? (cgpaSum / cgpaCount).toFixed(2) : 'N/A',
    topSubjects
  };
}

// ============================================
// ADMIN LOGIN
// ============================================
export async function loginAdmin(email) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    console.log('🔐 Attempting admin login:', email);

    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error('Login failed - invalid credentials');
    }

    const result = await response.json();
    console.log('✅ Login successful');
    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('❌ Login error:', error);
    
    if (error.name === 'AbortError') {
      throw new Error('Login timeout - please try again');
    }
    throw error;
  }
}

// ============================================
// EXPORTS
// ============================================
export { checkHealth };
