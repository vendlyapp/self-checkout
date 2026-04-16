const { query } = require('./lib/database');
(async () => {
  try {
    const all = await query('SELECT id, name, sku, "taxRate", "isActive" FROM "Product" ORDER BY name');
    console.log(`\n=== TOTAL PRODUCTS: ${all.rows.length} ===\n`);
    const groups = { null: [], '0': [], '0.026': [], '0.081': [], other: [] };
    for (const p of all.rows) {
      const tr = p.taxRate;
      if (tr === null || tr === undefined || tr === '') groups.null.push(p);
      else {
        const n = typeof tr === 'number' ? tr : parseFloat(String(tr).replace(',', '.'));
        if (n === 0) groups['0'].push(p);
        else if (Math.abs(n - 0.026) < 0.0005) groups['0.026'].push(p);
        else if (Math.abs(n - 0.081) < 0.0005) groups['0.081'].push(p);
        else groups.other.push({ ...p, numeric: n });
      }
    }
    console.log(`NULL (sin taxRate): ${groups.null.length}`);
    groups.null.forEach(p => console.log(`  [${p.isActive?'ON':'off'}] ${p.name} — ${p.sku}`));
    console.log(`\n0% (Befreit): ${groups['0'].length}`);
    groups['0'].forEach(p => console.log(`  [${p.isActive?'ON':'off'}] ${p.name}`));
    console.log(`\n2.6% (Reduziert): ${groups['0.026'].length}`);
    groups['0.026'].forEach(p => console.log(`  [${p.isActive?'ON':'off'}] ${p.name}`));
    console.log(`\n8.1% (Normal): ${groups['0.081'].length}`);
    groups['0.081'].forEach(p => console.log(`  [${p.isActive?'ON':'off'}] ${p.name}`));
    console.log(`\nANOMALIAS (valores raros tipo 0.08, 2.6 sin dividir, etc): ${groups.other.length}`);
    groups.other.forEach(p => console.log(`  [${p.isActive?'ON':'off'}] ${p.name} — taxRate=${p.taxRate} (num=${p.numeric})`));
    process.exit(0);
  } catch (e) { console.error(e); process.exit(1); }
})();
