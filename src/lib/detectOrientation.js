export default function detectOrientation(photos) {
  const horizontal = [];
  const vertical = [];
  for (const p of photos) {
    if (p.width && p.height) {
      if (p.width > p.height) horizontal.push(p);
      else vertical.push(p);
    } else {
      vertical.push(p);
    }
  }
  return { horizontal, vertical };
}
