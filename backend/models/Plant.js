// models/Plant.js
const mongoose = require('mongoose');

const PlantSchema = new mongoose.Schema({
  name: String,
  type: String,
  image: String,
  wateringFrequency: String,
  lastWatered: String,
  userId: String, 
  is_plant: {
    probability: Number,
    binary: Boolean,
    threshold: Number,
  },
  classification: {
    suggestions: [
      {
        id: String,
        name: String,
        probability: Number,
        similar_images: [
          {
            id: String,
            url: String,
            license_name: String,
            license_url: String,
            citation: String,
            similarity: Number,
            url_small: String,
          },
        ],
        details: {
          language: String,
          entity_id: String,
          common_names: [String],
          description: String,
          sunlight: String,
          watering: String,
          temperature_range: String,
        },
      },
    ],
  },
  status: String,
  sla_compliant_client: Boolean,
  sla_compliant_system: Boolean,
  created_datetime: Number,
  finished_datetime: Number,
});

module.exports = mongoose.model('Plant', PlantSchema);