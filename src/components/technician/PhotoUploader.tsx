import { useState, useRef } from 'react';
import { Upload, X, Camera } from 'lucide-react';
import Button from '../ui/Button.js';
import toast from 'react-hot-toast';

interface PhotoUploaderProps {
  onUpload: (files: File[]) => Promise<void>;
  uploading: boolean;
  label: string;
}

export default function PhotoUploader({ onUpload, uploading, label }: PhotoUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const addFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const fileArray = Array.from(newFiles);
    const total = files.length + fileArray.length;

    if (total > 10) {
      toast.error('Maximum 10 photos allowed');
      return;
    }

    const updatedFiles = [...files, ...fileArray];
    setFiles(updatedFiles);

    const newPreviews = fileArray.map((f) => URL.createObjectURL(f));
    setPreviews([...previews, ...newPreviews]);
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setFiles(files.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length < 3) {
      toast.error('Minimum 3 photos required');
      return;
    }
    await onUpload(files);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    addFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">{label}</h3>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-accent transition-colors"
      >
        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-500 mb-3">Drag & drop photos here or</p>
        <div className="flex gap-2 justify-center">
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            Browse Files
          </Button>
          <Button variant="accent" size="sm" onClick={() => cameraInputRef.current?.click()}>
            <Camera className="w-4 h-4" />
            Camera
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => addFiles(e.target.files)}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => addFiles(e.target.files)}
          className="hidden"
        />
        <p className="text-xs text-gray-400 mt-2">3-10 photos required</p>
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {previews.map((src, i) => (
            <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
              <img src={src} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
              <button
                onClick={() => removeFile(i)}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{files.length}/10 photos selected</span>
        <Button onClick={handleUpload} loading={uploading} disabled={files.length < 3}>
          Upload Photos
        </Button>
      </div>
    </div>
  );
}
