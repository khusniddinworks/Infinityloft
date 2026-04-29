import os
import time
from datetime import datetime, timezone, timedelta
import threading
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# SECURITY FIX: Restrict CORS to known origins
# Add your production domain to the list below
ALLOWED_ORIGINS = [
    "https://infinityloft.uz",
    "https://khusniddinworks.github.io",
    "https://ki770.github.io",
    "http://localhost:5500", 
    "http://127.0.0.1:5500"
]

CORS(app, resources={r"/api/*": {"origins": ALLOWED_ORIGINS}})

# Telegram Config
BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
CHAT_ID_ENV = os.getenv("TELEGRAM_CHAT_ID")
CHAT_IDS = [cid.strip() for cid in CHAT_ID_ENV.split(",")] if CHAT_ID_ENV else []
APP_URL = os.getenv("APP_URL")
RECAPTCHA_SECRET = os.getenv("RECAPTCHA_SECRET")

@app.after_request
def add_security_headers(response):
    response.headers['X-Frame-Options'] = 'SAMEORIGIN'
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    # Content Security Policy - tailored for this app
    csp = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' https://api.telegram.org https://infinityloft.onrender.com https://unpkg.com https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "img-src 'self' data: https:; "
        "font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com; "
        "connect-src 'self' https://infinityloft.onrender.com; "
        "frame-src 'self' https://www.google.com https://maps.google.com https://sketchfab.com https://www.google.com/recaptcha/;"
    )
    response.headers['Content-Security-Policy'] = csp
    return response

def verify_recaptcha(token):
    if not RECAPTCHA_SECRET:
        return True # Skip if not configured
    try:
        res = requests.post(
            'https://www.google.com/recaptcha/api/siteverify',
            data={'secret': RECAPTCHA_SECRET, 'response': token},
            timeout=10
        )
        return res.json().get('success', False)
    except:
        return False

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "active",
        "service": "Infinity Loft Telegram Bot API",
        "bot_configured": bool(BOT_TOKEN and CHAT_IDS)
    })

# SEO SERVICE ROUTES (Returning success to allow frontend to handle or for crawlers)
@app.route("/surma-eshiklar")
@app.route("/garmoshka-eshiklar")
@app.route("/shisha-peregorodkalar")
def service_routes():
    # In a real setup, this might serve a specialized template or index.html
    return "Infinity Loft Services", 200

@app.route("/api/contact", methods=["POST"])
def contact():
    data = request.json
    if not data:
        return jsonify({"success": False, "message": "No data received"}), 400

    name = data.get("name", "").strip()
    phone = data.get("phone", "").strip()
    service = data.get("service", "").strip()
    message = data.get("message", "").strip()

    # RECAPTCHA VALIDATION
    recaptcha_token = data.get("recaptcha_token")
    if not verify_recaptcha(recaptcha_token):
        return jsonify({"success": False, "message": "Bot protection triggered"}), 403

    # VALIDATION: Check for required fields and length limits
    if not name or not phone:
        return jsonify({"success": False, "message": "Name and phone are required"}), 400
    
    if len(message) > 1500:
        message = message[:1500] + "..."

    # Escape HTML special characters
    def escape_html(text):
        if not text: return ""
        return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

    safe_name = escape_html(name)
    safe_phone = escape_html(phone)
    safe_service = escape_html(service)
    safe_message = escape_html(message if message else "Xabar yo'q")

    bot_msg = (
        f"🛡️ <b>INFINITY LOFT — YANGI BUYURTMA</b>\n\n"
        f"👤 <b>Mijoz:</b> {safe_name}\n"
        f"📞 <b>Telefon:</b> {safe_phone}\n"
        f"📐 <b>Xizmat:</b> {safe_service}\n"
        f"💬 <b>Xabar:</b> {safe_message}\n\n"
        f"🕒 <b>Vaqt:</b> {datetime.now(timezone(timedelta(hours=5))).strftime('%Y-%m-%d %H:%M:%S')}"
    )

    try:
        if not BOT_TOKEN or not CHAT_IDS:
            app.logger.error("BOT_TOKEN yoki CHAT_ID topilmadi!")
            return jsonify({"success": False, "message": "Bot configuration error"}), 500

        url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
        
        for chat_id in CHAT_IDS:
            payload = {
                "chat_id": chat_id,
                "text": bot_msg,
                "parse_mode": "HTML"
            }
            try:
                response = requests.post(url, json=payload, timeout=15)
                response.raise_for_status()
            except Exception as e:
                app.logger.error(f"TELEGRAM XATO (chat_id={chat_id}): {str(e)}")
        
        return jsonify({"success": True, "message": "Sent to Telegram"})
    except Exception as e:
        app.logger.error(f"TELEGRAM XATO: {str(e)}")
        return jsonify({"success": False, "message": "Server Error"}), 500

# ========== SELF-PING (Render keeps awake) ==========
def keep_awake():
    if not APP_URL:
        return

    while True:
        time.sleep(14 * 60) # Ping every 14 minutes
        try:
            requests.get(APP_URL, timeout=10)
        except:
            pass

# Start keep_awake regardless of __main__ for Gunicorn support
if APP_URL:
    threading.Thread(target=keep_awake, daemon=True).start()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 3000))
    app.run(host="0.0.0.0", port=port)
