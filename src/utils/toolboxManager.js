// src/utils/toolboxManager.js

export const buildDynamicToolbox = (dbBlocks, staticConfig) => {
  if (!dbBlocks || dbBlocks.length === 0) return staticConfig;

  // 1. Group DB blocks by category
  const categoryMap = {};
  dbBlocks.forEach(block => {
    if (!categoryMap[block.category]) {
      categoryMap[block.category] = [];
    }
    categoryMap[block.category].push({
      kind: 'block',
      type: block.block_name
    });
  });

  // 2. Deep clone static config to avoid mutation
  const mergedToolbox = JSON.parse(JSON.stringify(staticConfig));

  // 3. Merge into existing categories (HTML/CSS)
  mergedToolbox.contents.forEach(item => {
    // Check if this category exists in our map (e.g., "HTML", "CSS")
    // Note: You might need to adjust logic if your DB categories (e.g., "Layout") 
    // are different from Toolbox categories (e.g., "HTML")
    
    // Logic: Look for sub-categories within HTML/CSS
    if (item.contents) {
      item.contents.forEach(subItem => {
        if (subItem.kind === 'category' && categoryMap[subItem.name]) {
          const newBlocks = categoryMap[subItem.name];
          
          // Filter duplicates
          const existingTypes = new Set(subItem.contents.map(b => b.type));
          newBlocks.forEach(b => {
            if (!existingTypes.has(b.type)) {
              subItem.contents.push(b);
            }
          });
          
          // Mark as consumed
          delete categoryMap[subItem.name];
        }
      });
    }
  });

  // 4. Create new categories for anything remaining
  Object.entries(categoryMap).forEach(([catName, blocks]) => {
    // Decide where to put it. Defaults to HTML parent if not specified.
    const isCss = blocks[0]?.type?.startsWith('css_');
    const parentName = isCss ? 'CSS' : 'HTML';

    const parentCat = mergedToolbox.contents.find(c => c.name === parentName);
    if (parentCat) {
      parentCat.contents.push({
        kind: 'category',
        name: catName,
        colour: '#64748B',
        contents: blocks
      });
    }
  });

  return mergedToolbox;
};