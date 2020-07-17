var ConfigReader = function (opts) {
    var host = opts.host
    var port = opts.port !== undefined ? opts.port : 80;
    var path = opts.path;
    var method = opts.method !== undefined ? opts.method : 'GET';

    var protocol;
    if (opts.protocol !== undefined) {
        protocol = opts.protocol;
    } else {
        protocol = this._port === 443 ? 'https:' : 'http:';
    }

    var headers = {};
    if (opts.login !== undefined && opts.pass !== undefined) {
        headers['Authorization'] = this._getBasicAuth(opts.login, opts.pass);
    }

    var url = {
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
};

ConfigReader.prototype._getBasicAuth = function (login, pass) {
    return 'Basic ' + btoa(login + ':' + pass);
}

ConfigReader.prototype.read = function (callback) {
    try {
        var req = this._http.request(this._url, function (res) {
            var response = '';

            res.on('data', function (d) {
                response += d;
            });

            res.on('close', function () {
                var config_json = JSON.parse(response);
                callback(config_json);
            });
        });

        req.on('error', (e) => {
            print('problem with request: code=' + e.code + ', message=' + e.message);
        });

        req.end();
    } catch (e) {
        print('got exception while reading config: ' + e);
    }
}

exports.connect = function (opts) {
    return new ConfigReader(opts);
};
