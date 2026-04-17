// ============================================================
// GerbDiff — Parse Worker
// Runs Gerber/Excellon parsing off the main thread
// ============================================================
import { parseFile } from './parse-file';
self.onmessage = (e) => {
    const { id, fileName, content } = e.data;
    try {
        const result = parseFile(fileName, content);
        self.postMessage({ id, result });
    }
    catch (err) {
        self.postMessage({
            id,
            error: err instanceof Error ? err.message : String(err),
        });
    }
};
