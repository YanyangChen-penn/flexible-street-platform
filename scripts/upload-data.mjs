/**
 * upload-data.mjs — 上传 GeoJSON 数据到 Supabase
 *
 * 使用方法:
 *   node scripts/upload-data.mjs poi       ./public/data/POI_Filtered.geojson
 *   node scripts/upload-data.mjs streets   ./public/data/Street_Centerline.geojson
 *
 * 需要先安装: npm install @supabase/supabase-js
 * 需要在 .env 中配置 VITE_SUPABASE_URL 和 SUPABASE_SERVICE_KEY
 * （service_role key 在 Supabase Dashboard → Settings → API → service_role secret）
 */

import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

// ── 配置 ──
const SUPABASE_URL = 'https://ikbtkwlrqubsdgjwuynt.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrYnRrd2xycXVic2Rnand1eW50Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTUwOTI3MCwiZXhwIjoyMDg3MDg1MjcwfQ.iB-J_g7QY3zLm4sdiUM4UNxn_9-puJGwFt4bHoOXrbM';

const BATCH_SIZE = 200; // 每批上传条数

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ── 解析命令行参数 ──
const [,, type, filePath] = process.argv;

if (!type || !filePath) {
  console.log(`
用法:
  node scripts/upload-data.mjs poi     ./public/data/POI_Filtered.geojson
  node scripts/upload-data.mjs streets ./public/data/Street_Centerline.geojson

环境变量:
  SUPABASE_SERVICE_KEY=your_service_role_key_here
  `);
  process.exit(1);
}

if (!['poi', 'streets'].includes(type)) {
  console.error('❌ type 必须是 "poi" 或 "streets"');
  process.exit(1);
}

// ── 读取 GeoJSON ──
console.log(`📂 正在读取 ${filePath}...`);
const raw = readFileSync(filePath, 'utf-8');
const geojson = JSON.parse(raw);
const features = geojson.features;
console.log(`📊 共 ${features.length} 个要素`);

// ── 过滤无效几何 ──
const valid = features.filter(f => f.geometry && f.geometry.coordinates);
console.log(`✅ 有效要素: ${valid.length}（过滤了 ${features.length - valid.length} 个无效）`);

// ── 分批上传 ──
const rpcName = type === 'poi' ? 'insert_poi_batch' : 'insert_street_batch';
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
console.log(`   📦 目标表: ${type === 'poi' ? 'poi' : 'street_centerline'}`);
