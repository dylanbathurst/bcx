import * as WebSocket from 'ws'
import { EventEmitter } from 'events'

type WebSocketUrlType =
  'wss://ws.prod.blockchain.info/mercury-gateway/v1/ws'
type DefaultOrigin = 'https://exchange.blockchain.com'

interface BaseOrderCreateType {
  symbol: string,
  side: 'buy' | 'sell',
  orderQty: number,
}

interface CreateLimitOrderType extends BaseOrderCreateType {
  price: number;
  execInst?: 'ALO';
}

interface SubscriptionType {
  token: string;
  action: string;
  channel: string;
  symbol: string;
  granularity?: number
}

interface ApiKeyType {
  secret: string;
}

interface ChannelsType {
  channels: string[];
}

interface PairDetailType {
  pairSymbol: string;
  granularity: number;
}

interface PairsType {
  pairs: any[];
}

type OwnProps = ApiKeyType & ChannelsType & PairsType

export default class BCX extends EventEmitter {
  private secret: ApiKeyType['secret']
  private channels: ChannelsType['channels']
  private pairs:  PairsType['pairs']
  private ws: WebSocket | undefined
  private prodUrl: WebSocketUrlType =
    'wss://ws.prod.blockchain.info/mercury-gateway/v1/ws'
  private origin: DefaultOrigin = 'https://exchange.blockchain.com'

  constructor({ secret, pairs, channels }: OwnProps) {
    super()
    if (!secret) throw new Error('You must provide a secret key')
    this.secret = secret
    this.pairs = pairs
    this.channels = channels

    this.wsConnect()
  }

  private wsConnect() {
    this.ws = new WebSocket(this.prodUrl, {
      origin: this.origin,
      headers: {
        'Cookie': `auth_token=${this.secret}`,
      }
    })

    this.ws.on('open', this.onOpen.bind(this))
    this.ws.on('message', this.onMessage.bind(this))
    this.ws.on('error', this.onError.bind(this))
    this.ws.on('close', this.onClose.bind(this))

    return this.ws
  }

  private subscribe(
    pairs: PairsType['pairs'] = ['BTC-USD'],
    channels = ['prices'],
  ) {
    const subs: SubscriptionType[] = []
    const { secret } = this

    pairs.forEach((pair: string | PairDetailType) => {
      channels.forEach(chan => {
        const msg: SubscriptionType = {
          token: secret,
          action: 'subscribe',
          channel: chan,
          symbol: (typeof pair === 'string') ? pair : pair.pairSymbol,
        }

        if (chan === 'prices') {
          msg.granularity = typeof pair !== 'string' && pair.granularity || 86400
        }

        subs.push(msg)
      })
    })

    subs.forEach(sub => {
      this.ws && this.ws.send(JSON.stringify(sub))
    })
  }

  private onOpen() {
    this.emit('open')
    this.subscribe(this.pairs, this.channels)
  }

  private onMessage(data: string) {
    const message = JSON.parse(data)
    this.emit('message', message)
  }

  private onError(err: string) {
    const errMessage = JSON.parse(err)
    this.emit('error', errMessage)
  }

  private onClose() {
    this.emit('close')
  }

  public createMarketOrder(orderInfo: BaseOrderCreateType) {
    const Order = {
      action: 'NewOrderSingle',
      channel: 'trading',
      clOrdID: 'Client ID 3',
      ordType: 'market',
      timeInForce: 'GTC',
      ...orderInfo,
    }
    this.ws && this.ws.send(JSON.stringify(Order))
  }

  public createLimitOrder(orderInfo: CreateLimitOrderType) {
    const Order = {
      action: 'NewOrderSingle',
      channel: 'trading',
      clOrdID: 'Client ID 3',
      ordType: 'limit',
      timeInForce: 'GTC',
      ...orderInfo,
    }
    this.ws && this.ws.send(JSON.stringify(Order))
  }
}
