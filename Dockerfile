# Build Stage (Backend + Frontend)
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Copy the entire project
COPY . .

# Set memory limits for Maven to prevent Railway from killing the build
ENV MAVEN_OPTS="-Xmx384m -XX:MaxMetaspaceSize=256m"

# Build the project (This will trigger frontend-maven-plugin automatically)
RUN mvn clean package -DskipTests

# Run Stage
FROM eclipse-temurin:17-jdk-jammy
WORKDIR /app

# Copy the JAR from the build stage
COPY --from=build /app/target/svmps-0.0.1-SNAPSHOT.jar app.jar

# Install fontconfig and fonts (CRITICAL for JasperReports on Linux)
RUN apt-get update && apt-get install -y \
    libfontconfig1 \
    fontconfig \
    fontconfig-config \
    fonts-dejavu-core \
    && rm -rf /var/lib/apt/lists/*

# Expose the port (Railway uses PORT env var)
EXPOSE 8080

# Start the application with optimized memory limits
# We use sh -c to ensure environment variables like ${PORT} are evaluated
ENTRYPOINT ["sh", "-c", "java -Xms128m -Xmx384m -XX:MaxMetaspaceSize=128m -jar app.jar --server.port=${PORT:-8080}"]
