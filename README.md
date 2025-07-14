# 📄 ServeNow Product Document

---

## 🟦 Overview: What is ServeNow?

**ServeNow** is a **next-generation full-stack web-based SaaS platform** designed to modernize dine-in restaurant operations using **QR-code-based digital ordering**, **role-based dashboards**, and **real-time order tracking**.

ServeNow replaces outdated manual processes—like physical menus, waiter-based order collection, and disconnected kitchen operations—with a unified, intuitive, and efficient system that enhances both **customer experience** and **restaurant productivity**.

---

## 💡 Why ServeNow Exists

### Traditional Dine-in Problems
- Long wait times for menu access and order collection
- Errors or delays in communication between waiter and kitchen
- Inefficient payment workflows
- Lack of analytics and order tracking
- No scalability across locations

### ServeNow Solves:
- QR-based instant digital menu access
- Customers can self-order and track their food
- Seamless online or offline payments
- E-billing and real-time manager visibility
- Role-specific dashboards for better control and data sync

---

## 🧱 Core Modules

### 1. 👨‍💼 Admin Panel
- Admin adds restaurant with:
  - Restaurant Name
  - Owner Name
  - Phone Number
  - Email
  - Address
  - Cuisine Tags
  - Seating Capacity
- Generates `Manager ID` and `Access Key`
- Shares credentials with restaurant manager
- Tracks all active restaurants

### 2. 🧑‍🍳 Manager Dashboard
- Login with credentials provided by admin
- Access pre-filled restaurant data
- Key features:
  - 🍽️ **Dish Management** (add/edit dishes, price, ingredients, prep time)
  - 🪑 **Table Setup**
  - 📱 **QR Code + Menu Page Generator**
  - 🔄 **Live Order Tracking**
  - ⚙️ **Settings & Configurations**

### 3. 🍴 Customer Panel
- Accessed via QR scan
- Steps:
  1. Browse Menu (sorted, with tags)
  2. Add to Cart
  3. Enter Name, Table Number, Phone
  4. Choose Payment: Pay Now or Later
  5. Track Order Status: Cooking ➝ Serving
  6. Download/Receive E-Bill

---

## 🔄 Workflow

1. **Admin** adds a restaurant and generates credentials.
2. **Manager** logs in, sets up dishes, tables, and payment gateway.
3. **Customer** scans QR, places order, pays, and tracks order.
4. **Manager** receives and updates order status in real-time.

---

## 🌟 What Makes ServeNow Different?

| Feature                    | ServeNow | Traditional | Other QR Apps |
|----------------------------|----------|-------------|----------------|
| QR-Based Live Ordering     | ✅       | ❌          | ⚠️ Limited     |
| Role-Based Access Panels   | ✅       | ❌          | ❌             |
| Real-Time Order Sync       | ✅       | ❌          | ⚠️ Rare         |
| Online + Offline Payments  | ✅       | ⚠️          | ⚠️             |
| Custom Menu Builder        | ✅       | ❌          | ⚠️             |
| E-Billing                  | ✅       | ❌          | ❌             |
| Manager Menu Control       | ✅       | ❌          | ⚠️             |
| Self-Serve Experience      | ✅       | ❌          | ⚠️             |

---

## 🎨 Design Philosophy

- **Customer Panel**: Blue + White (Clean, modern)
- **Manager Panel**: White + Black (Professional, minimal)
- **Glassmorphism UI**, modern rounded corners
- Mobile-Responsive
- Simple, no-install experience

---

## 🔐 Tech Stack

- **Frontend**: React + Tailwind (via Vite or Next.js)
- **Database**: MongoDB Atlas (Free tier)
- **Backend**: Node.js + Express (planned integration)
- **Payments**: Stripe (for now, Razorpay optional)
- **Hosting**: Vercel (Frontend), Render/Railway (Backend)

---

## 📦 Deployment Model

- Deployed as one monorepo with role-based routing
- Payment revenue model: platform fee per transaction
- Self-hosted restaurant pages, real-time order management
- Scalable for multi-location restaurants

---

## 📈 Planned Features

- Socket-based real-time kitchen updates
- Waiter assist UI (optional hybrid)
- Customer feedback & review system
- Dish popularity analytics
- Loyalty & referral system
- Admin-wide analytics for platform monitoring

---

## 📣 Tagline

> **ServeNow** — Scan, Order, Track, and Serve Faster.



