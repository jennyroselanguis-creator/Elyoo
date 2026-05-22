# Cellphone Store Website

A complete web application for managing and selling cellphones online. This project includes a customer-facing storefront and an admin panel for managing products, inventory, orders, and staff.

## Features

### Customer Features
- Browse cellphones by brand
- View detailed product information with pricing
- Add products to shopping cart
- Place orders without requiring login
- Filter products by brand category
- View shopping cart and manage quantities

### Admin Features
- **Secure Login System**: Admin and staff authentication
- **Product Management**: Add, edit, delete cellphones with pricing and stock management
- **Brand Management**: Create and manage cellphone brands
- **Staff Management**: Add and manage staff members (Admin only)
- **Order Management**: View and process customer orders
- **Dashboard**: Overview of sales statistics and recent orders

## Tech Stack
- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: PHP (7.4+)
- **Database**: MySQL / MariaDB
- **Server**: Apache (via XAMPP)

## Installation & Setup

### 1. Place Files in XAMPP
Copy the entire project folder to `C:\xampp\htdocs\webPro\`

### 2. Create Database
1. Open MySQL/PhpMyAdmin
2. Go to `http://localhost/phpmyadmin`
3. Copy and paste the contents of `database.sql` into the SQL query window
4. Click Execute

OR use command line:
```bash
mysql -u root < database.sql
```

### 3. Update Database Connection (if needed)
Edit `includes/db.php` to match your MySQL credentials:
```php
$host = 'localhost';
$username = 'root';
$password = '';
$database = 'cellphone_store';
```

### 4. Access the Application

**Customer Store:**
```
http://localhost/webPro/
```

**Admin Panel:**
```
http://localhost/webPro/admin/
```

## Default Credentials

### Admin Login
- Username: `admin`
- Password: `admin123`
- Role: Admin (can manage all features including staff)

### Staff Login
- Username: `staff1`
- Password: `staff123`
- Role: Staff (can manage products and view orders)

## Database Schema

### admins (Users/Staff)
- Stores admin and staff user accounts
- Fields: id, username, password, email, role, created_at

### brands
- Cellphone brands
- Fields: id, name, description, created_at

### products
- Cellphones inventory
- Fields: id, brand_id, name, model, description, price, image, stock, created_at, updated_at

### orders
- Customer orders
- Fields: id, customer_name, customer_email, customer_phone, customer_address, total_amount, status, notes, created_at, updated_at

### order_items
- Individual items in orders
- Fields: id, order_id, product_id, quantity, price

## File Structure

```
webPro/
├── index.php              # Main store homepage
├── cart.php               # Shopping cart & checkout
├── css/
│   └── style.css         # Main stylesheet
├── js/                   # JavaScript files (optional)
├── includes/
│   └── db.php            # Database connection
├── admin/
│   ├── index.php         # Admin entry point
│   ├── login.php         # Admin login page
│   ├── dashboard.php     # Admin dashboard
│   ├── products.php      # Product management
│   ├── brands.php        # Brand management
│   ├── staff.php         # Staff management (Admin only)
│   ├── orders.php        # Order management
│   └── logout.php        # Logout handler
├── uploads/              # Product images directory
└── database.sql          # Database schema & sample data
```

## Usage

### For Customers
1. Visit the main store at `http://localhost/webPro/`
2. Browse products by brand using the filter
3. Add products to cart with desired quantity
4. Go to cart and proceed to checkout
5. Enter delivery details and place order
6. Order is saved immediately (no payment processing implemented)

### For Admins
1. Login at `http://localhost/webPro/admin/`
2. **Dashboard**: View statistics and recent orders
3. **Products**: Add new cellphones, edit stock/price, delete products
4. **Brands**: Manage cellphone brands
5. **Staff**: Add/edit/delete staff members (Admin only)
6. **Orders**: View all orders and update their status (Pending → Processing → Completed)

## Security Notes

⚠️ **This is a demo application. For production use:**

1. Implement proper password hashing (bcrypt)
2. Add CSRF tokens to forms
3. Use prepared statements everywhere
4. Implement proper user input validation
5. Add SSL/HTTPS
6. Implement payment gateway integration
7. Add email notifications for order confirmations
8. Implement proper session management
9. Hide critical error messages from users
10. Add rate limiting and DDoS protection

## Customization

### Add More Brands
Edit `database.sql` and add to the brands table before importing, or use the Admin Panel to add new brands.

### Modify Pricing
Edit products through the admin panel - Products page.

### Change Styling
Edit `css/style.css` to modify colors, fonts, and layout.

### Database Name
If you prefer a different database name, edit:
- `database.sql` (first line)
- `includes/db.php` (database variable)

## Troubleshooting

### Cannot connect to database
- Ensure XAMPP is running (Apache + MySQL)
- Check credentials in `includes/db.php`
- Verify database `cellphone_store` exists

### Login not working
- Ensure database is properly imported
- Check that admins table has data
- Verify username and password match exactly

### Products not showing
- Verify products table has data
- Check database connection is working
- Verify brands table is properly populated

## Future Enhancements

- Product image upload
- Payment gateway integration
- Email notifications
- Advanced search and filtering
- Customer reviews and ratings
- Wishlist feature
- Inventory notifications
- Reports and analytics
- Multi-language support
- Mobile app

## Support

For issues or questions, refer to the code comments or contact support.

## License

This project is provided as-is for educational purposes.
