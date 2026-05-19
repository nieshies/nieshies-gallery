const SECTION_KEYS = [
  "filmStrip", "horizontalJourney", "cameraRoll", "floatingCloud",
  "stackStory", "collageGrid", "cinematicViewer", "memoryWall", "parallaxLayers",
];

export default function slicePhotos(photos) {
  const result = {};
  const n = Math.max(SECTION_KEYS.length, photos.length);
  const perSection = Math.max(1, Math.floor(photos.length / SECTION_KEYS.length));
  let offset = 0;
  for (let i = 0; i < SECTION_KEYS.length; i++) {
    const count = i === SECTION_KEYS.length - 1 ? Math.max(0, photos.length - offset) : perSection;
    result[SECTION_KEYS[i]] = photos.slice(offset, offset + count);
    offset += count;
    if (offset >= photos.length) {
      for (let j = i + 1; j < SECTION_KEYS.length; j++) result[SECTION_KEYS[j]] = [];
      break;
    }
  }
  return result;
}
