
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

const spacingPrompt = ai.definePrompt({
  name: 'spacingPrompt',
  input: {schema: AIEnhancedSpacingInputSchema},
  output: {schema: AIEnhancedSpacingOutputSchema},
  prompt: `You are an AI expert in Chinese calligraphy and image composition. Your task is to generate an image of the given Chinese phrase with optimal character spacing.

Given the following parameters, create an image with AI-enhanced spacing for the Chinese phrase, ensuring visual balance and aesthetic appeal. Also, provide a brief explanation of the spacing adjustments made.

Chinese Phrase: {{{chinesePhrase}}}
Font Family: {{{fontFamily}}}
Font Size: {{{fontSize}}}
Brush Size: {{{brushSize}}}
Background Color: {{{backgroundColor}}}

Ensure the image is returned as a data URI with the correct MIME type and Base64 encoding.
Explain the changes that you made in the explanation field.

Output:
{
  "spacedImageUri": "data:<mimetype>;base64,<encoded_data>",
  "explanation": "Explanation of spacing adjustments"
}
`,
});

const aiEnhancedSpacingFlow = ai.defineFlow(
  {
    name: 'aiEnhancedSpacingFlow',
    inputSchema: AIEnhancedSpacingInputSchema,
    outputSchema: AIEnhancedSpacingOutputSchema,
  },
  async input => {
    const {output} = await spacingPrompt(input);
    return output!;
  }
);
