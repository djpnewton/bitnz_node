var querystring = require("querystring");
var https = require('https');
var _ = require('underscore');
var crypto = require('crypto');

_.mixin({
  // compact for objects
  compactObject: function(to_clean) {
    _.map(to_clean, function(value, key, to_clean) {
      if (value === undefined)
        delete to_clean[key];
    });
    return to_clean;
  }
});  

var bitNZ = function(key, secret, username) {
  this.key = key;
  this.secret = secret;
  this.username = username;

  _.bindAll(this);
}

bitNZ.prototype._request = function(method, path, data, callback, args) {
  
  var options = {
    host: 'bitnz.com',
    path: path,
    method: method,
    headers: {
      'User-Agent': 'Mozilla/4.0 (compatible; bitNZ node.js client)'
    }
  };

  if (method === 'post') {
    options.headers['Content-Length'] = data.length;
    options.headers['content-type'] = 'application/x-www-form-urlencoded';
  }

  var req = https.request(options, function(res) {
    res.setEncoding('utf8');
    var buffer = '';
    res.on('data', function(data) {
      buffer += data;
    });
    res.on('end', function() {
      try {
        var json = JSON.parse(buffer);
      } catch (err) {
        return callback(err);
      }
      callback(null, json);
    });
  });

  req.on('error', function(err) {
    callback(err);
  });

  req.on('socket', function (socket) {
    socket.setTimeout(5000);
    socket.on('timeout', function() {
      req.abort();
    });
    socket.on('error', function(err) {
      callback(err);
    });
  });
  
  req.end(data);

}

bitNZ.prototype._get = function(action, callback, args) {
  args = _.compactObject(args);
  var path = '/api/0/' + action + '?' + querystring.stringify(args);
  this._request('get', path, undefined, callback, args)
}

bitNZ.prototype._post = function(action, callback, args) {
  if(!this.key || !this.secret || !this.username)
    return callback('Must provide key, secret and username to make this API request.');

  var path = '/api/0/private/' + action;

  var nonce = new Date().getTime() + '' + new Date().getMilliseconds();
  var message = nonce + this.username + this.key;
  var signer = crypto.createHmac('sha256', new Buffer(this.secret, 'utf8'));
  var signature = signer.update(message).digest('hex').toUpperCase();

  args = _.extend({
    key: this.key,
    signature: signature,
    nonce: nonce
  }, args);

  args = _.compactObject(args);
  var data = querystring.stringify(args);

  this._request('post', path, data, callback, args);
}

// 
// Public API
// 

bitNZ.prototype.ticker = function(callback) {
  this._get('ticker', callback);
}

bitNZ.prototype.trades = function(options, callback) {
  if(!callback) {
    callback = options;
    options = undefined;
  }
  this._get('trades', callback, options);
}

bitNZ.prototype.orderbook = function(callback) {
  this._get('orderbook', callback);
}

// 
// Private API
// (you need to have key / secret / username set)
// 

bitNZ.prototype.balance = function(callback) {
  this._post('balance', callback);
}

bitNZ.prototype.user_transactions = function(timedelta, callback) {
  if(!callback) {
    callback = timedelta;
    timedelta = undefined;
  }
  this._post('user_transactions', callback, {timedelta: timedelta});
}

bitNZ.prototype.open_orders = function(callback) {
  this._post('open_orders', callback);
}

bitNZ.prototype.cancel_order = function(id, callback) {
  this._post('cancel_order', callback, {id: id});
}

bitNZ.prototype.buy = function(amount, price, callback) {
  this._post('buy', callback, {amount: amount, price: price});
}

bitNZ.prototype.sell = function(amount, price, callback) {
  this._post('sell', callback, {amount: amount, price: price});
}

bitNZ.prototype.withdrawal_requests = function(callback) {
  this._post('withdrawal_requests', callback);
}

bitNZ.prototype.bitcoin_withdrawal = function(amount, address, callback) {
  this._post('bitcoin_withdrawal', callback, {amount: amount, address: address});
}

bitNZ.prototype.bitcoin_deposit_address = function(callback) {
  this._post('bitcoin_deposit_address', callback);
}

bitNZ.prototype.unconfirmed_btc = function(callback) {
  this._post('unconfirmed_btc', callback);
}

bitNZ.prototype.ripple_withdrawal = function(amount, address, currency, callback) {
  this._post('ripple_withdrawal', callback, {amount: amount, address: address, currency: currency});
}

bitNZ.prototype.ripple_address = function(callback) {
  this._post('ripple_address', callback);
}

// These API calls return a 404 as of `Thu Oct 31 13:54:19 CET 2013`
// even though they are still in the API documentation
bitNZ.prototype.create_code = function(usd, btc, callback) {
  this._post('create_code', callback, {usd: usd, btc: btc});
}
bitNZ.prototype.check_code = function(code, callback) {
  this._post('check_code', callback, {code: code});
}
bitNZ.prototype.redeem_code = function(code, callback) {
  this._post('redeem_code', callback, {code: code});
}

module.exports = bitNZ;
