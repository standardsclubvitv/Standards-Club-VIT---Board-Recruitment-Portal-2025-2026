/* ==========================================
   UI INTERACTIONS - ADDITIONAL UI FEATURES
   ========================================== */

// Initialize UI features
document.addEventListener('DOMContentLoaded', () => {
  initializeAnimations();
  initializeTooltips();
  initializeBackToTop();
  initializeFormInteractions();
});

// ========== ANIMATIONS ==========
function initializeAnimations() {
  // Add entrance animations to elements
  const animatedElements = document.querySelectorAll('[data-aos]');
  
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.getAttribute('data-aos-delay') || 0;
        
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, delay);
        
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
}

// ========== TOOLTIPS ==========
function initializeTooltips() {
  // Simple tooltip implementation
  const elementsWithTitle = document.querySelectorAll('[title]');
  
  elementsWithTitle.forEach(element => {
    const title = element.getAttribute('title');
    if (!title) return;

    // Remove default title to prevent browser tooltip
    element.removeAttribute('title');
    element.setAttribute('data-tooltip', title);

    element.addEventListener('mouseenter', (e) => {
      showTooltip(e.target, title);
    });

    element.addEventListener('mouseleave', () => {
      hideTooltip();
    });
  });
}

function showTooltip(element, text) {
  const tooltip = document.createElement('div');
  tooltip.className = 'custom-tooltip';
  tooltip.textContent = text;
  tooltip.style.cssText = `
    position: fixed;
    background: var(--bg-dark);
    color: var(--primary);
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 0.85rem;
    z-index: 10000;
    pointer-events: none;
    white-space: nowrap;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    border: 1px solid var(--primary);
  `;

  document.body.appendChild(tooltip);

  const rect = element.getBoundingClientRect();
  tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
  tooltip.style.top = rect.bottom + 10 + 'px';

  // Store reference for cleanup
  element._tooltip = tooltip;
}

function hideTooltip() {
  const tooltip = document.querySelector('.custom-tooltip');
  if (tooltip) {
    tooltip.remove();
  }
}

// ========== BACK TO TOP BUTTON ==========
function initializeBackToTop() {
  // Create back to top button
  const backToTop = document.createElement('button');
  backToTop.id = 'backToTop';
  backToTop.innerHTML = '<i class="fas fa-arrow-up"></i>';
  backToTop.setAttribute('aria-label', 'Back to top');
  backToTop.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
    color: var(--bg-dark);
    border: none;
    border-radius: 50%;
    font-size: 1.2rem;
    cursor: pointer;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    z-index: 999;
    box-shadow: 0 4px 15px rgba(255, 199, 0, 0.3);
  `;

  document.body.appendChild(backToTop);

  // Show/hide based on scroll position
  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      backToTop.style.opacity = '1';
      backToTop.style.visibility = 'visible';
    } else {
      backToTop.style.opacity = '0';
      backToTop.style.visibility = 'hidden';
    }
  });

  // Scroll to top on click
  backToTop.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  // Hover effect
  backToTop.addEventListener('mouseenter', () => {
    backToTop.style.transform = 'translateY(-5px)';
    backToTop.style.boxShadow = '0 6px 25px rgba(255, 199, 0, 0.5)';
  });

  backToTop.addEventListener('mouseleave', () => {
    backToTop.style.transform = 'translateY(0)';
    backToTop.style.boxShadow = '0 4px 15px rgba(255, 199, 0, 0.3)';
  });
}

// ========== FORM INTERACTIONS ==========
function initializeFormInteractions() {
  // Auto-expand textareas
  const textareas = document.querySelectorAll('.form-textarea');
  
  textareas.forEach(textarea => {
    textarea.addEventListener('input', () => {
      autoExpandTextarea(textarea);
    });
  });

  // Floating labels effect
  const formInputs = document.querySelectorAll('.form-input, .form-select');
  
  formInputs.forEach(input => {
    // Add focus class
    input.addEventListener('focus', () => {
      input.parentElement.classList.add('focused');
    });

    input.addEventListener('blur', () => {
      if (!input.value) {
        input.parentElement.classList.remove('focused');
      }
    });

    // Check initial value
    if (input.value) {
      input.parentElement.classList.add('focused');
    }
  });

  // Format phone number on input
  const mobileInput = document.getElementById('mobile');
  if (mobileInput) {
    mobileInput.addEventListener('input', (e) => {
      // Allow only digits
      e.target.value = e.target.value.replace(/\D/g, '');
    });
  }

  // Format registration number
  const regNumberInput = document.getElementById('regNumber');
  if (regNumberInput) {
    regNumberInput.addEventListener('input', (e) => {
      // Auto-capitalize
      e.target.value = e.target.value.toUpperCase();
    });
  }
}

function autoExpandTextarea(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = (textarea.scrollHeight) + 'px';
}

// ========== KEYBOARD SHORTCUTS ==========
document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + Enter to submit form when in textarea
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    const activeElement = document.activeElement;
    if (activeElement.classList.contains('form-textarea')) {
      const submitButton = document.querySelector('.btn-submit');
      if (submitButton && submitButton.offsetParent !== null) {
        submitButton.click();
      }
    }
  }

  // Escape to close mobile menu
  if (e.key === 'Escape') {
    const navMenu = document.getElementById('navMenu');
    if (navMenu && navMenu.classList.contains('active')) {
      navMenu.classList.remove('active');
    }
  }
});

// ========== COPY TO CLIPBOARD ==========
window.copyToClipboard = function(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      showNotification('Copied to clipboard!', 'success');
    }).catch(err => {
      showNotification('Failed to copy', 'error');
    });
  }
};

// ========== NOTIFICATIONS ==========
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 90px;
    right: 20px;
    padding: 15px 25px;
    background: ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--error)' : 'var(--primary)'};
    color: white;
    border-radius: 5px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 10000;
    animation: slideInRight 0.3s ease;
    font-weight: 600;
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// ========== PRINT STYLES ==========
window.addEventListener('beforeprint', () => {
  // Expand all collapsed sections before printing
  document.querySelectorAll('.position-questions').forEach(el => {
    el.style.maxHeight = 'none';
  });
});

// ========== PERFORMANCE MONITORING ==========
window.addEventListener('load', () => {
  // Page loaded
});

// ========== ERROR HANDLING ==========
window.addEventListener('error', (e) => {
  // Could send error to analytics service here
});

// ========== ACCESSIBILITY ==========
// Trap focus in modal/overlay when open
function trapFocus(element) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  element.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    }
  });
}

// Apply to loading overlay
const loadingOverlay = document.getElementById('loadingOverlay');
if (loadingOverlay) {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'style') {
        if (loadingOverlay.style.display !== 'none') {
          trapFocus(loadingOverlay);
        }
      }
    });
  });
  
  observer.observe(loadingOverlay, { attributes: true });
}

// ========== LOCAL STORAGE (FORM DRAFT) ==========
// Auto-save form data to prevent loss
let autoSaveTimeout;

document.addEventListener('input', (e) => {
  if (e.target.closest('#applicationForm')) {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(() => {
      saveFormDraft();
    }, 2000); // Save after 2 seconds of inactivity
  }
});

function saveFormDraft() {
  const formData = {};
  const form = document.getElementById('applicationForm');
  if (!form) return;

  const inputs = form.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    if (input.id && input.value) {
      formData[input.id] = input.value;
    }
  });

  try {
    localStorage.setItem('applicationDraft', JSON.stringify(formData));
  } catch (err) {
    // Failed to save draft
  }
}

function loadFormDraft() {
  try {
    const draft = localStorage.getItem('applicationDraft');
    if (draft) {
      const formData = JSON.parse(draft);
      
      Object.keys(formData).forEach(id => {
        const element = document.getElementById(id);
        if (element && !element.value) {
          element.value = formData[id];
        }
      });

      showNotification('Previous draft loaded', 'info');
    }
  } catch (err) {
    // Failed to load draft
  }
}

function clearFormDraft() {
  localStorage.removeItem('applicationDraft');
}

// Load draft on page load (optional - comment out if not needed)
// window.addEventListener('load', loadFormDraft);

// Clear draft after successful submission
window.addEventListener('load', () => {
  const successMessage = document.getElementById('successMessage');
  if (successMessage && successMessage.style.display !== 'none') {
    clearFormDraft();
  }
});

// Export functions for use in other modules
window.showNotification = showNotification;
window.copyToClipboard = copyToClipboard;
