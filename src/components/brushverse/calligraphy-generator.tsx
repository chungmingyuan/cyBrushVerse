
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
  { id: "s1", text: "花好月圓", description_en: "Blooming flowers and a full moon - A wish for a happy life", description_zh: "花好月圓 - 祝生活愉快" },
  { id: "s2", text: "福壽康寧", description_en: "Good fortune, longevity, health, and peace", description_zh: "福壽康寧 - 福氣、長壽、健康、安寧" },
  { id: "s3", text: "龍馬精神", description_en: "Spirit of a dragon and horse - Vigor and vitality", description_zh: "龍馬精神 - 活力充沛，精神旺盛" },
  { id: "s4", text: "學無止境", description_en: "Learning is endless", description_zh: "學無止境 - 學習永無止盡" },
  { id: "s5", text: "靜以修身", description_en: "Cultivate oneself through tranquility", description_zh: "靜以修身 - 通過寧靜來修養身心" },
  { id: "s6", text: "厚德載物", description_en: "Great virtue carries all things - Be virtuous and tolerant", description_zh: "厚德載物 - 品德高尚，能容納萬物" },
  { id: "s7", text: "自強不息", description_en: "Strive constantly for self-improvement", description_zh: "自強不息 - 不斷努力向上，永不懈怠" },
  { id: "s8", text: "登高望遠", description_en: "Climb high and look far - Aim high and have a broad perspective", description_zh: "登高望遠 - 登得高看得遠，比喻志向遠大" },
  { id: "s9", text: "海納百川", description_en: "The sea accepts all rivers - Be open-minded and inclusive", description_zh: "海納百川 - 大海容納百條河流，比喻心胸寬廣" },
  { id: "s10", text: "道法自然", description_en: "The Tao follows nature - Live in accordance with nature", description_zh: "道法自然 - 道效法自然，順應自然規律" },
  { id: "s11", text: "天道酬勤", description_en: "Heaven rewards the diligent", description_zh: "天道酬勤 - 上天會獎賞勤奮的人" },
  { id: "s12", text: "虛懷若谷", description_en: "Modest as an empty valley - Be humble", description_zh: "虛懷若谷 - 心胸像山谷一樣開闊，形容非常謙虛" },
  { id: "s13", text: "積健為雄", description_en: "Accumulate strength to become powerful", description_zh: "積健為雄 - 積累健康強壯的基礎才能成就大事" },
  { id: "s14", text: "和氣致祥", description_en: "Harmony brings auspiciousness", description_zh: "和氣致祥 - 和睦的氣氛能帶來吉祥" },
  { id: "s15", text: "心想事成", description_en: "May all your wishes come true", description_zh: "心想事成 - 心裡想的都能成功" },
  { id: "s16", text: "萬事如意", description_en: "May everything go as you wish", description_zh: "萬事如意 - 所有事情都順心如意" },
  { id: "s17", text: "一帆風順", description_en: "Smooth sailing - May your endeavors go smoothly", description_zh: "一帆風順 - 旅程或事業順利無阻" },
  { id: "s18", text: "歲月靜好", description_en: "Years are quiet and good - Peaceful and beautiful times", description_zh: "歲月靜好 - 生活安寧美好" },
  { id: "s19", text: "知足常樂", description_en: "Contentment brings happiness", description_zh: "知足常樂 - 知道滿足就能常常快樂" },
  { id: "s20", text: "大道至簡", description_en: "The great way is simple", description_zh: "大道至簡 - 最高的道理往往是最簡單的" },
  { id: "s21", text: "上善若水", description_en: "The highest good is like water - Be adaptable and beneficial", description_zh: "上善若水 - 最好的品德像水一樣，滋養萬物而不爭" },
  { id: "s22", text: "寧靜致遠", description_en: "Tranquility leads to far-reaching wisdom", description_zh: "寧靜致遠 - 內心寧靜才能思慮深遠，成就遠大目標" },
  { id: "s23", text: "春華秋實", description_en: "Spring flowers, autumn fruits - Efforts yield results", description_zh: "春華秋實 - 春天開花，秋天結果，比喻努力必有收穫" },
  { id: "s24", text: "格物致知", description_en: "Investigate things to extend knowledge", description_zh: "格物致知 - 探究事物的原理以獲得知識" },
  { id: "s25", text: "誠意正心", description_en: "Sincerity of intent rectifies the mind", description_zh: "誠意正心 - 心意真誠，思想端正" },
  { id: "s26", text: "修身齊家", description_en: "Cultivate oneself, regulate the family", description_zh: "修身齊家 - 修養自身品德，管理好家庭" },
  { id: "s27", text: "治國平天下", description_en: "Govern the state, bring peace to the world (aspirational)", description_zh: "治國平天下 - 治理國家，使天下太平（抱負）" },
  { id: "s28", text: "仁者愛人", description_en: "The benevolent love others", description_zh: "仁者愛人 - 有仁德的人愛護他人" },
  { id: "s29", text: "禮尚往來", description_en: "Courtesy demands reciprocity", description_zh: "禮尚往來 - 禮節上應該有來有往" },
  { id: "s30", text: "温故知新", description_en: "Review the old to learn the new", description_zh: "温故知新 - 温習舊的知識，從而獲得新的理解和體會" },
  { id: "s31", text: "學而不厭", description_en: "Learn without satiety", description_zh: "學而不厭 - 學習不感到滿足" },
  { id: "s32", text: "誨人不倦", description_en: "Teach without weariness", description_zh: "誨人不倦 - 教導別人不知疲倦" },
  { id: "s33", text: "見賢思齊", description_en: "Emulate virtuous people when you see them", description_zh: "見賢思齊 - 看到賢德的人就想向他看齊" },
  { id: "s34", text: "三思而行", description_en: "Think thrice before acting", description_zh: "三思而行 - 反覆思考然後才行動" },
  { id: "s35", text: "言必信行必果", description_en: "Be true to your word and resolute in your actions", description_zh: "言必信行必果 - 說話一定守信用，行動一定堅決果斷" },
  { id: "s36", text: "任重道遠", description_en: "The burden is heavy and the road is long - A difficult task", description_zh: "任重道遠 - 責任重大，路途遙遠，形容任務艱鉅" },
  { id: "s37", text: "己所不欲勿施於人", description_en: "Do not do to others what you do not want done to yourself", description_zh: "己所不欲勿施於人 - 自己不想要的事物，不要強加給別人" },
  { id: "s38", text: "敏於事慎於言", description_en: "Be quick in action and cautious in speech", description_zh: "敏於事慎於言 - 做事要敏捷，說話要謹慎" },
  { id: "s39", text: "君子和而不同", description_en: "A gentleman seeks harmony but not conformity", description_zh: "君子和而不同 - 君子在人際交往中能保持和諧，但有自己的獨立見解" },
  { id: "s40", text: "小人同而不和", description_en: "A petty person seeks conformity but not harmony", description_zh: "小人同而不和 - 小人與人交往時盲目附和，但內心並不和諧" },
  { id: "s41", text: "博學篤志", description_en: "Learn broadly and be steadfast in purpose", description_zh: "博學篤志 - 廣泛學習，並堅守自己的志向" },
  { id: "s42", text: "切問近思", description_en: "Inquire earnestly and reflect on what is at hand", description_zh: "切問近思 - 懇切地提問，並思考當前的事情" },
  { id: "s43", text: "精益求精", description_en: "Constantly strive for perfection", description_zh: "精益求精 - 已經很好了還要求更好" },
  { id: "s44", text: "持之以恆", description_en: "Persevere", description_zh: "持之以恆 - 長久堅持下去" },
  { id: "s45", text: "集思廣益", description_en: "Draw on collective wisdom for greater benefit", description_zh: "集思廣益 - 集中大家的智慧，廣泛聽取有益的意見" },
  { id: "s46", text: "飲水思源", description_en: "When drinking water, remember its source - Be grateful", description_zh: "飲水思源 - 喝水時想到水的來源，比喻不忘本，感恩圖報" },
  { id: "s47", text: "鵬程萬里", description_en: "A roc’s flight of ten thousand li - A bright future", description_zh: "鵬程萬里 - 大鵬鳥能飛萬里之遙，比喻前程遠大" },
  { id: "s48", text: "馬到成功", description_en: "Instant success upon arrival (like a swift horse)", description_zh: "馬到成功 - 戰馬一到便獲得勝利，形容事情順利，迅速成功" },
  { id: "s49", text: "一諾千金", description_en: "A promise is worth a thousand pieces of gold - Keep your promises", description_zh: "一諾千金 - 一句承諾價值千金，形容說話算數，信守承諾" },
  { id: "s50", text: "樂在其中", description_en: "Find joy in it", description_zh: "樂在其中 - 在所做的事情中感受到樂趣" },
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

const ratioLabels_EN: Record<string, string> = {
  "Landscape": "Landscape",
  "Portrait": "Portrait",
  "Square": "Square"
};
const ratioLabels_ZH: Record<string, string> = {
  "Landscape": "橫向",
  "Portrait": "縱向",
  "Square": "方形"
};

type GeneratedImageInfo = AIEnhancedSpacingOutput["generatedImages"][0];

type SamplePhrase = {
  id: string;
  text: string;
  description_en: string;
  description_zh: string;
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
  const [showChinese, setShowChinese] = useState<boolean>(false);


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
        title: `Input Error${showChinese ? " (輸入錯誤)" : ""}`,
        description: `Please enter a Chinese phrase.${showChinese ? " (請輸入中文詞句。)" : ""}`,
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
            title: `Images Generated${showChinese ? " (圖像已生成)" : ""}`,
            description: `Your calligraphy images are ready in different ratios.${showChinese ? " (您的書法圖像已準備好多種比例。)" : ""}`,
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
          title: `Generation Failed${showChinese ? " (生成失敗)" : ""}`,
          description: `${description}${showChinese ? " (請重試或檢查您的輸入。)" : ""}`,
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
            title: `Download Error${showChinese ? " (下載錯誤)" : ""}`,
            description: `No valid image to download.${showChinese ? " (沒有可下載的有效圖像。)" : ""}`,
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

    const toastTitle = isCropped ? `Image Cropped Downloaded${showChinese ? " (已下載裁剪圖像)" : ""}` : `Image Downloaded${showChinese ? " (圖像已下載)" : ""}`;
    const toastDescriptionEn = isCropped ? "The cropped image has been saved." : `The ${selectedRatio} image has been saved.`;
    const toastDescriptionZh = isCropped ? " (裁剪後的圖像已儲存。)" : ` (${selectedRatio} 圖像已儲存。)`;
    
    toast({
      title: toastTitle,
      description: `${toastDescriptionEn}${showChinese ? toastDescriptionZh : ""}`,
    });
  };

  const handleSampleClick = (sampleText: string) => {
    setPhrase(sampleText);
    toast({
      title: `Phrase Updated${showChinese ? " (詞句已更新)" : ""}`,
      description: `Input set to: "${sampleText}"${showChinese ? ` (輸入已設為：「${sampleText}」)` : ""}`,
    });
  };

  const handleSamplePhraseSelect = (value: string) => {
    if (value) {
      setPhrase(value);
      toast({
        title: `Phrase Updated${showChinese ? " (詞句已更新)" : ""}`,
        description: `Input set to: "${value}"${showChinese ? ` (輸入已設為：「${value}」)` : ""}`,
      });
    }
  };

  const onApplyCrop = async () => {
    if (!completedCrop || !selectedImageUri ) {
      toast({ 
        title: `Crop Error${showChinese ? " (裁剪錯誤)" : ""}`, 
        description: `Cannot apply crop. Please select an area or ensure an image is loaded.${showChinese ? " (無法套用裁剪。請選取一個區域或確保圖像已載入。)" : ""}`, 
        variant: "destructive"
      });
      return;
    }
    if (completedCrop.width === 0 || completedCrop.height === 0) {
      toast({ 
        title: `Crop Error${showChinese ? " (裁剪錯誤)" : ""}`, 
        description: `Crop selection has no width or height. Please select a valid area.${showChinese ? " (裁剪選取範圍沒有寬度或高度。請選取有效區域。)" : ""}`, 
        variant: "destructive"
      });
      return;
    }

    try {
      const cropped = await getCroppedImg(selectedImageUri, completedCrop);
      if (cropped && cropped !== 'data:,') {
        setCroppedImageUrl(cropped);
        setShowCropper(false);
        toast({ 
          title: `Crop Applied${showChinese ? " (裁剪已套用)" : ""}`, 
          description: `You can now download the cropped image.${showChinese ? " (您現在可以下載裁剪後的圖像。)" : ""}`
        });
      } else {
        toast({ 
          title: `Crop Failed${showChinese ? " (裁剪失敗)" : ""}`, 
          description: `Could not crop the image or crop area was invalid.${showChinese ? " (無法裁剪圖像或裁剪區域無效。)" : ""}`, 
          variant: "destructive"
        });
      }
    } catch (e) {
      console.error("Error cropping image:", e);
      const message = e instanceof Error ? e.message : String(e);
      toast({ 
        title: `Crop Failed${showChinese ? " (裁剪失敗)" : ""}`, 
        description: `Could not crop the image: ${message}${showChinese ? ` (無法裁剪圖像：${message})` : ""}`, 
        variant: "destructive"
      });
    }
  };

  const explanationTitles = {
    en: "AI Spacing Explanation:",
    zh: "AI 間距調整說明："
  };

  const explanationButtonAriaLabel = explanationLanguage === 'en' ? 
    `Switch to Traditional Chinese explanation${showChinese ? " (切換至繁體中文說明)" : ""}` : 
    `Switch to English explanation${showChinese ? " (切換至英文說明)" : ""}`;


  const imageToDisplay = (croppedImageUrl && croppedImageUrl !== 'data:,') ? croppedImageUrl : selectedImageUri;


  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <div className="flex items-center justify-center gap-4">
            <h1 className="text-5xl font-headline font-bold text-primary">CyBrushVerse</h1>
            <Button variant="outline" onClick={() => setShowChinese(!showChinese)} className="text-lg" aria-label={showChinese ? "Switch to English UI (切換至英文界面)" : "Switch to Chinese UI (切換至中文界面)"}>
                <Languages className="mr-2 h-5 w-5" />
                {showChinese ? "English" : "中文"}
            </Button>
        </div>
        <p className="text-xl text-muted-foreground mt-2">
            Craft Your Chinese Calligraphy with AI
            {showChinese && " (用AI創作您的中國書法)"}
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline text-3xl flex items-center">
                <PenTool className="mr-3 text-primary h-8 w-8" />
                Create Your Art
                {showChinese && " (創作您的藝術作品)"}
            </CardTitle>
            <CardDescription>
                Enter your phrase and customize the appearance.
                {showChinese && " (輸入您的詞句並自訂外觀。)"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-1">
              <Label htmlFor="phrase" className="text-base flex items-center">
                <TextCursorInput className="mr-2 h-5 w-5 text-accent" />
                Chinese Phrase (Traditional)
                {showChinese && " (中文詞句 (繁體))"}
              </Label>
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
                <Label htmlFor="fontFamily" className="text-base flex items-center">
                    <WholeWord className="mr-2 h-5 w-5 text-accent" />
                    Font Style
                    {showChinese && " (字體樣式)"}
                </Label>
                <Select value={fontFamily} onValueChange={setFontFamily}>
                  <SelectTrigger id="fontFamily" className="text-base focus:ring-primary">
                    <SelectValue placeholder={`Select a font${showChinese ? " (選擇字體)" : ""}`} />
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
                  <Label htmlFor="backgroundColor" className="text-base flex items-center">
                    <Palette className="mr-2 h-5 w-5 text-accent"/>
                    Background Color
                    {showChinese && " (背景顏色)"}
                  </Label>
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
                <Label htmlFor="fontSize" className="text-base pt-2">
                    Character Size{showChinese && " (字元大小)"}: {fontSize[0]}px
                </Label>
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
                <Label htmlFor="brushSize" className="text-base pt-2">
                    Brush Thickness{showChinese && " (畫筆粗細)"}: {brushSize[0]}px
                </Label>
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
              <Label htmlFor="borderStyle" className="text-base flex items-center">
                <Square className="mr-2 h-5 w-5 text-accent" />
                Border Style
                {showChinese && " (邊框樣式)"}
              </Label>
              <Select value={borderStyle} onValueChange={setBorderStyle}>
                <SelectTrigger id="borderStyle" className="text-base focus:ring-primary">
                  <SelectValue placeholder={`Select a border style${showChinese ? " (選擇邊框樣式)" : ""}`} />
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
              <Label htmlFor="backgroundImageTheme" className="text-base flex items-center">
                <ImageIcon className="mr-2 h-5 w-5 text-accent" />
                Background Theme
                {showChinese && " (背景主題)"}
              </Label>
              <Select value={backgroundImageTheme} onValueChange={setBackgroundImageTheme}>
                <SelectTrigger id="backgroundImageTheme" className="text-base focus:ring-primary">
                  <SelectValue placeholder={`Select a background theme${showChinese ? " (選擇背景主題)" : ""}`} />
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
              <Label className="text-lg flex items-center">
                <Sparkles className="mr-2 h-5 w-5 text-accent" />
                Sample Phrases (Traditional)
                {showChinese && " (範例詞句 (繁體))"}
              </Label>
              <div className="space-y-2">
                <Label htmlFor="samplePhraseSelect" className="text-base flex items-center">
                    <List className="mr-2 h-5 w-5 text-accent" />
                    Or pick from a list:
                    {showChinese && " (或從列表中選擇：)"}
                </Label>
                 <Select onValueChange={handleSamplePhraseSelect}>
                  <SelectTrigger id="samplePhraseSelect" className="text-base focus:ring-primary">
                    <SelectValue placeholder={`Select a sample phrase...${showChinese ? " (選擇一個範例詞句...)" : ""}`} />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {allSamplePhrases.map((sample) => (
                      <SelectItem key={sample.id} value={sample.text} className="text-base">
                        {sample.text} <span className="text-xs text-muted-foreground ml-2">({sample.description_en}{showChinese && sample.description_zh ? ` / ${sample.description_zh}` : ""})</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    Quick samples:
                    {showChinese && " (快速範例：)"}
                </p>
                <Button variant="ghost" size="sm" onClick={refreshSamplePhrases} aria-label={`Refresh quick samples${showChinese ? " (刷新快速範例)" : ""}`}>
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
                    title={`${sample.description_en}${showChinese && sample.description_zh ? ` / ${sample.description_zh}` : ""}`}
                  >
                    <div className="flex flex-col w-full">
                      <span className="font-semibold text-primary">{sample.text}</span>
                      <span className="text-xs text-muted-foreground break-words whitespace-normal">{sample.description_en}{showChinese && sample.description_zh ? ` / ${sample.description_zh}` : ""}</span>
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
              aria-label={`Generate Calligraphy Image${showChinese ? " (生成書法圖像)" : ""}`}
            >
              {isPending ? (
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              ) : (
                <PenTool className="mr-2 h-6 w-6" />
              )}
              Generate Images
              {showChinese && " (生成圖像)"}
            </Button>
          </CardFooter>
        </Card>

        <Card className="shadow-xl sticky top-8">
          <CardHeader>
            <CardTitle className="font-headline text-3xl">
                Preview
                {showChinese && " (預覽)"}
            </CardTitle>
            <CardDescription>
                Your generated calligraphy will appear here. Select a ratio below.
                {showChinese && " (您生成的書法作品將顯示於此。請在下方選擇一個比例。)"}
            </CardDescription>
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
                <p className="text-lg text-muted-foreground">
                    Generating your masterpieces...
                    {showChinese && " (正在生成您的傑作...)"}
                </p>
                <p className="text-sm text-muted-foreground">
                    Using theme{showChinese && " (使用主題)"}: {backgroundImageTheme !== backgroundThemeOptions[0].value ? backgroundImageTheme : `Solid Color${showChinese ? " (純色)" : ""} - ${backgroundColor}`}
                </p>
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
                            alt={`Crop preview${showChinese ? " (裁剪預覽)" : ""}`}
                            data-ai-hint="calligraphy art"
                        />
                        </ReactCrop>
                    ) : (
                        <img
                        ref={imgRef}
                        src={imageToDisplay}
                        alt={`Generated Calligraphy (${selectedRatio || `Preview${showChinese ? " (預覽)" : ""}`})${showChinese ? ` (生成書法 (${selectedRatio || `預覽`}))` : ""}`}
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
                <p className="text-lg">
                    Your artwork will be shown here.
                    {showChinese && " (您的作品將顯示於此。)"}
                </p>
                <p className="text-sm">
                    Adjust settings and click "Generate Images".
                    {showChinese && " (調整設定並點擊「生成圖像」。)"}
                </p>
              </div>
            )}
          </CardContent>
          {generatedImages && generatedImages.length > 0 && !isPending && (
            <CardFooter className="flex-col items-stretch space-y-3 pt-4">
               <div className="flex justify-center space-x-2">
                {generatedImages.map((imgInfo) => {
                  const enLabel = ratioLabels_EN[imgInfo.label] || imgInfo.label;
                  const zhLabel = ratioLabels_ZH[imgInfo.label] || "";
                  return (
                    <Button
                        key={imgInfo.ratio}
                        variant={selectedRatio === imgInfo.ratio ? "default" : "outline"}
                        onClick={() => { setSelectedRatio(imgInfo.ratio); resetCropState(); }}
                        className="flex-1"
                        aria-label={`Select ${enLabel} ratio (${imgInfo.ratio})${showChinese && zhLabel ? ` (選擇 ${zhLabel} 比例 (${imgInfo.ratio}))` : ""}`}
                        disabled={showCropper}
                    >
                        {enLabel} ({imgInfo.ratio})
                        {showChinese && zhLabel && ` (${zhLabel})`}
                    </Button>
                  );
                })}
              </div>
              {showCropper && selectedImageUri && (
                <div className="flex space-x-2">
                    <Button onClick={onApplyCrop} className="flex-1" variant="default" disabled={!completedCrop || !selectedImageUri}>
                        <Crop className="mr-2 h-5 w-5"/> Apply Crop
                        {showChinese && " (套用裁剪)"}
                    </Button>
                    <Button onClick={resetCropState} className="flex-1" variant="outline">
                        Cancel Crop
                        {showChinese && " (取消裁剪)"}
                    </Button>
                </div>
              )}
              <div className="flex space-x-2">
                <Button
                    onClick={() => setShowCropper(prev => !prev)}
                    variant="outline"
                    className="flex-1"
                    aria-label={showCropper ? `Cancel Cropping${showChinese ? " (取消裁剪)" : ""}` : `Crop Image${showChinese ? " (裁剪圖像)" : ""}`}
                    disabled={!selectedImageUri || isPending}
                    >
                    <Crop className="mr-2 h-5 w-5" />
                    {showCropper ? 
                        `Cancel Cropping${showChinese ? " (取消裁剪)" : ""}` : 
                        `Crop Image${showChinese ? " (裁剪圖像)" : ""}`
                    }
                </Button>
                <Button
                    onClick={() => handleDownloadImage(false)}
                    variant="outline"
                    className="flex-1 border-primary text-primary hover:bg-primary/10"
                    aria-label={`Download Original Calligraphy Image${showChinese ? " (下載原始書法圖像)" : ""}`}
                    disabled={!selectedImageUri || showCropper}
                    >
                    <Download className="mr-2 h-5 w-5" />
                    Download Original
                    {showChinese && " (下載原圖)"}
                </Button>
              </div>
              {croppedImageUrl && croppedImageUrl !== 'data:,' && !showCropper && (
                 <Button
                    onClick={() => handleDownloadImage(true)}
                    variant="default"
                    className="w-full text-lg py-3 bg-green-600 hover:bg-green-700"
                    aria-label={`Download Cropped Calligraphy Image${showChinese ? " (下載裁剪後的書法圖像)" : ""}`}
                    >
                    <Download className="mr-2 h-6 w-6" />
                    Download Cropped Image
                    {showChinese && " (下載裁剪圖像)"}
                </Button>
              )}
            </CardFooter>
          )}
        </Card>
      </div>
      <footer className="text-center mt-16 py-6 border-t border-border">
        <p className="text-muted-foreground">
            &copy; {new Date().getFullYear()} CyBrushVerse. All rights reserved.
            {showChinese && " (版權所有。)"}
        </p>
      </footer>
    </div>
  );
}

