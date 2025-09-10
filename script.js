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
    alert('Your cart is empty!');
    return;
  }
  
  const total = cart.reduce((sum, item) => sum + item.total, 0);
  let message = `Hello! I'd like to order:\n\n`;
  
  cart.forEach(item => {
    message += `${item.name} - ${item.quantity} pc${item.quantity > 1 ? 's' : ''} - ₹${item.total}\n`;
  });
  
  message += `\nTotal: ₹${total}`;
  
  const whatsappUrl = `https://wa.me/917972019884?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
}
