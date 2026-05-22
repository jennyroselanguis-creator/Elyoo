// Add to cart with quantity
function addToCart(productId, maxStock) {
    const quantityInput = document.querySelector(`input[name="quantity"]`);
    const quantity = parseInt(quantityInput.value);
    
    if (quantity > 0 && quantity <= maxStock) {
        document.querySelector(`form`).submit();
    } else {
        alert('Please enter a valid quantity!');
    }
}

// Update quantity in cart
function updateQuantity(productId, maxStock) {
    const input = document.querySelector(`input[value="${productId}"]`);
    console.log('Quantity input found');
}

// Remove from cart confirmation
function removeFromCart(productId) {
    if (confirm('Are you sure you want to remove this item?')) {
        window.location.href = `cart.php?remove=${productId}`;
    }
}

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}
