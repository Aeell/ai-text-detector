const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: {
    main: './main.js',
    'ai-detector': './ai-detector.js',
    'ui-controller': './ui-controller.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js',
    clean: true,
    publicPath: '/ai-text-detector/',
    library: {
      name: 'AITextDetector',
      type: 'umd',
      umdNamedDefine: true
    },
    globalObject: 'this'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                targets: '> 0.25%, not dead',
                useBuiltIns: 'usage',
                corejs: 3,
                modules: false
              }]
            ],
            plugins: [
              '@babel/plugin-transform-runtime',
              '@babel/plugin-transform-modules-umd',
              '@babel/plugin-syntax-dynamic-import'
            ]
          }
        }
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1
            }
          },
          'postcss-loader'
        ]
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'images/[name][ext]'
        }
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css'
    }),
    new HtmlWebpackPlugin({
      template: './index.html',
      filename: 'index.html',
      chunks: ['main'],
      minify: false,
      inject: 'body',
      scriptLoading: 'blocking'
    }),
    new HtmlWebpackPlugin({
      template: './blog.html',
      filename: 'blog.html',
      chunks: ['main'],
      minify: false,
      inject: 'body',
      scriptLoading: 'blocking'
    }),
    new HtmlWebpackPlugin({
      template: './educators.html',
      filename: 'educators.html',
      chunks: ['main'],
      minify: false,
      inject: 'body',
      scriptLoading: 'blocking'
    }),
    new CopyWebpackPlugin({
      patterns: [
        { 
          from: 'sherlock-ai-background.jpg',
          to: 'images/sherlock-ai-background.jpg'
        },
        {
          from: '_headers',
          to: '_headers'
        }
      ]
    })
  ],
  optimization: {
    moduleIds: 'deterministic',
    runtimeChunk: false,
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  },
  resolve: {
    extensions: ['.js'],
    modules: ['node_modules'],
    fallback: {
      "path": false,
      "fs": false
    }
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    port: 9000,
    hot: true
  }
}; 