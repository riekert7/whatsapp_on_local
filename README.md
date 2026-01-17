# WhatsApp Web Service

Simple WhatsApp webhook service for sending messages via WhatsApp Web.

## Quick Start

### Docker (Recommended)

```bash
docker-compose up -d
docker-compose logs -f  # Scan QR code with your phone
```

### Local

```bash
npm install
npm start  # Scan QR code when it appears
```

## API

### Send Message

```
POST /webhook/send
Content-Type: application/json

{
  "phoneNumber": "1234567890",
  "message": "Hello!",
  "imageBase64": "..."  // Optional
}
```

### Health Check

```
GET /health
```

## Usage with n8n

Transform your data in n8n and send to:
```
http://host.docker.internal:3000/webhook/send
```

Body:
```json
{
  "phoneNumber": "{{ $json.phoneNumber }}",
  "message": "{{ $json.message }}",
  "imageBase64": "{{ $json.imageBase64 }}"
}
```

## Phone Number Format

Use country code + number (no spaces): `1234567890`
