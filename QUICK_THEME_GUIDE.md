# 🌓 Quick Theme Toggle Guide

## Where to Find Theme Toggles

### 🏠 User Portal (Main Website)

**Desktop View:**
```
┌─────────────────────────────────────────────────────┐
│ Logo  HOME ABOUT CONTACT  [🌙]  🔍 👤 🛒  ☰        │
└─────────────────────────────────────────────────────┘
                              ↑
                    Theme Toggle Here
```

**Mobile View:**
```
┌──────────────────────────┐
│ Logo            🔍 👤 🛒 ☰│
│                          │
│ [☰ Menu Opened]          │
│                          │
│ 🏠 Home                  │
│ 📖 About                 │
│ 📧 Contact               │
│ ─────────────            │
│ [🌙 Dark Mode]  ← HERE   │
│ ─────────────            │
│ 💼 Buyers Portal         │
│ 🏪 Seller Portal         │
└──────────────────────────┘
```

### 💼 Admin Portal

```
┌─────────────────────────────────────────────┐
│ ♻️ Admin Panel                    [🌙] ←   │
│                                       ↑     │
│                           Fixed top-right   │
└─────────────────────────────────────────────┘
│ 🛍️ Collections  │                          │
│ 📦 Orders       │   Main Content           │
│ 👥 Users        │                          │
└─────────────────┴──────────────────────────┘
```

### 🏪 Seller Portal

```
┌─────────────────────────────────────────────┐
│ ♻️ Seller Dashboard               [🌙] ←   │
│                                       ↑     │
│                           Fixed top-right   │
└─────────────────────────────────────────────┘
│ ➕ Add Items    │                          │
│ 📋 List Items   │   Main Content           │
│ 📦 Orders       │                          │
└─────────────────┴──────────────────────────┘
```

### 🛍️ Buyer Portal

```
┌─────────────────────────────────────────────┐
│ ← Home  ♻️ Buyers Portal  [🔍 Search]  [🌙]│
│                                       ↑     │
│                           Fixed top-right   │
└─────────────────────────────────────────────┘
│ Filters  │  Product Grid                   │
│ 🤍 Wish  │  [Cards] [Cards] [Cards]        │
│ 👕 Cat   │  [Cards] [Cards] [Cards]        │
└──────────┴─────────────────────────────────┘
```

---

## 🎨 Theme Appearance

### ☀️ Light Mode
- Clean white backgrounds
- Dark gray text
- Soft shadows
- Colorful gradients stand out

### 🌙 Dark Mode
- Deep gray/black backgrounds
- Light gray/white text
- Subtle shadows
- Gradients remain vibrant

---

## 🔄 How It Works

1. **Click the theme toggle button** (Sun ☀️ or Moon 🌙 icon)
2. **Theme changes instantly** with smooth transition
3. **Preference is saved** to localStorage
4. **Persists across sessions** - your choice is remembered
5. **Works on all pages** - consistent throughout the site

---

## 💡 Pro Tips

- **First time:** System theme preference is auto-detected
- **Keyboard users:** Tab to the theme button, press Enter/Space
- **Mobile users:** Find it in the hamburger menu (☰)
- **Portal users:** Look for floating button at top-right
- **Reset:** Clear localStorage to return to system default

---

## 🎯 Keyboard Shortcuts

While there's no default keyboard shortcut, you can:
1. Press `Tab` until theme button is focused
2. Press `Enter` or `Space` to toggle

---

## 🐛 Troubleshooting

**Theme not changing?**
- Check if JavaScript is enabled
- Clear browser cache
- Check localStorage is not disabled

**Theme resets on reload?**
- Check browser localStorage permissions
- Ensure cookies/storage not cleared on exit

**Some elements look wrong?**
- Hard refresh with Ctrl+F5 (or Cmd+Shift+R on Mac)
- Check for browser extensions interfering with styles

---

## 📱 Platform Coverage

| Platform | Location | Status |
|----------|----------|--------|
| User Portal (Desktop) | Navbar top-right | ✅ |
| User Portal (Mobile) | Hamburger menu | ✅ |
| Admin Panel | Fixed top-right | ✅ |
| Seller Portal | Fixed top-right | ✅ |
| Buyer Portal | Fixed top-right | ✅ |

---

## 🎨 Color Reference

### Light Mode Colors
- Background: `#ffffff`, `#f9fafb`
- Text: `#374151`, `#111827`
- Borders: `#e5e7eb`, `#d1d5db`

### Dark Mode Colors
- Background: `#030712`, `#111827`
- Text: `#f3f4f6`, `#ffffff`
- Borders: `#374151`, `#1f2937`

### Brand Colors (Both Modes)
- Green: `#00b894` → `#10b981`
- Blue: `#3498db` → `#06b6d4`
- Purple: `#9b59b6` → `#a855f7`

---

**Made with 💚 by the EcoCycleHUB Team**
