# Wechaty Pay - 让线上没有难做的生意

## TLDR
本文主要面对没有营业执照，想使用微信或支付宝在线收款的中小企业或者个人开发者，日收入在5K以下（菠菜类或者想偷税者请绕道）。

自从使用了Wechaty，资金及时到账，收款后立即通知。即开即用，高并发，超稳定不掉单。

<img src="https://cdn.mugglepay.com/docs/pics/paypic.png" alt="让线上没有难做的生意" width="250x"/>

<!--more-->

## 背景
随处可见微信和支付宝的支付二维码，已经让超市水果店和煎饼果子摊贩没有难做的生意。然而在线支付可就没那么容易了。接口大部分需要企业资质认证，或者需要备案域名以及开通权限，对于中小型商户门槛非常高。大部分人会在收到款后，手动确认订单，经常出现订单延误或者遗漏。然而市面上的解决方案都差强人意。那么这个线上支付的流程如何利用Wechaty优化一下呢？

![各种支付方案对比](https://cdn.mugglepay.com/docs/pics/paycompare.png)

## 技术实现

整个收款过程分为3步：
1. 用户选择支付金额后，付款页面打开对应的付款码（支付宝可自定义金额），用户扫码付款
2. 确认收款后（```onMessage```），跟后端发送回调收款金额及收款时间（```sendPayment```）
3. 后台根据金额以及时间，把对应的订单自动标记

下面的例子以第2步为例，如何在后台确认收款，以及跟后端发送回调。

```
// Wechaty 经典启动
const bot = new Wechaty()
bot.on('scan',    onScan)
bot.on('login',   onLogin)
bot.on('message', onMessage)
bot.start()

// 微信收款的消息提示
async function onMessage (msg) {
  if ( msg.type() !== bot.Message.Type.Attachment && !msg.self()
    || contact.name() !== '微信支付') {
    return
  }
  const strs = msg.text().split('元')
  if (strs.length >= 1) {
    const prices = strs[0].split('微信支付收款')
    if (prices.length >= 1) {
      const priceStr = prices[1]
      sendPayment(parseFloat(priceStr), msg.date().getTime())
    }
  }
}

// 收到金额之后，进行确认订单回调 
function sendPayment (priceAmount, timestamp) {
  const options = {
    method: 'POST',
    url: 'https://api.callbackaddress.com/api/admin/callback',
    headers: { 'content-type': 'application/json', 'token': 'XXXXXX'},
    body: {'amount': priceAmount, 'timestamp': timestamp },
    json: true 
  };
  request(options, function (error, response, body) {
    if (error) throw new Error(error);
  });
}
```

支付宝道理类似，不过目前产品包装没有Wechaty这么优秀的代码库。半自动操作如下：
1.  扫码登录支付宝账号，在Headers中获取Cookie。操作类似于``` bot.on('scan',    onScan) ```
2.  轮询获取订单列表，如果有新支付订单，，跟后端发送回调收款金额及收款时间（```sendPayment```）
3.  由于此处使用了轮询的方式，为了防止频繁访问被支付宝风控，仅当有待支付订单才会高频访问订单接口。


## 效果预览

终于可以一站式的管理所有微信和支付宝的订单了！每笔订单的时间，金额，还有每天收入统计一览无余。

![后台订单管理](https://cdn.mugglepay.com/docs/pics/paymentsx.jpg)

## 产品实现

如果还是觉得步骤有点繁琐？那可以试一下这款基于[桔子互动](https://www.botorange.com/)的云端服务哦。

* 支持微信扫码托管（基于桔子互动服务）
* 支持支付宝扫码托管
* 保障安全性，不记录个人账户密码
* 资金实时到账，不经过第三方

<img src="https://cdn.mugglepay.com/docs/pics/botorange.png" alt="桔子互动" width="500x"/>


本文仅供技术产品交流参考，建议使用官方认证接口。请勿使用此项目做违反微信、支付宝规定或者其他违法事情！
