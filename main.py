from telegram import ReplyKeyboardRemove
from telegram.ext import Filters
from telegram.ext import MessageHandler
from telegram.ext import Updater, CommandHandler
from telegram.ext import ConversationHandler
import logging
import time
from modules import aqi, contact, forward, loc, pic, text, doc
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
            update.message.reply_text("[通讯链路开启]\n拒绝访问:不在访问授权时间\列表内。\n公共授权时间:\n 8:00-12:30, 14:00-23:00\n[通讯链路已终结]")
            return ConversationHandler.END
        else:
            update.message.reply_text("[传输链路开启]\n请提供需要传输的数据:")
            return PRTXT
    else:
        update.message.reply_text("Welcome, my master.\nInput text to print:")
        return PRTXT


def pwd(bot, update):
    if update.message.text == pwd:
        update.message.reply_text("Input text to print:")
        return PRTXT
    else:
        update.message.reply_text("Wrong password")
        return ConversationHandler.END


def cancel(bot, update):
    update.message.reply_text('Good bye.\n[通讯链路已终结]',
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
        entry_points=[CommandHandler('start', start)],

        states={
            PEND: [MessageHandler(Filters.text, pwd)],
            PRTXT: [MessageHandler(Filters.forwarded & Filters.text, forward.prfor),
                    MessageHandler(Filters.text, text.prtxt),
                    MessageHandler(Filters.document, doc.prdoc),
                    MessageHandler(Filters.photo, pic.prpic),
                    MessageHandler(Filters.location, loc.prloc),
                    MessageHandler(Filters.contact, contact.prcon),
                    CommandHandler('aqi', aqi.praqi)]
        },
        fallbacks=[CommandHandler('cancel', cancel)]
    )

updater.dispatcher.add_handler(pr)
updater.start_polling()
updater.idle()
