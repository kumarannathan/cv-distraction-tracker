# Hasan Piker 9/11 - Educational Resource

A minimalist, newspaper-inspired educational website built with React, TypeScript, and Tailwind CSS. This resource provides factual context about Hasan Piker, the 9/11 controversy, and the political context surrounding Cuomo's campaign ad.

## Design Philosophy

- **Typography-first**: Large serif headlines, clean sans-serif body text
- **Breathing room**: Generous whitespace, restrained layout (max-width: 4xl)
- **Editorial styling**: Eyebrows (I, II, III), pull quotes, callouts like NYT/WaPo
- **Neutral palette**: Blacks, grays, minimal color for serious tone
- **Subtle motion**: Fade-ins on scroll, gentle hover states—nothing flashy

## Key Features

- Fixed minimal header that fades out on scroll
- Five educational sections covering the controversy
- Pull quotes and callouts for emphasis
- Resource links for further learning and action
- Link cards with subtle hover animations
- Mobile-responsive throughout
- SEO optimized for "Hasan Piker 9/11" searches

## Tech Stack

- ✅ React 18 with TypeScript
- ✅ Vite for fast development
- ✅ Tailwind CSS for utility-first styling
- ✅ Framer Motion for scroll animations
- ✅ Semantic HTML for accessibility

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser to `http://localhost:5173`

## Project Structure

```
src/
├── components/
│   ├── Header.tsx          # Fixed header with fade-out on scroll
│   ├── HeroSection.tsx     # Main headline and introduction
│   ├── WhoIsHasan.tsx      # Who is Hasan Piker?
│   ├── AmericaDeserved.tsx # Why would someone say "America deserved 9/11"?
│   ├── CuomoContext.tsx    # Why is this being brought up by Cuomo?
│   ├── MamdaniStance.tsx   # What is Mamdani's stance?
│   └── ResourcesSection.tsx # Where can I learn more / help / join?
├── App.tsx                 # Main application component
├── index.css               # Global styles and Tailwind imports
└── main.tsx                # Application entry point
```

## Design Elements

### Typography
- **Headlines**: Georgia serif font for authority
- **Body text**: Inter sans-serif for readability
- **Eyebrows**: Small caps for section labels

### Color Palette
- **Primary**: Editorial black (#1a1a1a)
- **Secondary**: Various grays for hierarchy
- **Accent**: Minimal color usage for emphasis

### Components
- **Pull quotes**: Large italic text with left border
- **Callouts**: Highlighted boxes for important information
- **Link cards**: Subtle hover effects for interactivity

## Responsive Design

The design is fully responsive with:
- Mobile-first approach
- Flexible typography scaling
- Adaptive grid layouts
- Touch-friendly interactions

## Accessibility

- Semantic HTML structure
- Proper heading hierarchy
- Keyboard navigation support
- Screen reader friendly
- High contrast ratios

## Performance

- Optimized bundle size with Vite
- Lazy loading for animations
- Efficient re-renders with React
- Minimal dependencies

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES2020+ features
- CSS Grid and Flexbox
- CSS Custom Properties