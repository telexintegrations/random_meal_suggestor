const request = require("supertest");
const app = require("../index");  
const axios = require("axios");
const MockAdapter = require("axios-mock-adapter");

const mock = new MockAdapter(axios);


describe("getRandomMeal Function", () => {
  it("should return meal data correctly", async () => {
   
    mock.onGet("https://www.themealdb.com/api/json/v1/1/random.php").reply(200, {
      meals: [
        {
          strMeal: "Chicken Parmesan",
          strCategory: "Main Course",
          strInstructions: "Cook the chicken, add sauce, and bake.",
          strMealThumb: "https://via.placeholder.com/150",
          strSource: "https://www.recipe.com"
        }
      ]
    });

    const meal = await app.getRandomMeal();  

    expect(meal).toHaveProperty("name", "Chicken Parmesan");
    expect(meal).toHaveProperty("category", "Main Course");
    expect(meal).toHaveProperty("instructions", "Cook the chicken, add sauce, and bake.");
  });

  it("should return null when meal API fails", async () => {
    mock.onGet("https://www.themealdb.com/api/json/v1/1/random.php").reply(500);

    const meal = await app.getRandomMeal();  // Assuming the function is exported from app.js

    expect(meal).toBeNull();
  });
});

// 2. Test /integration.json Endpoint
describe("GET /integration.json", () => {
  it("should return integration data", async () => {
    const response = await request(app).get("/integration.json");

    expect(response.status).toBe(200);
    expect(response.body.data.descriptions.app_name).toBe("Daily Meal Suggestion");
    expect(response.body.data.settings[0].label).toBe("interval");
    expect(response.body.data.settings[0].default).toBe("*/3 * * * *");
  });
});


describe("POST /tick", () => {
  it("should return 202 status code when payload is correct", async () => {
    const payload = {
      return_url: "http://example.com/return"
    };

    const response = await request(app).post("/tick").send(payload);

    expect(response.status).toBe(202);
    expect(response.body.status).toBe("accepted");
  });
});
