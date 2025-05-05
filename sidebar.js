module.exports = {
  // Android
  ...require('./src/sidebars/android/sidebar.deployapp'),
  ...require('./src/sidebars/android/sidebar.tak'),
  ...require('./src/sidebars/android/sidebar.bl'),

  // iOS
  ...require('./src/sidebars/ios/sidebar.deployapp'),
  ...require('./src/sidebars/ios/sidebar.tak'),
  ...require('./src/sidebars/ios/sidebar.bl'),

  // Windows
  ...require('./src/sidebars/windows/sidebar.deployapp'),
  ...require('./src/sidebars/windows/sidebar.tak'),
  ...require('./src/sidebars/windows/sidebar.bl'),
};