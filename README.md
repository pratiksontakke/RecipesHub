
# 🍽️ Yummy Page – Collaborative Recipe Sharing SaaS

A modern, full-stack SaaS project where users can **create, share, and collaborate** on recipes with real-time syncing, secure access control, and clean UI – built with **Supabase**, **React**, and **AWS**.

---

## 🚀 Live Demo

🔗 [https://showcasehq.xyz](https://showcasehq.xyz)  

---

## 🎯 Demo Users for Testing

**User 1 (Recipe Owner):**
- Email: `pratikass488@gmail.com`
- Password: `pratik@123`

**User 2 (Collaborator):**
- Email: `pratikdevcloud@gmail.com`
- Password: `pratik@123`

---

## 🧠 Complete Features Overview

### 🔐 **Authentication System**
- ✅ **Sign Up** with email/password
- ✅ **Sign In** with secure authentication
- ✅ **Forgot Password** with email reset link
- ✅ **Email Confirmation** for new accounts
- ✅ **Password Reset** via secure email link
- ✅ **Auto-redirect** to dashboard after login

### 👤 **User Profile & Dashboard**
- ✅ **Personal Dashboard** with recipe overview
- ✅ **Profile Management** (name, email, avatar upload)
- ✅ **My Recipes** section showing owned recipes
- ✅ **Collaborated Recipes** section showing shared recipes
- ✅ **Activity Stats** (total recipes, collaborations)
- ✅ **Settings** page for account management

### 📖 **Recipe Management**
- ✅ **Create New Recipes** (title, description, ingredients, steps)
- ✅ **Edit Recipes** with full form validation
- ✅ **Delete Recipes** (owner only)
- ✅ **Image Upload** for recipe featured images
- ✅ **Recipe Categories** and difficulty levels
- ✅ **Public/Private** recipe visibility
- ✅ **Cooking Timer** for recipe steps
- ✅ **Progress Tracking** while cooking
- ✅ **Celebration Animation** when recipe is complete

### 🤝 **Collaboration System** (Main Feature)
- ✅ **Invite Collaborators** by email
- ✅ **Role-based Access** (Editor/Viewer permissions)
- ✅ **Real-time Sync** of collaboration changes
- ✅ **Invitation Management** (Accept/Decline invitations)
- ✅ **Collaboration Status Tracking**
- ✅ **Original Creator Attribution**

---

## 🎯 **Collaboration Feature Flow** (Step-by-Step)

### **Step 1: Recipe Owner Creates Recipe**
1. **User 1** (`pratikass488@gmail.com`) logs in
2. Goes to **Dashboard** → **"Create New Recipe"**
3. Creates a recipe (e.g., "Pasta Carbonara")
4. Recipe is saved and visible in **"My Recipes"** section

### **Step 2: Owner Invites Collaborator**
1. **User 1** opens the recipe → scrolls to **"Collaboration"** section
2. Enters **User 2's email** (`pratikdevcloud@gmail.com`)
3. Selects **Role**: "Editor" or "Viewer"
4. Clicks **"Invite"** button
5. System sends invitation (status: "Pending")

### **Step 3: Collaborator Receives Invitation**
1. **User 2** (`pratikdevcloud@gmail.com`) logs in
2. Goes to **Dashboard** → **"Collaborated"** tab
3. Sees the pending invitation with **Accept/Decline** buttons
4. Clicks **"Accept"** to join as collaborator

### **Step 4: Collaboration in Action**
1. **Both users** can now see the recipe in their dashboards:
   - **User 1**: Recipe appears in "My Recipes" (as owner)
   - **User 2**: Recipe appears in "Collaborated" (as editor/viewer)

2. **Editor Access** (if User 2 has editor role):
   - Can **edit** recipe details, ingredients, and steps
   - Can see **"Edit"** button on recipe page
   - Changes are **instantly synced** for both users

3. **Viewer Access** (if User 2 has viewer role):
   - Can **view** recipe but cannot edit
   - Only sees **"View"** button on recipe page

### **Step 5: Real-time Sync & Management**
1. **Manual Sync**: Both users can click **"Sync"** button to refresh collaboration data
2. **Role Management**: Owner can change collaborator roles (Editor ↔ Viewer)
3. **Remove Collaborators**: Owner can remove collaborators anytime
4. **Original Creator Credit**: Recipe always shows original creator's name

---

## 🎨 **User Interface Features**

### **Homepage**
- 🏠 Hero section with call-to-action
- 📱 Featured recipes showcase
- 👨‍🍳 Top creators section
- 🔥 Trending categories

### **Dashboard Layout**
- 📊 **Left Sidebar**: User profile and activity stats
- 📋 **Main Area**: Tabbed interface (My Recipes | Collaborated | Settings)
- 🎯 **Visual Indicators**: Role badges, status indicators, collaboration icons

### **Recipe Detail Page**
- 🖼️ Featured image display
- ⏱️ Cooking timers and progress tracking
- 📝 Interactive ingredient list with scaling
- ✅ Step-by-step instructions with checkboxes
- 🤝 Collaboration section (for authenticated users)
- 👑 Original creator attribution

---

## 🛠 **Technical Stack**

### **Frontend:**
- ⚛️ React + TypeScript + Vite
- 🎨 TailwindCSS + Shadcn/UI components
- 🧭 React Router for navigation
- 🔄 TanStack Query for data fetching

### **Backend & Database:**
- 🗄️ Supabase (PostgreSQL + Auth + Storage)
- 🔒 Row Level Security (RLS) policies
- 📧 Email authentication & password reset
- 🔄 Real-time collaboration sync

---

## 🚀 **Quick Start Guide**

### **For Recipe Owners:**
1. Sign up/Login → Create recipes → Invite collaborators by email

### **For Collaborators:**
1. Sign up/Login → Check "Collaborated" tab → Accept invitations → Start collaborating

### **Testing Collaboration:**
1. Login as **User 1** → Create a recipe → Invite **User 2**
2. Login as **User 2** → Accept invitation → Edit recipe (if editor)
3. Switch between users to see **real-time sync** in action

---

## 🔧 **Key Collaboration Benefits**

- 👥 **Multiple Editors**: Teams can co-create recipes
- 🔄 **Real-time Sync**: Changes appear instantly for all collaborators
- 🔒 **Secure Access**: Role-based permissions (Owner > Editor > Viewer)
- 📧 **Email Invitations**: Easy onboarding for new collaborators
- 👑 **Creator Attribution**: Original recipe creator always credited
- 🎯 **Status Tracking**: Clear visibility of collaboration status

---

**Built with ❤️ for collaborative cooking experiences**
