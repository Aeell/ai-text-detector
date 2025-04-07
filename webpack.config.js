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
    filename: '[name].[contenthash].js',
    clean: true,
    publicPath: '/ai-text-detector/'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ['@babel/plugin-transform-runtime']
          }
        }
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '/ai-text-detector/'
            }
          },
          'css-loader',
          'postcss-loader'
        ]
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'images/[name].[hash][ext]'
        }
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css'
    }),
    new HtmlWebpackPlugin({
      template: './index.html',
      filename: 'index.html',
      chunks: ['main'],
      minify: false,
      scriptLoading: 'module'
    }),
    new HtmlWebpackPlugin({
      template: './blog.html',
      filename: 'blog.html',
      chunks: ['main'],
      minify: false,
      scriptLoading: 'module'
    }),
    new HtmlWebpackPlugin({
      template: './educators.html',
      filename: 'educators.html',
      chunks: ['main'],
      minify: false,
      scriptLoading: 'module'
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
          from: '*.css',
          to: '[name][ext]'
        }
      ]
    })
  ],
  optimization: {
    moduleIds: 'deterministic',
    runtimeChunk: 'single',
    splitChunks: {
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
    modules: ['node_modules']
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