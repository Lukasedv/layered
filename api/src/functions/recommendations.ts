import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getRecommendation } from "../shared/recommendationEngine";
import type { Activity, WeatherData } from "../shared/types";

interface RecommendationRequest {
  activity: Activity;
  weather: WeatherData;
}

const validActivities: Activity[] = ['running', 'cycling', 'skiing', 'hiking', 'walking'];

async function recommendationsHandler(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const body = await request.json() as RecommendationRequest;

    if (!body.activity || !validActivities.includes(body.activity)) {
      return {
        status: 400,
        jsonBody: { error: 'Invalid or missing activity' },
      };
    }

    if (!body.weather || typeof body.weather.temperature !== 'number') {
      return {
        status: 400,
        jsonBody: { error: 'Invalid or missing weather data' },
      };
    }

    const recommendation = getRecommendation(body.activity, body.weather);

    return {
      jsonBody: recommendation,
    };
  } catch (error) {
    context.error('Failed to generate recommendations:', error);
    return {
      status: 500,
      jsonBody: { error: 'Failed to generate recommendations' },
    };
  }
}

app.http('recommendations', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'recommendations',
  handler: recommendationsHandler,
});
