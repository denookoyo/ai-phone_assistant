# 📞 AI Phone Assistant

An AI-powered phone switchboard assistant designed to handle business or personal calls with intelligent, natural conversations. Runs locally with support for Whisper STT and OpenAI GPT models, with optional TTS and phone system integration.

---

## 🚀 Features

- ✅ OpenAI GPT-powered conversation engine
- ✅ Speech-to-text using Whisper
- ✅ Text-to-speech (TTS) via Coqui.ai or ElevenLabs
- ✅ Real-time dialogue engine
- ✅ Pluggable phone system integration (e.g., Twilio or Sora)

---

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/ai-phone_assistant.git
cd ai-phone_assistant
```

### 2. Set up a virtual environment

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install required packages

```bash
pip install -r requirements.txt
```

### 4. Add a `.env` file in the root directory

```env
# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Whisper STT model
WHISPER_MODEL=base

# Text-to-Speech
ELEVENLABS_API_KEY=your-elevenlabs-key
COQUI_API_KEY=your-coqui-key

# Twilio or Sora (optional)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+123456789

# Application config
PORT=8000
```

### 5. Run the application

```bash
uvicorn main:app --reload
```

---

## 📁 Project Structure

```
ai-phone_assistant/
├── main.py                # FastAPI or core server logic
├── speech/
│   ├── transcribe.py      # Handles Whisper speech-to-text
│   └── synthesize.py      # Handles TTS with Coqui or ElevenLabs
├── ai/
│   └── conversation.py    # GPT-based chat response logic
├── phone/
│   └── call_handler.py    # Telephony logic (Twilio/Sora integration)
├── .env                   # Secret keys and config (not committed)
├── requirements.txt       # Python dependencies
└── README.md              # You're here
```

---

## 🧪 Example API Test

```bash
curl http://localhost:8000/ask \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"query": "Hello"}'
```

---

## ☎️ Phone System Integration

**Using Twilio:**

- Set your Twilio number webhook to:
  ```
  http://your-server.com/incoming-call
  ```
- Implement TwiML or webhook handling logic in `call_handler.py`.

**Using Sora:**

- Configure your webhook and audio stream settings to point to your server endpoint.
- Adapt `call_handler.py` to match Sora's integration model.

---

## ✅ Status

- ✅ Whisper + OpenAI chat loop functional
- ✅ TTS services integrated
- ✅ `.env` file support added
- 🚧 Phone integration (Twilio/Sora) in progress
- 🔜 Conversation memory + logging planned