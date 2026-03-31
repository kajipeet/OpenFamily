# OpenFamily

OpenFamily — self-hosted чат и видеозвонки на стеке Go + Gin + MongoDB + Nuxt + Tailwind.

## Что реализовано

- JWT авторизация
- админ создаёт и удаляет пользователей
- поиск пользователей по тегу
- 1:1 чаты, unread/read + автоудаление через 3 минуты после прочтения
- WebSocket для realtime событий (сообщения, typing, read, сигналы звонков)
- отправка файлов, голосовых, изображений, видео
- TURN (coturn) для WebRTC
- инфраструктура через Docker Compose
- certbot контейнер для выпуска/автообновления сертификатов

## Ключевой security-апдейт: E2EE для сообщений и файлов

Сообщения и файлы теперь шифруются на клиенте до отправки.

### Как работает E2EE

1. Клиент генерирует пару ключей ECDH P-256 локально (в браузере).
2. На сервер отправляется только публичный ключ пользователя (`/api/users/me/e2ee-key`).
3. Для конкретного 1:1 чата клиент выводит общий ключ через ECDH + HKDF (salt = chat_id).
4. Текст шифруется AES-256-GCM (`content` + `nonce`).
5. Файл шифруется AES-256-GCM на клиенте, затем на сервер уходит уже шифротекст.
6. Сервер хранит и отдаёт только шифротекст; расшифровки на сервере нет.

### Что это даёт при компрометации сервера

- По содержимому переписки и файлам сервер (и провайдер) не видит plaintext.
- В базе/хранилище остаются только шифротексты и nonce.
- Компрометация сервера не даёт автоматически доступ к содержимому старых сообщений/файлов.

### Что остаётся видимым (метаданные)

- кто с кем общается (участники чата)
- размер файлов
- время отправки/прочтения
- тип сообщения

Это стандартное ограничение большинства E2EE-систем без отдельной metadata-hiding архитектуры.

### Важные ограничения модели угроз

- Если скомпрометирован клиент (браузер/устройство), E2EE не спасает.
- Публичные ключи сейчас по модели TOFU (trust on first use). Для защиты от MITM на первом контакте рекомендуется добавить проверку fingerprint ключей между пользователями.

## Большие файлы: архитектура загрузки

Добавлен chunked upload API для больших файлов:

- `POST /api/upload/init` — открыть upload-сессию
- `PUT /api/upload/:upload_id/parts/:part` — загрузить кусок
- `POST /api/upload/:upload_id/complete` — собрать файл

Параметры задаются через env:

- `MAX_UPLOAD_BYTES` (по умолчанию 10 GiB)
- `UPLOAD_CHUNK_SIZE` (по умолчанию 8 MiB)

Фронтенд шифрует файл, затем отправляет его чанками.

## Быстрый старт

1. Скопировать env:

```bash
cp .env.example .env
```

2. Запустить:

```bash
docker compose up -d --build
```

3. Открыть приложение на порту из `.env` (`HTTP_PORT`/`HTTPS_PORT`).

## Certbot в Compose

В `docker-compose.yml` добавлен сервис `certbot`.

### Подготовка

- В `.env` задать:
	- `CERTBOT_DOMAIN=your.domain`
	- `CERTBOT_EMAIL=you@example.com`

### Первичный выпуск сертификата

После старта nginx:

```bash
docker compose run --rm certbot certonly \
	--webroot -w /var/www/certbot \
	-d "$CERTBOT_DOMAIN" \
	--email "$CERTBOT_EMAIL" \
	--agree-tos --no-eff-email
```

Далее экспортировать сертификаты в `nginx/ssl`:

```bash
docker compose run --rm certbot sh -c '
	cp /etc/letsencrypt/live/$CERTBOT_DOMAIN/fullchain.pem /exported-certs/fullchain.pem &&
	cp /etc/letsencrypt/live/$CERTBOT_DOMAIN/privkey.pem /exported-certs/privkey.pem
'
```

Перезапустить nginx:

```bash
docker compose restart nginx
```

### Автопродление

Сервис `certbot` периодически выполняет `certbot renew` и через deploy-hook обновляет `nginx/ssl/fullchain.pem` и `nginx/ssl/privkey.pem`.

Рекомендуется после продления перезагружать nginx:

```bash
docker compose restart nginx
```

## Структура сервисов

- `mongodb` — база
- `backend` — Gin API + WebSocket
- `frontend` — Nuxt приложение
- `nginx` — reverse proxy, TLS, ACME challenge
- `coturn` — TURN для звонков
- `certbot` — выпуск/продление сертификатов

## Примечание по локальной разработке

Если валидных сертификатов ещё нет, nginx поднимется с временным self-signed сертификатом.