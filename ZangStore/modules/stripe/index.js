import stripe from 'stripe'
import config from '../../config'

console.log('===================================', config.stripe.secretKey.substr(0, 8));
export default stripe(
  config.stripe.secretKey
)
