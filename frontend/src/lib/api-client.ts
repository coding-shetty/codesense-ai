/**
 * Processes an SSE stream chunk by chunk from the backend pipeline.
 * Handles decoding text, splitting data boundaries, and firing callbacks.
 */
export async function streamCodeAnalysis(
  sourceCode: string,
  fileName: string,
  mentorMode: boolean,
  callbacks: {
    onMetrics: (data: any) => void;
    onStatus: (data: any) => void;
    onChunk: (text: string) => void;
    onError: (err: string) => void;
  }
) {
  try {
    const response = await fetch('http://localhost:8000/api/v1/analyze/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source_code: sourceCode,
        file_name: fileName,
        mentor_mode: mentorMode
      })
    });

    if (!response.body) {
      callbacks.onError("No data stream returned from the processing matrix.");
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || "";

      for (const line of lines) {
        const cleanLine = line.trim();
        if (!cleanLine) continue;

        if (cleanLine.startsWith('data: ')) {
          const rawData = cleanLine.slice(6).trim();
          try {
            const parsed = JSON.parse(rawData);
            
            // Check cross-reference event headers via string tracking or explicit frames
            if (line.includes('structural_metrics') || parsed.complexity) {
              callbacks.onMetrics(parsed);
            } else if (line.includes('status')) {
              callbacks.onStatus(parsed);
            } else if (parsed.chunk) {
              callbacks.onChunk(parsed.chunk);
            } else if (parsed.detail) {
              callbacks.onError(parsed.detail);
            }
          } catch (e) {
            // Suppress intermediate chunk noise gracefully
          }
        }
      }
    }
  } catch (error: any) {
    callbacks.onError(error?.message || "Critical transport layer connection failure.");
  }
}