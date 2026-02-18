import React, { useState } from 'react';
import { Upload, FileCheck, Loader2 } from 'lucide-react';

interface Props {
  applicationId: string;
  onUploadSuccess: (url: string) => void;
}

export default function ResumeUpload({ applicationId, onUploadSuccess }: Props) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const response = await fetch(`/api/applications/${applicationId}/upload-resume`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        onUploadSuccess(data.url);
        alert("Resume uploaded!");
      }
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-4">
      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          {uploading ? (
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          ) : (
            <>
              <Upload className="w-8 h-8 text-gray-500 mb-2" />
              <p className="text-sm text-gray-500">Click to upload Resume (PDF/Docx)</p>
            </>
          )}
        </div>
        <input 
          type="file" 
          className="hidden" 
          accept=".pdf,.docx" 
          onChange={handleFileChange} 
          disabled={uploading}
        />
      </label>
    </div>
  );
}