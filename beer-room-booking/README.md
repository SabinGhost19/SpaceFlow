# 🍺 Beer Room Booking - Frontend

A professional, beer-themed corporate meeting room booking system built with React, Vite, and Tailwind CSS.

## ✨ Features

- **🏢 Interactive 3D Floor Plans** - Explore rooms with immersive 3D model viewer
- **📱 Responsive Design** - Works perfectly on all devices
- **⌨️ Full Accessibility** - WCAG compliant with keyboard navigation and screen readers
- **🎨 Smooth Animations** - Polished transitions and loading states
- **🍺 Beer-Themed Design** - Professional yet warm amber color scheme
- **📢 Toast Notifications** - Real-time feedback for all actions
- **🔄 Loading Skeletons** - Better UX during data fetching
- **🎯 React Router** - Seamless navigation between pages

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (recommended)
- npm or yarn

### Installation

1. **Clone and navigate to the project:**
   ```bash
   cd beer-room-booking
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   Navigate to `http://localhost:3000`

## 📦 Build for Production

```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## 🗂️ Project Structure

```
beer-room-booking/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable components
│   │   ├── Icons.jsx           # SVG icon components
│   │   ├── LoadingSkeleton.jsx # Loading states
│   │   ├── Map3D.jsx           # 3D model viewer
│   │   ├── Navigation.jsx      # Top navigation bar
│   │   ├── RoomCard.jsx        # Individual room card
│   │   ├── RoomList.jsx        # List of rooms
│   │   └── Toast.jsx           # Notification system
│   ├── pages/          # Page components
│   │   ├── BookingPage.jsx     # Main booking interface
│   │   └── LandingPage.jsx     # Marketing landing page
│   ├── utils/          # Utility functions
│   ├── App.jsx         # Main app component
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## 🎨 Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **@google/model-viewer** - 3D model rendering

## 🛠️ Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
VITE_API_BASE=https://your-api-endpoint.com
VITE_MODEL_PATH=/models/your-model.glb
```

### 3D Models

Place your 3D models (`.glb` or `.gltf` format) in the `public/models/` directory.

### Tailwind Customization

Edit `tailwind.config.js` to customize colors, animations, and more.

## ♿ Accessibility Features

- **ARIA labels** on all interactive elements
- **Keyboard navigation** with arrow keys in room list
- **Focus indicators** for better visibility
- **Screen reader support** with live regions
- **Semantic HTML** throughout

## 🍺 Beer-Themed Easter Eggs

- Animated foam bubbles floating in background
- Spinning bottle cap icons
- Beer mug icons for room markers
- "Cheers!" success messages

## 📱 Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Code Style

The project follows:
- 8px grid system for spacing
- Rounded corners (8px for cards, 4px for buttons)
- Soft shadows for depth
- Smooth transitions on all interactions

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy!

### Netlify

1. Run `npm run build`
2. Upload `dist` folder to Netlify
3. Configure environment variables

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "run", "preview"]
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support, email support@beerroombooking.com or join our Discord channel.

## 🙏 Acknowledgments

- Design inspired by craft beer culture
- Icons from Heroicons
- 3D rendering powered by Google's model-viewer

---

Made with 🍺 and React

**Cheers to better meeting room booking!** 🎉
