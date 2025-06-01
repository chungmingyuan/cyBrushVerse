"use client";

import type { AIEnhancedSpacingInput, AIEnhancedSpacingOutput } from "@/ai/flows/ai-enhanced-spacing";
import { aiEnhancedSpacing } from "@/ai/flows/ai-enhanced-spacing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Download, Loader2, Palette, PenTool, TextCursorInput, WholeWord } from "lucide-react";
import NextImage from 'next/image';
import { useState, useTransition } from "react";

const fontOptions = [
  { value: "KaiTi", label: "Regular Script (楷体 - KaiTi)" },
  { value: "SimSun", label: "Song Style (宋体 - SimSun)" },
  { value: "FangSong", label: "FangSong (仿宋 - FangSong)" },
  { value: "LiSu", label: "Clerical Script (隶书 - LiSu)" },
  { value: "YouYuan", label: "Round Script (幼圆 - YouYuan)" },
];

export function CalligraphyGenerator() {
  const [phrase, setPhrase] = useState<string>("你好世界");
  const [fontFamily, setFontFamily] = useState<string>(fontOptions[0].value);
  const [fontSize, setFontSize] = useState<number[]>([64]);
  const [brushSize, setBrushSize] = useState<number[]>([3]);
  const [backgroundColor, setBackgroundColor] = useState<string>("#F5F5DC"); // Pale Beige

  const [generatedImageUri, setGeneratedImageUri] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleGenerateImage = async () => {
    if (!phrase.trim()) {
      toast({
        title: "Input Error",
        description: "Please enter a Chinese phrase.",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      setGeneratedImageUri(null);
      setExplanation(null);
      try {
        const input: AIEnhancedSpacingInput = {
          chinesePhrase: phrase,
          fontFamily,
          fontSize: fontSize[0],
          brushSize: brushSize[0],
          backgroundColor,
        };
        const result: AIEnhancedSpacingOutput = await aiEnhancedSpacing(input);
        setGeneratedImageUri(result.spacedImageUri);
        setExplanation(result.explanation);
        toast({
          title: "Image Generated",
          description: "Your calligraphy image is ready.",
        });
      } catch (error) {
        console.error("Error generating image:", error);
        toast({
          title: "Generation Failed",
          description: "Could not generate the image. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  const handleDownloadImage = () => {
    if (!generatedImageUri) return;
    const link = document.createElement("a");
    link.href = generatedImageUri;
    // Extract phrase for filename, sanitize, and limit length
    const safePhrase = phrase.replace(/[^\u4e00-\u9fa5\w\s]/g, '').substring(0, 20) || "calligraphy";
    link.download = `brushverse_${safePhrase}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
      title: "Image Downloaded",
      description: "The image has been saved to your device.",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-headline font-bold text-primary">BrushVerse</h1>
        <p className="text-xl text-muted-foreground mt-2">Craft Your Chinese Calligraphy with AI</p>
      </header>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline text-3xl flex items-center"><PenTool className="mr-3 text-primary h-8 w-8" />Create Your Art</CardTitle>
            <CardDescription>Enter your phrase and customize the appearance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="phrase" className="text-lg flex items-center"><TextCursorInput className="mr-2 h-5 w-5 text-accent" />Chinese Phrase</Label>
              <Textarea
                id="phrase"
                value={phrase}
                onChange={(e) => setPhrase(e.target.value)}
                placeholder="例如: 花好月圆"
                className="text-base min-h-[100px] focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fontFamily" className="text-lg flex items-center"><WholeWord className="mr-2 h-5 w-5 text-accent" />Font Style</Label>
              <Select value={fontFamily} onValueChange={setFontFamily}>
                <SelectTrigger id="fontFamily" className="text-base focus:ring-primary">
                  <SelectValue placeholder="Select a font" />
                </SelectTrigger>
                <SelectContent>
                  {fontOptions.map((font) => (
                    <SelectItem key={font.value} value={font.value} className="text-base">
                      {font.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fontSize" className="text-lg">Character Size: {fontSize[0]}px</Label>
              <Slider
                id="fontSize"
                min={24}
                max={128}
                step={1}
                value={fontSize}
                onValueChange={setFontSize}
                className="[&>span:first-child]:h-2 [&>span:first-child>span]:bg-primary [&>span+button]:bg-background [&>span+button]:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brushSize" className="text-lg">Brush Thickness: {brushSize[0]}px</Label>
              <Slider
                id="brushSize"
                min={1}
                max={10}
                step={1}
                value={brushSize}
                onValueChange={setBrushSize}
                className="[&>span:first-child]:h-2 [&>span:first-child>span]:bg-primary [&>span+button]:bg-background [&>span+button]:border-primary"
              />
            </div>

            <div className="space-y-2">
                <Label htmlFor="backgroundColor" className="text-lg flex items-center"><Palette className="mr-2 h-5 w-5 text-accent"/>Background Color</Label>
                <div className="flex items-center gap-2">
                    <Input
                        id="backgroundColor"
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="w-16 h-10 p-1 focus:ring-primary"
                    />
                    <span className="text-muted-foreground">{backgroundColor}</span>
                </div>
            </div>

          </CardContent>
          <CardFooter>
            <Button
              onClick={handleGenerateImage}
              disabled={isPending}
              className="w-full text-lg py-6 bg-primary hover:bg-primary/90"
              aria-label="Generate Calligraphy Image"
            >
              {isPending ? (
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              ) : (
                <PenTool className="mr-2 h-6 w-6" />
              )}
              Generate Image
            </Button>
          </CardFooter>
        </Card>

        <Card className="shadow-xl sticky top-8">
          <CardHeader>
            <CardTitle className="font-headline text-3xl">Preview</CardTitle>
            <CardDescription>Your generated calligraphy will appear here.</CardDescription>
          </CardHeader>
          <CardContent className="min-h-[300px] flex flex-col items-center justify-center bg-muted/30 rounded-md p-4">
            {isPending && (
              <div className="text-center">
                <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
                <p className="text-lg text-muted-foreground">Generating your masterpiece...</p>
              </div>
            )}
            {!isPending && generatedImageUri && (
              <div className="w-full space-y-4">
                <div className="border border-border rounded-md overflow-hidden shadow-inner aspect-video max-h-[400px] mx-auto bg-white flex items-center justify-center">
                   {/* Using standard img tag for data URI as next/image might not be optimized for it or could be complex to set up for this use case.
                       The PRD mentions "final image to fit within the preview window". This is handled by style attributes.
                    */}
                   <img 
                    src={generatedImageUri} 
                    alt="Generated Calligraphy" 
                    style={{ objectFit: 'contain', maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto' }}
                    className="rounded-md"
                    data-ai-hint="calligraphy art"
                    />
                </div>
                {explanation && (
                  <div className="bg-background p-3 rounded-md border border-border">
                    <h4 className="font-semibold text-accent mb-1">AI Spacing Explanation:</h4>
                    <p className="text-sm text-foreground/80">{explanation}</p>
                  </div>
                )}
              </div>
            )}
            {!isPending && !generatedImageUri && (
              <div className="text-center text-muted-foreground">
                <Palette className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Your artwork will be shown here.</p>
                <p className="text-sm">Adjust settings and click "Generate Image".</p>
              </div>
            )}
          </CardContent>
          {generatedImageUri && !isPending && (
            <CardFooter>
              <Button
                onClick={handleDownloadImage}
                variant="outline"
                className="w-full text-lg py-6 border-primary text-primary hover:bg-primary/10"
                aria-label="Download Calligraphy Image"
              >
                <Download className="mr-2 h-6 w-6" />
                Download Image
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
      <footer className="text-center mt-16 py-6 border-t border-border">
        <p className="text-muted-foreground">&copy; {new Date().getFullYear()} BrushVerse. All rights reserved.</p>
      </footer>
    </div>
  );
}
