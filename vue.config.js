module.exports = {
  publicPath: '/',
  transpileDependencies: [
    'bootstrap-vue',
  ],
  pwa: {
    name: 'RMP Invoice',
    manifestOptions: {
      short_name: 'RMP inv',
    },
    themeColor: '#edeff1',
    appleMobileWebAppCapable: 'yes',
    workboxPluginMode: 'GenerateSW',
    workboxOptions: {
      exclude: [/htaccess/],
    },
  },
};
