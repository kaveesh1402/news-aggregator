# 🚀 Quick Start Guide

## One-Minute Setup

### Prerequisites Check
```bash
java -version    # Should be 17+
mvn -version     # Should be 3.8+
node -v          # Should be 18+
npm -version     # Should be 9+
```

## Backend Setup (5 minutes)

```bash
# Navigate to backend
cd backend

# Build the application
mvn clean install

# Run Spring Boot
mvn spring-boot:run
```

**Expected Output:**
```
...
Tomcat started on port(s): 8080
Started NewsAggregatorApplication in ... seconds
```

**Test It:**
```bash
curl http://localhost:8080/api/health
# Response: News Aggregator API is running
```

## Frontend Setup (5 minutes)

Open another terminal:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

**Expected Output:**
```
  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

Visit http://localhost:5173 in your browser!

## Optional: Ollama Setup (For Better AI Results)

If you want better summarization and analysis:

1. Install Ollama: https://ollama.ai
2. Start Ollama: `ollama serve`
3. Pull a model: `ollama pull llama2`
4. Backend will automatically connect on `http://localhost:11434`

## Optional: Real News API Token

To ingest live headlines from TheNewsAPI, set:

```bash
# macOS/Linux
export THENEWSAPI_TOKEN=your_token_here

# Windows PowerShell
$env:THENEWSAPI_TOKEN="your_token_here"
```

## File Structure Created

```
NewsAgg/
├── QUICK_REFERENCE.md        # API + command quick reference
├── BACKEND_SETUP.md          # Backend setup guide
├── FRONTEND_SETUP.md         # Frontend setup guide
├── QUICKSTART.md            # This file
├── backend/
│   ├── pom.xml             # Maven configuration
│   ├── src/main/
│   │   ├── java/com/newsagg/
│   │   │   ├── NewsAggregatorApplication.java
│   │   │   ├── controller/       # REST endpoints
│   │   │   ├── service/          # Business logic
│   │   │   ├── entity/           # JPA entities
│   │   │   ├── repository/       # Data access
│   │   │   ├── ai/               # AI services
│   │   │   ├── dto/              # Data transfer
│   │   │   └── config/           # Configuration
│   │   └── resources/
│   │       └── application.yml   # Config file
│   └── .gitignore
└── frontend/
    ├── package.json           # npm configuration
    ├── vite.config.js        # Vite configuration
    ├── tailwind.config.js    # Tailwind config
    ├── index.html            # HTML entry
    ├── src/
    │   ├── main.jsx          # React entry
    │   ├── App.jsx           # Main app component
    │   ├── api/
    │   │   └── client.js     # API client
    │   ├── components/       # React components
    │   └── pages/            # Page components
    └── .gitignore
```

## What You Can Do

### 1. View News Articles
- Browse the latest news articles
- Filter by topic and sentiment, or search

### 2. Read Detailed Articles
- Click any article to see full content
- AI-generated summary at the top
- Get recommendations for similar articles

### 3. Search Articles
- **Keyword Search**: Traditional text search from the UI
- **Semantic Search API**: Available at backend endpoint (`/api/news/semantic-search`) for API clients

### 4. Analyze Trends
- View dashboard insights
- See category distribution
- Analyze sentiment patterns

### 5. Trigger News Fetch
- Click "Fetch News" button
- Manually update articles from RSS feeds
- (Automatic fetch happens every hour)

## API Endpoints

### News Management
- `GET /api/news` - All articles
- `GET /api/news/{id}` - Single article
- `GET /api/news/search?q=query` - Keyword search
- `GET /api/news/semantic-search?query=...` - Semantic search endpoint (API)
- `GET /api/news/category/{category}` - Filter by category
- `GET /api/news/sentiment/{sentiment}` - Filter by sentiment
- `GET /api/news/{id}/recommendations` - Similar articles

### Analytics
- `GET /api/insights` - Dashboard data
- `POST /api/fetch-news` - Trigger fetch
- `GET /api/health` - Health check

See `QUICK_REFERENCE.md` for a concise API and command reference.

## Common Tasks

### Change RSS Feeds

Edit `backend/src/main/resources/application.yml`:

```yaml
news:
  rss-feeds:
    - name: "Custom Source"
      url: "https://example.com/feed"
```

Restart backend for changes to take effect.

### Modify AI Model

Edit `backend/src/main/resources/application.yml`:

```yaml
ollama:
  model: llama2  # default model (can be changed)
```

### Switch to PostgreSQL

1. Install PostgreSQL
2. Create database: `createdb newsagg`
3. Update `application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/newsagg
    username: postgres
    password: your-password
    driver-class-name: org.postgresql.Driver
  jpa:
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
```

## Troubleshooting

### Backend won't start?
```bash
# Check if port 8080 is in use
lsof -i :8080

# Try different port
java -Dserver.port=8081 -jar target/news-aggregator-1.0.0.jar
```

### Frontend can't connect to API?
Check in `frontend/src/api/client.js`:
```javascript
const API_BASE_URL = 'http://localhost:8080/api';
```

### RSS feeds not updating?
- Check network connection
- Verify RSS URLs are valid
- Check logs for errors
- Manually trigger with "Fetch News" button

### Ollama connection issues?
```bash
# Check Ollama is running
curl http://localhost:11434/api/tags

# Pull model
ollama pull llama2

# Or disable Ollama - backend has fallbacks
```

## Next Steps

1. **Backend Setup**: See `BACKEND_SETUP.md`
2. **Frontend Setup**: See `FRONTEND_SETUP.md`
3. **Quick Commands**: See `QUICK_REFERENCE.md`
4. **Current Status**: See `CURRENT_STATUS.md`

## Need Help?

- Check existing issues on GitHub
- Review logs: `tail -f logs/newsagg.log`
- Test API: Use curl or Postman
- Check configuration: Verify `application.yml`

## Key Features Implemented

✅ **News Aggregation** - From multiple RSS feeds
✅ **AI Summarization** - Using Ollama LLM
✅ **Sentiment Analysis** - Positive/Neutral/Negative
✅ **Auto-Categorization** - Topic labels for filtering
✅ **Semantic Search API** - Available for API clients
✅ **Recommendations** - Similar article suggestions
✅ **Modern Dashboard** - Beautiful React UI
✅ **REST API** - Full-featured API
✅ **Database** - H2 (dev) / PostgreSQL (prod)
✅ **Scheduling** - Automatic hourly fetches

## Technology Stack

- **Backend**: Spring Boot 3.1.5
- **Frontend**: React 18 + Vite
- **Database**: H2 / PostgreSQL
- **AI**: Ollama LLM
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## Production Checklist

- [ ] Switch to PostgreSQL
- [ ] Add environment variables for secrets
- [ ] Enable HTTPS/SSL
- [ ] Setup monitoring and logging
- [ ] Add authentication/authorization
- [ ] Configure backup strategy
- [ ] Setup CI/CD pipeline
- [ ] Scale database and cache
- [ ] Deploy to cloud (AWS, GCP, Azure)

---

**You're all set!** 🎉

Start exploring your AI-powered news aggregator platform.
