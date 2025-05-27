import pyttsx3
import uuid
import os

def text_to_speech(text):
    engine = pyttsx3.init()
    filename = f"temp/{uuid.uuid4()}.wav"
    engine.save_to_file(text, filename)
    engine.runAndWait()
    return filename
