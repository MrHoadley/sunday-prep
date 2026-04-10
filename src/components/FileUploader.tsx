import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Loader2, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { parseMealPlanFile } from '../services/geminiService';
import { MealPlan } from '../types';

interface FileUploaderProps {
  onPlanParsed: (plan: MealPlan) => void;
}

export function FileUploader({ onPlanParsed }: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const plan = await parseMealPlanFile(base64, file.type);
        onPlanParsed(plan);
        setIsUploading(false);
      };
      reader.onerror = () => {
        setError("Failed to read file");
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setError("Failed to parse meal plan. Please try again.");
      setIsUploading(false);
    }
  }, [onPlanParsed]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/markdown': ['.md'],
      'text/plain': ['.txt'],
    } as any,
    multiple: false,
  } as any);

  return (
    <div className="w-full max-w-xl mx-auto">
      <Card className="border-dashed border-2 bg-muted/50">
        <CardContent className="p-0">
          <div
            {...getRootProps()}
            className={`flex flex-col items-center justify-center p-12 cursor-pointer transition-colors ${
              isDragActive ? 'bg-primary/10' : ''
            }`}
          >
            <input {...getInputProps()} />
            {isUploading ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-lg font-medium">Analyzing your meal plan...</p>
              </div>
            ) : (
              <>
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Upload Meal Plan</h3>
                <p className="text-muted-foreground text-center mb-6">
                  Drag & drop your PDF, Word, Excel, or Markdown file here, or click to browse.
                </p>
                <div className="flex gap-4 flex-wrap justify-center">
                  <Badge variant="secondary" className="flex gap-1">
                    <FileText className="h-3 w-3" /> PDF
                  </Badge>
                  <Badge variant="secondary" className="flex gap-1">
                    <FileText className="h-3 w-3" /> Word
                  </Badge>
                  <Badge variant="secondary" className="flex gap-1">
                    <FileText className="h-3 w-3" /> Excel
                  </Badge>
                  <Badge variant="secondary" className="flex gap-1">
                    <FileText className="h-3 w-3" /> Markdown
                  </Badge>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}
    </div>
  );
}
