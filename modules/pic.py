import base64
import time
from io import BytesIO
from PIL import Image
from msgtpl import *
from api import *
import logging
from telegram.ext import ConversationHandler

logger = logging.getLogger(__name__)


def prpic(bot, update):
    image_max_width = 384
    user = update.message.from_user
    logger.info(user.username + ":[pic]")
    r = requests.get(bot.getFile(update.message.photo[0].file_id).file_path)
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
    guguprpic(user.username, content)
    update.message.reply_text('Done!\n[消息已呈递]\n[通讯链路终结]')
    return ConversationHandler.END


def guguprpic(pruser, prpic_it):
    tstamp = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
    outdata = outpictpl.replace("%FROM_USER%", pruser)
    outdata = outdata.replace("%FROM_TIME%", tstamp)
    outdata = base64.b64encode(outdata.encode(encoding='gbk', errors='ignore')).decode()
    outdata_e = base64.b64encode(outpictpl_end.encode(encoding='gbk', errors='ignore')).decode()
    gu_req(pruser, tstamp, 'T:' + outdata + '|P:' + prpic_it.decode() + '|T:' + outdata_e)