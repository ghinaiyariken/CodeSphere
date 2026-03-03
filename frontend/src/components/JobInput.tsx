import { useRef } from 'react';
import { Upload, FileText, Trash2 } from 'lucide-react';

interface JobInputProps {
    textValue: string;
    onTextChange: (value: string) => void;
    fileValue: File | null;
    onFileChange: (file: File | null) => void;
}

export const JobInput = ({ textValue, onTextChange, fileValue, onFileChange }: JobInputProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onFileChange(e.target.files[0]);
        }
    };

    return (
        <div className="w-full h-full flex flex-col space-y-4">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-300">
                    Job Description
                </label>
                <span className="text-xs text-slate-500 italic">Paste text OR upload file</span>
            </div>

            {/* File Upload Area */}
            <div
                className={`relative border-2 border-dashed rounded-xl transition-all p-4 ${fileValue
                        ? 'border-primary/50 bg-primary/5'
                        : 'border-slate-700 hover:border-slate-500 bg-black/20'
                    }`}
            >
                {fileValue ? (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/20 rounded-lg">
                                <FileText className="w-5 h-5 text-primary" />
                            </div>
                            <div className="text-left">
                                <div className="text-sm font-medium text-white max-w-[150px] truncate">
                                    {fileValue.name}
                                </div>
                                <div className="text-xs text-slate-500">
                                    {(fileValue.size / 1024).toFixed(1)} KB
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => onFileChange(null)}
                            className="p-2 hover:bg-white/5 rounded-full text-slate-500 hover:text-red-400 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-white py-2"
                    >
                        <Upload className="w-4 h-4" />
                        Upload JD (PDF/TXT)
                    </button>
                )}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,.txt,.doc,.docx"
                    className="hidden"
                />
            </div>

            <div className="flex items-center gap-2">
                <div className="h-px bg-slate-800 flex-1" />
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">or</span>
                <div className="h-px bg-slate-800 flex-1" />
            </div>

            {/* Text Area */}
            <div className="relative flex-1">
                <textarea
                    value={textValue}
                    onChange={(e) => onTextChange(e.target.value)}
                    disabled={!!fileValue}
                    placeholder={fileValue ? "File uploaded! Remove file to type manually." : "Paste the full job description here..."}
                    className={`w-full h-full min-h-[120px] p-4 bg-black/20 border rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent resize-none transition-all scrollbar-thin scrollbar-thumb-slate-700 ${fileValue ? 'border-transparent opacity-50 cursor-not-allowed' : 'border-slate-700'
                        }`}
                />
            </div>
        </div>
    );
};
