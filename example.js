var BitNZ = require('./bitnz.js');

var publicBitNZ = new BitNZ();

var hour_ago = Date.now() - 60 * 60;
publicBitNZ.ticker(console.log);
publicBitNZ.trades({since_date: hour_ago}, console.log);
publicBitNZ.orderbook(console.log);

var key = 'your key';
var secret = 'your secret';
var username = 0; // your bitNZ user ID
var privateBitNZ = new BitNZ(key, secret, username);

//    commented out for your protection

// privateBitNZ.balance(console.log);
// privateBitNZ.user_transactions(100, console.log);
// privateBitNZ.open_orders(console.log);
// privateBitNZ.cancel_order(id, console.log);
// privateBitNZ.buy(amount, price, console.log);
// privateBitNZ.sell(amount, price, console.log);
// privateBitNZ.withdrawal_requests(console.log);
// privateBitNZ.bitcoin_withdrawal(amount, address, console.log);
// privateBitNZ.bitcoin_deposit_address(console.log);
// privateBitNZ.unconfirmed_btc(console.log())
// privateBitNZ.ripple_withdrawal(amount, address, currency)
// privateBitNZ.ripple_address(console.log)


//		Bistamp is currently (Thu Oct 31 13:54:19 CET 2013) 
//		returning 404's when doing these calls

// privateBitNZ.create_code(usd, btc, console.log);
// privateBitNZ.check_code(code, console.log);
// privateBitNZ.redeem_code(code, console.log);
