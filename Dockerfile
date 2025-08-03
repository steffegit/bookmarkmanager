FROM gradle:latest AS build

WORKDIR /home/gradle/src

# Copy build files first for dependency caching
COPY --chown=gradle:gradle build.gradle.kts settings.gradle.kts gradle.properties ./
COPY --chown=gradle:gradle gradle ./gradle
COPY --chown=gradle:gradle server/build.gradle.kts ./server/

# Download dependencies (this layer will be cached)
RUN gradle :server:dependencies --no-daemon

# Copy source code
COPY --chown=gradle:gradle server/src ./server/src

# Build the application
RUN gradle :server:buildFatJar --no-daemon

# Stage 2: Create the Runtime Image
FROM amazoncorretto:24-jdk AS runtime
EXPOSE 8080
RUN mkdir /app
COPY --from=build /home/gradle/src/server/build/libs/*.jar /app/bookmarkmanager.jar
ENTRYPOINT ["java","-jar","/app/bookmarkmanager.jar"]