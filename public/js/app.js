// WanderLust - Main Application JavaScript

// ================== DARK MODE ==================
const darkModeToggle = document.getElementById('darkModeToggle');
if (darkModeToggle) {
  darkModeToggle.addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark);
  });
}

// Check for saved dark mode preference
if (localStorage.getItem('darkMode') === 'true') {
  document.body.classList.add('dark-mode');
}

// ================== FLASH MESSAGES ==================
setTimeout(function() {
  const flashMessages = document.querySelectorAll('.flash-message');
  flashMessages.forEach(function(msg) {
    msg.style.opacity = '0';
    msg.style.transform = 'translateY(-20px)';
    msg.style.transition = 'all 0.3s ease';
    setTimeout(function() {
      msg.style.display = 'none';
    }, 300);
  });
}, 4000);

// ================== IMAGE UPLOAD PREVIEW ==================
const imageInput = document.getElementById('imageInput');
const imagePreview = document.getElementById('imagePreview');

if (imageInput && imagePreview) {
  imageInput.addEventListener('change', function(e) {
    const files = e.target.files;
    imagePreview.innerHTML = '';
    
    Array.from(files).forEach(function(file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
          const div = document.createElement('div');
          div.style.cssText = 'position: relative; width: 100px; height: 100px; border-radius: 8px; overflow: hidden;';
          div.innerHTML = '<img src="' + e.target.result + '" style="width: 100%; height: 100%; object-fit: cover;">' +
            '<button type="button" onclick="this.parentElement.remove()" style="position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.7); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer;">×</button>';
          imagePreview.appendChild(div);
        };
        reader.readAsDataURL(file);
      }
    });
  });
}

// ================== WISHLIST TOGGLE ==================
async function toggleWishlist(listingId) {
  try {
    const response = await fetch('/wishlists/add/' + listingId, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const result = await response.json();
    
    if (result.success) {
      const heart = document.querySelector('.listing-favorite[data-listing-id="' + listingId + '"]');
      if (heart) {
        if (result.action === 'added') {
          heart.classList.add('active');
        } else {
          heart.classList.remove('active');
        }
      }
    } else if (result.redirect) {
      window.location.href = result.redirect;
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// ================== DELETE CONFIRMATION ==================
function confirmDelete(message) {
  return confirm(message || 'Are you sure you want to delete this?');
}

// ================== FORM VALIDATION ==================
function validateForm(formId) {
  const form = document.getElementById(formId);
  if (!form) return true;
  
  const requiredFields = form.querySelectorAll('[required]');
  let isValid = true;
  
  requiredFields.forEach(function(field) {
    if (!field.value.trim()) {
      field.style.borderColor = '#ff385c';
      isValid = false;
    } else {
      field.style.borderColor = '#e5e5e5';
    }
  });
  
  return isValid;
}

// ================== DATE PICKER ==================
function initDatePickers() {
  const checkIn = document.getElementById('checkIn');
  const checkOut = document.getElementById('checkOut');
  const today = new Date().toISOString().split('T')[0];
  
  if (checkIn) {
    checkIn.setAttribute('min', today);
    checkIn.addEventListener('change', function() {
      if (checkOut) checkOut.setAttribute('min', this.value);
    });
  }
}

// ================== MAP INITIALIZATION ==================
function initMap(mapId, lat, lng, popupText) {
  if (typeof L === 'undefined') {
    console.warn('Leaflet not loaded');
    return;
  }
  
  const map = L.map(mapId).setView([lat || 28.6139, lng || 77.2090], 13);
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);
  
  if (lat && lng) {
    L.marker([lat, lng])
      .addTo(map)
      .bindPopup(popupText || 'Location')
      .openPopup();
  }
  
  return map;
}

// ================== CATEGORY FILTER ==================
// document.querySelectorAll('.category-item').forEach(function(item) {
//   item.addEventListener('click', function(e) {
//     e.preventDefault();
//     const category = this.dataset.category;
    
//     document.querySelectorAll('.category-item').forEach(function(i) {
//       i.classList.remove('active');
//     });
//     this.classList.add('active');
    
//     document.querySelectorAll('.listing-card').forEach(function(card) {
//       if (category === 'all' || card.dataset.category === category) {
//         card.style.display = 'block';
//       } else {
//         card.style.display = 'none';
//       }
//     });
//   });
// });

// ================== PAGINATION ==================
function goToPage(page) {
  const url = new URL(window.location.href);
  url.searchParams.set('page', page);
  window.location.href = url.toString();
}

// ================== SORT & FILTER ==================
function applySort() {
  const sort = document.getElementById('sortSelect').value;
  const url = new URL(window.location.href);
  url.searchParams.set('sort', sort);
  window.location.href = url.toString();
}

function applyFilters() {
  const price = document.getElementById('priceFilter').value;
  const guests = document.getElementById('guestsFilter').value;
  const url = new URL(window.location.href);
  
  if (price) {
    url.searchParams.set('price', price);
  } else {
    url.searchParams.delete('price');
  }
  
  if (guests) {
    url.searchParams.set('guests', guests);
  } else {
    url.searchParams.delete('guests');
  }
  
  window.location.href = url.toString();
}

// ================== STAR RATING ==================
function initStarRating(containerId, inputId) {
  const container = document.getElementById(containerId);
  const input = document.getElementById(inputId);
  
  if (!container || !input) return;
  
  const stars = container.querySelectorAll('.star');
  stars.forEach(function(star, index) {
    star.addEventListener('click', function() {
      input.value = index + 1;
      stars.forEach(function(s, i) {
        s.style.color = i <= index ? '#ff385c' : '#ddd';
      });
    });
    
    star.addEventListener('mouseenter', function() {
      stars.forEach(function(s, i) {
        s.style.color = i <= index ? '#ff6b8a' : '#ddd';
      });
    });
    
    star.addEventListener('mouseleave', function() {
      const currentRating = parseInt(input.value) || 0;
      stars.forEach(function(s, i) {
        s.style.color = i < currentRating ? '#ff385c' : '#ddd';
      });
    });
  });
}

// ================== LOADING STATES ==================
function showLoading(button) {
  const originalText = button.innerText;
  button.innerText = 'Loading...';
  button.disabled = true;
  return function() {
    button.innerText = originalText;
    button.disabled = false;
  };
}

// ================== COPY TO CLIPBOARD ==================
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    return false;
  }
}

// ================== TOAST NOTIFICATIONS ==================
// ================== TOAST NOTIFICATIONS ==================
function showToast(message, type) {
  // Remove any existing toast
  const existingToast = document.querySelector('.toast-notification');
  if (existingToast) existingToast.remove();
  
  // Create toast element
  const toast = document.createElement('div');
  toast.className = 'toast-notification toast-' + (type || 'success');
  
  const icons = {
    success: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>',
    error: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>'
  };
  
  toast.innerHTML = `
    <div class="toast-icon">
      ${icons[type] || icons.info}
    </div>
    <span class="toast-message">${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>
    </button>
  `;
  
  // Add to document
  document.body.appendChild(toast);
  
  // Animate in
  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  }, 10);
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ================== WISHLIST TOGGLE ==================
// ================== WISHLIST TOGGLE ==================
async function toggleWishlist(listingId) {
  try {
    const response = await fetch('/wishlists/add/' + listingId, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    // Check if redirected to login (not authenticated)
    if (response.redirected || response.url.includes('/users/login')) {
      // Store the flash message in session storage
      sessionStorage.setItem('loginMessage', 'Please sign in or sign up to add to wishlist');
      window.location.href = '/users/login';
      return;
    }
    
    const result = await response.json();
    
    if (result.success) {
      const heart = document.querySelector('.listing-favorite[data-listing-id="' + listingId + '"]');
      if (heart) {
        if (result.action === 'added') {
          heart.classList.add('active');
          showToast('Added to wishlist!', 'success');
        } else {
          heart.classList.remove('active');
          showToast('Removed from wishlist', 'info');
        }
      }
    } else if (result.redirect) {
      window.location.href = result.redirect;
    } else {
      showToast('Failed to update wishlist', 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    // Likely a redirect or authentication issue
    sessionStorage.setItem('loginMessage', 'Please sign in or sign up to continue');
    window.location.href = '/users/login';
  }
}
// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
  initDatePickers();
});

// Add CSS animation for toast
const style = document.createElement('style');
style.textContent = '@keyframes slideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }';
document.head.appendChild(style);

