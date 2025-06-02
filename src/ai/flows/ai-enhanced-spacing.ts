
'use server';

/**
 * @fileOverview An AI-enhanced spacing flow for Chinese calligraphy image generation.
 *
 * This flow uses AI to intelligently adjust character spacing and layout in the generated image,
 * ensuring optimal visual balance and composition, especially for phrases with varying character densities,
 * without altering the characters themselves. It also allows for optional border styles.
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
  borderStyle: z
    .string()
    .optional()
    .describe('The style of the border to apply to the image. E.g., "none", "thin black line". Default is "none".'),
});
export type AIEnhancedSpacingInput = z.infer<typeof AIEnhancedSpacingInputSchema>;

const AIEnhancedSpacingOutputSchema = z.object({
  spacedImageUri: z
    .string()
    .describe(
      `A data URI of the generated image with AI-enhanced character spacing, layout, and optional border, including MIME type and Base64 encoding (data:<mimetype>;base64,<encoded_data>).
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
  input: {schema: AIEnhancedSpacingInputSchema.omit({ borderStyle: true })}, // borderStyle not needed for explanation
  output: { schema: z.object({
      explanationEn: AIEnhancedSpacingOutputSchema.shape.explanationEn,
      explanationZh: AIEnhancedSpacingOutputSchema.shape.explanationZh,
  })},
  prompt: `You are an AI assistant specialized in Chinese calligraphy.
For the Chinese phrase "{{chinesePhrase}}", with font style "{{fontFamily}}", font size {{fontSize}}px, brush thickness {{brushSize}}px on a background of "{{backgroundColor}}":

1.  **English Explanation:** Provide a brief explanation (2-3 sentences) focusing on how AI would typically adjust the spacing *between* characters and their overall layout to achieve visual balance and aesthetic appeal, *without altering the characters themselves*. Consider aspects like inter-character spacing (kerning), negative space management, and overall compositional harmony. Explain how these spacing adjustments contribute to the artwork's quality. Ensure the explanation clarifies that the fundamental shape and strokes of each individual character in the calligraphy itself are NEVER altered; focus only on spacing and layout adjustments.

2.  **Traditional Chinese Explanation:** Provide the same explanation as above, translated accurately into Traditional Chinese.

Return the explanations in the specified output format.`,
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
Image Border: ${input.borderStyle || "none"}. If the border style is "none", "no border", or not specified, do not add any visible border. Otherwise, apply the described border to the final image.

**CRITICAL INSTRUCTION: STROKE ACCURACY IS PARAMOUNT.**
Your **absolute top priority** is to ensure 100% fidelity in rendering every stroke of every character accurately according to the specified font style. No stroke, however small or complex, may be omitted or distorted.
For characters with a high stroke count, you MUST meticulously verify each stroke's presence against the standard form of the character in the specified font style. If necessary, mentally decompose complex characters into their constituent radicals and simpler components, ensuring all parts and all strokes for those parts are rendered.
If there is any conflict between rendering a character with perfect stroke accuracy and achieving a certain visual spacing or composition, **perfect stroke accuracy MUST take precedence.**

Only *after* ensuring complete and accurate stroke rendering for all characters should you then optimize inter-character spacing and overall layout for visual harmony and aesthetic appeal.
The fundamental shape and strokes of each individual character MUST NOT be altered by spacing considerations. The focus of spacing is solely on their placement and spacing relative to each other and the canvas.

An image with incorrect or missing strokes is unacceptable, regardless of its spacing or overall composition. The final image must display each character distinctly and accurately, with all strokes present.`;

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
    const explanationResult = await explanationPrompt({
        chinesePhrase: input.chinesePhrase,
        fontFamily: input.fontFamily,
        fontSize: input.fontSize,
        brushSize: input.brushSize,
        backgroundColor: input.backgroundColor,
    });
    
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

