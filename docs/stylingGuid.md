# Sirkin Supper Club Styling Guide

## Color Palette
- **Primary Gold**: `#D4AF37` (Used for headings, accents, and highlights)
- **Black**: `#000000` (Used for backgrounds and containers)
- **White**: `#FFFFFF` (Used for text on dark backgrounds)
- **Gray**: `#333333` (Used for subtle UI elements and hover states)
- **Dark Gray**: `#1A1A1A` (Used for form inputs and secondary backgrounds)

## Typography
- **Headings**: Bold, larger sizes (3xl-6xl)
- **Body Text**: Regular weight, medium sizes (xl-2xl)
- **Buttons**: Bold, medium size (lg)
- **Form Labels**: Bold, white text

## Animations
### Page Elements
- Initial load animations use opacity and subtle Y-axis movements
- Staggered animations for lists of items
- Subtle hover effects for interactive elements

### Framer Motion Settings
- **Duration**: 0.5-0.7s for most animations
- **Delays**: Staggered (0.1-0.2s increments) for sequential elements
- **Easing**: Default ease for most animations

## Components

### Cards
- Black background (`bg-black`)
- Subtle border (`border border-gray-700`)
- Rounded corners (`rounded-lg`)
- Shadow effect (`shadow-md`)
- Hover transform (`hover:translate-y-[-2px]`)
- Transition effect (`transition-all duration-300`)

### Buttons
- Black background (`bg-black`)
- White text (`text-white`)
- Bold font (`font-bold`)
- Rounded corners (`rounded`)
- Shadow effect (`shadow-md`)
- Hover scale effect (`whileHover={{ scale: 1.05 }}`)
- Tap scale effect (`whileTap={{ scale: 0.95 }}`)

### Form Inputs
- Dark gray background (`bg-gray-800`)
- White text (`text-white`)
- Rounded corners (`rounded`)
- Transparent border by default (`border-2 border-transparent`)
- White border on focus (`focus:border-white`)
- No outline on focus (`focus:outline-none`)
- Smooth transition (`transition-all duration-300`)

### Icons
- Contained in circular backgrounds (`rounded-full`)
- Gold color for icons (`text-gold`)
- Shadow effect (`shadow-sm`)

## Layout
- Responsive design with mobile-first approach
- Flex and Grid layouts for component organization
- Consistent padding and margins
- Proper spacing between elements

## Responsive Breakpoints
- **Mobile**: Default styles
- **Tablet/Medium**: `md:` prefix (768px and above)
- **Desktop/Large**: `lg:` prefix (1024px and above)

## Animation Examples