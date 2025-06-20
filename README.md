# 📝 ToDo List Application
## 🛠 Stack
- **Backend**: Spring Boot 3, Java 17
- **Frontend**: Vanilla JS, HTML5, CSS3
- **База данных**: PostgreSQL 12+
- **Сборка**: Maven 3.6+

## ⚙️ Установка и настройка


### 1. Установка JDK 17
```bash
# Windows:
# Скачайте с официального сайта:
# https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html

# Linux (Ubuntu/Debian):
sudo apt update && sudo apt install -y openjdk-17-jdk

# MacOS:
brew install openjdk@17
```

### 2. Настройка базы данных PostgreSQL
Установите PostgreSQL (если не установлен).

Создайте базу данных и замените подходящие данные в файле
src/main/resources/application.properties:

spring.datasource.url=jdbc:postgresql://localhost:5432/your_db_name

spring.datasource.username=your_username

spring.datasource.password=your_password

### 3. Запуск проекта

Соберите проект:
./mvnw clean install или mvn clean install

Запустите приложение:
./mvnw spring-boot:run или mvn spring-boot:run
