"""
CropSmart Telegram Bot — Daily Farm Activity Notifier
=====================================================
- Farmers link their Telegram account by sharing their contact via /start.
- Every day at a configured time, the bot sends today's calendar tasks to each
  linked farmer.
- After sending tasks, it asks the farmer to upload a crop progress photo.
- Photos are stored locally under  ml_model/crop_photos/<phone>/<date>.jpg
  for future growth-detection features.

Run standalone:
    python telegram_bot.py

Or import and call  start_bot()  from another module.

Requires:
    pip install python-telegram-bot[job-queue]   (v20+)
"""

import asyncio
import json
import logging
import os
import sqlite3
from datetime import datetime, time as dtime

from telegram import (
    KeyboardButton,
    ReplyKeyboardMarkup,
    ReplyKeyboardRemove,
    Update,
)
from telegram.ext import (
    Application,
    CommandHandler,
    ContextTypes,
    MessageHandler,
    filters,
)

try:
    from deep_translator import GoogleTranslator

    HAS_TRANSLATOR = True
except ImportError:
    HAS_TRANSLATOR = False

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    format="%(asctime)s [%(name)s] %(levelname)s — %(message)s", level=logging.INFO
)
logger = logging.getLogger("cropsmart_bot")

# ---------------------------------------------------------------------------
# Config (loaded from .env next to this file)
# ---------------------------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PHOTO_DIR = os.path.join(BASE_DIR, "crop_photos")
DB_PATH = os.path.join(BASE_DIR, "farmers.db")


def _load_env():
    """Reuse the same .env loader as app.py"""
    env_path = os.path.join(BASE_DIR, ".env")
    if not os.path.exists(env_path):
        return
    with open(env_path, "r", encoding="utf-8") as f:
        for raw in f:
            line = raw.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            if key and (key not in os.environ or not os.environ.get(key)):
                os.environ[key] = value


_load_env()

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
# Time to send daily digest (24-hr, IST → converted to UTC internally)
DAILY_NOTIFY_HOUR = int(os.getenv("DAILY_NOTIFY_HOUR", "7"))  # 7 AM
DAILY_NOTIFY_MINUTE = int(os.getenv("DAILY_NOTIFY_MINUTE", "0"))

if not TELEGRAM_BOT_TOKEN:
    raise RuntimeError("TELEGRAM_BOT_TOKEN is missing from .env")

# ---------------------------------------------------------------------------
# Database helpers
# ---------------------------------------------------------------------------


def _get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def _ensure_telegram_table():
    """Create the mapping table if it doesn't exist."""
    conn = _get_conn()
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS telegram_links (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            phone TEXT NOT NULL UNIQUE,
            chat_id INTEGER NOT NULL,
            farmer_name TEXT,
            linked_at TEXT NOT NULL
        )
        """
    )
    conn.commit()
    conn.close()


def _link_farmer(phone: str, chat_id: int, name: str | None = None):
    """Link a farmer's phone to a Telegram chat_id."""
    conn = _get_conn()
    conn.execute(
        """
        INSERT INTO telegram_links (phone, chat_id, farmer_name, linked_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(phone) DO UPDATE SET chat_id=excluded.chat_id, farmer_name=excluded.farmer_name, linked_at=excluded.linked_at
        """,
        (phone, chat_id, name, datetime.now().isoformat()),
    )
    conn.commit()
    conn.close()


def _get_all_linked_farmers():
    """Return all farmers who have linked their Telegram."""
    conn = _get_conn()
    rows = conn.execute(
        "SELECT phone, chat_id, farmer_name, preferred_language FROM telegram_links"
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def _get_todays_tasks(phone: str):
    """Fetch today's tasks from the cultivation_plans table for this farmer."""
    today = datetime.now().strftime("%Y-%m-%d")
    conn = _get_conn()
    rows = conn.execute(
        "SELECT crop, schedule_json FROM cultivation_plans WHERE phone = ? AND start_date <= ? AND end_date >= ?",
        (phone, today, today),
    ).fetchall()
    conn.close()

    all_tasks = []
    for row in rows:
        crop = row["crop"]
        schedule = json.loads(row["schedule_json"]) if row["schedule_json"] else []
        for day in schedule:
            if day.get("date") == today:
                for task in day.get("tasks", []):
                    all_tasks.append({**task, "crop": crop})
    return all_tasks


def _get_farmer_language(phone: str) -> str:
    """Return the preferred language code for a farmer, default 'en'."""
    conn = _get_conn()
    try:
        row = conn.execute(
            "SELECT preferred_language FROM telegram_links WHERE phone = ?", (phone,)
        ).fetchone()
        return (row["preferred_language"] or "en") if row else "en"
    except Exception:
        return "en"
    finally:
        conn.close()


def _translate(text: str, target_lang: str) -> str:
    """Translate text to target language. Returns original if translation fails or lang is 'en'."""
    if not HAS_TRANSLATOR or not target_lang or target_lang == "en":
        return text
    try:
        translated = GoogleTranslator(source="en", target=target_lang).translate(text)
        return translated or text
    except Exception as e:
        logger.warning("Translation to '%s' failed: %s", target_lang, e)
        return text


# ---------------------------------------------------------------------------
# Emoji map for task types
# ---------------------------------------------------------------------------
TASK_EMOJI = {
    "Watering": "💧",
    "Fertilizing": "🌿",
    "Inspection": "🔍",
    "Pest Control": "🐛",
    "Soil Testing": "🧪",
}


def _format_task_message(farmer_name: str | None, tasks: list[dict]) -> str:
    """Build a pretty daily digest message."""
    today_str = datetime.now().strftime("%A, %B %d, %Y")
    greeting = f"🌾 Good morning{', ' + farmer_name if farmer_name else ''}!"
    header = f"{greeting}\n📅 Today's Farm Tasks — {today_str}\n"

    if not tasks:
        return header + "\n✅ No tasks scheduled for today. Enjoy your day! 🎉"

    lines = []
    for t in tasks:
        emoji = TASK_EMOJI.get(t.get("type", ""), "📋")
        crop = t.get("crop", "")
        title = t.get("title", t.get("type", "Task"))
        desc = t.get("description", "")
        lines.append(f"{emoji} {title} [{crop}]\n   {desc}")

    body = "\n\n".join(lines)
    footer = "\n\n📸 Please send a photo of your crop progress today!\nThis helps us track growth and detect issues early."
    return header + "\n" + body + footer


# ---------------------------------------------------------------------------
# Bot command / message handlers
# ---------------------------------------------------------------------------


async def cmd_start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /start — ask farmer to share their phone number (only if not already linked)."""
    chat_id = update.message.chat_id

    # Check if this chat is already linked
    conn = _get_conn()
    link = conn.execute(
        "SELECT phone, farmer_name FROM telegram_links WHERE chat_id = ?", (chat_id,)
    ).fetchone()
    conn.close()

    if link:
        name = link["farmer_name"] or "Farmer"
        await update.message.reply_text(
            f"🌾 Welcome back, {name}!\n\n"
            f"Your phone ({link['phone']}) is already linked. ✅\n\n"
            f"Use /today to see today's tasks or send a 📸 crop photo anytime.\n"
            f"Type /help for all commands.",
            reply_markup=ReplyKeyboardRemove(),
        )
        return

    contact_button = KeyboardButton("📱 Share My Phone Number", request_contact=True)
    markup = ReplyKeyboardMarkup(
        [[contact_button]], one_time_keyboard=True, resize_keyboard=True
    )
    await update.message.reply_text(
        "🌾 Welcome to CropSmart Advisor!\n\n"
        "I'll send you daily farming activity reminders from your cultivation calendar.\n\n"
        "To get started, share your phone number using the button below.\n\n"
        "Or type: /link <your 10-digit phone>\nExample: /link 7411328409",
        reply_markup=markup,
    )


async def _do_link(update: Update, phone: str, chat_id: int, name: str | None):
    """Shared logic to link a farmer phone to Telegram chat."""
    # Check if farmer exists in the main farmers table
    conn = _get_conn()
    farmer = conn.execute(
        "SELECT name FROM farmers WHERE phone = ?", (phone,)
    ).fetchone()
    conn.close()

    if not farmer:
        await update.message.reply_text(
            f"⚠️ No CropSmart account found for phone {phone}.\n"
            "Please register on the CropSmart app first, then come back and /start again.",
            reply_markup=ReplyKeyboardRemove(),
        )
        return

    farmer_name = farmer["name"] if farmer else name
    _link_farmer(phone, chat_id, farmer_name)

    await update.message.reply_text(
        f"✅ Linked successfully!\n\n"
        f"Hello {farmer_name}! 🎉\n"
        f"Phone: {phone}\n\n"
        f"You'll now receive daily farming activity reminders every morning at {DAILY_NOTIFY_HOUR}:00 AM.\n\n"
        f"You can also send me a 📸 crop photo anytime to log your progress!",
        reply_markup=ReplyKeyboardRemove(),
    )
    logger.info("Linked farmer %s (chat_id=%s, phone=%s)", farmer_name, chat_id, phone)


async def cmd_link(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /link <phone> — manually link a phone number."""
    if not context.args or len(context.args) < 1:
        await update.message.reply_text(
            "Usage: /link <your 10-digit phone number>\nExample: /link 7411328409"
        )
        return

    phone = "".join(ch for ch in context.args[0] if ch.isdigit())
    if len(phone) > 10:
        phone = phone[-10:]
    if len(phone) != 10:
        await update.message.reply_text(
            "❌ Please enter a valid 10-digit phone number.\nExample: /link 7411328409"
        )
        return

    chat_id = update.message.chat_id
    name = update.message.from_user.first_name or None
    await _do_link(update, phone, chat_id, name)


async def handle_contact(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """When the farmer shares their contact, link their phone → chat_id."""
    contact = update.message.contact
    if not contact or not contact.phone_number:
        await update.message.reply_text(
            "❌ Could not read your phone number. Please try again with /start"
        )
        return

    phone = contact.phone_number.replace("+", "").replace(" ", "")
    logger.info("Contact shared — raw phone: %s", phone)
    # Strip country code (keep last 10 digits for Indian numbers)
    if len(phone) > 10:
        phone = phone[-10:]
    logger.info("Normalized phone: %s", phone)

    chat_id = update.message.chat_id
    name = contact.first_name or update.message.from_user.first_name or None

    await _do_link(update, phone, chat_id, name)


async def handle_photo(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Save crop progress photos from farmers."""
    chat_id = update.message.chat_id

    # Find which farmer this chat belongs to
    conn = _get_conn()
    link = conn.execute(
        "SELECT phone, farmer_name FROM telegram_links WHERE chat_id = ?", (chat_id,)
    ).fetchone()
    conn.close()

    if not link:
        await update.message.reply_text(
            "❌ Your account is not linked yet. Please use /start to link your phone number first."
        )
        return

    phone = link["phone"]
    farmer_name = link["farmer_name"] or "Farmer"
    today = datetime.now().strftime("%Y-%m-%d")
    timestamp = datetime.now().strftime("%H%M%S")

    # Create photo directory
    phone_dir = os.path.join(PHOTO_DIR, phone)
    os.makedirs(phone_dir, exist_ok=True)

    # Get the highest resolution photo
    photo = update.message.photo[-1]
    file = await context.bot.get_file(photo.file_id)
    filename = f"{today}_{timestamp}.jpg"
    filepath = os.path.join(phone_dir, filename)
    await file.download_to_drive(filepath)

    # Save metadata to DB so the calendar can display the photo
    conn = _get_conn()
    conn.execute(
        "INSERT INTO crop_photos (phone, date, filename, created_at) VALUES (?, ?, ?, ?)",
        (phone, today, filename, datetime.now().isoformat()),
    )
    conn.commit()
    conn.close()

    await update.message.reply_text(
        f"✅ *Photo saved!* 📸\n\n"
        f"Thank you, *{farmer_name}*! Your crop progress photo for *{today}* has been recorded.\n"
        f"Keep sending daily photos so we can track your crop's growth! 🌱",
        parse_mode="Markdown",
    )
    logger.info("Saved crop photo for %s: %s", phone, filepath)


async def cmd_today(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /today — show today's tasks on demand."""
    chat_id = update.message.chat_id
    conn = _get_conn()
    link = conn.execute(
        "SELECT phone, farmer_name FROM telegram_links WHERE chat_id = ?", (chat_id,)
    ).fetchone()
    conn.close()

    if not link:
        await update.message.reply_text("❌ Not linked yet. Use /start first.")
        return

    tasks = _get_todays_tasks(link["phone"])
    msg = _format_task_message(link["farmer_name"], tasks)
    lang = _get_farmer_language(link["phone"])
    msg = _translate(msg, lang)
    await update.message.reply_text(msg)


async def cmd_send(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /send — trigger the daily digest notification immediately."""
    await daily_notification_job(context)
    await update.message.reply_text("✅ Daily digest sent to all linked farmers!")


async def cmd_help(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /help — show available commands."""
    await update.message.reply_text(
        "🌾 CropSmart Bot Commands\n\n"
        "/start — Link your phone number (share contact)\n"
        "/link <phone> — Link manually (e.g. /link 7411328409)\n"
        "/today — See today's farming tasks\n"
        "/send — Trigger daily digest now\n"
        "/help — Show this help message\n\n"
        "📸 Send a photo anytime to log crop progress!",
    )


# ---------------------------------------------------------------------------
# Scheduled daily notification job
# ---------------------------------------------------------------------------


async def daily_notification_job(context: ContextTypes.DEFAULT_TYPE):
    """Runs daily — sends today's tasks to every linked farmer."""
    logger.info("⏰ Running daily notification job...")
    farmers = _get_all_linked_farmers()

    sent = 0
    for farmer in farmers:
        phone = farmer["phone"]
        chat_id = farmer["chat_id"]
        name = farmer.get("farmer_name")
        lang = farmer.get("preferred_language") or "en"

        tasks = _get_todays_tasks(phone)
        msg = _format_task_message(name, tasks)
        msg = _translate(msg, lang)

        try:
            await context.bot.send_message(chat_id=chat_id, text=msg)
            sent += 1
        except Exception as e:
            logger.error("Failed to send to %s (chat_id=%s): %s", phone, chat_id, e)

    logger.info("✅ Daily notifications sent to %d / %d farmers", sent, len(farmers))


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def start_bot():
    """Build and run the Telegram bot with daily scheduled notifications."""
    _ensure_telegram_table()
    os.makedirs(PHOTO_DIR, exist_ok=True)

    app = Application.builder().token(TELEGRAM_BOT_TOKEN).build()

    # Command handlers
    app.add_handler(CommandHandler("start", cmd_start))
    app.add_handler(CommandHandler("link", cmd_link))
    app.add_handler(CommandHandler("today", cmd_today))
    app.add_handler(CommandHandler("send", cmd_send))
    app.add_handler(CommandHandler("help", cmd_help))

    # Contact sharing handler (for phone linking)
    app.add_handler(MessageHandler(filters.CONTACT, handle_contact))

    # Photo handler (crop progress)
    app.add_handler(MessageHandler(filters.PHOTO, handle_photo))

    # Schedule daily notification job
    job_queue = app.job_queue
    notify_time = dtime(hour=DAILY_NOTIFY_HOUR, minute=DAILY_NOTIFY_MINUTE, second=0)
    job_queue.run_daily(
        daily_notification_job, time=notify_time, name="daily_farm_tasks"
    )
    logger.info(
        "📅 Daily notification scheduled at %02d:%02d every day",
        DAILY_NOTIFY_HOUR,
        DAILY_NOTIFY_MINUTE,
    )

    # Also send today's tasks immediately on startup (30 seconds after bot starts)
    job_queue.run_once(daily_notification_job, when=30, name="startup_send")

    logger.info("🤖 CropSmart Telegram Bot is running! Press Ctrl+C to stop.")
    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    start_bot()
