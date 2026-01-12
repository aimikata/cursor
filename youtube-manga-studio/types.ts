export interface CharacterProfile {
  id: string;
  name: string;
  description: string;
  imageData: string | null; // Base64 string
  mimeType: string;
}

export interface PanelConfig {
  scenario: string; // The user's rough input
}

export interface DirectorOutput {
  visual_direction: string;
  bubble_type: string;
  dialogue: string;
}

export interface GenerationResult {
  imageUrl: string | null;
  loading: boolean;
  statusMessage: string; // To show "Directing..." vs "Drawing..."
  error: string | null;
  directorOutput?: DirectorOutput;
}