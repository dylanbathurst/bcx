import BCX from '.'

// Instructions to obtain an api key can be found here
// https://exchange.blockchain.com/api
const YOUR_KEY = process.env.BCX_SECRET || ''

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

    // CREATES A REAL ORDER!!!
    // bcx.createMarketOrder({
    //   symbol: 'BTC-USD',
    //   side: 'buy',
    //   orderQty: 0.01,
    // })

    // CREATES A REAL ORDER!!!
    bcx.createLimitOrder({
      symbol: 'BTC-USD',
      side: 'sell',
      orderQty: 0.01,
      price: 200000,
      execInst: 'ALO', // (Optional) Post only
    })
  }
})
bcx.on('err', err => { console.log(err) })
bcx.on('close', () => { console.log('closed') })
