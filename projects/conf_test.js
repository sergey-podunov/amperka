var conf = require('./conf/autowatering_conf');

const SSID = conf.ssid;
const PASSWORD = conf.wifi_password;
const DWEET_NAME = conf.dweet_name;

const CONFIG_HOST = conf.config_host;
const CONFIG_PATH = conf.config_path;
const CONFIG_LOGIN = conf.config_login;
const CONFIG_PASS = conf.config_pass;

print(SSID);
print(PASSWORD);
print(DWEET_NAME);
print(CONFIG_HOST);
print(CONFIG_PATH);
print(CONFIG_LOGIN);
print(CONFIG_PASS);
