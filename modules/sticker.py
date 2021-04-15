import base64
from modules import pic
from io import BytesIO
import requests
from PIL import Image
import logging
from telegram.ext import ConversationHandler
import lang
from telegram.ext import MessageHandler
from telegram.ext import Filters

logger = logging.getLogger(__name__)


def start(update, context):
    image_max_width = 384
    user = update.message.from_user
    logger.info(user.username + ":[sticker]")
    r = requests.get(context.bot.getFile(update.message.sticker.file_id).file_path)
    rpic = r.content
    open("tmp.png", 'wb').write(rpic)

    png = Image.open("tmp.png")
    png.load()

    if len(png.split()) == 4:
        image = Image.new("RGB", png.size, (255, 255, 255))
        image.paste(png, mask=png.split()[3])
    else:
        image = png

    image = image.transpose(Image.FLIP_TOP_BOTTOM)
    width, height = image.size
    image = image.resize((image_max_width, height * 384 // width), Image.ANTIALIAS)
    image = image.convert("1")
    p = BytesIO()
    image.save(p, "BMP")
    content = base64.b64encode(p.getvalue())
    pic.guguprpic(user.username, content,
                  prtxt_it="FROM STICKER PACK: \n@" + update.message.sticker.set_name,
                  pictype=1)
    update.message.reply_text(lang.print_success)
    return ConversationHandler.END

handler = MessageHandler(Filters.sticker, start)