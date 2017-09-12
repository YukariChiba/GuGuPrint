from io import BytesIO
import math
from telegram import ReplyKeyboardRemove
from telegram.ext import ConversationHandler
from telegram.ext import Filters
from telegram.ext import MessageHandler
from PIL import Image
from telegram.ext import Updater, CommandHandler
import logging
import base64
import requests
import time
gelekey = '--key--'
ggeokey = '--key--'


outcontpl = ' <-----BEGIN TRANSMISSION----->\n' \
         'FROM: @%FROM_USER%\n' \
         'TIME: %FROM_TIME%\n' \
         '     -------CONTACT-------\n' \
         'NAME: %NAME%\n' \
         'PHONE: %PHONE%\n' \
         '  <-----END TRANSMISSION----->'


outloctpl = ' <-----BEGIN TRANSMISSION----->\n' \
         'FROM: @%FROM_USER%\n' \
         'TIME: %FROM_TIME%\n' \
         '     ------LOCATION------\n' \
         'ELE: %ELE%  ' \
         'RES: %RES%\n' \
         'LAT: %LAT%  ' \
         'LON: %LON%\n' \
         '%LOC%\n' \
         '  <-----END TRANSMISSION----->'

outtpl = ' <-----BEGIN TRANSMISSION----->\n' \
         'FROM: @%FROM_USER%\n' \
         'TIME: %FROM_TIME%\n' \
         '     -------%TEXT%-------\n' \
         '%CONTENT%\n' \
         '  <-----END TRANSMISSION----->'

outpictpl = ' <-----BEGIN TRANSMISSION----->\n' \
         'FROM: @%FROM_USER%\n' \
         'TIME: %FROM_TIME%\n' \
         '     ------PICTURE------\n'
outpictpl_end = '  <-----END TRANSMISSION----->'

logging.basicConfig(format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
                    level=logging.INFO)

logger = logging.getLogger(__name__)


whitelist = ["CharlesYang"]

updater = Updater('--key--')
PWD, PRTXT = range(2)
x_pi = 3.14159265358979324 * 3000.0 / 180.0
pi = 3.1415926535897932384626
ee = 0.00669342162296594323
a = 6378245.0


def transformlat(lng, lat):
    ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + \
        0.1 * lng * lat + 0.2 * math.sqrt(math.fabs(lng))
    ret += (20.0 * math.sin(6.0 * lng * pi) + 20.0 *
            math.sin(2.0 * lng * pi)) * 2.0 / 3.0
    ret += (20.0 * math.sin(lat * pi) + 40.0 *
            math.sin(lat / 3.0 * pi)) * 2.0 / 3.0
    ret += (160.0 * math.sin(lat / 12.0 * pi) + 320 *
            math.sin(lat * pi / 30.0)) * 2.0 / 3.0
    return ret


def transformlng(lng, lat):
    ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + \
        0.1 * lng * lat + 0.1 * math.sqrt(math.fabs(lng))
    ret += (20.0 * math.sin(6.0 * lng * pi) + 20.0 *
            math.sin(2.0 * lng * pi)) * 2.0 / 3.0
    ret += (20.0 * math.sin(lng * pi) + 40.0 *
            math.sin(lng / 3.0 * pi)) * 2.0 / 3.0
    ret += (150.0 * math.sin(lng / 12.0 * pi) + 300.0 *
            math.sin(lng / 30.0 * pi)) * 2.0 / 3.0
    return ret


def out_of_china(lng, lat):
    return not (73.66 < lng < 135.05 and 3.86 < lat < 53.55)


def mars(lng, lat):
    dlat = transformlat(lng - 105.0, lat - 35.0)
    dlng = transformlng(lng - 105.0, lat - 35.0)
    radlat = lat / 180.0 * pi
    magic = math.sin(radlat)
    magic = 1 - ee * magic * magic
    sqrtmagic = math.sqrt(magic)
    dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * pi)
    dlng = (dlng * 180.0) / (a / sqrtmagic * math.cos(radlat) * pi)
    mglat = lat + dlat
    mglng = lng + dlng
    return [mglng, mglat]


def guguprpic(pruser, prpic_it):
    tstamp = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
    payload = {'ak': '--key--',
               'timestamp': tstamp,
               'memobirdID': '--key--',
               'useridentifying': pruser
               }
    r = requests.post("http://open.memobird.cn/home/setuserbind", params=payload)
    rjson = r.json()
    if rjson['showapi_res_error'] == 'ok':
        outdata = outpictpl.replace("%FROM_USER%", pruser)
        outdata = outdata.replace("%FROM_TIME%", tstamp)
        outdata = base64.b64encode(outdata.encode(encoding='gbk', errors='ignore')).decode()
        outdata_e = base64.b64encode(outpictpl_end.encode(encoding='gbk', errors='ignore')).decode()
        payload2 = {'ak': '--key--',
                    'timestamp': tstamp,
                    'memobirdID': '--key--',
                    'userID': rjson['showapi_userid'],
                    'printcontent': 'T:' + outdata + '|P:' + prpic_it.decode() + '|T:' + outdata_e
                    }
        requests.post("http://open.memobird.cn/home/printpaper", data=payload2)


def guguprloc(pruser, prloc_it, prele):
    tstamp = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
    payload = {'ak': '--key--',
               'timestamp': tstamp,
               'memobirdID': '--key--',
               'useridentifying': pruser
               }
    r = requests.post("http://open.memobird.cn/home/setuserbind", params=payload)
    rjson = r.json()
    if rjson['showapi_res_error'] == 'ok':
        outdata = outloctpl.replace("%FROM_USER%", pruser)
        outdata = outdata.replace("%FROM_TIME%", tstamp)
        outdata = outdata.replace("%ELE%", str(round(prele['elevation'], 2)))
        outdata = outdata.replace("%RES%", str(round(prele['resolution'], 2)))
        outdata = outdata.replace("%LAT%", str(round(prloc_it[0]['geometry']['location']['lat'], 5)))
        outdata = outdata.replace("%LON%", str(round(prloc_it[0]['geometry']['location']['lng'], 5)))
        outdata = outdata.replace("%LOC%", prloc_it[0]['formatted_address'])
        outdata = outdata.replace(u'\xa0 ', u' ')
        outdata = base64.b64encode(outdata.encode(encoding='gbk', errors='ignore')).decode()
        payload2 = {'ak': '--key--',
                    'timestamp': tstamp,
                    'memobirdID': '--key--',
                    'userID': rjson['showapi_userid'],
                    'printcontent': 'T:' + outdata
                    }
        requests.post("http://open.memobird.cn/home/printpaper", params=payload2)


def guguprtxt(pruser, prtext, forward=False):
    tstamp = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
    payload = {'ak': '--key--',
               'timestamp': tstamp,
               'memobirdID': '--key--',
               'useridentifying': pruser
               }
    r = requests.post("http://open.memobird.cn/home/setuserbind", params=payload)
    rjson = r.json()
    if rjson['showapi_res_error'] == 'ok':
        outdata = outtpl.replace("%FROM_USER%", pruser)
        outdata = outdata.replace("%FROM_TIME%", tstamp)
        outdata = outdata.replace("%CONTENT%", prtext)
        if forward:
            outdata = outdata.replace("%TEXT%", 'FORWARD')
        else:
            outdata = outdata.replace("%TEXT%", '-TEXT-')
        outdata = outdata.replace(u'\xa0 ', u' ')
        outdata = base64.b64encode(outdata.encode(encoding='gbk', errors='ignore')).decode()
        payload2 = {'ak': '--key--',
                    'timestamp': tstamp,
                    'memobirdID': '--key--',
                    'userID': rjson['showapi_userid'],
                    'printcontent': 'T:' + outdata
                    }
        requests.post("http://open.memobird.cn/home/printpaper", params=payload2)


def guguprcon(pruser, prcon_it):
    tstamp = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
    payload = {'ak': '--key--',
               'timestamp': tstamp,
               'memobirdID': '--key--',
               'useridentifying': pruser
               }
    r = requests.post("http://open.memobird.cn/home/setuserbind", params=payload)
    rjson = r.json()
    if rjson['showapi_res_error'] == 'ok':
        outdata = outcontpl.replace("%FROM_USER%", pruser)
        outdata = outdata.replace("%FROM_TIME%", tstamp)
        outdata = outdata.replace("%NAME%", prcon_it.first_name + prcon_it.last_name)
        outdata = outdata.replace("%PHONE%", prcon_it.phone_number)
        outdata = outdata.replace(u'\xa0 ', u' ')
        outdata = base64.b64encode(outdata.encode(encoding='gbk', errors='ignore')).decode()
        payload2 = {'ak': '--key--',
                    'timestamp': tstamp,
                    'memobirdID': '--key--',
                    'userID': rjson['showapi_userid'],
                    'printcontent': 'T:' + outdata
                    }
        requests.post("http://open.memobird.cn/home/printpaper", params=payload2)


def start(update):
    user = update.message.from_user
    if user.username not in whitelist:
        update.message.reply_text("Input user password:")
        return PWD
    else:
        update.message.reply_text("You are in whitelist.\nInput text to print:")
        return PRTXT


def pwd(update):
    # user = update.message.from_user
    # if args[0] == '321123':
    if update.message.text == '31415926535':
        update.message.reply_text("Input text to print:")
        return PRTXT
    else:
        update.message.reply_text("Wrong password")
        return ConversationHandler.END


def prfor(update):
    user = update.message.from_user
    logger.info(user.username + ":[Forward:" + update.message.forward_from.username + "]")
    guguprtxt(user.username + "\nFORWARD: @" + update.message.forward_from.username, update.message.text, forward=True)
    update.message.reply_text('Done!')
    return ConversationHandler.END


def prtxt(update):
    user = update.message.from_user
    logger.info(user.username + ":[Text]")
    guguprtxt(user.username, update.message.text)
    update.message.reply_text('Done!')
    return ConversationHandler.END


def prloc(update):
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


def prdoc(bot, update):
    image_max_width = 384
    user = update.message.from_user
    logger.info(user.username + ":[pic]")
    r = requests.get(bot.getFile(update.message.document.file_id).file_path)
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
    update.message.reply_text('Done!')
    return ConversationHandler.END


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
    update.message.reply_text('Done!')
    return ConversationHandler.END


def praqi(update):
    user = update.message.from_user
    logger.info(user.username + ":[aqi]")
    city = 'chengdu'
    tstamp = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
    payload = {'ak': '--key--',
               'timestamp': tstamp,
               'memobirdID': '--key--',
               'useridentifying': 'Test'
               }
    aqitpl = ' <-----BEGIN TRANSMISSION----->\n' \
             'FROM: @%FROM_USER%\n' \
             'TIME: %FROM_TIME%\n' \
             '     ---------AQI---------\n' \
             'TIME£º%time%\n' \
             'CITY£º%city%  AQI£º%aqi%\n' \
             'LVL£º%level%\n' \
             'PM25£º%pm25%   PM10£º%pm10%\n' \
             '  <-----END TRANSMISSION----->'
    r = requests.post("http://open.memobird.cn/home/setuserbind", params=payload)
    rjson = r.json()
    level = ''
    r1j = dict()
    if rjson['showapi_res_error'] == 'ok':
        r1 = requests.get("https://api.waqi.info/feed/" + city + "/?token=--key--")
        r1j = r1.json()
        if r1j['data']['aqi'] >= 300:
            level = 'Hazardous'
        else:
            if r1j['data']['aqi'] >= 200:
                level = 'Very Unhealthy'
            else:
                if r1j['data']['aqi'] >= 150:
                    level = 'Unhealthy'
                else:
                    if r1j['data']['aqi'] >= 100:
                        level = 'Unhealthy for Sensitive Groups'
                    else:
                        if r1j['data']['aqi'] >= 50:
                            level = 'Moderate'
                        else:
                            level = 'Good'
    aqitpl = aqitpl.replace('%city%', city)
    aqitpl = aqitpl.replace("%FROM_USER%", user.username)
    aqitpl = aqitpl.replace("%FROM_TIME%", tstamp)
    aqitpl = aqitpl.replace('%level%', level)
    aqitpl = aqitpl.replace('%pm25%', str(r1j['data']['iaqi']['pm25']['v']))
    aqitpl = aqitpl.replace('%pm10%', str(r1j['data']['iaqi']['pm10']['v']))
    aqitpl = aqitpl.replace('%aqi%', str(r1j['data']['aqi']))
    aqitpl = aqitpl.replace('%time%', str(r1j['data']['time']['s']))
    outdata = base64.b64encode(aqitpl.encode(encoding='gbk')).decode()
    payload2 = {'ak': '--key--',
                'timestamp': tstamp,
                'memobirdID': '--key--',
                'userID': rjson['showapi_userid'],
                'printcontent': 'T:' + outdata
                }
    requests.post("http://open.memobird.cn/home/printpaper", params=payload2)
    update.message.reply_text('Done!')
    return ConversationHandler.END


def prcon(update):
    user = update.message.from_user
    logger.info(user.username + ":" + update.message.contact.phone_number)
    guguprcon(user.username, update.message.contact)
    update.message.reply_text('Done!')
    return ConversationHandler.END


def cancel(update):
    # user = update.message.from_user
    update.message.reply_text('Good bye.',
                              reply_markup=ReplyKeyboardRemove())
    return ConversationHandler.END


pr = ConversationHandler(
        entry_points=[CommandHandler('start', start)],

        states={
            PWD: [MessageHandler(Filters.text, pwd)],
            PRTXT: [MessageHandler(Filters.forwarded & Filters.text, prfor),
                    MessageHandler(Filters.text, prtxt),
                    MessageHandler(Filters.document, prdoc),
                    MessageHandler(Filters.photo, prpic),
                    MessageHandler(Filters.location, prloc),
                    MessageHandler(Filters.contact, prcon),
                    CommandHandler('aqi', praqi)]
        },
        fallbacks=[CommandHandler('cancel', cancel)]
    )

updater.dispatcher.add_handler(pr)
updater.start_polling()
updater.idle()
