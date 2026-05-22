# Quick Reference Guide - Elyoo React App

## 🎯 Common Tasks

### Running the App

```bash
npm start          # Development server
npm build          # Production build
npm test           # Run tests
```

### Adding New Components

1. Create file in `src/components/YourComponent.jsx`
2. Export as default
3. Import in needed pages

Example:

```jsx
// src/components/YourComponent.jsx
export default function YourComponent() {
  return <div>Your Component</div>;
}

// In a page
import YourComponent from "../components/YourComponent";
```

### Adding New Pages

1. Create file in `src/pages/YourPage.jsx`
2. Add route in `src/App.jsx`

Example:

```jsx
// In App.jsx Routes
<Route path="/your-page" element={<YourPage />} />
```

### Using State Management (Zustand)

```jsx
import { useStore } from "../store/store";

function MyComponent() {
  const { cart, addToCart } = useStore();

  return <button onClick={() => addToCart(product, 1)}>Add to Cart</button>;
}
```

### Making API Calls

```jsx
import { productAPI } from "../api/client";

// In a component or hook
const fetchProducts = async () => {
  try {
    const response = await productAPI.getAll();
    console.log(response.data);
  } catch (error) {
    console.error("Error:", error);
  }
};
```

### Using Custom Hooks

```jsx
import { useCart } from "../hooks/useCart";

function MyComponent() {
  const { cart, cartTotal, addToCart } = useCart();

  return <div>Cart Total: ${cartTotal}</div>;
}
```

### Adding Notifications

```jsx
import toast from "react-hot-toast";

// Success
toast.success("Product added to cart!");

// Error
toast.error("Something went wrong!");

// Info
toast.loading("Loading...");
```

### Styling Components

- Use CSS files in `src/styles/`
- Import in components: `import '../styles/component.css';`
- Use CSS variables: `color: var(--primary-color);`

### Available CSS Variables

```css
/* Colors */
--primary-color: #00d9ff --primary-dark: #0099cc --danger-color: #ef4444
  --success-color: #10b981 --dark-text: #e2e8f0 --gray-600: #cbd5e1;
```

## 📦 Component Structure

### Recommended Component Layout

```jsx
import React, { useState } from "react";
import { useStore } from "../store/store";
import toast from "react-hot-toast";
import "../styles/component.css";

export default function MyComponent() {
  const [state, setState] = useState("");
  const { storeData } = useStore();

  return <div className="component">{/* JSX here */}</div>;
}
```

## 🔐 Admin Authentication

### Login Flow

1. User navigates to `/login`
2. Enters email and password
3. API returns token
4. Token stored in localStorage
5. Redirect to `/admin` on success

### Protecting Routes

```jsx
import { useStore } from "../store/store";

function AdminPage() {
  const { isAdmin } = useStore();

  if (!isAdmin) {
    return <div>Access Denied</div>;
  }

  return <div>Admin Content</div>;
}
```

## 🎨 Styling Tips

### Hover Effects

```css
.component:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 217, 255, 0.3);
}
```

### Animations

```css
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.component {
  animation: slideIn 0.3s ease;
}
```

### Responsive Design

```css
@media (max-width: 768px) {
  .component {
    /* Mobile styles */
  }
}
```

## 🐛 Debugging

### Browser DevTools

- F12 or Ctrl+Shift+I to open
- Console tab for errors
- Network tab for API calls
- Application tab for localStorage

### React DevTools

- Install React DevTools browser extension
- Inspect components and props
- Check state in Zustand

### Useful Console Commands

```javascript
// Check localStorage
localStorage.getItem("authToken");

// Clear cart
localStorage.removeItem("cart");

// Check store state
console.log(useStore.getState());
```

## 📋 File Naming Conventions

- **Components**: PascalCase (MyComponent.jsx)
- **Pages**: PascalCase (HomePage.jsx)
- **Hooks**: camelCase (useCart.js)
- **CSS**: kebab-case (product-card.css)
- **API methods**: camelCase (productAPI.getAll())

## 🚀 Performance Tips

1. Use React.memo for expensive components
2. Lazy load images
3. Split code with React.lazy()
4. Use useCallback for event handlers
5. Avoid inline functions in render
6. Use CSS animations over JS

## 📝 Commit Message Convention

```
[type]: Brief description

feat: Add new feature
fix: Bug fix
docs: Documentation update
style: CSS/styling changes
refactor: Code refactoring
perf: Performance improvement
test: Test additions
```

Example:

```
feat: Add product filtering by brand
fix: Cart total calculation bug
docs: Update README
```

## 🔗 Useful Links

- [React Docs](https://react.dev)
- [React Router Docs](https://reactrouter.com)
- [Zustand Docs](https://github.com/pmndrs/zustand)
- [Axios Docs](https://axios-http.com)
- [MDN Web Docs](https://developer.mozilla.org)

## 💡 Pro Tips

1. **Always use functional components** - Class components are outdated
2. **Keep components small** - Max 200-300 lines
3. **Use hooks** - useState, useEffect, useCallback
4. **Avoid prop drilling** - Use Zustand for global state
5. **Test as you build** - Don't leave it for the end
6. **Document your code** - Add comments for complex logic
7. **Follow conventions** - Consistent code style
8. **Use TypeScript** - When project grows (future enhancement)

---

**Happy Coding! 🚀**
