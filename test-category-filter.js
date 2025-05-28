// Simple test to validate category filtering logic
const categories = [
  { id: 1, name: 'Electronics' },
  { id: 2, name: 'Furniture' },
  { id: 3, name: 'Equipment' }
];

const assets = [
  { id: 1, name: 'Laptop', categoryName: 'Electronics' },
  { id: 2, name: 'Desk', categoryName: 'Furniture' },
  { id: 3, name: 'Projector', categoryName: 'Equipment' }
];

const assetItems = [
  { asset: 1, serial_number: 'LAP001', asset_name: 'Laptop' },
  { asset: 2, serial_number: 'DSK001', asset_name: 'Desk' },
  { asset: 3, serial_number: 'PRJ001', asset_name: 'Projector' }
];

// Test the category filtering logic
function testCategoryFilter(reportType, categoryFilter, data) {
  console.log(`\nTesting ${reportType} with category filter: ${categoryFilter}`);
  
  return data.filter((item) => {
    if (reportType === 'assetItemReport') {
      // For asset items, find the related asset and check its category
      if (typeof item.asset === 'number') {
        const relatedAsset = assets.find(a => a.id === item.asset);
        if (relatedAsset) {
          const category = categories.find(c => c.name === relatedAsset.categoryName);
          const matches = category?.name === categoryFilter;
          console.log(`Asset item ${item.serial_number}: asset ${item.asset} -> category ${category?.name} -> matches: ${matches}`);
          return matches;
        }
      }
      return false;
    } else {
      // For assets, check categoryName directly
      const category = categories.find(c => c.name === item.categoryName);
      const matches = category?.name === categoryFilter;
      console.log(`Asset ${item.name}: category ${category?.name} -> matches: ${matches}`);
      return matches;
    }
  });
}

// Test assets filtering
console.log('=== TESTING ASSETS FILTERING ===');
const filteredAssets = testCategoryFilter('assets', 'Electronics', assets);
console.log('Filtered assets:', filteredAssets.map(a => a.name));

// Test asset items filtering
console.log('\n=== TESTING ASSET ITEMS FILTERING ===');
const filteredAssetItems = testCategoryFilter('assetItemReport', 'Electronics', assetItems);
console.log('Filtered asset items:', filteredAssetItems.map(i => i.serial_number));

console.log('\n=== TEST COMPLETED ===');
