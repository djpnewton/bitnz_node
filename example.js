var BitNZ = require('./bitnz.js');

var publicBitNZ = new BitNZ();

publicBitNZ.ticker(console.log);
publicBitNZ.trades(console.log);
publicBitNZ.orderbook(console.log);

var key = 'your key';
var secret = 'your secret';
var username = 'your username'; // your bitNZ username
var privateBitNZ = new BitNZ(key, secret, username);

//    commented out for your protection

//privateBitNZ.balance(console.log);
//privateBitNZ.orders_buy_open(console.log);
//privateBitNZ.orders_sell_open(console.log);
//privateBitNZ.orders_buy_closed(console.log);
//privateBitNZ.orders_sell_closed(console.log);
//privateBitNZ.orders_buy_cancel(console.log, id);
//privateBitNZ.orders_sell_cancel(console.log, id);
//privateBitNZ.orders_buy_create(console.log, amount, price);
//privateBitNZ.orders_sell_create(console.log, amount, price);
//privateBitNZ.btc_deposit_address(console.log);
//privateBitNZ.btc_withdraw(console.log, amount, address);
