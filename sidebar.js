const daSidebar = require('./src/sidebars/sidebar.deployapp');
const takSidebar = require('./src/sidebars/sidebar.tak');
const blSidebar = require('./src/sidebars/sidebar.bl');

module.exports = {
  ...daSidebar, // Include Deploy App Sidebar
  ...takSidebar,       // Include TAK Sidebar
  ...blSidebar,        // Include BL Sidebar
};
