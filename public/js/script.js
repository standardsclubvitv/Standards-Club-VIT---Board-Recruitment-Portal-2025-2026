/* ==========================================
   STANDARDS CLUB RECRUITMENT - MAIN SCRIPT
   ========================================== */

// Global state - expose to window for cross-file access
window.positionsData = [];
window.allPositionsWithQuestions = []; // Full data including domain questions
let selectedPositions = [];

// API Configuration
const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api' 
  : '/api';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  initializeNavigation();
  loadPositions();
  initializeScrollEffects();
  initializeSmoothScroll();
});

// ========== NAVIGATION ==========
function initializeNavigation() {
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  // Toggle mobile menu
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  }

  // Close menu on link click
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
    });
  });

  // Sticky navbar on scroll
  window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
      navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.5)';
    } else {
      navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.3)';
    }
  });
}

// ========== SMOOTH SCROLL ==========
function initializeSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const offsetTop = target.offsetTop - 70; // Account for fixed navbar
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });
}

// ========== SCROLL EFFECTS ==========
function initializeScrollEffects() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // Observe elements with data-aos attribute
  document.querySelectorAll('[data-aos]').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
}

// ========== LOAD POSITIONS DATA ==========
async function loadPositions() {
  try {
    const response = await fetch(`${API_URL}/get-positions`);
    const data = await response.json();

    if (data.success) {
      window.positionsData = data.positions; // Display data (without domain questions)
      window.allPositionsWithQuestions = data.allPositions; // Full data with domain questions for form
      
      renderPositions(window.positionsData);
      populatePositionSelects();
      initializeDepartmentFilter();
    } else {
      showError('Failed to load positions. Please refresh the page.');
    }
  } catch (error) {
    showError('Failed to load positions. Please check your connection and refresh.');
  }
}

// ========== RENDER POSITIONS CARDS ==========
function renderPositions(positions) {
  const grid = document.getElementById('positionsGrid');
  grid.innerHTML = '';

  positions.forEach((position, index) => {
    const card = createPositionCard(position, index);
    grid.appendChild(card);
  });
}

function createPositionCard(position, index) {
  const card = document.createElement('div');
  card.className = 'position-card';
  card.setAttribute('data-department', position.department);
  card.setAttribute('data-aos', 'fade-up');
  card.setAttribute('data-aos-delay', (index % 3) * 100);

  const responsibilitiesHTML = position.responsibilities
    .slice(0, 4)
    .map(resp => `<li><i class="fas fa-check-circle"></i>${resp}</li>`)
    .join('');

  const skillsHTML = position.requiredSkills
    .map(skill => `<span class="skill-tag">${skill}</span>`)
    .join('');

  card.innerHTML = `
    <div class="position-header">
      <div>
        <h3 class="position-title">${position.name}</h3>
      </div>
    </div>
    <p class="position-description">${position.description}</p>
    
    <div class="position-section">
      <h4><i class="fas fa-tasks"></i> Key Responsibilities</h4>
      <ul>${responsibilitiesHTML}</ul>
    </div>
    
    <div class="position-section">
      <h4><i class="fas fa-lightbulb"></i> Required Skills</h4>
      <div class="position-skills">${skillsHTML}</div>
    </div>
    
    <div class="position-footer">
      <i class="fas fa-info-circle"></i> Domain questions will appear in the application form
    </div>
  `;

  return card;
}

// ========== DEPARTMENT FILTER ==========
function initializeDepartmentFilter() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Update active state
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      // Filter positions
      const department = button.getAttribute('data-department');
      filterPositions(department);
    });
  });
}

function filterPositions(department) {
  const cards = document.querySelectorAll('.position-card');
  
  cards.forEach(card => {
    if (department === 'all' || card.getAttribute('data-department') === department) {
      card.style.display = 'block';
      card.style.animation = 'fadeIn 0.5s ease';
    } else {
      card.style.display = 'none';
    }
  });
}

// ========== POPULATE POSITION SELECTS ==========
function populatePositionSelects() {
  const selects = ['position1', 'position2', 'position3'];
  
  selects.forEach(selectId => {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    // Clear existing options except the first one
    select.innerHTML = '<option value="">-- Select Position --</option>';
    
    // Add position options
    window.positionsData.forEach(position => {
      const option = document.createElement('option');
      option.value = position.name;
      option.textContent = `${position.name}`;
      option.setAttribute('data-position-id', position.id);
      select.appendChild(option);
    });
    
    // Add change listener
    select.addEventListener('change', handlePositionSelection);
  });
}

// ========== HANDLE POSITION SELECTION ==========
function handlePositionSelection(event) {
  const selectId = event.target.id;
  const selectedValue = event.target.value;
  
  // Show/hide next position selector
  if (selectId === 'position1' && selectedValue) {
    document.getElementById('position2Container').style.display = 'block';
  }
  if (selectId === 'position2' && selectedValue) {
    document.getElementById('position3Container').style.display = 'block';
  }
  
  // Update available options in other selects
  updatePositionSelects();
}

function updatePositionSelects() {
  const position1 = document.getElementById('position1').value;
  const position2 = document.getElementById('position2').value;
  const position3 = document.getElementById('position3').value;
  
  const selectedValues = [position1, position2, position3].filter(v => v);
  
  // Disable already selected options
  ['position1', 'position2', 'position3'].forEach(selectId => {
    const select = document.getElementById(selectId);
    const currentValue = select.value;
    
    Array.from(select.options).forEach(option => {
      if (option.value === '') return;
      
      if (selectedValues.includes(option.value) && option.value !== currentValue) {
        option.disabled = true;
        option.style.color = '#666';
      } else {
        option.disabled = false;
        option.style.color = '';
      }
    });
  });
}

// ========== UTILITY FUNCTIONS ==========
function showError(message) {
  const grid = document.getElementById('positionsGrid');
  if (grid) {
    grid.innerHTML = `
      <div class="error-message" style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--error);">
        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
        <p style="font-size: 1.2rem;">${message}</p>
      </div>
    `;
  }
}

function showSuccess(message) {
  alert(message); // Simple implementation, can be enhanced with custom modal
}

// Export API_URL for use in other modules
window.API_URL = API_URL;
