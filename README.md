# 📞 AI Phone Assistant

An AI-powered phone switchboard assistant designed to handle business or personal calls with intelligent, natural conversations. Runs locally with support for offline models like GPT4All and Whisper.

---

## 🚀 Features

- ✅ Local LLM via GPT4All
- ✅ Speech-to-text using Whisper
- ✅ Text-to-speech (TTS) via Coqui.ai or ElevenLabs
- ✅ Real-time conversation engine
- ✅ Pluggable phone system integration (e.g., Twilio or Sora)

---

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/ai-phone_assistant.git
cd ai-phone_assistant

### 2. Set up a virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

### 3. Install required packages
pip install -r requirements.txt

### 4. Add a .env file in the root directory
Create a .env file with the following:
# GPT4All Model
MODEL_PATH=models/mistral.gguf

# Whisper STT model
WHISPER_MODEL=base

# Text-to-Speech
ELEVENLABS_API_KEY=your-elevenlabs-key
COQUI_API_KEY=your-coqui-key

# Twilio or Sora (if using phone system)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+123456789

# Application config
PORT=8000

### 5. Run the application

uvicorn main:app --reload

## 📁 Project Structure

ai-phone_assistant/
├── main.py                # FastAPI or core server logic
├── speech/
│   ├── transcribe.py      # Handles Whisper speech-to-text
│   └── synthesize.py      # Handles TTS with Coqui or ElevenLabs
├── ai/
│   └── chat_engine.py     # GPT4All inference logic
├── phone/
│   └── call_handler.py    # Telephony logic (Twilio/Sora integration)
├── .env                   # Secret keys and config (not committed)
├── requirements.txt       # Python dependencies
└── README.md              # You're here

## 🧪 Example API Test

curl http://localhost:8000/ask \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"query": "Hello"}'

## S☎️ Phone System Integration
If you're using Twilio:

Configure your Twilio number webhook to hit:
http://your-server.com/incoming-call
Implement logic in call_handler.py to handle TwiML or webhook events.

If you're using Sora (or similar), update the webhook logic accordingly.

