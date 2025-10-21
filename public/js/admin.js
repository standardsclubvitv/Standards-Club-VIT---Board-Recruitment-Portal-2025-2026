/* ==========================================
   ADMIN PANEL JAVASCRIPT
   ========================================== */

// API Configuration
const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api' 
  : '/api';

let authToken = null;
let allApplications = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Check if already logged in
  authToken = localStorage.getItem('adminToken');
  if (authToken) {
    showDashboard();
    loadApplications();
  }
  
  // Setup event listeners
  setupEventListeners();
});

// ========== EVENT LISTENERS ==========
function setupEventListeners() {
  // Login form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  // Logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
  
  // Refresh button
  const refreshBtn = document.getElementById('refreshBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      loadApplications();
    });
  }
  
  // Download Excel button
  const downloadBtn = document.getElementById('downloadExcelBtn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', downloadExcel);
  }
  
  // Search input
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', handleSearch);
  }
  
  // Filter position
  const filterPosition = document.getElementById('filterPosition');
  if (filterPosition) {
    filterPosition.addEventListener('change', handleFilter);
  }
}

// ========== LOGIN ==========
async function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('adminEmail').value;
  const password = document.getElementById('adminPassword').value;
  const errorDiv = document.getElementById('loginError');
  
  try {
    const response = await fetch(`${API_URL}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      authToken = data.token;
      localStorage.setItem('adminToken', authToken);
      showDashboard();
      loadApplications();
    } else {
      errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${data.message}`;
      errorDiv.style.display = 'block';
    }
  } catch (error) {
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> Connection error. Please try again.`;
    errorDiv.style.display = 'block';
  }
}

// ========== LOGOUT ==========
function handleLogout() {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.removeItem('adminToken');
    authToken = null;
    document.getElementById('dashboardScreen').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'flex';
  }
}

// ========== SHOW DASHBOARD ==========
function showDashboard() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('dashboardScreen').style.display = 'block';
}

// ========== LOAD APPLICATIONS ==========
async function loadApplications() {
  const tbody = document.getElementById('applicationsBody');
  tbody.innerHTML = `
    <tr>
      <td colspan="8" class="loading">
        <i class="fas fa-spinner fa-spin"></i>
        Loading applications...
      </td>
    </tr>
  `;
  
  try {
    const response = await fetch(`${API_URL}/admin/get-applications`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      allApplications = data.applications;
      renderApplications(allApplications);
      updateStats(allApplications);
      populatePositionFilter(allApplications);
    } else {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="loading" style="color: var(--error);">
            <i class="fas fa-exclamation-triangle"></i>
            ${data.message}
          </td>
        </tr>
      `;
    }
  } catch (error) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="loading" style="color: var(--error);">
          <i class="fas fa-exclamation-triangle"></i>
          Failed to load applications. Please refresh.
        </td>
      </tr>
    `;
  }
}

// ========== RENDER APPLICATIONS ==========
function renderApplications(applications) {
  const tbody = document.getElementById('applicationsBody');
  
  if (applications.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="loading">
          <i class="fas fa-inbox"></i>
          No applications found.
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = applications.map(app => {
    const positions = app.positions.map(p => p.positionName).join(', ');
    const date = new Date(app.submittedAt).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Handle both 'phone' and 'mobile' field names
    const phoneNumber = app.phone || app.mobile || 'N/A';
    
    return `
      <tr>
        <td><strong>${app.applicationId}</strong></td>
        <td>${app.name}</td>
        <td>${app.email}</td>
        <td>${app.regNumber}</td>
        <td>${phoneNumber}</td>
        <td>
          ${app.positions.map(p => `<span class="position-badge">${p.positionName}</span>`).join('')}
        </td>
        <td>${date}</td>
        <td>
          <button class="action-btn" onclick="viewDetails('${app._id}')">
            <i class="fas fa-eye"></i> View
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// ========== UPDATE STATS ==========
function updateStats(applications) {
  // Total applications
  document.getElementById('totalApplications').textContent = applications.length;
  
  // Today's applications
  const today = new Date().toDateString();
  const todayCount = applications.filter(app => {
    return new Date(app.submittedAt).toDateString() === today;
  }).length;
  document.getElementById('todayApplications').textContent = todayCount;
  
  // Unique applicants (by email)
  const uniqueEmails = new Set(applications.map(app => app.email));
  document.getElementById('uniqueApplicants').textContent = uniqueEmails.size;
  
  // Total positions applied
  const totalPositions = applications.reduce((sum, app) => sum + app.positions.length, 0);
  document.getElementById('totalPositions').textContent = totalPositions;
}

// ========== POPULATE POSITION FILTER ==========
function populatePositionFilter(applications) {
  const filterSelect = document.getElementById('filterPosition');
  const positions = new Set();
  
  applications.forEach(app => {
    app.positions.forEach(pos => {
      positions.add(pos.positionName);
    });
  });
  
  filterSelect.innerHTML = '<option value="">All Positions</option>';
  Array.from(positions).sort().forEach(position => {
    const option = document.createElement('option');
    option.value = position;
    option.textContent = position;
    filterSelect.appendChild(option);
  });
}

// ========== SEARCH ==========
function handleSearch(e) {
  const searchTerm = e.target.value.toLowerCase();
  
  const filtered = allApplications.filter(app => {
    const phoneNumber = app.phone || app.mobile || '';
    return app.name.toLowerCase().includes(searchTerm) ||
           app.email.toLowerCase().includes(searchTerm) ||
           app.regNumber.toLowerCase().includes(searchTerm) ||
           app.applicationId.toLowerCase().includes(searchTerm) ||
           phoneNumber.includes(searchTerm);
  });
  
  renderApplications(filtered);
}

// ========== FILTER ==========
function handleFilter(e) {
  const position = e.target.value;
  
  if (!position) {
    renderApplications(allApplications);
    return;
  }
  
  const filtered = allApplications.filter(app => {
    return app.positions.some(p => p.positionName === position);
  });
  
  renderApplications(filtered);
}

// ========== VIEW DETAILS ==========
window.viewDetails = function(applicationId) {
  const application = allApplications.find(app => app._id === applicationId);
  if (!application) return;
  
  const modal = document.getElementById('detailsModal');
  const detailsBody = document.getElementById('detailsBody');
  
  // Handle both 'phone' and 'mobile' field names
  const phoneNumber = application.phone || application.mobile || 'N/A';
  
  // Format date
  const submittedDate = new Date(application.submittedAt);
  const formattedDate = submittedDate.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  const formattedTime = submittedDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  
  let detailsHTML = `
    <!-- Application Header -->
    <div class="detail-header">
      <div class="detail-header-left">
        <h2 style="color: var(--primary); margin-bottom: 0.5rem;">
          ${application.applicationId}
        </h2>
        <p style="color: var(--text-gray); font-size: 0.9rem;">
          <i class="fas fa-calendar-alt"></i> Submitted on ${formattedDate} at ${formattedTime}
        </p>
      </div>
      <div style="display: flex; flex-direction: column; gap: 0.5rem; align-items: flex-end;">
        <div class="status-badge" style="background: ${application.status === 'pending' ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' : application.status === 'shortlisted' ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' : 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'};">
          <i class="fas ${application.status === 'pending' ? 'fa-clock' : application.status === 'shortlisted' ? 'fa-list-check' : 'fa-check-circle'}"></i> 
          ${application.status ? application.status.charAt(0).toUpperCase() + application.status.slice(1) : 'Pending'}
        </div>
        ${application.agreedToTerms ? `
        <small style="color: var(--text-gray); display: flex; align-items: center; gap: 0.25rem;">
          <i class="fas fa-check-circle" style="color: var(--success);"></i> Terms Agreed
        </small>
        ` : ''}
      </div>
    </div>
    
    <!-- Personal Information -->
    <div class="detail-section">
      <h3><i class="fas fa-user-circle"></i> Personal Information</h3>
      <div class="info-card">
        <div class="info-row">
          <div class="info-label"><i class="fas fa-user"></i> Full Name</div>
          <div class="info-value">${application.name}</div>
        </div>
        <div class="info-row">
          <div class="info-label"><i class="fas fa-envelope"></i> Email Address</div>
          <div class="info-value">${application.email}</div>
        </div>
        <div class="info-row">
          <div class="info-label"><i class="fas fa-phone"></i> Phone Number</div>
          <div class="info-value">${phoneNumber}</div>
        </div>
        <div class="info-row">
          <div class="info-label"><i class="fas fa-id-card"></i> Registration Number</div>
          <div class="info-value">${application.regNumber}</div>
        </div>
        ${application.branch ? `
        <div class="info-row">
          <div class="info-label"><i class="fas fa-graduation-cap"></i> Branch</div>
          <div class="info-value">${application.branch}</div>
        </div>
        ` : ''}
        ${application.year ? `
        <div class="info-row">
          <div class="info-label"><i class="fas fa-calendar"></i> Year of Study</div>
          <div class="info-value">${application.year}</div>
        </div>
        ` : ''}
        ${application.resumeLink ? `
        <div class="info-row">
          <div class="info-label"><i class="fas fa-file-pdf"></i> Resume</div>
          <div class="info-value">
            <a href="${application.resumeLink}" target="_blank" class="link-button">
              View Resume <i class="fas fa-external-link-alt"></i>
            </a>
          </div>
        </div>
        ` : ''}
      </div>
    </div>
  `;
  
  // Profile Links
  if (application.portfolioLink || application.githubLink || application.linkedinLink) {
    detailsHTML += `
      <div class="detail-section">
        <h3><i class="fas fa-link"></i> Social & Professional Links</h3>
        <div class="info-card">
    `;
    
    if (application.portfolioLink) {
      detailsHTML += `
        <div class="info-row">
          <div class="info-label"><i class="fas fa-globe"></i> Portfolio</div>
          <div class="info-value">
            <a href="${application.portfolioLink}" target="_blank" class="link-button">
              ${application.portfolioLink} <i class="fas fa-external-link-alt"></i>
            </a>
          </div>
        </div>
      `;
    }
    
    if (application.githubLink) {
      detailsHTML += `
        <div class="info-row">
          <div class="info-label"><i class="fab fa-github"></i> GitHub</div>
          <div class="info-value">
            <a href="${application.githubLink}" target="_blank" class="link-button">
              ${application.githubLink} <i class="fas fa-external-link-alt"></i>
            </a>
          </div>
        </div>
      `;
    }
    
    if (application.linkedinLink) {
      detailsHTML += `
        <div class="info-row">
          <div class="info-label"><i class="fab fa-linkedin"></i> LinkedIn</div>
          <div class="info-value">
            <a href="${application.linkedinLink}" target="_blank" class="link-button">
              ${application.linkedinLink} <i class="fas fa-external-link-alt"></i>
            </a>
          </div>
        </div>
      `;
    }
    
    detailsHTML += `
        </div>
      </div>
    `;
  }
  
  // Positions Applied - Summary
  detailsHTML += `
    <div class="detail-section">
      <h3><i class="fas fa-briefcase"></i> Positions Applied</h3>
      <div class="positions-summary">
  `;
  
  application.positions.forEach((pos, index) => {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    ];
    
    detailsHTML += `
      <div class="position-summary-card" style="border-left: 4px solid ${index === 0 ? '#667eea' : index === 1 ? '#f5576c' : '#4facfe'};">
        <div class="position-preference">
          <span class="preference-badge" style="background: ${gradients[index]};">
            ${pos.preference === 1 ? '1st' : pos.preference === 2 ? '2nd' : '3rd'} Preference
          </span>
        </div>
        <h4 style="color: var(--text-light); margin: 0.5rem 0;">
          ${pos.positionName}
        </h4>
      </div>
    `;
  });
  
  detailsHTML += `
      </div>
    </div>
  `;
  
  // Detailed Responses for Each Position
  application.positions.forEach((pos, index) => {
    const colors = ['#667eea', '#f5576c', '#4facfe'];
    const icons = ['fa-star', 'fa-star-half-alt', 'fa-star'];
    
    // Check if answers exist
    const hasAnswers = pos.answers && typeof pos.answers === 'object';
    const hasMotivation = pos.motivation && pos.motivation.trim().length > 0;
    const hasDomainAnswers = pos.domainAnswers && pos.domainAnswers.trim().length > 0;
    
    detailsHTML += `
      <div class="detail-section">
        <h3 style="color: ${colors[index]};">
          <i class="fas ${icons[index]}"></i> 
          Responses for ${pos.positionName || 'Position'} 
          <span style="font-size: 0.85rem; opacity: 0.8;">(${pos.preference === 1 ? '1st' : pos.preference === 2 ? '2nd' : '3rd'} Preference)</span>
        </h3>
        
        <!-- Motivation Question (200-500 words) -->
        ${hasMotivation ? `
        <div class="question-card">
          <div class="question-header">
            <i class="fas fa-heart"></i>
            Why do you want to join this position? (Motivation)
          </div>
          <div class="answer-content">
            ${pos.motivation}
          </div>
          <div style="padding: 0.5rem 1.5rem; border-top: 1px solid var(--border); background: rgba(0,0,0,0.02);">
            <small style="color: var(--text-gray);">
              <i class="fas fa-text-width"></i> Word count: ${getWordCount(pos.motivation)} words
            </small>
          </div>
        </div>
        ` : ''}
        
        <!-- Domain Answers (50+ words) -->
        ${hasDomainAnswers ? `
        <div class="question-card" style="border-left-color: ${colors[index]};">
          <div class="question-header" style="background: rgba(${index === 0 ? '102, 126, 234' : index === 1 ? '245, 87, 108' : '79, 172, 254'}, 0.1);">
            <i class="fas fa-puzzle-piece"></i>
            Domain-Specific Questions & Answers
          </div>
          <div class="answer-content">
            ${pos.domainAnswers}
          </div>
          <div style="padding: 0.5rem 1.5rem; border-top: 1px solid var(--border); background: rgba(0,0,0,0.02);">
            <small style="color: var(--text-gray);">
              <i class="fas fa-text-width"></i> Word count: ${getWordCount(pos.domainAnswers)} words
            </small>
          </div>
        </div>
        ` : ''}
        
        <!-- Old structure (General Questions) - for backward compatibility -->
        ${hasAnswers && pos.answers.whyJoin ? `
        <div class="question-card">
          <div class="question-header">
            <i class="fas fa-question-circle"></i>
            Why do you want to join Standards Club?
          </div>
          <div class="answer-content">
            ${pos.answers.whyJoin}
          </div>
        </div>
        ` : ''}
        
        ${hasAnswers && pos.answers.whyPosition ? `
        <div class="question-card">
          <div class="question-header">
            <i class="fas fa-question-circle"></i>
            Why are you interested in this position?
          </div>
          <div class="answer-content">
            ${pos.answers.whyPosition}
          </div>
        </div>
        ` : ''}
        
        ${hasAnswers && pos.answers.uniqueValue ? `
        <div class="question-card">
          <div class="question-header">
            <i class="fas fa-question-circle"></i>
            What unique value will you bring to this role?
          </div>
          <div class="answer-content">
            ${pos.answers.uniqueValue}
          </div>
        </div>
        ` : ''}
        
        ${!hasMotivation && !hasDomainAnswers && (!hasAnswers || (!pos.answers.whyJoin && !pos.answers.whyPosition && !pos.answers.uniqueValue)) ? `
        <div class="info-card" style="padding: 1.5rem; text-align: center; color: var(--text-gray);">
          <i class="fas fa-info-circle" style="font-size: 2rem; margin-bottom: 0.5rem; opacity: 0.5;"></i>
          <p>No responses recorded for this position</p>
        </div>
        ` : ''}
    `;
    
    // Domain-specific questions
    if (hasAnswers && pos.answers.domainAnswers && pos.answers.domainAnswers.length > 0) {
      detailsHTML += `
        <div style="margin-top: 1.5rem;">
          <h4 style="color: ${colors[index]}; font-size: 1rem; margin-bottom: 1rem;">
            <i class="fas fa-puzzle-piece"></i> Domain-Specific Questions
          </h4>
      `;
      
      pos.answers.domainAnswers.forEach((da, idx) => {
        detailsHTML += `
          <div class="question-card" style="border-left-color: ${colors[index]};">
            <div class="question-header" style="background: rgba(${index === 0 ? '102, 126, 234' : index === 1 ? '245, 87, 108' : '79, 172, 254'}, 0.1);">
              <i class="fas fa-lightbulb"></i>
              Question ${idx + 1}: ${da.question}
            </div>
            <div class="answer-content">
              ${da.answer}
            </div>
          </div>
        `;
      });
      
      detailsHTML += `</div>`;
    }
    
    detailsHTML += `</div>`;
  });
  
  detailsBody.innerHTML = detailsHTML;
  modal.classList.add('active');
}

// ========== CLOSE MODAL ==========
window.closeDetailsModal = function() {
  const modal = document.getElementById('detailsModal');
  modal.classList.remove('active');
}

// Close modal on outside click
window.addEventListener('click', (e) => {
  const modal = document.getElementById('detailsModal');
  if (e.target === modal) {
    closeDetailsModal();
  }
});

// ========== DOWNLOAD EXCEL ==========
function downloadExcel() {
  if (allApplications.length === 0) {
    alert('No applications to download!');
    return;
  }
  
  // Create CSV content
  let csv = 'Application ID,Name,Email,Phone,Registration No.,Branch,Year,Status,Terms Agreed,Position 1,Motivation 1,Domain Answers 1,Position 2,Motivation 2,Domain Answers 2,Position 3,Motivation 3,Domain Answers 3,Portfolio,GitHub,LinkedIn,Resume Link,Submitted Date\n';
  
  allApplications.forEach(app => {
    const row = [
      app.applicationId,
      app.name,
      app.email,
      app.phone || app.mobile || 'N/A',
      app.regNumber,
      app.branch || 'N/A',
      app.year || 'N/A',
      app.status || 'pending',
      app.agreedToTerms ? 'Yes' : 'No',
      app.positions[0]?.positionName || '',
      cleanCSVField(app.positions[0]?.motivation || ''),
      cleanCSVField(app.positions[0]?.domainAnswers || ''),
      app.positions[1]?.positionName || '',
      cleanCSVField(app.positions[1]?.motivation || ''),
      cleanCSVField(app.positions[1]?.domainAnswers || ''),
      app.positions[2]?.positionName || '',
      cleanCSVField(app.positions[2]?.motivation || ''),
      cleanCSVField(app.positions[2]?.domainAnswers || ''),
      app.portfolioLink || '',
      app.githubLink || '',
      app.linkedinLink || '',
      app.resumeLink || '',
      new Date(app.submittedAt).toLocaleString('en-IN')
    ];
    
    csv += row.map(field => `"${field}"`).join(',') + '\n';
  });
  
  // Create and download file
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  const timestamp = new Date().toISOString().split('T')[0];
  
  link.setAttribute('href', url);
  link.setAttribute('download', `standards-club-applications-${timestamp}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function cleanCSVField(text) {
  if (!text) return '';
  return text.replace(/"/g, '""').replace(/\n/g, ' ');
}

// Helper: Get word count
function getWordCount(text) {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}
