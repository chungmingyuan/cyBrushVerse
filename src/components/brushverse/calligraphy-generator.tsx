
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
import { Crop, Download, Image as ImageIcon, Languages, List, Loader2, Palette, PenTool, RefreshCcw, Sparkles, Square, TextCursorInput, WholeWord } from "lucide-react";
import { useState, useTransition, type KeyboardEvent, useEffect, useCallback, useRef } from "react";
import ReactCrop, { type Crop as CropType } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

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

const allSamplePhrases = [
  { id: "s1", text: "花好月圓", description: "Blooming flowers and a full moon - A wish for a happy life" },
  { id: "s2", text: "福壽康寧", description: "Good fortune, longevity, health, and peace" },
  { id: "s3", text: "龍馬精神", description: "Spirit of a dragon and horse - Vigor and vitality" },
  { id: "s4", text: "學無止境", description: "Learning is endless" },
  { id: "s5", text: "靜以修身", description: "Cultivate oneself through tranquility" },
  { id: "s6", text: "厚德載物", description: "Great virtue carries all things - Be virtuous and tolerant" },
  { id: "s7", text: "自強不息", description: "Strive constantly for self-improvement" },
  { id: "s8", text: "登高望遠", description: "Climb high and look far - Aim high and have a broad perspective" },
  { id: "s9", text: "海納百川", description: "The sea accepts all rivers - Be open-minded and inclusive" },
  { id: "s10", text: "道法自然", description: "The Tao follows nature - Live in accordance with nature" },
  { id: "s11", text: "天道酬勤", description: "Heaven rewards the diligent" },
  { id: "s12", text: "虛懷若谷", description: "Modest as an empty valley - Be humble" },
  { id: "s13", text: "積健為雄", description: "Accumulate strength to become powerful" },
  { id: "s14", text: "和氣致祥", description: "Harmony brings auspiciousness" },
  { id: "s15", text: "心想事成", description: "May all your wishes come true" },
  { id: "s16", text: "萬事如意", description: "May everything go as you wish" },
  { id: "s17", text: "一帆風順", description: "Smooth sailing - May your endeavors go smoothly" },
  { id: "s18", text: "歲月靜好", description: "Years are quiet and good - Peaceful and beautiful times" },
  { id: "s19", text: "知足常樂", description: "Contentment brings happiness" },
  { id: "s20", text: "大道至簡", description: "The great way is simple" },
  { id: "s21", text: "上善若水", description: "The highest good is like water - Be adaptable and beneficial" },
  { id: "s22", text: "寧靜致遠", description: "Tranquility leads to far-reaching wisdom" },
  { id: "s23", text: "春華秋實", description: "Spring flowers, autumn fruits - Efforts yield results" },
  { id: "s24", text: "格物致知", description: "Investigate things to extend knowledge" },
  { id: "s25", text: "誠意正心", description: "Sincerity of intent rectifies the mind" },
  { id: "s26", text: "修身齊家", description: "Cultivate oneself, regulate the family" },
  { id: "s27", text: "治國平天下", description: "Govern the state, bring peace to the world (aspirational)" },
  { id: "s28", text: "仁者愛人", description: "The benevolent love others" },
  { id: "s29", text: "禮尚往來", description: "Courtesy demands reciprocity" },
  { id: "s30", text: "温故知新", description: "Review the old to learn the new" },
  { id: "s31", text: "學而不厭", description: "Learn without satiety" },
  { id: "s32", text: "誨人不倦", description: "Teach without weariness" },
  { id: "s33", text: "見賢思齊", description: "Emulate virtuous people when you see them" },
  { id: "s34", text: "三思而行", description: "Think thrice before acting" },
  { id: "s35", text: "言必信行必果", description: "Be true to your word and resolute in your actions" },
  { id: "s36", text: "任重道遠", description: "The burden is heavy and the road is long - A difficult task" },
  { id: "s37", text: "己所不欲勿施於人", description: "Do not do to others what you do not want done to yourself" },
  { id: "s38", text: "敏於事慎於言", description: "Be quick in action and cautious in speech" },
  { id: "s39", text: "君子和而不同", description: "A gentleman seeks harmony but not conformity" },
  { id: "s40", text: "小人同而不和", description: "A petty person seeks conformity but not harmony" },
  { id: "s41", text: "博學篤志", description: "Learn broadly and be steadfast in purpose" },
  { id: "s42", text: "切問近思", description: "Inquire earnestly and reflect on what is at hand" },
  { id: "s43", text: "精益求精", description: "Constantly strive for perfection" },
  { id: "s44", text: "持之以恆", description: "Persevere" },
  { id: "s45", text: "集思廣益", description: "Draw on collective wisdom for greater benefit" },
  { id: "s46", text: "飲水思源", description: "When drinking water, remember its source - Be grateful" },
  { id: "s47", text: "鵬程萬里", description: "A roc’s flight of ten thousand li - A bright future" },
  { id: "s48", text: "馬到成功", description: "Instant success upon arrival (like a swift horse)" },
  { id: "s49", text: "一諾千金", description: "A promise is worth a thousand pieces of gold - Keep your promises" },
  { id: "s50", text: "樂在其中", description: "Find joy in it" },
];

const borderOptions = [
    { value: 'none', label: 'No Border (無邊框)' },
    { value: 'thin black line', label: 'Thin Black Line (細黑線)' },
    { value: 'simple dark gray frame (1px)', label: 'Simple Dark Gray Frame (簡約深灰框)' },
    { value: 'classic red border (2px thickness)', label: 'Classic Red Border (經典紅邊框)' },
    { value: 'double line border (black, thin)', label: 'Double Line Border (Black) (雙線邊框 (黑色))' },
    { value: 'ornate wooden picture frame', label: 'Ornate Wooden Picture Frame (華麗木製畫框)' },
    { value: 'simple gold picture frame', label: 'Simple Gold Picture Frame (簡約金色畫框)' },
    { value: 'traditional Chinese window lattice border', label: 'Chinese Window Lattice Border (中式窗格邊框)' },
    { value: 'bamboo frame border', label: 'Bamboo Frame Border (竹框邊框)' },
];

const backgroundThemeOptions = [
    { value: 'Solid Color (Current)', label: 'Solid Color (Current) (純色 (目前))' },
    { value: 'Subtle Chinese Water Lily Pond', label: 'Subtle Water Lily Pond (雅緻荷塘月色)' },
    { value: 'Misty Mountains with Pine Trees', label: 'Misty Mountains & Pines (迷霧松山)' },
    { value: 'Bamboo Grove in Soft Light', label: 'Bamboo Grove (Soft Light) (柔光竹林)' },
    { value: 'Abstract Ink Wash Landscape', label: 'Abstract Ink Wash Landscape (抽象水墨山水)' },
    { value: 'Old Parchment Texture', label: 'Old Parchment Texture (舊羊皮紙紋理)' },
    { value: 'Silk Texture with Faint Floral Pattern', label: 'Silk with Faint Florals (淡雅花紋絲綢)' },
];

const ratioLabels_EN_ZH: Record<string, string> = {
  "Landscape": "Landscape (橫向)",
  "Portrait": "Portrait (縱向)",
  "Square": "Square (方形)"
};

type GeneratedImageInfo = AIEnhancedSpacingOutput["generatedImages"][0];

type SamplePhrase = {
  id: string;
  text: string;
  description: string;
};

const shuffleArray = (array: SamplePhrase[]) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

async function getCroppedImg(
  imageSrc: string,
  crop: CropType
): Promise<string | null> {
  const image = new Image();
  image.crossOrigin = 'anonymous';
  image.src = imageSrc;

  await new Promise((resolve, reject) => {
    image.onload = () => {
      if (image.naturalWidth === 0 || image.naturalHeight === 0) {
        reject(new Error('Image loaded with zero dimensions'));
      } else {
        resolve(image);
      }
    };
    image.onerror = (err) => reject(err);
  });

  if (crop.width === 0 || crop.height === 0) {
    return 'data:,'; 
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    console.error('Failed to get canvas context');
    return null;
  }

  let pixelX: number, pixelY: number, pixelWidth: number, pixelHeight: number;

  if (crop.unit === '%') {
    pixelX = (crop.x / 100) * image.naturalWidth;
    pixelY = (crop.y / 100) * image.naturalHeight;
    pixelWidth = (crop.width / 100) * image.naturalWidth;
    pixelHeight = (crop.height / 100) * image.naturalHeight;
  } else { 
    pixelX = crop.x;
    pixelY = crop.y;
    pixelWidth = crop.width;
    pixelHeight = crop.height;
  }
  
  if (pixelWidth === 0 || pixelHeight === 0) {
    return 'data:,';
  }

  canvas.width = pixelWidth;
  canvas.height = pixelHeight;

  ctx.drawImage(
    image,
    pixelX,
    pixelY,
    pixelWidth,
    pixelHeight,
    0,
    0,
    pixelWidth,
    pixelHeight
  );

  return new Promise((resolve) => {
    resolve(canvas.toDataURL('image/png'));
  });
}


export function CalligraphyGenerator() {
  const [phrase, setPhrase] = useState<string>("你好世界");
  const [fontFamily, setFontFamily] = useState<string>(fontOptions[0].value);
  const [fontSize, setFontSize] = useState<number[]>([64]);
  const [brushSize, setBrushSize] = useState<number[]>([3]);
  const [backgroundColor, setBackgroundColor] = useState<string>("#F5F5DC");
  const [borderStyle, setBorderStyle] = useState<string>(borderOptions[0].value);
  const [backgroundImageTheme, setBackgroundImageTheme] = useState<string>(backgroundThemeOptions[0].value);

  const [generatedImages, setGeneratedImages] = useState<GeneratedImageInfo[] | null>(null);
  const [selectedRatio, setSelectedRatio] = useState<string | null>(null);
  
  const [explanationEn, setExplanationEn] = useState<string | null>(null);
  const [explanationZh, setExplanationZh] = useState<string | null>(null);
  const [explanationLanguage, setExplanationLanguage] = useState<'en' | 'zh'>('en');

  const [displayedSamplePhrases, setDisplayedSamplePhrases] = useState<SamplePhrase[]>([]);
  
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<CropType>();
  const [completedCrop, setCompletedCrop] = useState<CropType>();
  const [showCropper, setShowCropper] = useState(false);
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);

  const resetCropState = useCallback(() => {
    setShowCropper(false);
    setCrop(undefined);
    setCompletedCrop(undefined);
    setCroppedImageUrl(null);
  }, []);

  const selectedImageUri = generatedImages?.find(img => img.ratio === selectedRatio)?.imageUri || null;

  const refreshSamplePhrases = useCallback(() => {
    setDisplayedSamplePhrases(shuffleArray(allSamplePhrases).slice(0, 4));
  }, []);

  useEffect(() => {
    if (generatedImages && generatedImages.length > 0 && !selectedRatio) {
      setSelectedRatio(generatedImages[0].ratio);
    }
    resetCropState(); 
  }, [generatedImages, selectedRatio, resetCropState]);

  useEffect(() => {
    refreshSamplePhrases();
  }, [refreshSamplePhrases]);


  const handleGenerateImage = async () => {
    if (!phrase.trim()) {
      toast({
        title: "Input Error (輸入錯誤)",
        description: "Please enter a Chinese phrase. (請輸入中文詞句。)",
        variant: "destructive",
      });
      return;
    }
    if (isPending) return;

    startTransition(async () => {
      setGeneratedImages(null);
      setSelectedRatio(null);
      setExplanationEn(null);
      setExplanationZh(null);
      resetCropState();
      try {
        const input: AIEnhancedSpacingInput = {
          chinesePhrase: phrase,
          fontFamily,
          fontSize: fontSize[0],
          brushSize: brushSize[0],
          backgroundColor,
          borderStyle: borderStyle === 'none' ? undefined : borderStyle,
          backgroundImageTheme: backgroundImageTheme === backgroundThemeOptions[0].value ? undefined : backgroundImageTheme,
        };
        const result: AIEnhancedSpacingOutput = await aiEnhancedSpacing(input);
        
        if (result.generatedImages && result.generatedImages.length > 0) {
          setGeneratedImages(result.generatedImages);
          setSelectedRatio(result.generatedImages[0].ratio); 
          setExplanationEn(result.explanationEn);
          setExplanationZh(result.explanationZh);
          toast({
            title: "Images Generated (圖像已生成)",
            description: "Your calligraphy images are ready in different ratios. (您的書法圖像已準備好多種比例。)",
          });
        } else {
          throw new Error("Image generation did not return any images.");
        }
      } catch (error) {
        console.error("Error generating image:", error);
        let description = "Could not generate the images. Please try again.";
        if (error instanceof Error) {
            description = error.message || description;
        }
        toast({
          title: "Generation Failed (生成失敗)",
          description: `${description} (請重試或檢查您的輸入。)`,
          variant: "destructive",
        });
      }
    });
  };

  const handlePhraseKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!isPending) {
        handleGenerateImage();
      }
    }
  };

  const handleDownloadImage = (isCropped = false) => {
    const uriToDownload = isCropped ? croppedImageUrl : selectedImageUri;
    if (!uriToDownload || uriToDownload === 'data:,' || !selectedRatio) {
        toast({
            title: "Download Error (下載錯誤)",
            description: "No valid image to download. (沒有可下載的有效圖像。)",
            variant: "destructive",
        });
        return;
    }

    const link = document.createElement("a");
    link.href = uriToDownload;
    const safePhrase = phrase.replace(/[^\u4e00-\u9fa5\w\s]/g, '').substring(0, 20) || "calligraphy";
    const safeRatio = selectedRatio.replace(':', '-');
    link.download = `cybrushverse_${safePhrase}_${safeRatio}${isCropped ? '_cropped' : ''}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    const toastTitle = isCropped ? "Image Cropped Downloaded (已下載裁剪圖像)" : "Image Downloaded (圖像已下載)";
    const toastDescription = isCropped ? "The cropped image has been saved. (裁剪後的圖像已儲存。)" : `The ${selectedRatio} image has been saved. (${selectedRatio} 圖像已儲存。)`;
    
    toast({
      title: toastTitle,
      description: toastDescription,
    });
  };

  const handleSampleClick = (sampleText: string) => {
    setPhrase(sampleText);
    toast({
      title: "Phrase Updated (詞句已更新)",
      description: `Input set to: "${sampleText}" (輸入已設為：「${sampleText}」)`,
    });
  };

  const handleSamplePhraseSelect = (value: string) => {
    if (value) {
      setPhrase(value);
      toast({
        title: "Phrase Updated (詞句已更新)",
        description: `Input set to: "${value}" (輸入已設為：「${value}」)`,
      });
    }
  };

  const onApplyCrop = async () => {
    if (!completedCrop || !selectedImageUri ) { 
      toast({ title: "Crop Error (裁剪錯誤)", description: "Cannot apply crop. Please select an area or ensure an image is loaded. (無法套用裁剪。請選取一個區域或確保圖像已載入。)", variant: "destructive"});
      return;
    }
    if (completedCrop.width === 0 || completedCrop.height === 0) {
      toast({ title: "Crop Error (裁剪錯誤)", description: "Crop selection has no width or height. Please select a valid area. (裁剪選取範圍沒有寬度或高度。請選取有效區域。)", variant: "destructive"});
      return;
    }

    try {
      const cropped = await getCroppedImg(selectedImageUri, completedCrop);
      if (cropped && cropped !== 'data:,') {
        setCroppedImageUrl(cropped);
        setShowCropper(false); 
        toast({ title: "Crop Applied (裁剪已套用)", description: "You can now download the cropped image. (您現在可以下載裁剪後的圖像。)"});
      } else {
        toast({ title: "Crop Failed (裁剪失敗)", description: "Could not crop the image or crop area was invalid. (無法裁剪圖像或裁剪區域無效。)", variant: "destructive"});
      }
    } catch (e) {
      console.error("Error cropping image:", e);
      const message = e instanceof Error ? e.message : String(e);
      toast({ title: "Crop Failed (裁剪失敗)", description: `Could not crop the image: ${message} (無法裁剪圖像：${message})`, variant: "destructive"});
    }
  };

  const explanationTitles = {
    en: "AI Spacing Explanation:",
    zh: "AI 間距調整說明："
  };
  
  const explanationButtonAriaLabel = explanationLanguage === 'en' ? 'Switch to Traditional Chinese explanation (切換至繁體中文說明)' : 'Switch to English explanation (切換至英文說明)';


  const imageToDisplay = (croppedImageUrl && croppedImageUrl !== 'data:,') ? croppedImageUrl : selectedImageUri;


  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-headline font-bold text-primary">CyBrushVerse</h1>
        <p className="text-xl text-muted-foreground mt-2">Craft Your Chinese Calligraphy with AI (用AI創作您的中國書法)</p>
      </header>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline text-3xl flex items-center"><PenTool className="mr-3 text-primary h-8 w-8" />Create Your Art (創作您的藝術作品)</CardTitle>
            <CardDescription>Enter your phrase and customize the appearance. (輸入您的詞句並自訂外觀。)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-1">
              <Label htmlFor="phrase" className="text-base flex items-center"><TextCursorInput className="mr-2 h-5 w-5 text-accent" />Chinese Phrase (Traditional) (中文詞句 (繁體))</Label>
              <Textarea
                id="phrase"
                value={phrase}
                onChange={(e) => setPhrase(e.target.value)}
                onKeyDown={handlePhraseKeyDown}
                placeholder="例如: 花好月圓"
                className="text-base min-h-[80px] focus:ring-primary"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div className="space-y-1">
                <Label htmlFor="fontFamily" className="text-base flex items-center"><WholeWord className="mr-2 h-5 w-5 text-accent" />Font Style (字體樣式)</Label>
                <Select value={fontFamily} onValueChange={setFontFamily}>
                  <SelectTrigger id="fontFamily" className="text-base focus:ring-primary">
                    <SelectValue placeholder="Select a font (選擇字體)" />
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
                  <Label htmlFor="backgroundColor" className="text-base flex items-center"><Palette className="mr-2 h-5 w-5 text-accent"/>Background Color (背景顏色)</Label>
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
                <Label htmlFor="fontSize" className="text-base pt-2">Character Size (字元大小): {fontSize[0]}px</Label>
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
                <Label htmlFor="brushSize" className="text-base pt-2">Brush Thickness (畫筆粗細): {brushSize[0]}px</Label>
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
              <Label htmlFor="borderStyle" className="text-base flex items-center"><Square className="mr-2 h-5 w-5 text-accent" />Border Style (邊框樣式)</Label>
              <Select value={borderStyle} onValueChange={setBorderStyle}>
                <SelectTrigger id="borderStyle" className="text-base focus:ring-primary">
                  <SelectValue placeholder="Select a border style (選擇邊框樣式)" />
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

            <div className="space-y-1">
              <Label htmlFor="backgroundImageTheme" className="text-base flex items-center"><ImageIcon className="mr-2 h-5 w-5 text-accent" />Background Theme (背景主題)</Label>
              <Select value={backgroundImageTheme} onValueChange={setBackgroundImageTheme}>
                <SelectTrigger id="backgroundImageTheme" className="text-base focus:ring-primary">
                  <SelectValue placeholder="Select a background theme (選擇背景主題)" />
                </SelectTrigger>
                <SelectContent>
                  {backgroundThemeOptions.map((theme) => (
                    <SelectItem key={theme.value} value={theme.value} className="text-base">
                      {theme.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label className="text-lg flex items-center"><Sparkles className="mr-2 h-5 w-5 text-accent" />Sample Phrases (Traditional) (範例詞句 (繁體))</Label>
              <div className="space-y-2">
                <Label htmlFor="samplePhraseSelect" className="text-base flex items-center"><List className="mr-2 h-5 w-5 text-accent" />Or pick from a list: (或從列表中選擇：)</Label>
                 <Select onValueChange={handleSamplePhraseSelect}>
                  <SelectTrigger id="samplePhraseSelect" className="text-base focus:ring-primary">
                    <SelectValue placeholder="Select a sample phrase... (選擇一個範例詞句...)" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {allSamplePhrases.map((sample) => (
                      <SelectItem key={sample.id} value={sample.text} className="text-base">
                        {sample.text} <span className="text-xs text-muted-foreground ml-2">({sample.description})</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Quick samples: (快速範例：)</p>
                <Button variant="ghost" size="sm" onClick={refreshSamplePhrases} aria-label="Refresh quick samples (刷新快速範例)">
                  <RefreshCcw className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {displayedSamplePhrases.map((sample) => (
                  <Button
                    key={sample.id}
                    variant="outline"
                    className="text-left justify-start h-auto py-2 border-dashed hover:border-primary hover:bg-primary/5 w-full"
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
              aria-label="Generate Calligraphy Image (生成書法圖像)"
            >
              {isPending ? (
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              ) : (
                <PenTool className="mr-2 h-6 w-6" />
              )}
              Generate Images (生成圖像)
            </Button>
          </CardFooter>
        </Card>

        <Card className="shadow-xl sticky top-8">
          <CardHeader>
            <CardTitle className="font-headline text-3xl">Preview (預覽)</CardTitle>
            <CardDescription>Your generated calligraphy will appear here. Select a ratio below. (您生成的書法作品將顯示於此。請在下方選擇一個比例。)</CardDescription>
          </CardHeader>
          <CardContent 
             className={cn(
                "min-h-[300px] max-h-[75vh] overflow-y-auto rounded-md p-4 flex flex-col",
                (!selectedImageUri && !isPending) && "items-center justify-center",
                showCropper && "overflow-visible" 
              )}
             style={{ backgroundColor: (showCropper || (backgroundImageTheme !== backgroundThemeOptions[0].value && backgroundImageTheme && selectedImageUri)) ? 'transparent' : backgroundColor }}
          >
            {isPending && (
              <div className="flex flex-col items-center justify-center text-center h-full">
                <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
                <p className="text-lg text-muted-foreground">Generating your masterpieces... (正在生成您的傑作...)</p>
                <p className="text-sm text-muted-foreground">Using theme (使用主題): {backgroundImageTheme !== backgroundThemeOptions[0].value ? backgroundImageTheme : `Solid Color (純色) - ${backgroundColor}`}</p>
              </div>
            )}
            {!isPending && imageToDisplay && (
              <div className="w-full space-y-4">
                 <div
                    className={cn(
                        "w-full rounded-md overflow-hidden shadow-inner mx-auto flex items-center justify-center",
                        (borderStyle === 'none' && backgroundImageTheme === backgroundThemeOptions[0].value && !showCropper) && "border border-border"
                    )}
                     style={{ backgroundColor: (showCropper || (backgroundImageTheme !== backgroundThemeOptions[0].value && backgroundImageTheme)) ? 'transparent' : backgroundColor }}
                    >
                    {showCropper && selectedImageUri ? ( 
                        <ReactCrop
                        crop={crop}
                        onChange={(_, percentCrop) => setCrop(percentCrop)}
                        onComplete={(c, pc) => setCompletedCrop(pc)} 
                        className="max-w-full max-h-[60vh] bg-background/50"
                        >
                        <img
                            ref={imgRef}
                            src={selectedImageUri} 
                            alt="Crop preview (裁剪預覽)" 
                            data-ai-hint="calligraphy art"
                        />
                        </ReactCrop>
                    ) : (
                        <img
                        ref={imgRef} 
                        src={imageToDisplay} 
                        alt={`Generated Calligraphy (${selectedRatio || 'Preview'}) (生成書法 (${selectedRatio || '預覽'}))`}
                        style={{ objectFit: 'contain', maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto' }}
                        className="rounded-md"
                        data-ai-hint="calligraphy art"
                        />
                    )}
                </div>

                {explanationEn && explanationZh && !showCropper && (
                  <div className="bg-background/80 p-3 rounded-md border border-border backdrop-blur-sm">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-semibold text-accent">{explanationTitles[explanationLanguage]}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExplanationLanguage(prev => prev === 'en' ? 'zh' : 'en')}
                        className="px-2 py-1 h-auto text-accent bg-accent/10 hover:bg-accent/20"
                        aria-label={explanationButtonAriaLabel}
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
            {!isPending && !imageToDisplay && (
              <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-full">
                <Palette className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Your artwork will be shown here. (您的作品將顯示於此。)</p>
                <p className="text-sm">Adjust settings and click "Generate Images". (調整設定並點擊「生成圖像」。)</p>
              </div>
            )}
          </CardContent>
          {generatedImages && generatedImages.length > 0 && !isPending && (
            <CardFooter className="flex-col items-stretch space-y-3 pt-4">
               <div className="flex justify-center space-x-2">
                {generatedImages.map((imgInfo) => (
                  <Button
                    key={imgInfo.ratio}
                    variant={selectedRatio === imgInfo.ratio ? "default" : "outline"}
                    onClick={() => { setSelectedRatio(imgInfo.ratio); resetCropState(); }}
                    className="flex-1"
                    aria-label={`Select ${imgInfo.label} ratio (${imgInfo.ratio}) (選擇 ${ratioLabels_EN_ZH[imgInfo.label] || imgInfo.label} 比例 (${imgInfo.ratio}))`}
                    disabled={showCropper}
                  >
                    {ratioLabels_EN_ZH[imgInfo.label] || imgInfo.label} ({imgInfo.ratio})
                  </Button>
                ))}
              </div>
              {showCropper && selectedImageUri && (
                <div className="flex space-x-2">
                    <Button onClick={onApplyCrop} className="flex-1" variant="default" disabled={!completedCrop || !selectedImageUri}>
                        <Crop className="mr-2 h-5 w-5"/> Apply Crop (套用裁剪)
                    </Button>
                    <Button onClick={resetCropState} className="flex-1" variant="outline">
                        Cancel Crop (取消裁剪)
                    </Button>
                </div>
              )}
              <div className="flex space-x-2">
                <Button
                    onClick={() => setShowCropper(prev => !prev)}
                    variant="outline"
                    className="flex-1"
                    aria-label={showCropper ? "Cancel Cropping (取消裁剪)" : "Crop Image (裁剪圖像)"}
                    disabled={!selectedImageUri || isPending}
                    >
                    <Crop className="mr-2 h-5 w-5" />
                    {showCropper ? "Cancel Cropping (取消裁剪)" : "Crop Image (裁剪圖像)"}
                </Button>
                <Button
                    onClick={() => handleDownloadImage(false)}
                    variant="outline"
                    className="flex-1 border-primary text-primary hover:bg-primary/10"
                    aria-label="Download Original Calligraphy Image (下載原始書法圖像)"
                    disabled={!selectedImageUri || showCropper}
                    >
                    <Download className="mr-2 h-5 w-5" />
                    Download Original (下載原圖)
                </Button>
              </div>
              {croppedImageUrl && croppedImageUrl !== 'data:,' && !showCropper && (
                 <Button
                    onClick={() => handleDownloadImage(true)}
                    variant="default"
                    className="w-full text-lg py-3 bg-green-600 hover:bg-green-700"
                    aria-label="Download Cropped Calligraphy Image (下載裁剪後的書法圖像)"
                    >
                    <Download className="mr-2 h-6 w-6" />
                    Download Cropped Image (下載裁剪圖像)
                </Button>
              )}
            </CardFooter>
          )}
        </Card>
      </div>
      <footer className="text-center mt-16 py-6 border-t border-border">
        <p className="text-muted-foreground">&copy; {new Date().getFullYear()} CyBrushVerse. All rights reserved. (版權所有。)</p>
      </footer>
    </div>
  );
}

