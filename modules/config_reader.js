var ConfigReader = function (opts) {
    const host = opts.host
    const port = opts.port !== undefined ? opts.port : 80;
    const path = opts.path;
    const method = opts.method !== undefined ? opts.method : 'GET';

    let protocol;
    if (opts.protocol !== undefined) {
        protocol = opts.protocol;
    } else {
        protocol = this._port === 443 ? 'https:' : 'http:';
    }

    let headers = {};
    if (opts.login !== undefined && opts.pass !== undefined) {
        headers['Authorization'] = this._getBasicAuth(opts.login, opts.pass);
    }

    let url = {
        host: host,
        port: port,
        path: path,
        method: method,
        protocol: protocol
    }

    if (Object.keys(headers).length !== 0) {
        url.headers = headers;
    }

    this._url = url;
    this._http = require('http');
    this._is_request_running = false;
};

ConfigReader.prototype._getBasicAuth = function (login, pass) {
    return 'Basic ' + btoa(login + ':' + pass);
}

ConfigReader.prototype.read = function (callback) {
    try {
        let self = this;
        if (!this._is_request_running) {
            this._is_request_running = true;
            let req = this._http.request(this._url, function (res) {
                let response = '';

                res.on('data', function (d) {
                    print('on data - _is_request_running = ' + self._is_request_running);
                    if (d) {
                        response += d;
                    }
                });

                res.on('close', function () {
                    print('response: \n' + response);
                    print('on close - _is_request_running = ' + self._is_request_running);
                    self._is_request_running = false;
                    if (response && response.length !== 0) {
                        let config_json = JSON.parse(response);
                        if (config_json) {
                            callback(config_json);
                        } else {
                            print('ConfigReader - can\'t parse response - ' + response)
                        }
                    }
                });
            });

            req.on('error', (e) => {
                print('ConfigReader - problem with request: code=' + e.code + ', message=' + e.message);
                print('error - _is_request_running = ' + this._is_request_running);
                this._is_request_running = false;
            });
            req.end();
        }
    } catch (e) {
        print('ConfigReader - got exception while reading config: ' + e);
    }
}

exports.connect = function (opts) {
    return new ConfigReader(opts);
};
