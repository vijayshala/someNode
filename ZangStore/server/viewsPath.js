var path = require('path');

export const productionViews = [
  path.join(__dirname, 'cart/views'),
  path.join(__dirname, 'order/views')
]

export const buildViews = [
  path.join(__dirname.replace('build', 'src/server'), 'cart'),
  path.join(__dirname.replace('build', 'src/server'), 'order')  
]
