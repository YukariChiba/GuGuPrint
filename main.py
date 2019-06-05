from telegram import ReplyKeyboardRemove
from telegram.ext import Filters
from telegram.ext import MessageHandler
from telegram.ext import Updater, CommandHandler
from telegram.ext import ConversationHandler
import logging
import lang
import time
from modules import aqi, contact, loc, pic, text, doc, sticker
from settings import *


logging.basicConfig(format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
                    level=logging.INFO)

logger = logging.getLogger(__name__)

updater = Updater(tg_tk)
PEND, PRTXT = range(2)


def start(bot, update):
    user = update.message.from_user
    if user.username not in whitelist:
        if not in_time_range(open_time):
            update.message.reply_text(lang.not_in_time_range)
            return ConversationHandler.END
        else:
            update.message.reply_text(lang.provide_data)
            return PRTXT
    else:
        update.message.reply_text(lang.admin_print)
        return PRTXT


def pwd(bot, update):
    if update.message.text == pwd:
        update.message.reply_text(lang.provide_data)
        return PRTXT
    else:
        update.message.reply_text(lang.access_denied)
        return ConversationHandler.END


def none(bot, update):
    update.message.reply_text(lang.usage_failed)
    return ConversationHandler.END


def cancel(bot, update):
    update.message.reply_text(lang.comm_end,
                              reply_markup=ReplyKeyboardRemove())
    return ConversationHandler.END


def in_time_range(ranges):
    now = time.strptime(time.strftime("%H%M%S"),"%H%M%S")
    ranges = ranges.split(",")
    for i_range in ranges:
        r = i_range.split("-")
        if time.strptime(r[0], "%H%M%S") <= now <= time.strptime(r[1], "%H%M%S") \
                or time.strptime(r[0], "%H%M%S") >= now >= time.strptime(r[1], "%H%M%S"):
            return True
    return False


pr = ConversationHandler(
        entry_points=[
            CommandHandler('start', start),
            MessageHandler(Filters.all, none)
        ],

        states={
            PEND: [MessageHandler(Filters.text, pwd)],
            PRTXT: [MessageHandler(Filters.text, text.prtxt),
                    MessageHandler(Filters.document, doc.prdoc),
                    MessageHandler(Filters.photo, pic.prpic),
                    MessageHandler(Filters.location, loc.prloc),
                    MessageHandler(Filters.contact, contact.prcon),
                    MessageHandler(Filters.sticker, sticker.prstk),
                    CommandHandler('aqi', aqi.praqi)]
        },
        fallbacks=[CommandHandler('cancel', cancel)]
    )

updater.dispatcher.add_handler(pr)
logging.log(logging.INFO, "System started successfully.")
updater.start_polling()
updater.idle()
