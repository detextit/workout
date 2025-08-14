'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface UploadResult {
  success: boolean;
  message: string;
  data?: {
    user: any;
    workouts: any[];
    instructions: any[];
  };
  error?: string;
  details?: string;
}

export default function AdminPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null); // Clear previous results
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('excel-file', file);

      const response = await fetch('/api/admin/upload-excel', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setResult(data);

      // Clear file selection if successful
      if (data.success) {
        setFile(null);
        const fileInput = document.getElementById('excel-file') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Failed to upload file',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Workout App Admin</h1>
        <p className="text-gray-600">
          Upload Excel files to import workout data into the database
        </p>
      </div>

      {/* Upload Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Excel File Upload
          </CardTitle>
          <CardDescription>
            Upload an Excel file (.xls or .xlsx) containing workout data. 
            The file should include sheets for different workout types (e.g., "Legs & Shoulder", "Chest & Triceps", "Back & Biceps").
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                id="excel-file"
                type="file"
                accept=".xls,.xlsx"
                onChange={handleFileSelect}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <Button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="min-w-[120px]"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
          </div>

          {file && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                Selected file: <span className="font-medium">{file.name}</span> 
                ({(file.size / 1024).toFixed(1)} KB)
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <Card className={`mb-8 ${result.success ? 'border-green-200' : 'border-red-200'}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              Upload Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`p-4 rounded-lg ${
              result.success 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <p className={`font-medium ${
                result.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {result.message}
              </p>
              
              {result.error && (
                <p className="text-red-700 mt-2">{result.error}</p>
              )}
              
              {result.details && (
                <p className="text-red-600 text-sm mt-2">{result.details}</p>
              )}
            </div>

            {/* Success Details */}
            {result.success && result.data && (
              <div className="mt-6 space-y-4">
                {/* User Information */}
                {result.data.user && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">User Created/Updated:</h4>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Name:</span> {result.data.user.name}
                      {result.data.user.age && (
                        <span className="ml-4"><span className="font-medium">Age:</span> {result.data.user.age}</span>
                      )}
                      {result.data.user.weight && (
                        <span className="ml-4"><span className="font-medium">Weight:</span> {result.data.user.weight}</span>
                      )}
                      {result.data.user.height && (
                        <span className="ml-4"><span className="font-medium">Height:</span> {result.data.user.height}</span>
                      )}
                    </p>
                  </div>
                )}

                {/* Workouts */}
                {result.data.workouts.length > 0 && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Workouts Processed:</h4>
                    <div className="space-y-2">
                      {result.data.workouts.map((workout, index) => (
                        <p key={index} className="text-sm text-gray-700">
                          <span className="font-medium">{workout.workoutType}:</span> {workout.exerciseCount} exercises
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Instructions */}
                {result.data.instructions.length > 0 && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Instructions Updated:</h4>
                    <div className="space-y-1">
                      {result.data.instructions.map((instruction, index) => (
                        <p key={index} className="text-sm text-gray-700">
                          {instruction.title || instruction.type}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Excel Format Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-gray-700 space-y-2">
            <p><span className="font-medium">Required Sheets:</span></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Workout sheets: "Legs & Shoulder", "Chest & Triceps", "Back & Biceps"</li>
              <li>Optional: "Disclaimer", "Additional instructions"</li>
            </ul>
            
            <p><span className="font-medium">Workout Sheet Format:</span></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>User info in first few rows: "Name - John Doe", "Age - 25", etc.</li>
              <li>Exercise table with columns: Exercise name, Number of repetitions, Number of sets, Total reps, Reference (YouTube URL)</li>
              <li>Warmup exercises marked with "Warm up" section</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}