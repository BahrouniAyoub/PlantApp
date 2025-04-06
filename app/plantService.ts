// app/plantService.ts
import axios from 'axios';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

const PLANT_ID_API_KEY = 'c1y6SCBSR2QwfpCDFWdFQochJctTl64VgtVg9z5hoxGvz3n882';
const TREFLE_API_KEY = 'zbQdqwa18n_4PCYzYHYfIG4tKoAEVgvKBO_Nl4J5Mew';
const PERENUAL_API_KEY = 'sk-oetU67e94b70ca96f9507'

const PLANT_ID_API_URL = 'https://plant.id/api/v3/identification?details=common_names,url,description,taxonomy,rank,gbif_id,inaturalist_id,image,synonyms,edible_parts,watering,best_light_condition,best_soil_type,common_uses,cultural_significance,toxicity,best_watering&language=en';
const PLANT_ID_API_DETAIL_URL = 'https://plant.id/api/v3/kb/plants';


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
    description?: {
      value: string;
      citation?: string;
      license_name?: string;
      license_url?: string;
    };
    best_light_condition ?: string;
    best_soil_type ?: string,
    best_watering ?: string;
    watering?: string;
  };
}

interface PlantRecognitionResult {
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

const optimizeImage = async (imageUri: string): Promise<string> => {
  try {
    const optimizedImage = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 800 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );
    return optimizedImage.uri;
  } catch (error) {
    console.error('❗ Error optimizing image:', error);
    throw error;
  }
};

// Recognize the plant using the Plant.id API
export const recognizePlant = async (imageUri: string): Promise<PlantRecognitionResult> => {
  try {
    const optimizedUri = await optimizeImage(imageUri);
    const base64Image = await FileSystem.readAsStringAsync(optimizedUri, { encoding: FileSystem.EncodingType.Base64 });

    const requestData = {
      images: [`data:image/jpg;base64,${base64Image.trim()}`],
      latitude: 49.207,
      longitude: 16.608,
      similar_images: true,
    };

    console.log('🚀 Sending request to Plant.id API...');
    const response = await axios.post(PLANT_ID_API_URL, requestData, {
      headers: {
        'Api-Key': PLANT_ID_API_KEY,
        'Content-Type': 'application/json',
      },
      timeout: 20000,
    });

    const accessToken = response.data.access_token;
    console.log('✅ Response from Plant.id API:', accessToken);

    if (!accessToken) {
      throw new Error('Access token not received.');
    }

    const data = response.data;
    const suggestions = data?.result?.classification?.suggestions || [];
    if (!Array.isArray(suggestions) || suggestions.length === 0) {
      throw new Error('⚠️ Plant not recognized.');
    }

    const topSuggestion = suggestions[0];
    

    // console.log('🌱 Plant Name:', topSuggestion.name);
    // console.log('🌼 Common names:', commonNames);
    // console.log('💧 Watering:', watering);
    // console.log('  sunLight:', sunlight);
    // console.log(' soil:', soil);

    return {
      access_token: accessToken,
      // commonNames : topSuggestion.details.common_names?.join(', ') || 'N/A';
      model_version: data.model_version || 'N/A',
      custom_id: data.custom_id || null,
      image: data.image || 'N/A',
      input: {
        latitude: requestData.latitude,
        longitude: requestData.longitude,
        similar_images: requestData.similar_images,
        images: data.input?.images || [],
        datetime: data.input?.datetime || 'N/A',
      },
      result: {
        is_plant: data.result.is_plant,
        classification: {
          suggestions: suggestions,
        },
      },
      status: data.status || 'COMPLETED',
      sla_compliant_client: data.sla_compliant_client ?? true,
      sla_compliant_system: data.sla_compliant_system ?? true,
      created: data.created || 0,
      completed: data.completed || 0,
    };

  } catch (error: any) {
    console.error('❌ Error recognizing plant:', error?.response?.data || error.message);
    throw error;
  }
};