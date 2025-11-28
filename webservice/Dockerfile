# builder stage: use Gradle image to build the Spring Boot jar
FROM gradle:8.4-jdk21 AS builder
WORKDIR /home/gradle/project
COPY --chown=gradle:gradle . .
# ensure gradlew is executable and strip CRLF if present, then run it with bash to avoid shebang/permission issues
RUN sed -i 's/\r$//' ./gradlew || true \
  && chmod +x ./gradlew \
  && bash ./gradlew clean bootJar -x test --no-daemon

# runtime stage: small JRE image to run the produced jar
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=builder /home/gradle/project/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
