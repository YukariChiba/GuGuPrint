import requests
from settings import *
import json

def gu_req(pruser, tstamp, content):
    payload2 = {'ak': gugu_ak,
                'timestamp': tstamp,
                'memobirdID': gugu_id,
                'userID': bind_user(pruser, tstamp),
                'printcontent': content
                }
    r = requests.post("http://open.memobird.cn/home/printpaper", params=payload2)
    rjson = r.json()
    with open('print_req.json', 'w') as f:    
        json.dump(rjson, f)
    return rjson['showapi_res_error']


def bind_user(pruser, tstamp):
    payload = {'ak': gugu_ak,
               'timestamp': tstamp,
               'memobirdID': gugu_id,
               'useridentifying': pruser
               }
    r = requests.post("http://open.memobird.cn/home/setuserbind", params=payload)
    rjson = r.json()
    with open('bind_req.json', 'w') as f:
        json.dump(rjson, f)
    print(r)
    return rjson['showapi_userid']
