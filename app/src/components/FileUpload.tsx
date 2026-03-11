import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useResume } from '@/hooks/useResume';
import { formatFileSize } from '@/lib/utils';

export function FileUpload() {
  const { uploadResume, uploadState, isAnalyzing } = useResume();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept: {
        'application/pdf': ['.pdf'],
      },
      maxFiles: 1,
      maxSize: 10 * 1024 * 1024,
      disabled: uploadState.isUploading || isAnalyzing,
    });

  const handleUpload = async () => {
    if (selectedFile) {
      await uploadResume(selectedFile);
      setSelectedFile(null);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
  };

  const isUploading = uploadState.isUploading;
  const isProcessing = isAnalyzing;

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 transition-all duration-200
          ${isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
          }
          ${(isUploading || isProcessing) && 'opacity-50 cursor-not-allowed'}
        `}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="p-4 bg-blue-100 rounded-full">
            <Upload className="w-8 h-8 text-blue-600" />
          </div>

          <div>
            <p className="text-lg font-medium text-slate-700">
              {isDragActive
                ? 'Drop your resume here'
                : 'Drag & drop your resume here'}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              or click to browse files
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="px-2 py-1 bg-slate-100 rounded">PDF</span>
            <span>Max 10MB</span>
          </div>
        </div>
      </div>

      {fileRejections.length > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg">
          <p className="text-sm text-rose-600">
            {fileRejections[0].errors[0].message}
          </p>
        </div>
      )}

      {selectedFile && !isUploading && !isProcessing && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <File className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-slate-700">{selectedFile.name}</p>
                <p className="text-sm text-slate-500">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClear}
                className="text-slate-400 hover:text-rose-500"
              >
                <X className="w-4 h-4" />
              </Button>
              <Button onClick={handleUpload} className="bg-blue-600 hover:bg-blue-700">
                Analyze Resume
              </Button>
            </div>
          </div>
        </div>
      )}

      {isUploading && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-700">Uploading...</span>
            <span className="text-sm text-blue-600">{uploadState.progress}%</span>
          </div>
          <Progress value={uploadState.progress} className="h-2" />
        </div>
      )}

      {isProcessing && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-amber-600 animate-spin" />
            <div>
              <p className="font-medium text-amber-700">Analyzing your resume...</p>
              <p className="text-sm text-amber-600">
                Our AI is evaluating keywords, formatting, impact, and completeness
              </p>
            </div>
          </div>
        </div>
      )}

      {uploadState.error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg">
          <p className="text-sm text-rose-600">{uploadState.error}</p>
        </div>
      )}
    </div>
  );
}
