// app/plantService.ts
import axios from 'axios';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

const PLANT_ID_API_KEY = 'H2PEHTBnlBy9TPy53lRfozUyBjLBsUQQlZEIGXWRBqx4A0Dr23';
const PLANT_ID_API_URL = 'https://plant.id/api/v3/identification';
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
        language: string;
        entity_id: string;
        common_names?: string[];
        description?: string;
        sunlight?: string;
        watering?: string;
        temperature_range?: string;
    };
}

interface PlantRecognitionResult {
    access_token: string;
    model_version: string;
    custom_id: string | null;
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
        console.log('✅ Response from Plant.id API:', accessToken); // Log the access_token for debugging

        if (!accessToken) {
            throw new Error('Access token not received.');
        }

        const data = response.data;
        const suggestions = data?.result?.classification?.suggestions || [];
        if (!Array.isArray(suggestions) || suggestions.length === 0) {
            throw new Error('⚠️ Plant not recognized.');
        }

        const topSuggestion = suggestions[0];
        const commonNames = topSuggestion.details.common_names?.join(', ') || 'N/A';
        const description = topSuggestion.details.description || 'No additional details available.';
        const sunlight = topSuggestion.details.sunlight || 'N/A';
        const watering = topSuggestion.details.watering || 'N/A';
        const temperatureRange = topSuggestion.details.temperature_range || 'N/A';

        console.log('🌱 Plant identified:', topSuggestion.name);
        console.log('🌼 Common names:', commonNames);
        console.log('💧 Watering:', watering);

        return {
            access_token: accessToken,
            model_version: data.model_version || 'N/A',
            custom_id: data.custom_id || null,
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

// Fetch plant details using the access_token from the recognition request
export const getPlantDetail = async (accessToken: string) => {
  try {    
    // Make the request with the API key and access token
    const response = await axios.get(`https://plant.id/api/v3/kb/plants/${accessToken}`, {
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': PLANT_ID_API_KEY,
      },
      params: {
        details: 'common_names,url,description,taxonomy,rank,gbif_id,inaturalist_id,image,synonyms,edible_parts,watering,propagation_methods',
        language: 'en',
      },
    });

    return response.data; // Return the data if the request is successful
  } catch (error) {
    console.error('Error fetching plant details:', error);
    throw error; // Rethrow the error so we can handle it in the calling function
  }
};


// Integration function for recognizing plant and fetching its details
const recognizeAndFetchDetails = async (imageUri: string) => {
    try {
        // Step 1: Recognize the plant and get the access token
        const recognitionResult = await recognizePlant(imageUri);
        const accessToken = recognitionResult.access_token;

        if (!accessToken) {
            throw new Error('No access token available');
        }

        console.log('Access Token:', accessToken);  // Log the token for debugging

        // Step 2: Fetch plant details using the access token
        const plantDetails = await getPlantDetail(accessToken);  // Pass access token here
        console.log('Plant Details:', plantDetails);  // Log plant details

    } catch (error) {
        console.error('Error during plant recognition or fetching details:', error);
        alert('Something went wrong. Please try again.');
    }
};
