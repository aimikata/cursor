

// Regex to find the Story marker, allowing for variable whitespace around brackets or text.
// Updated to include common markers like ◆【SCENE DESCRIPTION】 and ◆【STORY & ACTION】
export let STORY_MARKER_REGEX = new RegExp('◆\\s*【\\s*(?:ストーリー|Story_Description|SCENE DESCRIPTION|STORY & ACTION|SCENE)\\s*】', 'i');

/**
 * Splits the full prompt into a hidden header (config) and a visible body (story).
 * The split occurs at the STORY_MARKER.
 * Header includes the marker itself to ensure clean separation.
 */
export function splitPrompt(fullPrompt: string): { header: string; body: string } {
  // Use a fresh regex instance to avoid issues with lastIndex in global regexes
  let localRegex = new RegExp(STORY_MARKER_REGEX.source, 'i');
  let match = fullPrompt.match(localRegex);
  
  if (!match) {
    // If no specific story marker is found, assume the entire prompt is the body
    // and there is no distinct header to hide.
    return { header: '', body: fullPrompt };
  }
  
  // The split index is the end of the matched string (the marker itself).
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
