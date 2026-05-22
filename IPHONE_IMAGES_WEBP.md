# iPhone Images Setup - Webp Format

## 📱 Copy Your iPhone Images

### Step 1: Copy Images from Downloads
1. Open your **Downloads** folder: `c:\Users\Admin\Downloads\`
2. Find all your iPhone product images
3. Copy them to: **`c:\xampp\htdocs\webPro\images\iphone\`**

### Step 2: Rename Images to Match Database

The database expects these exact filenames (case-sensitive):

| iPhone Model | Filename to Use |
|---|---|
| iPhone 15 Pro Max | `iphone-15-pro-max.webp` |
| iPhone 15 Pro | `iphone-15-pro.webp` |
| iPhone 15 | `iphone-15.webp` |
| iPhone 15 Plus | `iphone-15-plus.webp` |
| iPhone 14 | `iphone-14.webp` |
| iPhone 14 Pro | `iphone-14-pro.webp` |
| iPhone SE | `iphoneSE.webp` ✓ (already correct) |
| iPhone 13 | `iphone-13.webp` |

### Step 3: Verify Files Are in Place
Your folder structure should look like:
```
c:\xampp\htdocs\webPro\images\iphone\
├── iphone-15-pro-max.webp
├── iphone-15-pro.webp
├── iphone-15.webp
├── iphone-15-plus.webp
├── iphone-14.webp
├── iphone-14-pro.webp
├── iphoneSE.webp
└── iphone-13.webp
```

### Step 4: Reset Database
1. Visit: **[http://localhost/webPro/setup.php](http://localhost/webPro/setup.php)**
2. Click **"Reset & Reload Database"** button
3. Confirm the reset

### Step 5: View Your Store
Visit: **[http://localhost/webPro](http://localhost/webPro)**

Your iPhone products will now display the beautiful images you provided! 🎉

## 💡 Tips
- **WebP Format**: WebP is better than PNG - smaller file size, better quality
- **File Names**: Must match exactly (including hyphens and capitalization)
- **Image Quality**: The images you provided are perfect resolution
- **Backup**: Keep originals in Downloads folder as backup

## ⚠️ Troubleshooting
- **Images not showing?** Check filenames match exactly
- **Wrong images?** Verify you're in the right folder
- **Page looks same?** Clear browser cache (Ctrl+Shift+Del) and refresh

---

Created: 2026-03-29
