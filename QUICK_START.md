# Quick Start Guide - Cellphone Store Website

## 🚀 Getting Started (5 minutes)

### Step 1: Ensure Files are in Place
The project should be in: `C:\xampp\htdocs\webPro\`

You should see these folders and files:
- `admin/` - Admin panel pages
- `includes/` - Database connection and utilities
- `css/` - Styling files
- `js/` - JavaScript files
- `uploads/` - Product images folder
- `index.php` - Main store page
- `cart.php` - Shopping cart page
- `setup.php` - Database setup helper
- `database.sql` - Database schema
- `README.md` - Full documentation

### Step 2: Start XAMPP
1. Open XAMPP Control Panel
2. Click "Start" for Apache
3. Click "Start" for MySQL

### Step 3: Setup Database
**Option A: Using the Web Setup (Easiest)**
1. Go to: `http://localhost/webPro/setup.php`
2. Click "Create Database & Tables"
3. Done! The database is created automatically

**Option B: Using PhpMyAdmin**
1. Go to: `http://localhost/phpmyadmin`
2. Click the "SQL" tab
3. Open `database.sql` file (copy-paste its contents)
4. Click Execute

**Option C: Using Command Line**
```bash
mysql -u root < C:\xampp\htdocs\webPro\database.sql
```

### Step 4: Access the Application

**🏪 Customer Store:**
```
http://localhost/webPro/
```
- Browse cellphones by brand
- Add to cart without login
- Checkout with your details

**👨‍💼 Admin Panel:**
```
http://localhost/webPro/admin/
```
- Username: `admin` | Password: `admin123` (Admin)
- Username: `staff1` | Password: `staff123` (Staff)

## 📋 What You Can Do

### As a Customer
✅ Browse all cellphones by brand
✅ View product details (name, model, price, stock)
✅ Add products to shopping cart
✅ View and edit cart
✅ Checkout and place order
✅ No login required!

### As Admin
✅ View dashboard with sales stats
✅ Add, edit, delete products
✅ Manage brands
✅ Manage staff members
✅ View and process customer orders
✅ Update order status

## 🎯 Quick Test

1. **Test Store:**
   - Go to home page
   - Select a brand from dropdown
   - Click "Add to Cart"
   - Check cart count updates
   - View cart and procee checkout

2. **Test Admin:**
   - Go to admin login
   - Use demo credentials
   - Add a new product
   - Check it appears in store
   - View orders from test

3. **Test Order:**
   - Add product to cart
   - Fill in checkout form
   - Place order
   - Check admin panel → Orders

## 🔧 Troubleshooting

**Cannot access website:**
- Is Apache running? (Check XAMPP)
- Is MySQL running? (Check XAMPP)
- URL correct? `http://localhost/webPro/`

**Database error:**
- Run setup.php again
- Check XAMPP MySQL is running
- Verify you can access PhpMyAdmin

**Products not showing:**
- Check database was imported correctly
- Go to setup.php to verify
- Check that products table has sample data

**Login not working:**
- Use correct credentials: admin/admin123
- Check database was created
- Clear browser cache and try again

## 📝 Default Sample Data

The database includes:

**6 Brands:**
- Apple, Samsung, Xiaomi, OnePlus, Realme, OPPO

**10 Sample Products:**
- iPhone 15 Pro - $999.99
- Samsung Galaxy S24 Ultra - $1,199.99
- Xiaomi 14 Ultra - $699.99
- OnePlus 12 - $799.99
- Realme 12 Pro+ - $349.99
- OPPO Find X7 - $899.99
- And more...

**2 Admin Users:**
- admin / admin123 (Full access)
- staff1 / staff123 (Limited access)

## 🌐 Accessing from Other Computers

To access from another computer on the same network:

1. Find your computer's IP address
   - Open Command Prompt
   - Type: `ipconfig`
   - Look for "IPv4 Address" (like 192.168.1.x)

2. Access from other computer:
   ```
   http://YOUR_IP_ADDRESS/webPro/
   ```

Example: `http://192.168.1.105/webPro/`

Note: Other computer must have access to port 80 (might need firewall configuration)

## 💡 Tips

- Use browser's Developer Tools (F12) to check for any JavaScript errors
- Check XAMPP Apache error log if pages show blank
- All sample data can be changed in the admin panel
- Products can be added/edited/deleted by admin
- Staff can view and process orders

## 📚 More Help

For detailed documentation, see `README.md` in the project folder.

## ✨ Next Steps

- Customize brand names and descriptions
- Add more products
- Modify colors in `css/style.css`
- Test all features
- Prepare for production (see security notes in README)

---

Happy selling! 🎉
