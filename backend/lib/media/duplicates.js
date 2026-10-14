/**
 * Classifies Cloudinary resources into active / duplicate / orphan.
 *
 * Identical content is detected by Cloudinary's `etag` (MD5 of the stored file)
 * together with byte size and resource type.
 *  - active:    referenced anywhere (DB or source). Never deleted, even when it is
 *               one of several identical copies, because its URL is in use.
 *  - duplicate: unreferenced copy of content that also exists under another public_id.
 *  - orphan:    unreferenced and unique content.
 * Resources without an etag are never grouped as duplicates.
 */
const contentKey = (r) =>
  r.etag ? `${r.resource_type}:${r.etag}:${r.bytes || 0}` : `${r.resource_type}:id:${r.public_id}`;

const classifyResources = (resources, isReferenced) => {
  const groups = new Map();
  for (const r of resources) {
    const key = contentKey(r);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(r);
  }

  const active = [];
  const duplicates = [];
  const orphans = [];
  const redundantReferenced = [];

  for (const members of groups.values()) {
    const referenced = members.filter((r) => isReferenced(r));
    const unreferenced = members.filter((r) => !isReferenced(r));
    active.push(...referenced);
    if (referenced.length > 1) redundantReferenced.push(...referenced.slice(1));

    if (!unreferenced.length) continue;
    if (members.length === 1) {
      orphans.push(unreferenced[0]);
    } else if (referenced.length) {
      duplicates.push(...unreferenced);
    } else {
      const [first, ...rest] = [...unreferenced].sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
      );
      orphans.push(first);
      duplicates.push(...rest);
    }
  }

  return { active, duplicates, orphans, redundantReferenced, groups: groups.size };
};

const sumBytes = (list) => list.reduce((total, r) => total + (r.bytes || 0), 0);

module.exports = { classifyResources, contentKey, sumBytes };
