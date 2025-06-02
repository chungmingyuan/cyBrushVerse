
'use server';

/**
 * @fileOverview An AI-enhanced spacing flow for Chinese calligraphy image generation.
 *
 * This flow uses AI to intelligently adjust character spacing and layout in the generated image,
 * ensuring optimal visual balance and composition, especially for phrases with varying character densities,
 * without altering the characters themselves.
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
      `A data URI of the generated image with AI-enhanced character spacing and layout, including MIME type and Base64 encoding (data:<mimetype>;base64,<encoded_data>).
      The image visualizes the Chinese phrase with optimized spacing for visual balance and composition, ensuring character integrity.`
    ),
  explanationEn: z
    .string()
    .describe(
      'A brief explanation in English of how the AI adjusted spacing and layout to improve visual balance without altering characters.'
    ),
  explanationZh: z
    .string()
    .describe(
      'A brief explanation in Traditional Chinese of how the AI adjusted spacing and layout to improve visual balance without altering characters.'
    ),
});
export type AIEnhancedSpacingOutput = z.infer<typeof AIEnhancedSpacingOutputSchema>;

export async function aiEnhancedSpacing(input: AIEnhancedSpacingInput): Promise<AIEnhancedSpacingOutput> {
  return aiEnhancedSpacingFlow(input);
}

const explanationPrompt = ai.definePrompt({
  name: 'calligraphyExplanationPrompt',
  input: {schema: AIEnhancedSpacingInputSchema},
  output: { schema: z.object({
      explanationEn: AIEnhancedSpacingOutputSchema.shape.explanationEn,
      explanationZh: AIEnhancedSpacingOutputSchema.shape.explanationZh,
  })},
  prompt: `You are an AI assistant specialized in Chinese calligraphy.
For the Chinese phrase "{{chinesePhrase}}", with font style "{{fontFamily}}", font size {{fontSize}}px, brush thickness {{brushSize}}px on a background of "{{backgroundColor}}":

1.  **English Explanation:** Provide a brief explanation (2-3 sentences) focusing on how AI would typically adjust the spacing *between* characters and their overall layout to achieve visual balance and aesthetic appeal, *without altering the characters themselves*. Consider aspects like inter-character spacing (kerning), negative space management, and overall compositional harmony. Explain how these spacing adjustments contribute to the artwork's quality.

2.  **Traditional Chinese Explanation:** Provide the same explanation as above, translated accurately into Traditional Chinese.

Return the explanations in the specified output format. Ensure the fundamental shape and strokes of each individual character in the calligraphy itself are NEVER altered; focus only on spacing and layout adjustments.`,
});


const aiEnhancedSpacingFlow = ai.defineFlow(
  {
    name: 'aiEnhancedSpacingFlow',
    inputSchema: AIEnhancedSpacingInputSchema,
    outputSchema: AIEnhancedSpacingOutputSchema,
  },
  async (input: AIEnhancedSpacingInput): Promise<AIEnhancedSpacingOutput> => {
    // Step 1: Generate the image
    const imageGenPrompt = `Generate a Chinese calligraphy image for the phrase "${input.chinesePhrase}".
Font style: ${input.fontFamily}.
Character size: approximately ${input.fontSize}px.
Brush thickness: ${input.brushSize}px.
Background color: ${input.backgroundColor}.

The primary goal is to optimize the spacing BETWEEN characters and their overall arrangement on the canvas to achieve visual balance and aesthetic appeal.
IMPORTANT: The fundamental shape and strokes of each individual character MUST NOT be altered. The focus is solely on their placement and spacing relative to each other and the canvas.
Ensure the calligraphy is clear, with each character distinctly rendered according to the specified font style, and the overall composition is harmonious.`;

    const imageResponse = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp', 
      prompt: imageGenPrompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'], 
      },
    });

    const spacedImageUri = imageResponse.media?.url;
    if (!spacedImageUri) {
      console.error('Image generation response:', imageResponse);
      throw new Error('Image generation failed or did not return a valid media URL. The response from the model might not contain image data.');
    }

    // Step 2: Generate the explanations
    const explanationResult = await explanationPrompt(input);
    
    const { explanationEn, explanationZh } = explanationResult.output || {
        explanationEn: "AI applies sophisticated algorithms to analyze inter-character relationships and overall composition, optimizing spacing for visual harmony and readability in calligraphy. Adjustments focus on character placement, kerning, and negative space to create an aesthetically pleasing composition while preserving the integrity of each character.",
        explanationZh: "人工智能應用複雜的算法分析字符間關係及整體佈局，優化間距以達致視覺和諧及書法可讀性。調整著重於字符位置、字距及留白處理，創造美觀的構圖，同時保留每個字符的完整性。"
    };

    return {
      spacedImageUri,
      explanationEn,
      explanationZh,
    };
  }
);
