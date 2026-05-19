export default function slicePhotos(photos, numSections) {
  if (!photos || photos.length === 0)
    return Array.from({ length: numSections }, () => []);
  const result = [];
  const perSection = Math.ceil(photos.length / numSections);
  for (let i = 0; i < numSections; i++) {
    result.push(photos.slice(i * perSection, (i + 1) * perSection));
  }
  return result;
}
