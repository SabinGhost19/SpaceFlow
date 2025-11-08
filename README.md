Prompts:


---

**PROMPT PENTRU CLAUDE SONNET 4.5:**

```
Trebuie să integrezi funcționalitățile dintr-un fișier HTML existent (2d_front.html) și un fișier SVG (floor-plan.svg) într-o aplicație React.js profesională existentă, folosind Tailwind CSS și shadcn/ui.

CONTEXT:
- Am o aplicație React.js funcțională cu un sistem de tabs
- Am un fișier 2d_front.html care conține funcționalități pentru vizualizarea unei hărți 2D
- Am un fișier floor-plan.svg care este folosit în acel HTML
- Vreau să adaug un nou tab numit "View 2D Map" care să conțină toate funcționalitățile din 2d_front.html

CERINȚE TEHNICE:
1. **Framework și stilizare:**
   - React.js (cu hooks: useState, useEffect, useRef, etc.)
   - Tailwind CSS pentru styling
   - shadcn/ui pentru componente UI (buttons, tabs, cards, dialogs, etc.)
   - TypeScript (dacă este posibil)

2. **Structură:**
   - Creează o componentă nouă: `View2DMap.tsx` (sau .jsx)
   - Integrează această componentă în sistemul de tabs existent
   - Asigură-te că tab-ul se numește exact "View 2D Map"

3. **Funcționalități de integrat din 2d_front.html:**
   - Parsează tot codul JavaScript și convertește-l în React hooks și event handlers
   - Păstrează TOATE funcționalitățile interactive (zoom, pan, click events, etc.)
   - Integrează SVG-ul floor-plan.svg direct în componenta React
   - Convertește orice manipulare DOM în echivalentul React (refs, state management)

4. **Design profesional:**
   - UI modern, clean și responsive
   - Folosește componente shadcn/ui pentru controale (buttons, sliders, tooltips)
   - Paletă de culori consistentă cu aplicația existentă
   - Animații fluide și tranziții smooth
   - Loading states și error handling
   - Mobile-friendly (responsive design)

5. **Calitatea codului:**
   - Cod clean, bine organizat și comentat
   - Separare clară a logic-ului de prezentare
   - Custom hooks pentru logica refolosibilă
   - PropTypes sau TypeScript pentru type safety
   - Performanță optimizată (useMemo, useCallback unde e necesar)

FIȘIERELE DISPONIBILE:
Voi atașa cele două fișiere:
1. 2d_front.html - conține tot HTML-ul, CSS-ul și JavaScript-ul
2. floor-plan.svg - fișierul SVG folosit pentru vizualizare

LIVRABILE NECESARE:
1. **View2DMap.tsx/jsx** - componenta principală completă
2. **Integrare în App.tsx** - codul pentru adăugarea noului tab
3. **Fișiere suplimentare** (dacă sunt necesare):
   - Custom hooks (ex: useFloorPlan.ts, useZoom.ts)
   - Componente auxiliare (ex: MapControls.tsx, MapLegend.tsx)
   - Utils/helpers (ex: svgUtils.ts)
4. **Instrucțiuni de instalare** - comenzi npm pentru orice dependințe noi
5. **Documentație** - explicații pentru funcționalitățile principale

AȘTEPTĂRI:
- Codul să fie production-ready
- Toate funcționalitățile din 2d_front.html să fie prezente și funcționale
- Design consistent cu best practices React și Tailwind
- Cod modular și ușor de întreținut
- Comentarii clare pentru logica complexă

COMENZI:
1. Analizează în detaliu fișierul 2d_front.html
2. Identifică toate funcționalitățile JavaScript existente
3. Creează structura componentei React
4. Convertește fiecare funcționalitate în React
5. Integrează SVG-ul în mod optim
6. Adaugă styling profesional cu Tailwind + shadcn/ui
7. Testează că totul funcționează corect
8. Oferă codul complet și instrucțiuni clare

Începe prin a-mi cere să îți arăt cele două fișiere (2d_front.html și floor-plan.svg), apoi creează soluția completă.
```

---

**INSTRUCȚIUNI DE UTILIZARE:**

1. Copiază prompt-ul de mai sus
2. Deschide o conversație nouă cu Claude Sonnet 4.5
3. Lipește prompt-ul
4. Când Claude îți cere, atașează fișierele `2d_front.html` și `floor-plan.svg`
5. Claude va analiza fișierele și va crea întreaga soluție

**OPȚIONAL - Adaugă la final dacă vrei specificații suplimentare:**
```
CERINȚE ADIȚIONALE:
- [Specifică orice funcționalitate extra dorită]
- [Menționează stilul exact de UI preferat]
- [Alte constrainte sau preferințe]
```

























```
Create a professional, modern room booking frontend application using React.js, Tailwind CSS, and shadcn/ui with the following specifications:

## Design Requirements
- **Color Palette (strictly prioritize these colors):**
  - Primary: #96A78D (sage green)
  - Secondary: #B6CEB4 (light sage)
  - Accent: #D9E9CF (pale mint)
  - Background: #F0F0F0 (light gray)
- **Style:** Minimalist, modern, professional with subtle, tasteful animations
- **UX:** Easy navigation, intuitive interface, responsive design

## Core Features (Mock data for initial display)

### 1. Authentication Pages
- Login page with email/password fields
- Sign up/registration page with form validation
- Password recovery option
- Smooth page transitions

### 2. Main Dashboard
- Overview of available rooms
- Quick booking panel
- Upcoming reservations summary
- Statistics cards (total bookings, available rooms, etc.)

### 3. Room Browsing & Booking
- Grid/list view of available rooms with:
  - Room images (use placeholder images)
  - Room name, capacity, amenities
  - Price per hour/day
  - Availability status
- Filtering options (capacity, amenities, price range)
- Search functionality
- **"View 2D Map" button (non-functional, just UI button)**

### 4. Custom Calendar & Schedule
- Interactive calendar component for selecting booking dates/times
- Visual representation of booked vs available time slots
- Multi-day booking capability
- Personal schedule view showing user's bookings
- Time slot selection with visual feedback

### 5. Booking Management
- Create new booking flow with:
  - Room selection
  - Date/time picker
  - Duration selector
  - Additional services/amenities
  - Booking summary and confirmation
- View/edit/cancel existing bookings
- Booking history

### 6. User Profile
- Personal information display
- Booking preferences
- Notification settings

## Technical Implementation
- Use React hooks (useState, useEffect, useContext)
- Implement React Router for navigation
- Create reusable components
- Use shadcn/ui components (Button, Card, Dialog, Calendar, Select, Input, etc.)
- Implement smooth animations with Framer Motion or CSS transitions
- Mock data stored in JSON format or state management
- Responsive design (mobile, tablet, desktop)

## Animation & Interaction Details
- Smooth page transitions
- Hover effects on interactive elements
- Loading states with skeleton screens
- Success/error notifications with slide-in animations
- Calendar date selection with visual feedback
- Card hover effects with subtle scaling/shadow
- Smooth scrolling

## Layout Structure
- Navigation bar (logo, menu items, user profile dropdown)
- Sidebar for quick actions (optional, collapsible)
- Main content area
- Footer with links and information

## Additional Polish
- Dark mode toggle (optional but recommended)
- Accessibility features (ARIA labels, keyboard navigation)
- Loading states and error handling
- Empty states with helpful messages
- Confirmation modals for important actions

Generate the complete, production-ready code with all components, proper file structure, and mock data. Make it look like a professional SaaS application that could be deployed immediately for demonstration purposes.
```

