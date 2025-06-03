
'use server';
/**
 * @fileOverview AI flow for generating Chinese calligraphy with enhanced spacing and multiple aspect ratios.
 *
 * - aiEnhancedSpacing - A function that handles the calligraphy generation process.
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
    .describe('The background color for the image (e.g., #F5F5DC). This will be used if no background image theme is selected or if the theme implies a base color.'),
  borderStyle: z
    .string()
    .optional()
    .describe('The style of the border to apply to the image. E.g., "none", "thin black line". Default is "none".'),
  backgroundImageTheme: z
    .string()
    .optional()
    .describe('An optional theme for the background image, e.g., "Subtle Chinese Water Lily Pond", "Misty Mountains with Pine Trees". If "none" or undefined, the plain backgroundColor will be used.'),
});
export type AIEnhancedSpacingInput = z.infer<typeof AIEnhancedSpacingInputSchema>;

const AIEnhancedSpacingOutputSchema = z.object({
  generatedImages: z.array(z.object({
    ratio: z.string().describe("The aspect ratio of the image, e.g., '1:1', '3:4'."),
    imageUri: z.string().describe("A data URI of the generated image for this ratio, including MIME type and Base64 encoding (data:<mimetype>;base64,<encoded_data>). The image visualizes the Chinese phrase with optimized spacing, layout, optional border, and optional background theme, ensuring character integrity."),
    label: z.string().describe("A user-friendly label for the ratio, e.g., 'Square', 'Portrait'.")
  })).describe("An array of generated images, each with a specific aspect ratio, its URI, and a label."),
  explanationEn: z
    .string()
    .optional()
    .describe(
      'A brief explanation in English of how the AI adjusted spacing and layout to improve visual balance without altering characters.'
    ),
  explanationZh: z
    .string()
    .optional()
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
  input: {schema: AIEnhancedSpacingInputSchema.omit({ borderStyle: true, backgroundImageTheme: true })},
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
    const targetRatios = [
      { id: "1:1", label: "Square" , instruction: "1:1 (a perfect square image)"},
      { id: "3:4", label: "Portrait", instruction: "3:4 (a portrait image, taller than it is wide)" },
      { id: "16:9", label: "Landscape", instruction: "16:9 (a landscape image, wider than it is tall)" },
    ];
    
    const generatedImagesOutput: Array<{ ratio: string; imageUri: string; label: string }> = [];

    for (const ratioInfo of targetRatios) {
      let imageGenPrompt = `Generate a Chinese calligraphy image of the phrase "${input.chinesePhrase}".
Font style: ${input.fontFamily}.
Character size: approximately ${input.fontSize}px.
Brush thickness: ${input.brushSize}px.
The final image should be rendered with an aspect ratio of ${ratioInfo.instruction}.`;

      if (input.backgroundImageTheme && input.backgroundImageTheme.toLowerCase() !== 'none' && input.backgroundImageTheme.toLowerCase() !== 'solid color (current)') {
        imageGenPrompt += `
The calligraphy should be rendered on a surface that has a background depicting: "${input.backgroundImageTheme}".
The calligraphy characters must be clear and legible against this themed background. The visual theme ("${input.backgroundImageTheme}") must be the dominant background feature.`;
      } else {
        imageGenPrompt += `
The calligraphy should be rendered on a surface with a solid background color of: ${input.backgroundColor}.`;
      }
      
      imageGenPrompt += `
After rendering the calligraphy on its background, the entire composition (calligraphy on its themed or solid background) should be framed with the following border style: ${input.borderStyle || "none"}.
If the border style is "none", "no border", or not specified, do not add any visible border.
Otherwise, apply the described border around the entire artwork.`;

      imageGenPrompt += `

**CRITICAL VERIFICATION STEP: CHARACTER ACCURACY AND ORDER.**
Before any artistic rendering or spacing, you MUST verify that the calligraphy you are about to generate contains **EXACTLY** the characters from the input phrase: "${input.chinesePhrase}", in the **EXACT SAME ORDER**.
- NO missing characters.
- NO extra characters.
- NO substituted characters.
- The ORDER of characters must be IDENTICAL to the input phrase.
This character-by-character and order accuracy is paramount and non-negotiable. If you cannot ensure this, do not generate an image.

After confirming character and order accuracy, proceed to visual rendering.`;

      imageGenPrompt += `

**CRITICAL INSTRUCTION: CHARACTER AND STROKE INTEGRITY ARE THE ABSOLUTE, UNCOMPROMISING TOP PRIORITY. NO EXCEPTIONS.**
Your **singular, undisputed, number one priority** is to ensure:
1.  **Character Set and Order Fulfillment:** The generated image MUST contain *exactly* the characters from the input phrase "${input.chinesePhrase}", in the *exact* same order as provided. Any deviation (missing characters, extra characters, substituted characters, or incorrect order) means the generation is a FAILURE and unacceptable. Verify this meticulously before proceeding.
2.  **Stroke Fidelity:** 100% fidelity in rendering every single stroke of every character accurately according to the specified font style. No stroke, however small, complex, or subtle, may be omitted, distorted, or incorrectly rendered.
**Do NOT proceed to any complex visual harmony considerations until you are absolutely certain that all characters are present in the correct order and are rendered with perfect stroke accuracy.**

**FOR CHARACTERS WITH HIGH STROKE COUNTS (e.g., 15 strokes or more):** You MUST exercise extreme diligence. These characters often have intricate details. Meticulously verify each stroke's presence, shape, and position against the standard form of the character in the specified font style. Double and triple-check these complex characters. If necessary, mentally decompose complex characters into their constituent radicals and simpler components, ensuring all parts and all strokes for those parts are rendered with perfect accuracy. **For these specific high-stroke-count characters, if there is the slightest doubt that visual harmony or spacing adjustments might compromise stroke integrity, you MUST sacrifice those adjustments for the sake of perfect stroke rendering. Prioritize their internal structural correctness above any external spacing considerations relative to other characters.**

If there is any conflict whatsoever between rendering *any* character with perfect textual and stroke accuracy (as defined above) and achieving a certain visual composition or any other aesthetic quality, **perfect textual and stroke accuracy MUST ALWAYS take precedence.**

Only *after* you have ensured complete and utterly accurate stroke rendering for all characters should you then proceed to optimize inter-character spacing and overall layout for visual harmony and aesthetic appeal.
The fundamental shape, form, and strokes of each individual character MUST NOT be altered in any way by spacing considerations. The focus of spacing adjustments is solely on their placement and spacing relative to each other and the canvas, AFTER character integrity is perfectly secured.

An image with incorrect or missing characters, incorrect character order, or incorrect/missing strokes is **completely unacceptable and considered a failure**, regardless of its spacing or overall composition. The final image must display each character distinctly, correctly, and accurately, with all characters matching the input phrase in content and order, and all strokes present and correctly formed. Re-evaluate and re-verify every character, especially complex ones, before finalizing the image.`;

      try {
        const imageResponse = await ai.generate({
          model: 'googleai/gemini-2.0-flash-exp',
          prompt: imageGenPrompt,
          config: {
            responseModalities: ['TEXT', 'IMAGE'],
          },
        });

        const imageUri = imageResponse.media?.url;
        if (imageUri) {
          generatedImagesOutput.push({ ratio: ratioInfo.id, imageUri, label: ratioInfo.label });
        } else {
          console.warn(`Image generation failed or did not return a valid media URL for ratio ${ratioInfo.id}. Response:`, imageResponse);
          // Optionally, push a placeholder or skip, or throw error for this ratio
        }
      } catch (error) {
          console.error(`Error generating image for ratio ${ratioInfo.id}:`, error);
          // Optionally, decide if one failure should stop all, or continue
      }
    } // End of for loop

    if (generatedImagesOutput.length === 0 && targetRatios.length > 0) {
        throw new Error('All image generation attempts failed for all aspect ratios.');
    }
    
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
      generatedImages: generatedImagesOutput,
      explanationEn,
      explanationZh,
    };
  }
);
