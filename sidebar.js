const sidebarData = require('./src/sidebars/index.json');

function getItem(item) {
  if (item.type === 'category') {
    return {
      type: 'category',
      label: item.label,
      items: item.items.map(getItem),
    };
  }
  if (item.type === 'doc') {
    return item.id;
  }
  return item;
}

module.exports = {
  tutorialSidebar: sidebarData.items.map(getItem),
};
