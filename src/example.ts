import BCX from '.'

// Instructions to obtain an api key can be found here
// https://exchange.blockchain.com/api
const YOUR_KEY = 'PUT YOUR KEY HERE'

const bcx = new BCX({
  secret: `${YOUR_KEY}`,
  // pairs: [{ pairSymbol: 'BTC-USD', granularity: 3600 }, 'BTC-EUR'],
  pairs: ['BTC-USD'],
  channels: ['trading', 'balances'],
})

bcx.on('open', () => { console.log('opened') })
bcx.on('message', data => {
  console.log('message', data)
  if ((data.event === 'subscribed') && (data.channel === 'trading')) {
    bcx.createMarketOrder({
      symbol: 'BTC-USD',
      side: 'sell',
      orderQty: 0.0001,
    })
  }
})
bcx.on('err', err => { console.log(err) })
bcx.on('close', () => { console.log('closed') })
