
import { GoogleGenAI, Type } from "@google/genai";
import { VehicleType, TaxCalculationResult } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const schema = {
  type: Type.OBJECT,
  properties: {
    estimatedTax: {
      type: Type.NUMBER,
      description: "The final calculated numerical tax amount.",
    },
    calculationDetails: {
      type: Type.STRING,
      description: "A step-by-step breakdown of how the tax was calculated, including depreciated value, applicable tax rate, and the final formula used."
    },
    disclaimer: {
      type: Type.STRING,
      description: "A standard disclaimer that this is an estimate."
    }
  },
  required: ['estimatedTax', 'calculationDetails', 'disclaimer']
};

const getPrompt = (vehicleType: VehicleType, cost: number, ageInYears: number): string => `
You are an expert tax calculator for the Karnataka RTO in India. Your task is to calculate the lifetime tax for a vehicle registered in another state that is now being re-registered in Karnataka.

Follow these rules precisely and without deviation.

**RULES:**

1. **Determine the Depreciated Value:**
   - First, find the vehicle's depreciated value. Use the vehicle's age to find the correct depreciation percentage from the table below.
   - Depreciated Value = Original Cost * Depreciation Percentage.

   | Vehicle Age (from original registration) | Depreciation Percentage to apply on Original Cost |
   |------------------------------------------|---------------------------------------------------|
   | Less than 2 years                        | 93%                                               |
   | 2 to 3 years                             | 87%                                               |
   | 3 to 4 years                             | 81%                                               |
   | 4 to 5 years                             | 75%                                               |
   | 5 to 6 years                             | 69%                                               |
   | 6 to 7 years                             | 64%                                               |
   | 7 to 8 years                             | 59%                                               |
   | 8 to 9 years                             | 54%                                               |
   | 9 to 10 years                            | 49%                                               |
   | 10 to 11 years                           | 45%                                               |
   | 11 to 12 years                           | 40%                                               |
   | 12 to 13 years                           | 35%                                               |
   | 13 to 14 years                           | 30%                                               |
   | 14 to 15 years                           | 25%                                               |
   | More than 15 years                       | 20%                                               |

2. **Determine the Tax Rate:**
   - Next, determine the applicable tax rate based on the vehicle type and its **original cost** (not the depreciated value).

   **For Motor Cars (VehicleType: Car):**
   | Original Cost (INR) | Tax Rate |
   |---------------------|----------|
   | Up to 5,00,000      | 13%      |
   | 5,00,001 to 10,00,000 | 14%      |
   | 10,00,001 to 20,00,000| 17%      |
   | Above 20,00,000     | 18%      |

   **For Motorcycles (VehicleType: Motorcycle):**
   | Original Cost (INR) | Tax Rate |
   |---------------------|----------|
   | Up to 50,000        | 10%      |
   | 50,001 to 1,00,000  | 12%      |
   | Above 1,00,000      | 18%      |

3. **Calculate the Final Tax:**
   - The final lifetime tax is: **Depreciated Value * Tax Rate**.

**USER'S VEHICLE DETAILS:**
- Vehicle Type: ${vehicleType}
- Original Cost: ${cost} INR
- Age of Vehicle: ${ageInYears} years

**TASK:**
Calculate the tax based on the rules and user details provided. Provide the output *only* in the specified JSON format. The explanation in 'calculationDetails' must be clear and show the numbers used. Add a disclaimer stating this is an estimate and the final amount is decided by the RTO.
`;

export const calculateTax = async (
  vehicleType: VehicleType,
  cost: number,
  ageInYears: number
): Promise<TaxCalculationResult> => {
  try {
    const prompt = getPrompt(vehicleType, cost, ageInYears);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const jsonText = response.text.trim();
    const result: TaxCalculationResult = JSON.parse(jsonText);
    return result;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to calculate tax. Please check the inputs or try again later.");
  }
};
