import base64
import time
from io import BytesIO
from PIL import Image
from msgtpl import *
from api import *
import logging
import lang
from telegram.ext import ConversationHandler
from telegram.ext import MessageHandler
from telegram.ext import Filters

logger = logging.getLogger(__name__)


def start(update, context):
    image_max_width = 384
    user = update.message.from_user
    logger.info(user.username + ":[pic]")
    r = requests.get(update.bot.getFile(update.message.photo[0].file_id).file_path)
    rpic = r.content
    open("tmp.jpg", 'wb').write(rpic)
    image = Image.open("tmp.jpg")
    image = image.transpose(Image.FLIP_TOP_BOTTOM)
    width, height = image.size
    image = image.resize((image_max_width, height * image_max_width // width), Image.ANTIALIAS)
    image = image.convert("1")
    p = BytesIO()
    image.save(p, "BMP")
    content = base64.b64encode(p.getvalue())
    pr_usrname = user.username
    if update.message.forward_from is not None:
        pr_usrname = pr_usrname + "\nFORWARD: @" + update.message.forward_from.username
    if update.message.caption is not None:
        guguprpic(pr_usrname, content, update.message.caption)
    else:
        guguprpic(pr_usrname, content)
    update.message.reply_text(lang.print_success)
    return ConversationHandler.END


def guguprpic(pruser, prpic_it, prtxt_it=None, pictype=0):
    tstamp = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
    outdata = outpictpl.replace("%FROM_USER%", pruser)
    outdata = outdata.replace("%FROM_TIME%", tstamp)
    if pictype == 0:
        outdata = outdata.replace("%PICTURE%", "PICTURE")
    elif pictype == 1:
        outdata = outdata.replace("%PICTURE%", "STICKER")
    outdata = base64.b64encode(outdata.encode(encoding='gbk', errors='ignore')).decode()
    if prtxt_it is not None:
        outdata_e = base64.b64encode((prtxt_it + "\n" + outpictpl_end).encode(encoding='gbk', errors='ignore')).decode()
    else:
        outdata_e = base64.b64encode(outpictpl_end.encode(encoding='gbk', errors='ignore')).decode()
    gu_req(pruser, tstamp, 'T:' + outdata + '|P:' + prpic_it.decode() + '|T:' + outdata_e)

handler = MessageHandler(Filters.photo, start)
