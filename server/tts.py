# tts.py
import sys
from gtts import gTTS
import os

text = sys.argv[1]
voice = sys.argv[2]
filename = sys.argv[3]

# Ensure audio directory exists
if not os.path.exists("audios"):
    os.makedirs("audios")

tts = gTTS(text)
tts.save(f"audios/{filename}")
