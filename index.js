const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const axios = require("axios");
const cron = require("node-cron");
const port = 8000;
const cors = require("cors");

const MEAL_API_URL = "https://www.themealdb.com/api/json/v1/1/random.php";

app.use(bodyParser.json());
app.use(cors());

async function getRandomMeal() {
  try {
    const response = await axios.get(MEAL_API_URL);
    const meal = response.data.meals[0];

    if (!meal) {
      throw new Error("No meal data received");
    }

    return {
      name: meal.strMeal,
      category: meal.strCategory,
      instructions: meal.strInstructions,
      image: meal.strMealThumb,
      url: meal.strSource,
    };


  } catch (error) {
    console.error("Error fetching meal from API:", error);
    return null;
  }
}

async function mealSuggestionTask(payload) {
  const meal = await getRandomMeal();
  if (!meal) {
    return;
  }
//   console.log(meal);

const message = `Today's meal suggestion: **${meal.name}**\nCategory: ${meal.category}\n\n*Instructions:* ${meal.instructions}\n\n[View Recipe](${meal.url})\n\n![Meal Image](${meal.image})`;

const data = {
    event_name: "Meal Suggestion",
    message: message,
    status: "success",
    username: "Meal Suggestion Bot"
  };
try {
const response = await axios.post(payload.return_url, data, {
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json"
    }
  });

  console.log('Webhook sent successfully:', response.data);

  

  console.log(message);

  
  } catch (error) {
    console.error("Error sending message:", error);
  }
}

app.post("/tick", async (req, res) => {
  const payload = req.body;
  console.log(payload);

  await mealSuggestionTask(payload);

  res.status(202).json({ status: "accepted" });
});

app.get("/integration.json", (req, res) => {
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  res.json({
    "data": {
      "date": {
        "created_at": "2025-02-22",
        "updated_at": "2025-02-22"
      },
      "descriptions": {
        "app_name": "Daily Meal Suggestion",
        "app_description": "Suggests a random meal daily.",
        "app_logo": "https://dcassetcdn.com/design_img/375573/141837/141837_3031164_375573_image.jpg",
        "app_url": baseUrl,
        "background_color": "#fff"
      },
      "is_active": true,
      "integration_category": "Communication & Collaboration",
      "integration_type": "interval",
      "key_features": [
        "Daily random meal suggestion"
      ],
      "author": "Kumar Rishi",
      "settings": [
        {
          "label": "interval",
          "type": "text",
          "required": true,
          "default": "*/3 * * * *"
        }
      ],
      "target_url": "",
      "tick_url": `${baseUrl}/tick`,
    }
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});


module.exports = { getRandomMeal, mealSuggestionTask, app};