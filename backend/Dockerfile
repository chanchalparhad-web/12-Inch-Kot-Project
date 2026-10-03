# Build Stage
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

# Run Stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
RUN mkdir -p /app/data
COPY --from=build /app/target/*.jar app.jar
ENV PORT=8080
ENV SPRING_DATASOURCE_URL=jdbc:sqlite:/app/data/billpro.db
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
