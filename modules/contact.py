import base64
import time
import logging
from msgtpl import *
from telegram.ext import ConversationHandler
from api import *
import lang
from telegram.ext import MessageHandler
from telegram.ext import Filters

logger = logging.getLogger(__name__)


def guguprcon(pruser, prcon_it):
    tstamp = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
    outdata = outcontpl.replace("%FROM_USER%", pruser)
    outdata = outdata.replace("%FROM_TIME%", tstamp)
    outdata = outdata.replace("%NAME%", prcon_it.first_name + prcon_it.last_name)
    outdata_meta = ""
    if prcon_it.phone_number is not None:
        outdata_meta = outdata_meta + "PHONE: " + prcon_it.phone_number + "\n"
    outdata = outdata.replace("%DATA%", outdata_meta)
    outdata = outdata.replace(u'\xa0 ', u' ')
    outdata = base64.b64encode(outdata.encode(encoding='gbk', errors='ignore')).decode()
    gu_req(pruser, tstamp, 'T:' + outdata)


def start(update, context):
    user = update.message.from_user
    logger.info(user.username + ":" + update.message.contact.phone_number)
    guguprcon(user.username, update.message.contact)
    update.message.reply_text(lang.print_success)
    return ConversationHandler.END

handler = MessageHandler(Filters.contact, start)