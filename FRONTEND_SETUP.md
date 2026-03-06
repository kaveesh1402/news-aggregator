# Frontend Setup and Running Guide

This guide will help you get the NewsAgg frontend up and running in just a few minutes.

## Prerequisites

- **Node.js** (version 16 or higher) and **npm** (comes with Node.js)
  - Download from: https://nodejs.org/
  - Verify installation: `node --version` and `npm --version`

- **Backend running** (on localhost:8080)
  - The frontend communicates with the Spring Boot backend API
  - See backend setup instructions in `DEVELOPMENT.md`

## Quick Start (5 minutes)

### Step 1: Navigate to the frontend directory

```bash
cd frontend
```

### Step 2: Install dependencies

```bash
npm install
```

This will install all required packages (React, Vite, Tailwind CSS, Axios, etc.) into the `node_modules` directory.

### Step 3: Start the development server

```bash
npm run dev
```

The development server will start, and your browser should automatically open to:
- **http://localhost:5173**

You should see the NewsAgg interface with the news dashboard!

## Available Scripts

### `npm run dev`
Starts the Vite development server with hot module replacement (HMR).
- Auto-opens browser to http://localhost:5173
- Changes to files will hot-reload without page refresh

### `npm run build`
Creates an optimized production build in the `dist/` directory.
- Minifies and optimizes all code and assets
- Ready for deployment to production servers

### `npm run preview`
Preview the production build locally.
- Useful for testing the build before deployment

## Features Implemented

### Homepage (`/`)
- ✅ Browse all news articles with pagination
- ✅ Search articles by keywords
- ✅ Dynamic topic filtering (driven by backend insights)
- ✅ Filter by sentiment (Positive, Neutral, Negative)
- ✅ Dashboard with analytics (total articles, category counts)
- ✅ Delete articles
- ✅ Fetch latest news manually
- ✅ Responsive design for mobile and desktop

### Article Detail Page (`/article/:id`)
- ✅ Full article content with formatted text
- ✅ AI-generated summary
- ✅ Metadata (category, sentiment, date, URL)
- ✅ Link to original article
- ✅ Related articles recommendations (AI-powered)
- ✅ Navigation back to home

### Components
1. **Header** - Navigation bar with app logo and links
2. **NewsCard** - Article preview card with metadata
3. **SearchBar** - Keyword search input
4. **CategoryFilter** - Sidebar filter by topic and sentiment
5. **SentimentBadge** - Visual sentiment indicator
6. **Pagination** - Navigate between article pages

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Header.jsx           # Navigation header
│   │   ├── NewsCard.jsx         # Article preview component
│   │   ├── SearchBar.jsx        # Keyword search input
│   │   ├── CategoryFilter.jsx   # Sidebar filters
│   │   ├── SentimentBadge.jsx   # Sentiment status display
│   │   └── Pagination.jsx       # Page navigation
│   ├── pages/
│   │   ├── HomePage.jsx         # Main articles listing page
│   │   └── ArticleDetailPage.jsx # Single article detail view
│   ├── api/
│   │   └── client.js            # Axios API client
│   ├── App.jsx                  # Main app with routing
│   ├── main.jsx                 # React entry point
│   └── index.css                # Global styles
├── index.html                   # HTML template
├── package.json                 # Dependencies and scripts
├── vite.config.js               # Vite build configuration
├── tailwind.config.js           # Tailwind CSS configuration
└── postcss.config.js            # PostCSS configuration
```

## Troubleshooting

### Port 5173 already in use
If you see "Port 5173 is already in use", the dev server will automatically use port 5174 instead.
Alternatively, stop the process using port 5173 or specify a different port:
```bash
npm run dev -- --port 3000
```

### Backend connection error
If you see "Failed to fetch articles. Make sure the backend is running...", ensure:
1. Backend is running on `localhost:8080`
2. No CORS issues (backend has CORS configured for localhost:5173)
3. Try accessing http://localhost:8080/api/health to verify

### Module not found errors
If you see "Module not found" errors, reinstall dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Localhost API is not accessible from the frontend
Make sure your backend `application.yml` has CORS configured:
```yaml
spring:
  web:
    cors:
      allowed-origins: "http://localhost:3000,http://localhost:5173"
```

## API Endpoints

The frontend uses the following backend API endpoints:

### News Articles
- `GET /api/news` - Get all articles (paginated)
- `GET /api/news/{id}` - Get single article
- `GET /api/news/search?q=...` - Keyword search
- `GET /api/news/semantic-search?query=...` - Semantic search endpoint (API clients, not exposed in current UI)
- `GET /api/news/category/{category}` - Filter by category
- `GET /api/news/sentiment/{sentiment}` - Filter by sentiment
- `GET /api/news/{id}/recommendations` - Get similar articles
- `DELETE /api/news/{id}` - Delete article

### Insights
- `GET /api/insights` - Get dashboard statistics
- `POST /api/fetch-news` - Trigger manual news fetch
- `GET /api/health` - Health check

## Performance Tips

1. **Build for production**: Use `npm run build` for deployment
2. **Enable caching**: Configure your server to cache static assets
3. **Use CDN**: Serve the built files through a CDN for faster load times
4. **Monitor bundle size**: Use `npm run build` and check the output size

## Deployment

### Build the production bundle
```bash
npm run build
```

This creates a `dist/` folder with optimized production files.

### Deploy to common platforms

#### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

#### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir dist
```

#### Docker
```bash
# Build the image
docker build -t newsagg-frontend .

# Run the container
docker run -p 3000:3000 newsagg-frontend
```

#### Traditional Server (Nginx/Apache)
Copy the `dist/` folder contents to your web server's public directory.

## Environment Variables

The current frontend uses a fixed API base URL in `src/api/client.js`:

```javascript
const API_BASE_URL = 'http://localhost:8080/api';
```

If needed, you can switch this to use `import.meta.env`.

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Development Tips

1. **Hot Module Replacement**: Changes automatically reload without losing state
2. **React DevTools**: Install React DevTools extension for debugging
3. **Network Tab**: Use browser DevTools Network tab to inspect API calls
4. **Console Logs**: Check browser console for client-side errors
5. **Tailwind IntelliSense**: Install Tailwind CSS IntelliSense extension for VS Code

## Performance Monitoring

Monitor performance using:
- Browser DevTools Lighthouse
- Network tab for API response times
- Performance tab for rendering performance
- Coverage tab to identify unused CSS/JS

## Next Steps

1. ✅ Frontend is now running!
2. 🚀 Make sure backend is running on `localhost:8080`
3. 📚 Test search and filtering (keyword, topic, sentiment)
4. 🎨 Customize styling in Tailwind config
5. 🔌 Consider adding authentication for production

---

Need help? Check the main README.md or DEVELOPMENT.md for more information.
