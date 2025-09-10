document.addEventListener("DOMContentLoaded", function() {
  console.log("1diaper site loaded successfully.");
});

// Cart functionality
let cart = [];

function updatePrice(selectElement) {
  const selectedOption = selectElement.options[selectElement.selectedIndex];
  const price = selectedOption.getAttribute('data-price');
  const priceElement = selectElement.closest('.product').querySelector('.price');
  priceElement.textContent = `₹${price}`;
}

function addToCart(productName, buttonElement) {
  const productDiv = buttonElement.closest('.product');
  const selectElement = productDiv.querySelector('select');
  const selectedOption = selectElement.options[selectElement.selectedIndex];
  const quantity = parseInt(selectedOption.value);
  const price = parseInt(selectedOption.getAttribute('data-price'));
  
  const cartItem = {
    name: productName,
    quantity: quantity,
    price: price,
    total: price
  };
  
  // Check if item already exists in cart
  const existingItemIndex = cart.findIndex(item => 
    item.name === productName && item.quantity === quantity
  );
  
  if (existingItemIndex > -1) {
    cart[existingItemIndex].total += price;
  } else {
    cart.push(cartItem);
  }
  
  updateCartDisplay();
  updateCartCount();
  
  // Show success message
  buttonElement.textContent = 'Added!';
  buttonElement.style.backgroundColor = '#4CAF50';
  setTimeout(() => {
    buttonElement.textContent = 'Add to Cart';
    buttonElement.style.backgroundColor = '';
  }, 1500);
}

function updateCartDisplay() {
  const cartItemsContainer = document.getElementById('cartItems');
  
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
    document.getElementById('cartTotal').textContent = '0';
    return;
  }
  
  let cartHTML = '';
  let total = 0;
  
  cart.forEach((item, index) => {
    total += item.total;
    cartHTML += `
      <div class="cart-item">
        <div class="item-details">
          <h4>${item.name}</h4>
          <p>${item.quantity} pc${item.quantity > 1 ? 's' : ''} - ₹${item.price} each</p>
        </div>
        <div class="item-total">₹${item.total}</div>
        <button class="remove-item" onclick="removeFromCart(${index})">×</button>
      </div>
    `;
  });
  
  cartItemsContainer.innerHTML = cartHTML;
  document.getElementById('cartTotal').textContent = total;
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCartDisplay();
  updateCartCount();
}

function updateCartCount() {
  const totalItems = cart.reduce((sum, item) => sum + (item.quantity === 1 ? 1 : 1), 0);
  document.getElementById('cartCount').textContent = totalItems;
}

function toggleCart() {
  const cartSidebar = document.getElementById('cartSidebar');
  const cartOverlay = document.getElementById('cartOverlay');
  
  cartSidebar.classList.toggle('open');
  cartOverlay.classList.toggle('open');
}

function checkout() {
  if (cart.length === 0) {
    showAlert('Your cart is empty!', 'error');
    return;
  }
  
  // Show address collection modal
  showAddressModal();
}

function showAddressModal() {
  // Create modal HTML
  const modalHTML = `
    <div class="address-modal-overlay" id="addressModalOverlay">
      <div class="address-modal">
        <div class="modal-header">
          <h3>Delivery Address</h3>
          <button class="close-modal" onclick="closeAddressModal()">&times;</button>
        </div>
        <div class="modal-body">
          <form id="addressForm">
            <div class="form-group">
              <label for="customerName">Full Name *</label>
              <input type="text" id="customerName" required placeholder="Enter your full name">
            </div>
            <div class="form-group">
              <label for="customerPhone">Phone Number *</label>
              <input type="tel" id="customerPhone" required placeholder="Enter your phone number">
            </div>
            <div class="form-group">
              <label for="customerAddress">Complete Address *</label>
              <textarea id="customerAddress" required placeholder="House/Flat No., Street, Area, Landmark" rows="3"></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="customerCity">City *</label>
                <input type="text" id="customerCity" required placeholder="City">
              </div>
              <div class="form-group">
                <label for="customerPincode">Pincode *</label>
                <input type="text" id="customerPincode" required placeholder="Pincode" maxlength="6">
              </div>
            </div>
            <div class="form-group">
              <label for="customerState">State *</label>
              <input type="text" id="customerState" required placeholder="State">
            </div>
            <div class="form-group">
              <label for="specialInstructions">Special Instructions (Optional)</label>
              <textarea id="specialInstructions" placeholder="Any special delivery instructions" rows="2"></textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" onclick="closeAddressModal()">Cancel</button>
          <button class="btn-primary" onclick="processCheckout()">Proceed</button>
        </div>
      </div>
    </div>
  `;
  
  // Add modal to body
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Show modal with animation
  setTimeout(() => {
    document.getElementById('addressModalOverlay').classList.add('show');
  }, 10);
}

function closeAddressModal() {
  const modal = document.getElementById('addressModalOverlay');
  if (modal) {
    modal.classList.remove('show');
    setTimeout(() => {
      modal.remove();
    }, 300);
  }
}

function processCheckout() {
  // Validate form
  const form = document.getElementById('addressForm');
  const formData = new FormData(form);
  
  const customerName = document.getElementById('customerName').value.trim();
  const customerPhone = document.getElementById('customerPhone').value.trim();
  const customerAddress = document.getElementById('customerAddress').value.trim();
  const customerCity = document.getElementById('customerCity').value.trim();
  const customerPincode = document.getElementById('customerPincode').value.trim();
  const customerState = document.getElementById('customerState').value.trim();
  const specialInstructions = document.getElementById('specialInstructions').value.trim();
  
  // Validation
  if (!customerName || !customerPhone || !customerAddress || !customerCity || !customerPincode || !customerState) {
    showAlert('Please fill in all required fields!', 'error');
    return;
  }
  
  if (customerPhone.length < 10) {
    showAlert('Please enter a valid phone number!', 'error');
    return;
  }
  
  if (customerPincode.length !== 6) {
    showAlert('Please enter a valid 6-digit pincode!', 'error');
    return;
  }
  
  // Generate order summary
  const orderDate = new Date().toLocaleDateString('en-IN');
  const orderTime = new Date().toLocaleTimeString('en-IN');
  const orderId = 'ORD' + Date.now().toString().slice(-6);
  
  let total = 0;
  let itemsText = '';
  
  cart.forEach((item, index) => {
    total += item.total;
    itemsText += `${index + 1}. ${item.name}\n   Quantity: ${item.quantity} pc${item.quantity > 1 ? 's' : ''}\n   Rate: ₹${item.price} each\n   Amount: ₹${item.total}\n\n`;
  });
  
  // Create detailed WhatsApp message
  let message = `🛒 *NEW ORDER FROM 1DIAPER*\n\n`;
  message += `📋 *Order Details:*\n`;
  message += `Order ID: ${orderId}\n`;
  message += `Date: ${orderDate}\n`;
  message += `Time: ${orderTime}\n\n`;
  
  message += `👤 *Customer Information:*\n`;
  message += `Name: ${customerName}\n`;
  message += `Phone: ${customerPhone}\n\n`;
  
  message += `📦 *Items Ordered:*\n`;
  message += `${itemsText}`;
  
  message += `💰 *Billing Summary:*\n`;
  message += `Subtotal: ₹${total}\n`;
  message += `Delivery: Free\n`;
  message += `*Total Amount: ₹${total}*\n\n`;
  
  message += `🏠 *Delivery Address:*\n`;
  message += `${customerAddress}\n`;
  message += `${customerCity}, ${customerState} - ${customerPincode}\n\n`;
  
  if (specialInstructions) {
    message += `📝 *Special Instructions:*\n${specialInstructions}\n\n`;
  }
  
  message += `Please confirm this order and let me know the expected delivery time. Thank you!`;
  
  // Close modal
  closeAddressModal();
  
  // Show success message
  showAlert('Redirecting to WhatsApp...', 'success');
  
  // Redirect to WhatsApp after a short delay
  setTimeout(() => {
    const whatsappUrl = `https://wa.me/917972019884?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    // Clear cart after successful order
    cart = [];
    updateCartDisplay();
    updateCartCount();
    toggleCart(); // Close cart
  }, 1500);
}

function showAlert(message, type = 'info') {
  // Remove existing alerts
  const existingAlert = document.querySelector('.custom-alert');
  if (existingAlert) {
    existingAlert.remove();
  }
  
  const alertHTML = `
    <div class="custom-alert ${type}">
      <div class="alert-content">
        <span class="alert-icon">${type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ'}</span>
        <span class="alert-message">${message}</span>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', alertHTML);
  
  const alert = document.querySelector('.custom-alert');
  setTimeout(() => alert.classList.add('show'), 10);
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    if (alert) {
      alert.classList.remove('show');
      setTimeout(() => alert.remove(), 300);
    }
  }, 3000);
}
