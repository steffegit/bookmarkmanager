# Stage 1: Download dependencies (cached as long as build files don't change)
FROM gradle:jdk21 AS deps

WORKDIR /home/gradle/src

COPY --chown=gradle:gradle gradle gradle
COPY --chown=gradle:gradle build.gradle.kts settings.gradle.kts gradle.properties ./
COPY --chown=gradle:gradle server/build.gradle.kts server/

RUN --mount=type=cache,target=/home/gradle/.gradle,uid=1000,gid=1000 \
    gradle :server:dependencies --no-daemon --quiet

# Stage 2: Build the fat JAR
FROM deps AS build

COPY --chown=gradle:gradle server/src server/src

RUN --mount=type=cache,target=/home/gradle/.gradle,uid=1000,gid=1000 \
    gradle :server:buildFatJar --no-daemon --quiet

# Stage 3: Minimal runtime image
FROM eclipse-temurin:21-jre AS runtime

WORKDIR /app
EXPOSE 8080

COPY --from=build /home/gradle/src/server/build/libs/fat.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]
