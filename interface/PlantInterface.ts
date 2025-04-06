interface SimilarImage {
  id: string;
  url: string;
  license_name?: string;
  license_url?: string;
  citation?: string;
  similarity: number;
  url_small: string;
}

interface PlantSuggestion {
  id: string;
  name: string;
  probability: number;
  similar_images: SimilarImage[];
  details: {
    common_names?: string[];
    common_uses?: string[];
    language: string;
    entity_id: string;
    description?: string;
    best_light_condition ?: string;
    best_soil_type ?: string,
    best_watering ?: string;
    watering?: string;
  };
}

export interface PlantRecognitionResult {
  access_token: string;
  model_version: string;
  custom_id: string | null;
  image: String;
  input: {
    latitude: number;
    longitude: number;
    similar_images: boolean;
    images: string[];
    datetime: string;
  };
  result: {
    is_plant: {
      probability: number;
      binary: boolean;
      threshold: number;
    };
    classification: {
      suggestions: PlantSuggestion[];
    };
  };
  status: string;
  sla_compliant_client: boolean;
  sla_compliant_system: boolean;
  created: number;
  completed: number;
}