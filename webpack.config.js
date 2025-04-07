const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  entry: {
    main: './main.js',
    'ai-detector': './ai-detector.js',
    'ui-controller': './ui-controller.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
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
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '../'
            }
          },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              sourceMap: true
            }
          },
          'postcss-loader'
        ]
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|ico)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'images/[name].[hash][ext]'
        }
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name].[hash][ext]'
        }
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash].css',
      chunkFilename: 'css/[id].[contenthash].css'
    }),
    new HtmlWebpackPlugin({
      template: './index.html',
      filename: 'index.html',
      chunks: ['main'],
      minify: false,
      inject: 'body',
      scriptLoading: 'blocking',
      favicon: './favicon.ico'
    }),
    new HtmlWebpackPlugin({
      template: './blog.html',
      filename: 'blog.html',
      chunks: ['main'],
      minify: false,
      inject: 'body',
      scriptLoading: 'blocking',
      favicon: './favicon.ico'
    }),
    new HtmlWebpackPlugin({
      template: './educators.html',
      filename: 'educators.html',
      chunks: ['main'],
      minify: false,
      inject: 'body',
      scriptLoading: 'blocking',
      favicon: './favicon.ico'
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
        },
        {
          from: 'service-worker.js',
          to: 'service-worker.js'
        },
        {
          from: 'favicon.ico',
          to: 'favicon.ico'
        }
      ]
    })
  ],
  optimization: {
    moduleIds: 'deterministic',
    runtimeChunk: 'single',
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: Infinity,
      minSize: 0,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
            return `vendor.${packageName.replace('@', '')}`;
          }
        }
      }
    },
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          format: {
            comments: false,
          },
          compress: {
            drop_console: process.env.NODE_ENV === 'production',
            drop_debugger: process.env.NODE_ENV === 'production'
          }
        },
        extractComments: false
      })
    ]
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
    hot: true,
    historyApiFallback: {
      rewrites: [
        { from: /^\/ai-text-detector\//, to: '/index.html' }
      ]
    }
  },
  stats: {
    errorDetails: true
  },
  devtool: process.env.NODE_ENV === 'production' ? 'source-map' : 'eval-source-map'
}; 