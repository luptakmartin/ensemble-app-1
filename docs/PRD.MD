**Product Requirements Document (PRD)**

**Product Name:** Ensemble Application
**Platform:** Responsive Web Application (desktop, mobile, tablet)

---

### **Overview**

An application to manage ensemble events and track member attendance for the musical ensemble. Primarily it will support singing choir, later will be extended to general music ensemble (instruments). The app supports different user roles and allows planning, communication, and record-keeping of rehearsals and concerts.

---

### **User Roles & Permissions**

#### **1. Admin**

* Full CRUD access to all data.
* Manage all users: view, add, delete, edit, assign roles.
* Assign multiple roles to users.
* Modify presence of any user at any time.
* Manage master data (event types, compositions, etc.).

#### **2. Choir Director**

* Create, edit, and delete events
* Event fields: name, type (fixed list), date, time, place, description.
* Assign compositions to events.
* Create, edit, delete compositions:

* Fields: name, author, duration, musical sheets (file/link), audio files (file/link).
* View presence of all members.
* Modify presence of any user at any time.
* Modify voice group of any member (S, A, T, B), but not other user details.

#### **3. Choir Member**

* View all scheduled events (cards + calendar view).
* View presence of all members on events.
* Mark their own presence (Yes/Maybe/No/Unset) **only before event start**.
* View compositions linked to events.
* Modify their own profile: name, picture (optional), e-mail, phone (optional), password.

---

### **Authentication & User Management**

* Login via email + password.
* Admins invite new users.
* All users can recover password via standard password recovery process.

---

### **Events Management**

#### **Event Types (Fixed):**

* Regular Rehearsal
* Exceptional Rehearsal
* General Rehearsal
* Concert
* Meeting

#### **Event Attributes:**

* Name
* Type (one of Event Types)
* Date and Time
* Place
* Description
* List of assigned compositions

#### **Event Views:**

1. **Card View**: List-style UI of upcoming/past events.
2. **Calendar View**: Monthly calendar layout. Clicking an event opens a popup with event details and presence interaction.

---

### **Presence Management**

#### **Presence Status Options:**

* Yes (green)
* Maybe (blue)
* No (red)
* Unset (grey)

#### **Rules:**

* Regular members can only update their presence **until the event starts**.
* Directors and Admins can update presence **after the event**.
* Only Admins can modify presence of other users.
* All users can view everyone's presence.
* Display both **detailed** (per-user) and **summary** (status count) views.

---

### **Compositions Management**

* Managed by Directors (CRUD).
* Fields:
  * Name
  * Author
  * Duration
  * Musical sheets (file or link, clickable)
  * Audio files (file or link, clickable)
* Assign compositions to events. N:M relationship to events.

---

### **User Profiles**

* Editable by the user:
  * Name
  * Profile picture (optional)
  * Email
  * Phone (optional)
  * Password

---

### **Design Requirements**

* Visually appealing, modern, accessible design.
* Fully responsive: supports desktop, tablet, and mobile.
* Calendar and card views are clearly accessible.
* Presence buttons are clearly color-coded.
* Sheet/audio links are styled as obvious clickable elements.

---
