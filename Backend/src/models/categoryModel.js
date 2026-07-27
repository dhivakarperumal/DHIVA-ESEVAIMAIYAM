const { getDB } = require('../config/db');

const CATEGORY_FIELDS = [
  'id',
  'cid',
  'name',
  'image',
  'description',
  'subcategories',
  'status',
  'created_at',
  'updated_at'
].join(', ');

function parseCategory(row) {
  if (!row) return null;
  return {
    ...row,
    subcategories: row.subcategories ? JSON.parse(row.subcategories) : []
  };
}

function isNumericId(val) {
  return /^\d+$/.test(String(val));
}

function idClause(idOrCid) {
  if (isNumericId(idOrCid)) {
    return { clause: 'id = ?', values: [Number(idOrCid)] };
  }
  return { clause: 'cid = ?', values: [String(idOrCid)] };
}

async function findAll() {
  const db = getDB();
  const [rows] = await db.execute(
    `SELECT ${CATEGORY_FIELDS} FROM categories ORDER BY created_at ASC`
  );
  return rows.map(parseCategory);
}

async function findLast() {
  const db = getDB();
  const [rows] = await db.execute(
    `SELECT ${CATEGORY_FIELDS} FROM categories ORDER BY created_at DESC LIMIT 1`
  );
  return parseCategory(rows[0]);
}

// Accepts numeric id or string cid
async function findById(idOrCid) {
  const db = getDB();
  const { clause, values } = idClause(idOrCid);
  const [rows] = await db.execute(
    `SELECT ${CATEGORY_FIELDS} FROM categories WHERE ${clause} LIMIT 1`,
    values
  );
  return parseCategory(rows[0]);
}

async function createCategory(category) {
  const db = getDB();
  const [result] = await db.execute(
    `INSERT INTO categories
      (cid, name, image, description, subcategories, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
    [
      category.cid,
      category.name,
      category.image || null,
      category.description || '',
      JSON.stringify(category.subcategories || []),
      category.status || 'Active'
    ]
  );

  return findById(result.insertId);
}

// idOrCid may be numeric id or cid
async function updateCategory(idOrCid, updates) {
  const db = getDB();
  const fields = [];
  const values = [];

  if (updates.name !== undefined) {
    fields.push('name = ?');
    values.push(updates.name);
  }
  if (updates.image !== undefined) {
    fields.push('image = ?');
    values.push(updates.image);
  }
  if (updates.description !== undefined) {
    fields.push('description = ?');
    values.push(updates.description);
  }
  if (updates.subcategories !== undefined) {
    fields.push('subcategories = ?');
    values.push(JSON.stringify(updates.subcategories || []));
  }
  if (updates.status !== undefined) {
    fields.push('status = ?');
    values.push(updates.status);
  }

  if (!fields.length) {
    return findById(idOrCid);
  }

  fields.push('updated_at = NOW()');
  const { clause, values: idValues } = idClause(idOrCid);
  const query = `UPDATE categories SET ${fields.join(', ')} WHERE ${clause}`;
  await db.execute(query, [...values, ...idValues]);
  return findById(idOrCid);
}

async function deleteCategory(idOrCid) {
  const db = getDB();
  const { clause, values } = idClause(idOrCid);
  await db.execute(`DELETE FROM categories WHERE ${clause}`, values);
}

module.exports = {
  findAll,
  findLast,
  findById,
  createCategory,
  updateCategory,
  deleteCategory,
};
