# Build stage
FROM maven:3.9.6-eclipse-temurin-21 as builder

WORKDIR /app

# Copy pom.xml
COPY pom.xml .

# Copy source code
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre

WORKDIR /app

# Copy the built JAR from builder stage
COPY --from=builder /app/target/*.jar app.jar

# Expose port
EXPOSE 8080

# Set environment variables
ENV SPRING_PROFILES_ACTIVE=prod
ENV SERVER_PORT=8080
ENV SPRING_DATASOURCE_URL=jdbc:h2:mem:testdb
ENV SPRING_JPA_DATABASE_PLATFORM=org.hibernate.dialect.H2Dialect

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
