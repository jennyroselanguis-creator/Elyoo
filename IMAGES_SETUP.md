# Product Images Setup Guide

## 📱 iPhone Images Setup

I've created a local image storage structure for your products. Here's how to add your iPhone images:

### Step 1: Copy iPhone Images
1. Navigate to: `c:\Users\Admin\Downloads\`
2. Copy all your iPhone product images (the ones you showed me)
3. Paste them into: `c:\xampp\htdocs\webPro\images\iphone\`

### Step 2: Rename Images Properly
Name your iPhone images exactly as follows:
- `iphone-15-pro-max.png` (iPhone 15 Pro Max)
- `iphone-15-pro.png` (iPhone 15 Pro)
- `iphone-15.png` (iPhone 15)
- `iphone-15-plus.png` (iPhone 15 Plus)
- `iphone-14.png` (iPhone 14)
- `iphone-14-pro.png` (iPhone 14 Pro)
- `iphone-se.png` (iPhone SE)
- `iphone-13.png` (iPhone 13)

### Step 3: Reset Database
1. Visit: [http://localhost/webPro/setup.php](http://localhost/webPro/setup.php)
2. Click **"Reset & Reload Database"** button
3. Confirm the reset

### Step 4: View Results
Visit your homepage: [http://localhost/webPro](http://localhost/webPro)

Your iPhone products will now display the local images instead of URLs!

## 📂 Folder Structure
```
c:\xampp\htdocs\webPro\images\
├── iphone\          ← Your iPhone images go here
├── samsung\         ← Samsung images (future)
├── xiaomi\          ← Xiaomi images (future)
├── oneplus\         ← OnePlus images (future)
├── realme\          ← Realme images (future)
└── oppo\            ← OPPO images (future)
```

## 💡 Tips
- All images should be PNG or JPG format
- For best results, use square (1:1) or portrait (3:4) aspect ratio images
- Image size: Recommended 500x700 pixels or larger
- The website will automatically scale and center the images

## 🔄 Adding Images to Other Brands
To add images to Samsung, Xiaomi, OnePlus, Realme, or OPPO products:
1. Copy images to the respective brand folder
2. Update the database image paths in `database.sql`
3. Reset the database
4. Images will display automatically

Need help? Check the product database in `database.sql` for current image paths.
