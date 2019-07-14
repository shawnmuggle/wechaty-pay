const { Wechaty } = require('wechaty')
const request = require("request")

function onScan (qrcode, status) {
  require('qrcode-terminal').generate(qrcode, { small: true })  // show qrcode on console

  const qrcodeImageUrl = [
    'https://api.qrserver.com/v1/create-qr-code/?data=',
    encodeURIComponent(qrcode),
  ].join('')

  console.log(qrcodeImageUrl)
}

function onLogin (user) {
  console.log(`${user} login`)
}

function onLogout(user) {
  console.log(`${user} logout`)
}

// sendPayment(0.01, 1562577831000)
function sendPayment (priceAmount, timestamp) {
  console.log(priceAmount, timestamp);

  // const options = {
  //   method: 'POST',
  //   url: 'https://api.callbackurl.com/callback',
  //   headers: 
  //   { 
  //     'content-type': 'application/json',
  //      token: 'usertoken-callback' },
  //      body: {
  //       price_amount: priceAmount,
  //       timestamp: timestamp
  //      },
  //      json: true 
  //   };

  // request(options, function (error, response, body) {
  //   if (error) throw new Error(error);
  // });
}

// 消息来自 “微信支付”，信息格式为“微信支付收款0.01元”
async function onMessage (msg) {
  if (msg.age() > 300) {
    // console.log('Message discarded because its TOO OLD(than 5 minute)')
    return
  }

  const contact = msg.from()
  const text = msg.text()
  const msgDate = msg.date()

  if (   msg.type() !== bot.Message.Type.Attachment
      && !msg.self()
  ) {
    // console.log('Message discarded because it does not match Payment Attachment')
    return
  }

  if ( contact.name() !== '微信支付'
  ) {
    // console.log('Message is not from wechat pay - from ', contact.name())
    return
  }

  const strs = text.split('元')
  if (strs.length >= 1) {
    const str= strs[0]
    const strs2 = str.split('微信支付收款')
    if (strs2.length >= 1) {
      const priceStr = strs2[1]
      sendPayment(parseFloat(priceStr), msgDate.getTime())
    }
  }
}

const bot = new Wechaty()

bot.on('scan',    onScan)
bot.on('login',   onLogin)
bot.on('logout',  onLogout)
bot.on('message', onMessage)

bot.start()
.then(() => console.log('Starter Bot Started.'))
.catch(e => console.error(e))
