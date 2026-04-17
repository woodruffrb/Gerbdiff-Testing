// ============================================================
// GerbDiff — Diff Worker
// Computes XOR diff + region detection off the main thread.
// ============================================================
import { shiftBoundingBox } from '../alignment';
import { calculateZoomToFit, unionBoundingBox } from '../canvas-renderer';
import { computeXorDiff } from './xor-diff';
import { findChangeRegions, clusterRegions } from './change-regions';
self.onmessage = (e) => {
    const { id, imageA, imageB, resolution, alignment } = e.data;
    try {
        const bboxB = alignment?.detected
            ? shiftBoundingBox(imageB.boundingBox, alignment)
            : imageB.boundingBox;
        const bbox = unionBoundingBox(imageA.boundingBox, bboxB);
        const viewport = calculateZoomToFit(bbox, resolution, resolution);
        const coordOffset = alignment?.detected
            ? { x: alignment.offsetX, y: alignment.offsetY }
            : undefined;
        const { diffImageData, changedPixelCount, totalPixelCount } = computeXorDiff(imageA, imageB, resolution, resolution, viewport, coordOffset);
        const rawRegions = findChangeRegions(diffImageData, viewport);
        const changeRegions = clusterRegions(rawRegions);
        self.postMessage({
            id,
            changeRegions,
            totalChangedPixels: changedPixelCount,
            totalPixels: totalPixelCount,
            changePercentage: totalPixelCount > 0 ? (changedPixelCount / totalPixelCount) * 100 : 0,
            diffImageData,
        });
    }
    catch (err) {
        self.postMessage({
            id,
            error: err instanceof Error ? err.message : String(err),
        });
    }
};
