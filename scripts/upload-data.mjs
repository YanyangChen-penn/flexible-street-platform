/**
 * upload-data.mjs — 上传 GeoJSON 数据到 Supabase
 *
 * 使用方法:
 *   node scripts/upload-data.mjs poi          ./public/data/POI_Filtered.geojson
 *   node scripts/upload-data.mjs streets      ./public/data/Street_Centerline.geojson
 *   node scripts/upload-data.mjs playstreets  ./public/data/Playstreets.geojson
 */

import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ikbtkwlrqubsdgjwuynt.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrYnRrd2xycXVic2Rnand1eW50Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTUwOTI3MCwiZXhwIjoyMDg3MDg1MjcwfQ.iB-J_g7QY3zLm4sdiUM4UNxn_9-puJGwFt4bHoOXrbM';

const BATCH_SIZE = 200;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const RPC_MAP = {
  poi: 'insert_poi_batch',
  streets: 'insert_street_batch',
  playstreets: 'insert_playstreets_batch',
};

const [,, type, filePath] = process.argv;

if (!type || !filePath || !RPC_MAP[type]) {
  console.log(`
用法:
  node scripts/upload-data.mjs poi          ./public/data/POI_Filtered.geojson
  node scripts/upload-data.mjs streets      ./public/data/Street_Centerline.geojson
  node scripts/upload-data.mjs playstreets  ./public/data/Playstreets.geojson
  `);
  process.exit(1);
}

console.log(`📂 正在读取 ${filePath}...`);
const raw = readFileSync(filePath, 'utf-8');
const geojson = JSON.parse(raw);
const features = geojson.features;
console.log(`📊 共 ${features.length} 个要素`);

const valid = features.filter(f => f.geometry && f.geometry.coordinates);
console.log(`✅ 有效要素: ${valid.length}（过滤了 ${features.length - valid.length} 个无效）`);

const rpcName = RPC_MAP[type];
let uploaded = 0;
let failed = 0;
const totalBatches = Math.ceil(valid.length / BATCH_SIZE);

for (let i = 0; i < valid.length; i += BATCH_SIZE) {
  const batch = valid.slice(i, i + BATCH_SIZE);
  const batchNum = Math.floor(i / BATCH_SIZE) + 1;

  try {
    const { data, error } = await supabase.rpc(rpcName, {
      features: batch,
    });

    if (error) {
      console.error(`❌ 批次 ${batchNum}/${totalBatches} 失败:`, error.message);
      failed += batch.length;
    } else {
      uploaded += data || batch.length;
      const pct = Math.round((uploaded / valid.length) * 100);
      process.stdout.write(`\r⬆️  上传中... ${uploaded}/${valid.length} (${pct}%) — 批次 ${batchNum}/${totalBatches}`);
    }
  } catch (err) {
    console.error(`\n❌ 批次 ${batchNum} 异常:`, err.message);
    failed += batch.length;
  }
}

console.log(`\n\n🎉 上传完成！`);
console.log(`   ✅ 成功: ${uploaded}`);
if (failed > 0) console.log(`   ❌ 失败: ${failed}`);
console.log(`   📦 目标表: ${type}`);
