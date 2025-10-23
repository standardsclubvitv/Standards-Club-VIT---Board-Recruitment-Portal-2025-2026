/* ==========================================
   FORM HANDLER - APPLICATION FORM LOGIC
   ========================================== */

let currentStep = 1;
const totalSteps = 4;

// Initialize form
document.addEventListener('DOMContentLoaded', () => {
  initializeFormNavigation();
  initializeFormValidation();
  initializeFormSubmission();
});

// ========== FORM NAVIGATION ==========
function initializeFormNavigation() {
  const nextButtons = document.querySelectorAll('.btn-next');
  const prevButtons = document.querySelectorAll('.btn-prev');

  nextButtons.forEach(button => {
    button.addEventListener('click', () => {
      if (validateCurrentStep()) {
        if (currentStep === 2) {
          // Generate motivation questions before moving to step 3
          generateMotivationQuestions();
        }
        goToStep(currentStep + 1);
      }
    });
  });

  prevButtons.forEach(button => {
    button.addEventListener('click', () => {
      goToStep(currentStep - 1);
    });
  });
}

function goToStep(step) {
  if (step < 1 || step > totalSteps) return;

  // Hide current step
  document.querySelector(`.form-step[data-step="${currentStep}"]`).classList.remove('active');

  // Show new step
  document.querySelector(`.form-step[data-step="${step}"]`).classList.add('active');

  // Update progress indicator
  updateProgressIndicator(step);

  // Update current step
  currentStep = step;

  // Scroll to form
  document.querySelector('.apply').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function updateProgressIndicator(step) {
  const steps = document.querySelectorAll('.progress-step');
  
  steps.forEach((stepEl, index) => {
    const stepNum = index + 1;
    
    if (stepNum < step) {
      stepEl.classList.add('completed');
      stepEl.classList.remove('active');
    } else if (stepNum === step) {
      stepEl.classList.add('active');
      stepEl.classList.remove('completed');
    } else {
      stepEl.classList.remove('active', 'completed');
    }
  });
}

// ========== FORM VALIDATION ==========
function initializeFormValidation() {
  // Real-time validation
  const inputs = document.querySelectorAll('.form-input, .form-select, .form-textarea');
  
  inputs.forEach(input => {
    input.addEventListener('blur', () => {
      validateField(input);
    });

    input.addEventListener('input', () => {
      // Clear error on input
      const formGroup = input.closest('.form-group');
      if (formGroup) {
        formGroup.classList.remove('error');
        const errorSpan = formGroup.querySelector('.form-error');
        if (errorSpan) errorSpan.textContent = '';
      }
    });
  });

  // Word count for textareas
  document.addEventListener('input', (e) => {
    if (e.target.classList.contains('motivation-textarea') || 
        e.target.classList.contains('domain-textarea')) {
      updateWordCount(e.target);
    }
  });
}

function validateCurrentStep() {
  let isValid = true;
  const currentStepEl = document.querySelector(`.form-step[data-step="${currentStep}"]`);
  const fields = currentStepEl.querySelectorAll('.form-input, .form-select, .form-textarea, input[type="checkbox"]');

  fields.forEach(field => {
    if (field.hasAttribute('required') || field.value) {
      if (!validateField(field)) {
        isValid = false;
      }
    }
  });

  return isValid;
}

function validateField(field) {
  const formGroup = field.closest('.form-group') || field.closest('.form-group-checkbox');
  const errorSpan = formGroup ? formGroup.querySelector('.form-error') : null;
  let error = '';

  // Skip if field is not required and empty
  if (!field.hasAttribute('required') && !field.value) {
    return true;
  }

  // Field-specific validation
  switch (field.id) {
    case 'fullName':
      if (field.value.trim().length < 3) {
        error = 'Name must be at least 3 characters long';
      } else if (field.value.trim().length > 100) {
        error = 'Name must not exceed 100 characters';
      } else if (!/^[a-zA-Z\s]+$/.test(field.value)) {
        error = 'Name must contain only letters and spaces';
      }
      break;

    case 'email':
      const vitEmailRegex = /^[a-zA-Z0-9._-]+@(vitstudent\.ac\.in|vit\.ac\.in)$/i;
      if (!vitEmailRegex.test(field.value)) {
        error = 'Please use a valid VIT email address (@vitstudent.ac.in)';
      }
      break;

    case 'mobile':
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(field.value.replace(/\s/g, ''))) {
        error = 'Please enter a valid 10-digit Indian mobile number';
      }
      break;

    case 'regNumber':
      const regNumRegex = /^[0-9]{2}[A-Z]{3}[0-9]{4,5}$/i;
      if (!regNumRegex.test(field.value.replace(/\s/g, ''))) {
        error = 'Please enter a valid registration number (e.g., 20BCE1234)';
      }
      break;

    case 'position1':
      if (!field.value) {
        error = 'Please select at least one position';
      }
      break;

    case 'resumeLink':
      try {
        const url = new URL(field.value);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
          error = 'Please enter a valid URL starting with http:// or https://';
        }
      } catch {
        error = 'Please enter a valid URL';
      }
      break;

    case 'portfolioLink':
    case 'githubLink':
    case 'linkedinLink':
      // Optional fields - only validate if they have a value
      if (field.value && field.value.trim()) {
        try {
          const url = new URL(field.value);
          if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            error = 'Please enter a valid URL starting with http:// or https://';
          }
        } catch {
          error = 'Please enter a valid URL';
        }
      }
      break;

    case 'termsConsent':
    case 'interviewConsent':
      if (!field.checked) {
        error = 'You must agree to continue';
      }
      break;

    default:
      // Motivation and domain textareas
      if (field.classList.contains('motivation-textarea')) {
        const wordCount = getWordCount(field.value);
        if (wordCount < 200) {
          error = `Motivation must be at least 200 words (currently ${wordCount} words)`;
        } else if (wordCount > 500) {
          error = `Motivation must not exceed 500 words (currently ${wordCount} words)`;
        }
      } else if (field.classList.contains('domain-textarea')) {
        const wordCount = getWordCount(field.value);
        if (wordCount < 50) {
          error = `Answer must be at least 50 words (currently ${wordCount} words)`;
        }
      }
      break;
  }

  // Update UI
  if (error) {
    if (formGroup) formGroup.classList.add('error');
    if (errorSpan) errorSpan.textContent = error;
    return false;
  } else {
    if (formGroup) formGroup.classList.remove('error');
    if (errorSpan) errorSpan.textContent = '';
    return true;
  }
}

function getWordCount(text) {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

function updateWordCount(textarea) {
  const wordCount = getWordCount(textarea.value);
  const countDisplay = textarea.nextElementSibling;
  
  if (countDisplay && countDisplay.classList.contains('word-count')) {
    let status = '';
    let min = 0, max = 0;

    if (textarea.classList.contains('motivation-textarea')) {
      min = 200;
      max = 500;
    } else if (textarea.classList.contains('domain-textarea')) {
      min = 50;
      max = 10000;
    }

    if (wordCount < min) {
      status = 'error';
    } else if (wordCount > max) {
      status = 'error';
    } else {
      status = 'success';
    }

    countDisplay.className = `word-count ${status}`;
    countDisplay.textContent = `${wordCount} words`;
  }
}

// ========== GENERATE MOTIVATION QUESTIONS ==========
function generateMotivationQuestions() {
  const container = document.getElementById('motivationQuestionsContainer');
  container.innerHTML = '';

  // Check if positions data is loaded
  if (!window.allPositionsWithQuestions || window.allPositionsWithQuestions.length === 0) {
    container.innerHTML = '<p style="color: #ffc700; text-align: center; padding: 2rem;">Loading positions data... Please wait.</p>';
    return;
  }

  const selectedPositions = [];
  
  // Collect selected positions
  for (let i = 1; i <= 3; i++) {
    const select = document.getElementById(`position${i}`);
    if (select && select.value) {
      // Use allPositionsWithQuestions to get full data including domain questions
      const positionData = window.allPositionsWithQuestions.find(p => p.name === select.value);
      if (positionData) {
        selectedPositions.push({
          ...positionData,
          preference: i
        });
      }
    }
  }

  // Show message if no positions selected
  if (selectedPositions.length === 0) {
    container.innerHTML = '<p style="color: #888; text-align: center; padding: 2rem;"><i class="fas fa-info-circle"></i> Please select at least one position in Step 2</p>';
    return;
  }

  // Generate questions for each position
  selectedPositions.forEach(position => {
    const section = createMotivationSection(position);
    container.appendChild(section);
  });
}

function createMotivationSection(position) {
  const section = document.createElement('div');
  section.className = 'motivation-section';
  section.setAttribute('data-position-name', position.name);

  // Check if domain questions exist
  const questionsHTML = (position.domainQuestions && position.domainQuestions.length > 0) 
    ? position.domainQuestions.map((question, index) => `
      <div class="form-group">
        <label for="domain-${position.id}-${index}">
          Question ${index + 1}: ${question}
          <span class="required">*</span>
        </label>
        <textarea 
          id="domain-${position.id}-${index}" 
          class="form-textarea domain-textarea" 
          placeholder="Enter your answer here (minimum 50 words)..."
          required
          data-position-id="${position.id}"
          data-question-index="${index}"
        ></textarea>
        <small class="word-count">0 words</small>
        <span class="form-error"></span>
      </div>
    `).join('')
    : '<p style="color: #888; font-style: italic;">No domain questions for this position.</p>';

  section.innerHTML = `
    <h4>
      <i class="fas fa-star"></i>
      ${position.name} (Preference ${position.preference})
    </h4>

    <div class="form-group">
      <label for="motivation-${position.id}">
        Why do you want to be ${position.name}?
        <span class="required">*</span>
      </label>
      <textarea 
        id="motivation-${position.id}" 
        class="form-textarea motivation-textarea" 
        placeholder="Share your motivation and vision for this position (200-500 words)..."
        required
        data-position-id="${position.id}"
      ></textarea>
      <small class="word-count">0 words</small>
      <span class="form-error"></span>
    </div>

    ${questionsHTML}
  `;

  return section;
}

// ========== FORM SUBMISSION ==========
function initializeFormSubmission() {
  const form = document.getElementById('applicationForm');
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!validateCurrentStep()) {
      return;
    }

    await submitApplication();
  });
}

async function submitApplication() {
  // Show loading overlay
  document.getElementById('loadingOverlay').style.display = 'flex';

  try {
    // Collect form data
    const formData = collectFormData();

    // Submit to API
    const response = await fetch(`${window.API_URL}/submit-application`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });

    const result = await response.json();

    // Hide loading overlay
    document.getElementById('loadingOverlay').style.display = 'none';

    if (result.success) {
      // Show success message
      showSuccessMessage(result.applicationId);
    } else {
      // Show error modal
      showErrorModal(result.message, result.error);
    }

  } catch (error) {
    document.getElementById('loadingOverlay').style.display = 'none';
    showErrorModal('Failed to submit application. Please check your connection and try again.', 'NETWORK_ERROR');
  }
}

function collectFormData() {
  // Basic info
  const name = document.getElementById('fullName').value.trim();
  const email = document.getElementById('email').value.trim().toLowerCase();
  const mobile = document.getElementById('mobile').value.trim();
  const regNumber = document.getElementById('regNumber').value.trim().toUpperCase();
  const resumeLink = document.getElementById('resumeLink').value.trim();
  const agreedToTerms = document.getElementById('termsConsent').checked;

  // Optional links
  const portfolioLink = document.getElementById('portfolioLink').value.trim();
  const githubLink = document.getElementById('githubLink').value.trim();
  const linkedinLink = document.getElementById('linkedinLink').value.trim();

  // Positions
  const positions = [];
  
  for (let i = 1; i <= 3; i++) {
    const select = document.getElementById(`position${i}`);
    if (select && select.value) {
      // Use allPositionsWithQuestions to get full data including domain questions
      const positionData = window.allPositionsWithQuestions?.find(p => p.name === select.value);
      
      if (positionData) {
        // Get motivation
        const motivationTextarea = document.getElementById(`motivation-${positionData.id}`);
        const motivation = motivationTextarea ? motivationTextarea.value.trim() : '';

        // Get domain answers with questions
        const domainAnswersArray = [];
        if (positionData.domainQuestions && positionData.domainQuestions.length > 0) {
          positionData.domainQuestions.forEach((question, index) => {
            const textarea = document.getElementById(`domain-${positionData.id}-${index}`);
            if (textarea && textarea.value.trim()) {
              domainAnswersArray.push({
                question: question,
                answer: textarea.value.trim()
              });
            }
          });
        }

        positions.push({
          positionName: positionData.name,
          preference: i,
          motivation: motivation,
          domainAnswers: domainAnswersArray,
          // Also keep text version for backward compatibility
          domainAnswersText: domainAnswersArray.map((qa, idx) => 
            `Q${idx + 1}: ${qa.question}\nA${idx + 1}: ${qa.answer}`
          ).join('\n\n')
        });
      }
    }
  }

  const formData = {
    name,
    email,
    mobile,
    regNumber,
    positions,
    resumeLink,
    agreedToTerms
  };

  // Add optional fields only if they have values
  if (portfolioLink) formData.portfolioLink = portfolioLink;
  if (githubLink) formData.githubLink = githubLink;
  if (linkedinLink) formData.linkedinLink = linkedinLink;

  return formData;
}

function showSuccessMessage(applicationId) {
  // Hide old success message
  const oldSuccessMessage = document.getElementById('successMessage');
  if (oldSuccessMessage) {
    oldSuccessMessage.style.display = 'none';
  }

  // Show modern modal
  const modal = document.getElementById('successModal');
  const modalAppId = document.getElementById('modalApplicationId');
  
  if (modal && modalAppId) {
    modalAppId.textContent = applicationId;
    modal.classList.add('active');
    
    // Trigger confetti
    setTimeout(() => {
      triggerConfetti();
    }, 600);
  }
}

function closeSuccessModal() {
  const modal = document.getElementById('successModal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => {
      location.reload();
    }, 300);
  }
}

function showErrorModal(message, errorCode = 'UNKNOWN_ERROR') {
  const modal = document.getElementById('errorModal');
  const errorMessage = document.getElementById('errorMessage');
  const errorDetails = document.getElementById('errorDetails');
  const errorCodeEl = document.getElementById('errorCode');
  
  if (modal && errorMessage) {
    // Set error message
    errorMessage.textContent = message;
    
    // Show/hide error code based on availability
    if (errorCode && errorCode !== 'UNKNOWN_ERROR') {
      errorCodeEl.textContent = errorCode;
      errorDetails.style.display = 'block';
    } else {
      errorDetails.style.display = 'none';
    }
    
    // Show modal with animation
    modal.classList.add('active');
  }
}

function closeErrorModal() {
  const modal = document.getElementById('errorModal');
  if (modal) {
    modal.classList.remove('active');
  }
}

// Make functions global
window.closeSuccessModal = closeSuccessModal;
window.closeErrorModal = closeErrorModal;
window.showErrorModal = showErrorModal;

function triggerConfetti() {
  // Enhanced confetti effect
  const colors = ['#ffc700', '#10b981', '#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6'];
  
  for (let i = 0; i < 100; i++) {
    setTimeout(() => {
      createConfettiPiece(colors);
    }, i * 30);
  }
}

function createConfettiPiece(colors) {
  const confetti = document.createElement('div');
  confetti.className = 'confetti-piece';
  
  const color = colors[Math.floor(Math.random() * colors.length)];
  const left = Math.random() * 100;
  const size = Math.random() * 10 + 5;
  const duration = Math.random() * 2 + 2;
  
  confetti.style.cssText = `
    position: fixed;
    left: ${left}%;
    top: -10%;
    width: ${size}px;
    height: ${size}px;
    background: ${color};
    border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
    z-index: 10000;
    pointer-events: none;
    animation: confetti-fall ${duration}s ease-out forwards;
  `;
  
  document.body.appendChild(confetti);
  
  setTimeout(() => {
    confetti.remove();
  }, duration * 1000);
}
