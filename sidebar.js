const deployAppSidebar = require('./src/sidebars/sidebar.deployapp');
const takSidebar = require('./src/sidebars/sidebar.tak');
const blSidebar = require('./src/sidebars/sidebar.bl');

module.exports = {
  ...deployAppSidebar, // Include Deploy App Sidebar
  ...takSidebar,       // Include TAK Sidebar
  ...blSidebar,        // Include BL Sidebar
};
