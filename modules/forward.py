import logging
from telegram.ext import ConversationHandler
from modules import text

logger = logging.getLogger(__name__)


def prfor(bot, update):
    user = update.message.from_user
    logger.info(user.username + ":[Forward:" + update.message.forward_from.username + "]")
    text.guguprtxt(user.username + "\nFORWARD: @" + update.message.forward_from.username, update.message.text, forward=True)
    update.message.reply_text('Done!\n[消息已呈递]\n[通讯链路终结]')
    return ConversationHandler.END
