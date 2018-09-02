import base64
import time
import logging
from msgtpl import *
from api import *
from telegram.ext import ConversationHandler

logger = logging.getLogger(__name__)


def guguprtxt(pruser, prtext, forward=False):
    tstamp = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
    outdata = outtpl.replace("%FROM_USER%", pruser)
    outdata = outdata.replace("%FROM_TIME%", tstamp)
    outdata = outdata.replace("%CONTENT%", prtext)
    if forward:
        outdata = outdata.replace("%TEXT%", 'FORWARD')
    else:
        outdata = outdata.replace("%TEXT%", '-TEXT-')
    outdata = outdata.replace(u'\xa0 ', u' ')
    outdata = base64.b64encode(outdata.encode(encoding='gbk', errors='ignore')).decode()
    gu_req(pruser, tstamp, 'T:' + outdata)


def prtxt(bot, update):
    user = update.message.from_user
    logger.info(user.username + ":[Text]")
    guguprtxt(user.username, update.message.text)
    update.message.reply_text('Done!\n[消息已呈递]\n[通讯链路终结]')
    return ConversationHandler.END
