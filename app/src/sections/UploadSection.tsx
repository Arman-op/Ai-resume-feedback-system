import { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileUpload } from '@/components/FileUpload';
import { useResume } from '@/hooks/useResume';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Lock, Upload } from 'lucide-react';

interface UploadSectionProps {
  onAnalysisComplete: () => void;
}

export function UploadSection({ onAnalysisComplete }: UploadSectionProps) {
  const { isAuthenticated, login } = useAuth();
  const { currentResume, isAnalyzing } = useResume();
  const sectionRef = useRef<HTMLDivElement>(null);

  if (!isAuthenticated) {
    return (
      <section ref={sectionRef} id="upload" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <Card className="border-dashed border-2">
              <CardContent className="p-12">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Lock className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-3">
                  Sign In to Analyze Your Resume
                </h2>
                <p className="text-slate-600 mb-6">
                  Create an account or sign in to upload your resume and get
                  personalized AI feedback.
                </p>
                <Button onClick={login} size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Sign In with Google
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} id="upload" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-800 mb-3">
              Upload Your Resume
            </h2>
            <p className="text-slate-600">
              Our AI will analyze your resume and provide detailed feedback in seconds.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" />
                Select Your Resume
              </CardTitle>
              <CardDescription>
                Supported format: PDF (max 10MB)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload />
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
