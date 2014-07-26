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

bitNZ.prototype._default = function(arg, value) {
  return typeof arg !== 'undefined' ? arg : value;
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

bitNZ.prototype.trades = function(callback, since_date) {
  var day_ago = Date.now() / 1000 - 24 * 60 * 60;
  since_date = this._default(since_date, day_ago);
  this._get('trades', callback, {'since_date': parseInt(since_date)});
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

bitNZ.prototype.orders_buy_open = function(callback) {
  this._post('orders/buy/open', callback);
}

bitNZ.prototype.orders_sell_open = function(callback) {
  this._post('orders/sell/open', callback);
}

bitNZ.prototype.orders_buy_closed = function(callback, offset, limit) {
  offset = this._default(offset, 0);
  limit = this._default(limit, 100);
  this._post('orders/buy/closed', callback, {'offset': offset, 'limit': limit});
}

bitNZ.prototype.orders_sell_closed = function(callback, offset, limit) {
  offset = this._default(offset, 0);
  limit = this._default(limit, 100);
  this._post('orders/sell/closed', callback, {'offset': offset, 'limit': limit});
}

bitNZ.prototype.orders_buy_cancel= function(callback, id) {
  this._post('orders/buy/cancel', callback, {'id': id});
}

bitNZ.prototype.orders_sell_cancel= function(callback, id) {
  this._post('orders/sell/cancel', callback, {'id': id});
}

bitNZ.prototype.orders_buy_create = function(callback, amount, price) {
  this._post('orders/buy/create', callback, {'amount': amount, 'price': price});
}

bitNZ.prototype.orders_sell_create = function(callback, amount, price) {
  this._post('orders/sell/create', callback, {'amount': amount, 'price': price});
}

bitNZ.prototype.btc_deposit_address = function(callback) {
  this._post('btc/address', callback);
}

bitNZ.prototype.btc_withdraw = function(callback, amount, address) {
  this._post('btc/withdraw', callback, {'amount': amount, 'address': address});
}

module.exports = bitNZ;
