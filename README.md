# Bike Rebalancing Dashboard

A production-ready Next.js application for real-time bike sharing system rebalancing using live GBFS (General Bikeshare Feed Specification) data.

## Features

- **Real-time Data**: Live integration with GBFS feeds
- **Interactive Map**: Built with deck.gl and react-map-gl using MapLibre tiles
- **Modern UI**: Clean interface with shadcn/ui components
- **Responsive Design**: Optimized for desktop and mobile
- **TypeScript**: Full type safety throughout the application

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: shadcn/ui (Button, Slider, Switch, Select, Card)
- **Mapping**: deck.gl + react-map-gl + MapLibre GL
- **Data Source**: GBFS (General Bikeshare Feed Specification)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd bike-rebalancing
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Create a `.env.local` file with the following variables:

```env
NEXT_PUBLIC_GBFS_ROOT=https://gbfs.divvybikes.com/gbfs
```

## Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Main dashboard page
│   └── globals.css     # Global styles
├── components/         # React components
│   ├── ui/            # shadcn/ui components
│   └── MapComponent.tsx # Main map component
├── types/             # TypeScript type definitions
└── lib/               # Utility functions
```

## Features Overview

### Dashboard Layout
- **Top Bar**: Application title and branding
- **Left Panel**: Control panel with system configuration, controls, and status
- **Right Panel**: Interactive map with real-time bike station data

### Map Features
- **Real-time Updates**: Live bike availability data
- **Color-coded Stations**: Visual indicators for bike availability levels
- **Interactive Elements**: Hover and click interactions
- **Legend**: Clear visual guide for station status

### Controls
- **System Selection**: Choose between different bike share systems
- **Live Mode Toggle**: Enable/disable real-time updates
- **Refresh Interval**: Configurable update frequency
- **Manual Controls**: Refresh data, export reports, settings

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Features

1. Create components in `src/components/`
2. Add types in `src/types/`
3. Update the main page in `src/app/page.tsx`
4. Test thoroughly before deployment

## Deployment

The application is ready for deployment on platforms like:
- Vercel (recommended for Next.js)
- Netlify
- AWS Amplify
- Any Node.js hosting platform

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.