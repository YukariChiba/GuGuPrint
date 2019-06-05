# -*- coding:utf-8 -*-
comm_start = "[通讯链路开启]\n"

comm_end = "[通讯链路已终结]"

admin_auth = "[认证管理者授权]\n"

admin_name = "GuGuAdmin"

access_denied = "[访问被拒绝]"

usage_failed = "[使用方式不当，请使用 /start ]"

not_in_time_range = comm_start + "拒绝访问:不在访问授权时间列表内。\n公共授权时间:\n 8:00-12:30, 14:00-23:00\n" + comm_end

provide_data = comm_start + "请提供需要传输的数据: "

admin_print = comm_start + admin_auth + "欢迎你，" + admin_name + "\n" + "请提供需要传输的数据: "

print_success = "Done!\n[消息已呈递]\n" + comm_end
