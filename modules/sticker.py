import base64
from modules import pic
from io import BytesIO
import requests
from PIL import Image
import logging
from telegram.ext import ConversationHandler
import lang

logger = logging.getLogger(__name__)


def prstk(bot, update):
    image_max_width = 384
    user = update.message.from_user
    logger.info(user.username + ":[sticker]")
    r = requests.get(bot.getFile(update.message.sticker.file_id).file_path)
    rpic = r.content
    open("tmp.jpg", 'wb').write(rpic)
    image = Image.open("tmp.jpg")
    image = image.transpose(Image.FLIP_TOP_BOTTOM)
    width, height = image.size
    image = image.resize((image_max_width, height * 384 // width), Image.ANTIALIAS)
    image = image.convert("1")
    p = BytesIO()
    image.save(p, "BMP")
    content = base64.b64encode(p.getvalue())
    pic.guguprpic(user.username, content,
                  prtxt_it="FROM STICKER PACK: \n[" + update.message.sticker.set_name + "]",
                  type=1)
    update.message.reply_text(lang.print_success)
    return ConversationHandler.END
