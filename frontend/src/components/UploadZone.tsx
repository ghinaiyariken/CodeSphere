import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';

interface UploadZoneProps {
    onFileSelect: (file: File) => void;
}

export const UploadZone = ({ onFileSelect }: UploadZoneProps) => {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setIsDragging(true);
        } else if (e.type === "dragleave") {
            setIsDragging(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file: File) => {
        const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (validTypes.includes(file.type)) {
            setFile(file);
            onFileSelect(file);
        } else {
            alert("Please upload a PDF or DOCX file.");
        }
    };

    return (
        <div className="w-full">
            <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-300">
                    Upload Resume
                </label>
                {file && (
                    <span className="text-xs text-green-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Uploaded
                    </span>
                )}
            </div>

            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={clsx(
                    "relative group cursor-pointer flex flex-col items-center justify-center w-full h-48 rounded-xl border-2 border-dashed transition-all duration-300",
                    isDragging
                        ? "border-primary bg-primary/10 scale-[1.01]"
                        : "border-slate-700 hover:border-slate-500 hover:bg-white/5",
                    file ? "border-green-500/50 bg-green-500/5" : "bg-black/20"
                )}
            >
                <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleChange}
                    accept=".pdf,.docx"
                />

                <div className="flex flex-col items-center text-center p-4">
                    <div className={clsx(
                        "p-3 rounded-full mb-3 transition-colors",
                        file ? "bg-green-500/20 text-green-400" : "bg-primary/10 text-primary group-hover:bg-primary/20"
                    )}>
                        {file ? <FileText className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
                    </div>

                    {file ? (
                        <div>
                            <p className="text-sm font-medium text-white">{file.name}</p>
                            <p className="text-xs text-slate-400 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                    ) : (
                        <div>
                            <p className="text-sm font-medium text-slate-200">
                                <span className="text-primary">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-slate-500 mt-2">
                                PDF or DOCX (Max 5MB)
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
