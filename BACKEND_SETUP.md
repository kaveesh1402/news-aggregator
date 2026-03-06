# Backend Compilation & Running Guide

## Overview

The NewsAgg backend is a **Spring Boot 3.1.5** application written in Java 21. To run it, you need:

1. **Maven** - Java build tool (for compiling)
2. **Java 21+** - Runtime environment
3. A terminal with proper PATH configuration

---

## Step 1: Install Maven (If Not Already Installed)

### Option A: Download Maven Manually (Recommended for Windows)

1. **Download Maven 3.9.6**
   - Go to: https://maven.apache.org/download.cgi
   - Download: **apache-maven-3.9.6-bin.zip**

2. **Extract the ZIP file**
   - Right-click → Extract All
   - Suggested location: `C:\Program Files\apache-maven-3.9.6`

3. **Add Maven to System PATH**
   - Press `Win + X` → System
   - Click "Advanced system settings"
   - Click "Environment Variables"
   - Under "System variables", click "New"
   - Variable name: `MAVEN_HOME`
   - Variable value: `C:\Program Files\apache-maven-3.9.6`
   - Click OK

4. **Update PATH variable**
   - Find "Path" in System variables
   - Click "Edit"
   - Click "New"
   - Add: `%MAVEN_HOME%\bin`
   - Click OK, OK, OK

5. **Verify Maven installation**
   - Open **new** Command Prompt
   - Run: `mvn --version`
   - Should show Maven version 3.9.6

### Option B: Install via Package Manager (If on macOS/Linux)

**macOS (with Homebrew):**
```bash
brew install maven
mvn --version
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install maven
mvn --version
```

---

## Step 2: Verify Java Installation

```bash
java -version
```

Should show: `java version "21.0.9"` (or higher)

If not found, download from: https://www.oracle.com/java/technologies/downloads/

---

## Step 3: Navigate to Backend Directory

```bash
cd C:\Users\kaveesh bhat\Desktop\NewsAgg\backend
```

Or use `cd frontend/..` if you're in the frontend directory.

---

## Step 4: Compile the Backend

### Full Build (First Time)

```bash
mvn clean install
```

This will:
- ✅ Download all dependencies (~200MB first time)
- ✅ Compile all Java source files
- ✅ Run tests (if configured)
- ✅ Package the application
- ✅ Install to local Maven repository

**Time: 2-5 minutes (depending on internet speed)**

### Quick Build (Subsequent Times)

```bash
mvn clean package -DskipTests
```

This skips tests for faster builds.

---

## Step 5: Run the Backend

### Option A: Run with Maven (Easiest)

```bash
mvn spring-boot:run
```

This will:
- Start the Spring Boot application
- Load H2 in-memory database
- Create sample data (5 articles)
- Start listening on **http://localhost:8080**

**Expected output:**
```
2025-03-04 20:15:32.123  INFO 1234 --- [main] c.n.NewsAggregatorApplication : Started NewsAggregatorApplication in 3.456 seconds (JVM running for 4.789s)
```

### Option B: Run the Built JAR File

```bash
java -jar target/newsagg-0.0.1-SNAPSHOT.jar
```

This runs the compiled JAR directly without Maven.

---

## Step 6: Verify Backend is Running

### Test 1: Health Check Endpoint

Open in your browser or terminal:

```bash
curl http://localhost:8080/api/health
```

Or visit: http://localhost:8080/api/health

**Expected response:**
`News Aggregator API is running`

### Test 2: Get All Articles

```bash
curl http://localhost:8080/api/news?page=0&size=10
```

**Expected response:** JSON payload with `articles`, `totalElements`, `totalPages`, and pagination fields.

### Test 3: H2 Database Console

Open in browser: http://localhost:8080/h2-console

**Login:**
- Driver: `org.h2.Driver`
- JDBC URL: `jdbc:h2:mem:newsaggdb`
- Username: `sa`
- Password: (leave empty)

Click Connect - you should see the database with `news_article` table.

---

## Backend Project Structure

```
backend/
├── pom.xml                                    # Maven configuration
├── src/main/java/com/newsagg/
│   ├── NewsAggregatorApplication.java        # Spring Boot entry point
│   ├── controller/
│   │   ├── NewsController.java               # REST endpoints for articles
│   │   └── InsightsController.java           # REST endpoints for analytics
│   ├── service/
│   │   ├── NewsArticleService.java           # Business logic
│   │   └── NewsFetcherService.java           # Scheduling & data loading
│   ├── repository/
│   │   └── NewsArticleRepository.java        # Database queries
│   ├── entity/
│   │   ├── NewsArticle.java                  # Article entity
│   │   └── SentimentType.java                # Sentiment enum
│   ├── ai/
│   │   ├── summarizer/                       # AI summarization
│   │   ├── sentiment/                        # Sentiment analysis
│   │   ├── categorizer/                      # Auto-categorization
│   │   └── embeddings/                       # Vector embeddings
│   ├── dto/                                  # Data transfer objects
│   └── config/                               # Configuration classes
└── src/main/resources/
    └── application.yml                       # Spring Boot config
```

---

## Common Issues & Solutions

### Issue: "mvn command not found"

**Solution:**
- Maven is not in your PATH
- Restart your terminal after adding to PATH
- Verify: `mvn --version`

### Issue: "Java not found"

**Solution:**
- Java is not installed or not in PATH
- Download from: https://www.oracle.com/java/technologies/downloads/
- Verify: `java --version`

### Issue: "Cannot download dependencies"

**Solution:**
- Network issue or firewall blocking Maven Central
- Try: `mvn clean install -X` (verbose mode to see errors)
- Check internet connection
- Try again later

### Issue: Port 8080 already in use

**Solution:**
- Another process is using port 8080
- Find process: `netstat -ano | findstr :8080` (Windows)
- Kill process: `taskkill /PID [PID] /F`
- Or use different port: `mvn spring-boot:run -Dspring-boot.run.arguments="--server.port=8081"`

### Issue: Database connection error

**Solution:**
- H2 database is in-memory, should work automatically
- Check `application.yml` for database configuration
- Verify H2 console: http://localhost:8080/h2-console

### Issue: "Build failure"

**Solution:**
- Check error message in console
- Run: `mvn clean install` (clear cache first)
- Check Java version: `java -version` (need 17+)
- Check Maven version: `mvn --version` (need 3.6+)

---

## API Endpoints

Once backend is running, test these endpoints:

### Articles
```bash
GET    /api/news                              # All articles
GET    /api/news/{id}                         # Single article
GET    /api/news/search?q=AI                  # Keyword search
GET    /api/news/semantic-search?query=AI     # Semantic search (API endpoint)
GET    /api/news/category/{category}          # Filter by category/topic value
GET    /api/news/sentiment/POSITIVE           # Filter by sentiment
GET    /api/news/{id}/recommendations         # Similar articles
DELETE /api/news/{id}                         # Delete article
```

### Insights
```bash
GET  /api/insights                            # Dashboard data
POST /api/fetch-news                          # Trigger manual fetch
GET  /api/health                              # Health check
```

---

## Running Backend + Frontend Together

### Terminal 1: Backend
```bash
cd C:\Users\kaveesh bhat\Desktop\NewsAgg\backend
mvn spring-boot:run
```

Wait for "Started NewsAggregatorApplication" message.

### Terminal 2: Frontend
```bash
cd C:\Users\kaveesh bhat\Desktop\NewsAgg\frontend
npm run dev
```

Then open: http://localhost:5173

---

## Environment Configuration

### Using Different Profiles

**Development (H2 in-memory):**
```bash
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"
```

**Production (PostgreSQL):**
```bash
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=prod"
```

(Requires PostgreSQL database set up)

### Custom Port

```bash
mvn spring-boot:run -Dspring-boot.run.arguments="--server.port=9090"
```

Then access on: http://localhost:9090

---

## Build Options

### Quick Development Build
```bash
mvn package -DskipTests
```

### Production Build (Optimized)
```bash
mvn clean package -DskipTests -Pproduction
```

### Debug Build
```bash
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=5005"
```

Then connect debugger to port 5005.

---

## Performance Tips

1. **First build takes longer** - Maven downloads ~200MB of dependencies
2. **Subsequent builds are faster** - Dependencies are cached
3. **Skip tests** - Use `-DskipTests` flag for faster builds
4. **Use offline mode** - `mvn spring-boot:run -o` (if dependencies cached)

---

## What Happens When Backend Starts

1. **Spring Boot initializes**
   - Loads `application.yml` configuration
   - Initializes H2 in-memory database

2. **Database schema created**
   - Creates `news_article` table
   - Sets up JPA entities

3. **Articles fetched and processed**
   - `NewsFetcherService` fetches external news when configured (TheNewsAPI token recommended)
   - New articles are AI-processed (summary, sentiment, category, embeddings)

4. **Web server starts**
   - Listens on port 8080
   - Enables REST API endpoints for news, insights, health, and fetch triggers
   - Configures CORS for frontend

5. **Scheduled task configured**
   - Hourly RSS feed fetching (can be disabled)
   - Manual trigger available via API

---

## Troubleshooting Checklist

- [ ] Maven installed? (`mvn --version`)
- [ ] Java 21+ installed? (`java -version`)
- [ ] In backend directory? (`pwd` or `cd backend`)
- [ ] Dependencies downloaded? (First `mvn install` successful?)
- [ ] Build successful? (No errors in console?)
- [ ] Port 8080 free? (Check with `netstat`)
- [ ] Backend running? (See "Started..." message)
- [ ] Can access health endpoint? (http://localhost:8080/api/health)

---

## Next Steps

1. ✅ Install Maven from https://maven.apache.org/download.cgi
2. ✅ Add Maven to system PATH
3. ✅ Run: `mvn clean install` in backend directory
4. ✅ Run: `mvn spring-boot:run` to start backend
5. ✅ Verify: Open http://localhost:8080/api/health
6. ✅ Test frontend: Open http://localhost:5173

---

## Quick Command Summary

```bash
# Navigate to backend
cd C:\Users\kaveesh bhat\Desktop\NewsAgg\backend

# First time setup
mvn clean install

# Start backend
mvn spring-boot:run

# In another terminal, test endpoints
curl http://localhost:8080/api/health
curl http://localhost:8080/api/news?page=0&size=10

# Or open in browser
http://localhost:8080/api/health
http://localhost:8080/h2-console
```

---

## Additional Resources

- **Maven Documentation**: https://maven.apache.org/
- **Spring Boot Documentation**: https://spring.io/projects/spring-boot
- **H2 Database**: https://www.h2database.com/
- **API Testing Tool**: https://www.postman.com/

---

**Once Maven is installed and added to PATH, the backend can be running in < 5 minutes!** 🚀

Good luck! Let me know if you run into any issues.
