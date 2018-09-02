import base64
import time
import logging
from msgtpl import *
from geo_calc import *
from api import *
from telegram.ext import ConversationHandler

logger = logging.getLogger(__name__)


def guguprloc(pruser, prloc_it, prele):
    tstamp = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
    outdata = outloctpl.replace("%FROM_USER%", pruser)
    outdata = outdata.replace("%FROM_TIME%", tstamp)
    outdata = outdata.replace("%ELE%", str(round(prele['elevation'], 2)))
    outdata = outdata.replace("%RES%", str(round(prele['resolution'], 2)))
    outdata = outdata.replace("%LAT%", str(round(prloc_it[0]['geometry']['location']['lat'], 5)))
    outdata = outdata.replace("%LON%", str(round(prloc_it[0]['geometry']['location']['lng'], 5)))
    outdata = outdata.replace("%LOC%", prloc_it[0]['formatted_address'])
    outdata = outdata.replace(u'\xa0 ', u' ')
    outdata = base64.b64encode(outdata.encode(encoding='gbk', errors='ignore')).decode()
    gu_req(pruser, tstamp, 'T:' + outdata)


def prloc(bot, update):
    user = update.message.from_user
    l1 = update.message.location.longitude
    l2 = update.message.location.latitude
    convert = mars(l1, l2)
    l1 = convert[0]
    l2 = convert[1]
    logger.info(user.username + ":Position[" + str(l2) + "," + str(l1) + "]")
    r = requests.get("https://maps.googleapis.com/maps/api/geocode/json?language=zh-CN&latlng="
                     + str(l2) + "," + str(l1) + "&key=" + ggeokey)
    rjson = r.json()
    r2 = requests.get("https://maps.googleapis.com/maps/api/elevation/json?locations="
                      + str(l2) + "," + str(l1) + "&key=" + gelekey)
    rjson2 = r2.json()
    guguprloc(user.username, rjson['results'], rjson2['results'][0])
    update.message.reply_text('Done!')
    return ConversationHandler.END
