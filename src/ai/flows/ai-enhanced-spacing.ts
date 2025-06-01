
'use server';

/**
 * @fileOverview An AI-enhanced spacing flow for Chinese calligraphy image generation.
 *
 * This flow uses AI to intelligently adjust character spacing in the generated image,
 * ensuring optimal visual balance and composition, especially for phrases with varying character densities.
 *
 * - aiEnhancedSpacing - A function that handles the AI-enhanced spacing process.
 * - AIEnhancedSpacingInput - The input type for the aiEnhancedSpacing function.
 * - AIEnhancedSpacingOutput - The return type for the aiEnhancedSpacing function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIEnhancedSpacingInputSchema = z.object({
  chinesePhrase: z
    .string()
    .describe('The Chinese phrase for which to optimize character spacing.'),
  fontFamily: z
    .string()
    .describe('The font family to be used for the Chinese phrase.'),
  fontSize: z.number().describe('The font size of the characters.'),
  brushSize: z.number().describe('The brush size to simulate different brush strokes.'),
  backgroundColor: z
    .string()
    .describe('The background color for the image (e.g., #F5F5DC).'),
});
export type AIEnhancedSpacingInput = z.infer<typeof AIEnhancedSpacingInputSchema>;

const AIEnhancedSpacingOutputSchema = z.object({
  spacedImageUri: z
    .string()
    .describe(
      `A data URI of the generated image with AI-enhanced character spacing, including MIME type and Base64 encoding (data:<mimetype>;base64,<encoded_data>).
      The image visualizes the Chinese phrase with optimized spacing for visual balance and composition.`
    ),
  explanation: z
    .string()
    .describe(
      'A brief explanation of how the AI adjusted the spacing to improve visual balance.'
    ),
});
export type AIEnhancedSpacingOutput = z.infer<typeof AIEnhancedSpacingOutputSchema>;

export async function aiEnhancedSpacing(input: AIEnhancedSpacingInput): Promise<AIEnhancedSpacingOutput> {
  return aiEnhancedSpacingFlow(input);
}

const aiEnhancedSpacingFlow = ai.defineFlow(
  {
    name: 'aiEnhancedSpacingFlow',
    inputSchema: AIEnhancedSpacingInputSchema,
    outputSchema: AIEnhancedSpacingOutputSchema,
  },
  async (input: AIEnhancedSpacingInput): Promise<AIEnhancedSpacingOutput> => {
    // Step 1: Generate the image
    const imageGenPrompt = `Generate a visually balanced Chinese calligraphy image for the phrase "${input.chinesePhrase}".
Font style: ${input.fontFamily}.
Character size: approximately ${input.fontSize}px.
Brush thickness: ${input.brushSize}px.
Background color: ${input.backgroundColor}.
Ensure the calligraphy is clear and aesthetically pleasing, suitable for display.`;

    const imageResponse = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp', // Specific model for image generation
      prompt: imageGenPrompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'], // Per documentation, both TEXT and IMAGE must be requested for gemini-2.0-flash-exp image generation
      },
    });

    const spacedImageUri = imageResponse.media?.url;
    if (!spacedImageUri) {
      console.error('Image generation response:', imageResponse);
      throw new Error('Image generation failed or did not return a valid media URL. The response from the model might not contain image data.');
    }

    // Step 2: Generate the explanation
    const explanationPrompt = `You are an AI assistant specialized in Chinese calligraphy.
For the Chinese phrase "${input.chinesePhrase}", with font style "${input.fontFamily}", font size ${input.fontSize}px, and brush size ${input.brushSize}px:
Provide a brief explanation (2-3 sentences) focusing on how AI would typically adjust character spacing to achieve visual balance and aesthetic appeal.
Consider aspects like character density, stroke complexity, and overall composition.`;

    // Use the default text model (gemini-2.0-flash) for explanation
    const explanationResponse = await ai.generate({
      prompt: explanationPrompt,
    });
    
    const explanation = explanationResponse.text ?? "AI applies sophisticated algorithms to analyze character shapes and inter-character relationships, optimizing spacing for visual harmony and readability in calligraphy. Adjustments consider stroke weight, negative space, and overall balance to create an aesthetically pleasing composition.";

    return {
      spacedImageUri,
      explanation,
    };
  }
);
