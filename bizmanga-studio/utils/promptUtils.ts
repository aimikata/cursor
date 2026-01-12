
// Regex to find the Story marker, allowing for variable whitespace around brackets or text.
// Matches: ◆【ストーリー】, ◆ 【ストーリー】, ◆【 ストーリー 】, ◆【Story_Description】 etc.
// Using new RegExp to avoid potential unicode parsing issues in literals
export let STORY_MARKER_REGEX = new RegExp('◆\\s*【\\s*(?:ストーリー|Story_Description)\\s*】');

/**
 * Splits the full prompt into a hidden header (config) and a visible body (story).
 * The split occurs at the STORY_MARKER.
 * Header includes the marker itself to ensure clean separation.
 */
export function splitPrompt(fullPrompt: string): { header: string; body: string } {
  let match = fullPrompt.match(STORY_MARKER_REGEX);
  
  if (!match) {
    // If marker not found, check for a "1コマ目" as a fallback, or return full prompt as body.
    // Given the instruction to keep config hidden, if we can't find the marker, we assume
    // the structure might be different. Let's return everything as body to be safe for editing.
    return { header: '', body: fullPrompt };
  }
  
  // The split index is the end of the matched string (the marker).
  // match.index is the start of the match.
  let splitIndex = (match.index || 0) + match[0].length;
  
  let header = fullPrompt.substring(0, splitIndex);
  let body = fullPrompt.substring(splitIndex);
  
  return { header, body };
}

/**
 * Recombines the header and body into the full prompt for the AI.
 */
export function combinePrompt(header: string, body: string): string {
  return `${header}${body}`;
}
