tr_begin = ' <-----BEGIN TRANSMISSION----->\n'
tr_end = '  <-----END TRANSMISSION----->'

outcontpl = tr_begin + \
         'FROM: @%FROM_USER%\n' \
         'TIME: %FROM_TIME%\n' \
         '     -------CONTACT-------\n' \
         'NAME: %NAME%\n' \
         '%DATA%' \
         + tr_end


outloctpl = tr_begin + \
         'FROM: @%FROM_USER%\n' \
         'TIME: %FROM_TIME%\n' \
         '     ------LOCATION------\n' \
         'ELE: %ELE%  ' \
         'RES: %RES%\n' \
         'LAT: %LAT%  ' \
         'LON: %LON%\n' \
         '%LOC%\n' \
         + tr_end

outtpl = tr_begin + \
         'FROM: @%FROM_USER%\n' \
         'TIME: %FROM_TIME%\n' \
         '     -------%TEXT%-------\n' \
         '%CONTENT%\n' \
         + tr_end

outpictpl = tr_begin + \
         'FROM: @%FROM_USER%\n' \
         'TIME: %FROM_TIME%\n' \
         '     ------PICTURE------\n'
outpictpl_end = tr_end
