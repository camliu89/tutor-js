ExtractTextPlugin = require 'extract-text-webpack-plugin'
isProduction = process.env.NODE_ENV is 'production'
LOADERS = if isProduction then [] else ["react-hot", "webpack-module-hot-accept"]

module.exports =
  cache: true

  entry:
    tutor: ["./index.coffee"]

  output:
    path: 'dist'
    filename: '[name].js'
    publicPath: '/dist/'

  plugins: [
    #new ExtractTextPlugin("tutor.css")
  ]

  module:
    noParse: [
      /\/sinon\.js/
    ]
    loaders: [
      { test: /\.json$/,   loader: "json-loader" }
      { test: /\.coffee$/, loaders: LOADERS.concat("coffee-loader") }
      { test: /\.cjsx$/,   loaders: LOADERS.concat("coffee-jsx-loader") }
      { test: /\.less$/,   loaders:
        if isProduction then [ExtractTextPlugin.extract('css!less')]
        else LOADERS.concat('style-loader', 'css-loader', 'less-loader')
      }
      { test: /\.(png|jpg|svg)/, loader: 'file-loader?name=[name].[ext]'}
      { test: /\.(woff|woff2|eot|ttf)/, loader: "url-loader?limit=30000&name=[name]-[hash].[ext]" }
   ]
  resolve:
    extensions: ['', '.js', '.json', '.coffee', '.cjsx']

  devServer:
    contentBase: './'
    publicPath: 'http://localhost:8000/dist/'
    hotComponents: true
    historyApiFallback: true
    inline: true
    port: 8000
    # It suppress error shown in console, so it has to be set to false.
    quiet: false,
    # It suppress everything except error, so it has to be set to false as well
    # to see success build.
    noInfo: false
    stats:
      # Config for minimal console.log mess.
      assets: false,
      colors: true,
      version: false,
      hash: false,
      timings: false,
      chunks: false,
      chunkModules: false
