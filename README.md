# Руководство по использованию сервиса интеграции с AmoCRM

Это руководство предоставляет подробные инструкции по использованию сервиса интеграции с AmoCRM. Сервис позволяет получать доступ к интеграции и выполнять автоматическое обновление данных в AmoCRM или создание новых контактов и сделок на основе GET-запросов с номером телефона, адресом электронной почты и именем в качестве параметров запроса. Пожалуйста, следуйте указанным ниже шагам для успешного использования этого сервиса.

## Требования к окружению

- Node.js версии 12 и выше установлен на вашем компьютере.
- MongoDB установлен и настроен.

## Установка и Запуск

1. Скачайте репозиторий с помощью следующей команды:

```bash
  git clone <URL репозитория>
```
   
2. Перейдите в директорию проекта:
```
  cd <название-папки-с-сервисом>
```
3. Установите зависимости:
```
  npm install
```
4. Создайте файл .env в корневой директории проекта и установите следующие переменные окружения:
```
  MONGO_URL=здесь_ваш_сервер_MongoDB
  CLIENT_SECRET=здесь_ваш_секретный_ключ_к_интеграции
  CLIENT_ID=здесь_ваш_идентификатор_интеграции
  SERVER_URL=здесь_ваш_публичный_адрес_Ngrok
```
Замените `здесь_ваш_сервер_MongoDB`, `здесь_ваш_секретный_ключ_к_интеграции`, `здесь_ваш_идентификатор_интеграции` и `здесь_ваш_публичный_адрес_Ngrok` на фактические значения.

5. Выполните сборку проекта:

```
  npm run build
```

6. Перейдите по ссылке:

```
https://www.amocrm.ru/oauth?client_id={client_id}&state={state}&mode=post_message
```
## Запуск с помощью Docker Compose

  Для использования этого проекта необходимо иметь Docker установленным на вашем компьютере. Если Docker ещё не установлен, вы можете скачать его с [официального сайта Docker](https://www.docker.com/get-started).

1. Скачайте файл `docker-compose.yml` из данного репозитория, нажав на кнопку "Download" или используя команду:

```
  git clone <URL репозитория>
```

2. Откройте терминал и перейдите в директорию, где находится скачанный файл `docker-compose.yml`.
   
3. Установите зависимости в файле `docker-compose.yml`.
   
```
  MONGO_URL=здесь_ваш_сервер_MongoDB
  CLIENT_SECRET=здесь_ваш_секретный_ключ_к_интеграции
  CLIENT_ID=здесь_ваш_идентификатор_интеграции
  SERVER_URL=здесь_ваш_публичный_адрес_Ngrok
```

4. Запустите проект с помощью команды:
```
  docker-compose up
```
Это действие запустит сборку сервиса соответствии с настройками в файле `docker-compose.yml`.

## Использование сервиса

Теперь, когда вы установили и настроили сервис, вы можете начать использовать его для обновления данных в AmoCRM и создания новых контактов и сделок.

### Обновление данных в AmoCRM

1. Выполните GET-запрос к сервису с параметрами запроса:
   
```
{SERVER_URL}/?name={name}&email={email}&phone={phone}
```
Замените `{SERVER_URL}`, `{name}`, `{email}` и `{phone}` на соответствующие значения.

## Требования к безопасности

Храните файл .env в безопасном месте и не делитесь им с посторонними.
