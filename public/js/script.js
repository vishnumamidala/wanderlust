// Bootstrap form validation
(() => {
  'use strict';

  // Fetch all forms with Bootstrap validation class
  const forms = document.querySelectorAll('.needs-validation');

  // Loop and add validation listeners
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }

      form.classList.add('was-validated');
    }, false);
  });
})();

// Star rating functionality
const stars = document.querySelectorAll('.star');
const ratingValue = document.getElementById('rating-value');
const ratingError = document.getElementById('rating-error');

stars.forEach(star => {
  star.addEventListener('click', () => {
    const value = star.dataset.value;
    ratingValue.value = value;
    ratingError.style.display = 'none';

    stars.forEach(s => {
      if (s.dataset.value <= value) {
        s.classList.add('filled');
      } else {
        s.classList.remove('filled');
      }
    });
  });
});

// Flash message auto-dismiss
const flashMessages = document.querySelectorAll('.flash-message');
flashMessages.forEach(message => {
  setTimeout(() => {
    message.classList.add('fade-out');
    setTimeout(() => {
      message.style.display = 'none';
    }, 300);
  }, 3000);
});

// AIRBNB GALLERY NAVIGATION
let currentImageIndex = 0;
const allImages = [];

function initGallery() {
  const mainImage = document.getElementById('mainImage');
  const thumbnails = document.querySelectorAll('.thumbnail img');
  
  if (mainImage) {
    allImages.push(mainImage.src);
  }
  
  thumbnails.forEach(thumb => {
    allImages.push(thumb.src);
  });
}

function setMainImage(imageSrc, index) {
  const mainImage = document.getElementById('mainImage');
  if (mainImage) {
    mainImage.src = imageSrc;
    currentImageIndex = index;
  }
}

function changeImage(direction) {
  if (allImages.length === 0) return;
  
  currentImageIndex += direction;
  
  if (currentImageIndex < 0) {
    currentImageIndex = allImages.length - 1;
  } else if (currentImageIndex >= allImages.length) {
    currentImageIndex = 0;
  }
  
  const mainImage = document.getElementById('mainImage');
  if (mainImage) {
    mainImage.src = allImages[currentImageIndex];
  }
}

// Initialize gallery on page load
document.addEventListener('DOMContentLoaded', initGallery);

// TAX TOGGLE FUNCTIONALITY
document.addEventListener('DOMContentLoaded', function() {
  const taxToggle = document.getElementById('tax-toggle');
  if (taxToggle) {
    taxToggle.addEventListener('change', function() {
      updatePrices();
    });
  }
});

function updatePrices() {
  const taxToggle = document.getElementById('tax-toggle');
  const isTaxIncluded = taxToggle.checked;
  const priceElements = document.querySelectorAll('.card-text strong');

  priceElements.forEach(element => {
    const basePriceText = element.textContent.replace('₹', '').replace(',', '').trim();
    const basePrice = parseFloat(basePriceText);

    if (!isNaN(basePrice)) {
      let displayPrice;
      if (isTaxIncluded) {
        // Add 18% GST
        displayPrice = basePrice * 1.18;
      } else {
        displayPrice = basePrice;
      }

      // Format as Indian Rupee
      element.textContent = '₹' + displayPrice.toLocaleString('en-IN');
    }
  });
}

// CATEGORY FILTER FUNCTIONALITY
document.addEventListener('DOMContentLoaded', function() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.col');

  filterButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Remove active class from all buttons
      filterButtons.forEach(btn => btn.classList.remove('active'));
      // Add active class to clicked button
      this.classList.add('active');

      const category = this.dataset.category;

      cards.forEach(card => {
        if (category === 'all') {
          card.style.display = 'block';
        } else {
          // For demo purposes, show all cards since we don't have category data
          // In real implementation, you'd check card data-category attribute
          card.style.display = 'block';
        }
      });
    });
  });
});

