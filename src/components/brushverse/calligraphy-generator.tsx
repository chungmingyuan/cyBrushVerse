
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
import { cn } from "@/lib/utils";
import { Download, Languages, Loader2, Palette, PenTool, Sparkles, Square, TextCursorInput, WholeWord } from "lucide-react";
// import NextImage from 'next/image'; // Not currently used as NextImage component
import { useState, useTransition } from "react";

const fontOptions = [
  { value: "KaiTi", label: "Regular Script (楷體 - KaiTi)" },
  { value: "MingLiU", label: "Ming Style (明體 - MingLiU)" },
  { value: "DFKai-SB", label: "DF Kai Style (標楷體 - DFKai-SB)" },
  { value: "SimHei", label: "Black Style (黑體 - SimHei)" },
  { value: "FangSong", label: "FangSong (仿宋 - FangSong)" },
  { value: "cwTeXKai", label: "cwTeX Kai (楷書 - cwTeXKai)"},
  { value: "cwTeXMing", label: "cwTeX Ming (明體 - cwTeXMing)"},
  { value: "Noto Serif TC", label: "Noto Serif TC (思源宋體)"},
  { value: "Noto Sans TC", label: "Noto Sans TC (思源黑體)"},
];

const samplePhrases = [
  { id: "s1", text: "花好月圓", description: "Blooming flowers and a full moon - A wish for a happy life" },
  { id: "s2", text: "福壽康寧", description: "Good fortune, longevity, health, and peace" },
  { id: "s3", text: "龍馬精神", description: "Spirit of a dragon and horse - Vigor and vitality" },
  { id: "s4", text: "學無止境", description: "Learning is endless" },
  { id: "s5", text: "靜以修身", description: "Cultivate oneself through tranquility" },
];

const borderOptions = [
    { value: 'none', label: 'No Border' },
    { value: 'thin black line', label: 'Thin Black Line' },
    { value: 'simple dark gray frame (1px)', label: 'Simple Dark Gray Frame' },
    { value: 'classic red border (2px thickness)', label: 'Classic Red Border' },
    { value: 'double line border (black, thin)', label: 'Double Line Border (Black)' },
    { value: 'ornate wooden picture frame', label: 'Ornate Wooden Picture Frame' },
    { value: 'simple gold picture frame', label: 'Simple Gold Picture Frame' },
    { value: 'traditional Chinese window lattice border', label: 'Chinese Window Lattice Border' },
    { value: 'bamboo frame border', label: 'Bamboo Frame Border' },
];


export function CalligraphyGenerator() {
  const [phrase, setPhrase] = useState<string>("你好世界");
  const [fontFamily, setFontFamily] = useState<string>(fontOptions[0].value);
  const [fontSize, setFontSize] = useState<number[]>([64]);
  const [brushSize, setBrushSize] = useState<number[]>([3]);
  const [backgroundColor, setBackgroundColor] = useState<string>("#F5F5DC");
  const [borderStyle, setBorderStyle] = useState<string>(borderOptions[0].value);

  const [generatedImageUri, setGeneratedImageUri] = useState<string | null>(null);
  const [explanationEn, setExplanationEn] = useState<string | null>(null);
  const [explanationZh, setExplanationZh] = useState<string | null>(null);
  const [explanationLanguage, setExplanationLanguage] = useState<'en' | 'zh'>('en');
  
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
      setExplanationEn(null);
      setExplanationZh(null);
      try {
        const input: AIEnhancedSpacingInput = {
          chinesePhrase: phrase,
          fontFamily,
          fontSize: fontSize[0],
          brushSize: brushSize[0],
          backgroundColor,
          borderStyle: borderStyle === 'none' ? undefined : borderStyle,
        };
        const result: AIEnhancedSpacingOutput = await aiEnhancedSpacing(input);
        setGeneratedImageUri(result.spacedImageUri);
        setExplanationEn(result.explanationEn);
        setExplanationZh(result.explanationZh);
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

  const handleSampleClick = (sampleText: string) => {
    setPhrase(sampleText);
    toast({
      title: "Phrase Updated",
      description: `Input set to: "${sampleText}"`,
    });
  };

  const explanationTitles = {
    en: "AI Spacing Explanation:",
    zh: "AI 間距調整說明："
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
            <div className="space-y-1">
              <Label htmlFor="phrase" className="text-base flex items-center"><TextCursorInput className="mr-2 h-5 w-5 text-accent" />Chinese Phrase (Traditional)</Label>
              <Textarea
                id="phrase"
                value={phrase}
                onChange={(e) => setPhrase(e.target.value)}
                placeholder="例如: 花好月圓"
                className="text-base min-h-[80px] focus:ring-primary"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div className="space-y-1">
                <Label htmlFor="fontFamily" className="text-base flex items-center"><WholeWord className="mr-2 h-5 w-5 text-accent" />Font Style</Label>
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
              
              <div className="space-y-1">
                  <Label htmlFor="backgroundColor" className="text-base flex items-center"><Palette className="mr-2 h-5 w-5 text-accent"/>Background Color</Label>
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

              <div className="space-y-1">
                <Label htmlFor="fontSize" className="text-base pt-2">Character Size: {fontSize[0]}px</Label>
                <Slider
                  id="fontSize"
                  min={24}
                  max={128}
                  step={1}
                  value={fontSize}
                  onValueChange={setFontSize}
                  className="[&>span:first-child]:h-2 [&>span:first-child>span]:bg-primary [&>span+button]:bg-background [&>span+button]:border-primary pt-2"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="brushSize" className="text-base pt-2">Brush Thickness: {brushSize[0]}px</Label>
                <Slider
                  id="brushSize"
                  min={1}
                  max={10}
                  step={1}
                  value={brushSize}
                  onValueChange={setBrushSize}
                  className="[&>span:first-child]:h-2 [&>span:first-child>span]:bg-primary [&>span+button]:bg-background [&>span+button]:border-primary pt-2"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="borderStyle" className="text-base flex items-center"><Square className="mr-2 h-5 w-5 text-accent" />Border Style</Label>
              <Select value={borderStyle} onValueChange={setBorderStyle}>
                <SelectTrigger id="borderStyle" className="text-base focus:ring-primary">
                  <SelectValue placeholder="Select a border style" />
                </SelectTrigger>
                <SelectContent>
                  {borderOptions.map((border) => (
                    <SelectItem key={border.value} value={border.value} className="text-base">
                      {border.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label className="text-lg flex items-center"><Sparkles className="mr-2 h-5 w-5 text-accent" />Sample Phrases (Traditional)</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {samplePhrases.map((sample) => (
                  <Button
                    key={sample.id}
                    variant="outline"
                    className="text-left justify-start h-auto py-2 border-dashed hover:border-primary hover:bg-primary/5"
                    onClick={() => handleSampleClick(sample.text)}
                    title={sample.description}
                  >
                    <div className="flex flex-col w-full">
                      <span className="font-semibold text-primary">{sample.text}</span>
                      <span className="text-xs text-muted-foreground break-words whitespace-normal">{sample.description}</span>
                    </div>
                  </Button>
                ))}
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
          <CardContent 
             className={cn(
                "min-h-[300px] max-h-[75vh] overflow-y-auto rounded-md p-4 flex flex-col",
                (!generatedImageUri && !isPending) && "items-center justify-center"
              )}
            style={{ backgroundColor: backgroundColor }}
          >
            {isPending && (
              <div className="flex flex-col items-center justify-center text-center h-full">
                <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
                <p className="text-lg text-muted-foreground">Generating your masterpiece...</p>
              </div>
            )}
            {!isPending && generatedImageUri && (
              <div className="w-full space-y-4">
                <div
                  className={cn(
                    "w-full rounded-md overflow-hidden shadow-inner mx-auto flex items-center justify-center",
                     borderStyle === 'none' && "border border-border"
                  )}
                  style={{ backgroundColor: backgroundColor }}
                >
                   <img
                    src={generatedImageUri}
                    alt="Generated Calligraphy"
                    style={{ objectFit: 'contain', maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto' }}
                    className="rounded-md"
                    data-ai-hint="calligraphy art"
                    />
                </div>
                {explanationEn && explanationZh && (
                  <div className="bg-background/80 p-3 rounded-md border border-border backdrop-blur-sm">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-semibold text-accent">{explanationTitles[explanationLanguage]}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExplanationLanguage(prev => prev === 'en' ? 'zh' : 'en')}
                        className="px-2 py-1 h-auto text-accent bg-accent/10 hover:bg-accent/20"
                        aria-label={explanationLanguage === 'en' ? 'Switch to Chinese explanation' : 'Switch to English explanation'}
                      >
                        <Languages className="mr-1 h-4 w-4" />
                        {explanationLanguage === 'en' ? '中文' : 'English'}
                      </Button>
                    </div>
                    <p className="text-sm text-foreground/80">
                      {explanationLanguage === 'en' ? explanationEn : explanationZh}
                    </p>
                  </div>
                )}
              </div>
            )}
            {!isPending && !generatedImageUri && (
              <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-full">
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
