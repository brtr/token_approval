const { environment } = require('@rails/webpacker')

const webpack = require('webpack')
environment.plugins.prepend('Provide',
  new webpack.ProvidePlugin({
    $: 'jquery',
    jQuery: 'jquery',
    jquery: 'jquery',
    Popper: ['popper.js', 'default'],
    moment: 'moment/moment'
  })
)

environment.plugins.prepend('env',
  new webpack.DefinePlugin({
    'NODE_ENV': JSON.stringify(process.env)
  })
)

module.exports = environment
