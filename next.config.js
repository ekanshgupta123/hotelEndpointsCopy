/** @type {import('next').NextConfig} */
require('dotenv').config({ path: "/Users/vijayrakeshchandra/Desktop/previous/api_endpoint/Hotel-Booking-Checkin/src/app/api/reservation/.env" })

const webpack = require('webpack');

module.exports = {
  webpack: (config, { isServer }) => {
    config.plugins = config.plugins.filter(
      plugin => !(plugin instanceof webpack.EnvironmentPlugin && plugin.definitions && plugin.definitions['process.env.__NEXT_OPTIMIZE_FONTS'])
    );

    if (!process.env.__NEXT_OPTIMIZE_FONTS) {
      config.plugins.push(
        new webpack.EnvironmentPlugin({
          ...process.env,
          __NEXT_OPTIMIZE_FONTS: 'true'
        })
      );
    }
    if (!process.env.NEXT_RUNTIME && !isServer) {
      config.plugins.push(
        new webpack.EnvironmentPlugin({
          ...process.env,
          NEXT_RUNTIME: 'development'
        })
      );
    }
    return config;
  }
};
