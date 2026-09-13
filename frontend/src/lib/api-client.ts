/**
 * Processes an SSE stream chunk by chunk from the backend pipeline.
 * Handles decoding text, splitting data boundaries, and firing callbacks.
 */
import { apiUrl, apiHeaders } from "./config";

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
    const response = await fetch(apiUrl("/api/v1/analyze/stream"), {
      method: "POST",
      headers: apiHeaders(),
      body: JSON.stringify({
        source_code: sourceCode,
        file_name: fileName,
        mentor_mode: mentorMode,
        user_id: "default-local-user",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      callbacks.onError(
        `Server returned ${response.status}: ${errorText || response.statusText}`
      );
      return;
    }

    if (!response.body) {
      callbacks.onError("No data stream returned from the processing matrix.");
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let currentEvent = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      // Keep the last potentially-incomplete line in the buffer
      buffer = lines.pop() || "";

      for (const line of lines) {
        const cleanLine = line.trim();
        if (!cleanLine) continue;

        if (cleanLine.startsWith("event: ")) {
          currentEvent = cleanLine.slice(7).trim();
        } else if (cleanLine.startsWith("data: ")) {
          const rawData = cleanLine.slice(6).trim();
          try {
            const parsed = JSON.parse(rawData);

            // Coordinate event routing using the tracked currentEvent
            if (currentEvent === "structural_metrics" || (!currentEvent && parsed.complexity)) {
              callbacks.onMetrics(parsed);
            } else if (currentEvent === "status" || (!currentEvent && parsed.message)) {
              callbacks.onStatus(parsed);
            } else if (currentEvent === "ai_stream" || (!currentEvent && parsed.chunk !== undefined)) {
              callbacks.onChunk(parsed.chunk);
            } else if (currentEvent === "system_error" || (!currentEvent && parsed.detail)) {
              callbacks.onError(parsed.detail);
            }
          } catch (_e) {
            // Suppress intermediate chunk noise gracefully
          }
          currentEvent = ""; // Reset for next SSE frame
        }
      }
    }
  } catch (error: any) {
    callbacks.onError(
      error?.message || "Critical transport layer connection failure."
    );
  }
}
