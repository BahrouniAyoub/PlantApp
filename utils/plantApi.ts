import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

const API_KEY = 'VTSXEXvv5uzUkTJULkgDFNmzDNJ5q2rlWJVzyXbMDa2FwaT0w7';

export async function identifyPlant(imageUri: string): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('images', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'plant.jpg',
    } as unknown as Blob);

    const response = await fetch('https://plant.id/api/v3/identification', {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const jsonResponse = await response.json();
    console.log("API Response:", jsonResponse);

    // Extract the plant name from the response
    if (jsonResponse.suggestions && jsonResponse.suggestions.length > 0) {
      return jsonResponse.suggestions[0].plant_name;
    } else {
      throw new Error("No plant identified");
    }
  } catch (error) {
    console.error("Error identifying plant:", error);
    throw error;
  }
}