# Hall of Fame · UET Lahore (Faisalabad Campus)

> **The campus wall of honour** — Where this campus keeps its legends.  
> Celebrating wins, firsts, and feats by students and alumni of the University of Engineering and Technology (UET) Lahore, Faisalabad Campus.

---

## 🏛️ Overview

The **Hall of Fame** is a community-driven digital campus wall celebrating student and alumni triumphs across six dedicated wings. Visitors can freely walk the hall, browse categories, filter by level or year, and submit nominations with zero signup friction. Every nomination is reviewed and verified by the campus Curator before being hung on the wall.

---

## ✨ Features

- **Six Distinct Campus Wings**:
  - 🎓 **Academics**: Top results, scholarships, and academic honours.
  - 🏆 **Competitions**: Hackathons, contests, and national/global championships.
  - 🔬 **Research & Innovation**: Papers, patents, and groundbreaking builds.
  - 🏅 **Sports**: Medals, records, and university team victories.
  - 🎭 **Arts & Culture**: Film, music, literature, debate, and design.
  - 🤝 **Community Service**: Drives, volunteering, and giving back to society.

- **Three Tiers of Honour**:
  - 🥉 **Campus**: Bronze frame (`#C98A5A`) and warm tint
  - 🥈 **National**: Silver frame (`#C9D2E0`) and cool tint
  - 🥇 **International**: Gold frame (`#F2B84B`) and golden tint

- **Interactive Wall Aesthetics**:
  - Authentic wall-hanging plaques with wire vectors, brass pegs, and subtle tilts.
  - Dynamic initials avatar generation with fallback for photo uploads.
  - Detailed plaque view with story narrative, department, batch, and verified source proof links.
  - One-click **"Share plaque"** and **"Report a mistake"** reporting modal.

- **Public Nomination Flow (No Account Needed)**:
  - 4-step streamlined submission form.
  - **Real-Time Live Plaque Preview**: The plaque hanging preview updates in real-time as the nominator types the name, title, selects wing, tier, or uploads a photo.
  - Confirmation screen with reference ID (`NOM-XXXXXX`) and pending gold stamp.

- **Curator Admin Desk (`/admin`)**:
  - Separate queue tabs for **Pending**, **Approved**, and **Rejected** nominations with live counts.
  - Full review inspector with one-click **"Approve and hang"**, **"Reject"** (with feedback note), and **"Edit details first"** modal.
  - Direct **"Add Legend"** desk to hang plaques immediately without review delay.
  - Campus wings management overview.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) (App Router, Turbopack)
- **UI & Styling**: React 19, Tailwind CSS v4, Lucide Icons, Google Fonts (`Bricolage Grotesque`, `DM Sans`)
- **Database**: [Neon](https://neon.tech) Serverless PostgreSQL (`@neondatabase/serverless`)
- **Media Storage**: [Cloudinary](https://cloudinary.com)
- **Authentication**: Secure HTTP-only cookies with JWT and bcrypt password hashing

---

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory:

```env
# Neon PostgreSQL
DATABASE_URI=postgresql://<user>:<password>@<host>/<database>?sslmode=require

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Optional: Session Secret
JWT_SECRET=your_custom_secret_key
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize and Seed the Database
Runs table migrations and seeds initial plaques and default Curator credentials:
```bash
node scripts/init-db.mjs
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Curator Login

- **URL**: `http://localhost:3000/admin/login`
- **Default Email**: `curator@example.com` *(or `curator@uet.edu.pk`)*
- **Default Password**: `curator123`

---

## 📜 License

Created for UET Lahore, Faisalabad Campus.
