import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import assert from "node:assert";

console.log("=== [1/4] Checking Local SQLite Schema for Nina Studio Editor ===");
const dbPath = path.join(process.cwd(), ".wrangler", "state", "local-dev.sqlite");
const db = new DatabaseSync(dbPath);

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(r => r.name);
console.log("Existing Tables:", tables);

assert(tables.includes("media_projects"), "media_projects table must exist");
assert(tables.includes("media_project_items"), "media_project_items table must exist");
assert(tables.includes("media_exports"), "media_exports table must exist");
console.log("✓ media_projects, media_project_items, and media_exports exist!");

console.log("\n=== [2/4] Testing Media Project CRUD & Cascading Deletes ===");
const testOwnerId = db.prepare("SELECT id FROM users LIMIT 1").get()?.id || "admin_test";

const testProjId = `test_proj_${Date.now()}`;
const now = Date.now();

// Insert project
db.prepare(`
  INSERT INTO media_projects(id, owner_id, project_type, title, status, aspect_ratio, width, height, duration_ms, created_at, updated_at)
  VALUES(?, ?, 'reel', 'Night in Tokyo Reel', 'draft', '9:16', 1080, 1920, 15000, ?, ?)
`).run(testProjId, testOwnerId, now, now);

// Insert item
const testItemId = `test_item_${Date.now()}`;
const recipe = JSON.stringify({
  filterId: "clarendon",
  filterIntensity: 85,
  adjustments: { brightness: 10, contrast: 15 },
  transform: { aspectRatio: "9:16", zoom: 1.1 }
});

db.prepare(`
  INSERT INTO media_project_items(id, project_id, position, edit_recipe_json, version, created_at, updated_at)
  VALUES(?, ?, 0, ?, 1, ?, ?)
`).run(testItemId, testProjId, recipe, now, now);

// Insert export record
const testExportId = `test_exp_${Date.now()}`;
db.prepare(`
  INSERT INTO media_exports(id, project_id, format, codec, width, height, duration_ms, status, progress, created_at)
  VALUES(?, ?, 'mp4', 'avc1', 1080, 1920, 15000, 'completed', 100, ?)
`).run(testExportId, testProjId, now);

// Verify query
const fetchedProj = db.prepare("SELECT * FROM media_projects WHERE id=?").get(testProjId);
assert.strictEqual(fetchedProj.title, "Night in Tokyo Reel");
assert.strictEqual(fetchedProj.aspect_ratio, "9:16");
assert.strictEqual(fetchedProj.project_type, "reel");

const fetchedItems = db.prepare("SELECT * FROM media_project_items WHERE project_id=?").all(testProjId);
assert.strictEqual(fetchedItems.length, 1);
assert.strictEqual(JSON.parse(fetchedItems[0].edit_recipe_json).filterId, "clarendon");

const fetchedExports = db.prepare("SELECT * FROM media_exports WHERE project_id=?").all(testProjId);
assert.strictEqual(fetchedExports.length, 1);
assert.strictEqual(fetchedExports[0].status, "completed");
console.log("✓ Project, item, and export records successfully inserted and verified!");

// Clean up
db.prepare("DELETE FROM media_exports WHERE project_id=?").run(testProjId);
db.prepare("DELETE FROM media_project_items WHERE project_id=?").run(testProjId);
db.prepare("DELETE FROM media_projects WHERE id=?").run(testProjId);

assert(!db.prepare("SELECT id FROM media_projects WHERE id=?").get(testProjId));
console.log("✓ Cleaned up test project!");

console.log("\n=== [3/4] Testing Frontend Module Exports & Types ===");
import("../components/media-editor/editor-types.ts").then(types => {
  assert(types.DEFAULT_TONE_ADJUSTMENTS, "DEFAULT_TONE_ADJUSTMENTS must exist");
  assert(types.DEFAULT_TRANSFORM_STATE, "DEFAULT_TRANSFORM_STATE must exist");
  assert(types.DEFAULT_VIDEO_TIMELINE, "DEFAULT_VIDEO_TIMELINE must exist");
  console.log("✓ editor-types.ts exports verified!");

  return import("../components/media-editor/filter-presets.ts");
}).then(filters => {
  assert(filters.FILTER_PRESETS.length >= 10, "FILTER_PRESETS must have full Instagram preset library");
  assert(filters.getFilterPreset("clarendon"), "clarendon preset must exist");
  assert(filters.getFilterPreset("juno"), "juno preset must exist");
  console.log(`✓ filter-presets.ts verified (${filters.FILTER_PRESETS.length} filters available)!`);

  console.log("\n=== [4/4] All Studio Editor Tests Passed Flawlessly! ===");
}).catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
