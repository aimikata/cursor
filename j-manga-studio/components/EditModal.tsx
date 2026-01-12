
import React, { useState } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { editPageImage } from '../services/geminiService';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalImage: string;
  onImageUpdate: (newImage: string) => void;
  apiKey: string;
  onSuccess?: () => void;
}

export default function EditModal({ isOpen, onClose, originalImage, onImageUpdate, apiKey, onSuccess }: EditModalProps) {
  let [prompt, setPrompt] = useState('');
  let [isProcessing, setIsProcessing] = useState(false);
  let [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleEdit() {
    if (!prompt.trim()) return;
    setIsProcessing(true);
    setError(null);
    
    try {
      let newImage = await editPageImage(originalImage, prompt, apiKey);
      onImageUpdate(newImage);
      if (onSuccess) onSuccess();
      setPrompt(''); // Reset prompt after success
      onClose();
    } catch (e: any) {
      setError(e.message || "Editing failed");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-white font-semibold flex items-center gap-2 text-lg">
            <Sparkles className="text-yellow-400" size={20} />
            Edit with Nano Banana
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 flex flex-col md:flex-row gap-6">
            <div className="flex-1 bg-slate-950 rounded-lg overflow-hidden border border-slate-800 relative group max-h-[50vh] md:max-h-auto">
                <img 
                    src={originalImage} 
                    alt="Original" 
                    className="w-full h-full object-contain"
                />
            </div>
            
            <div className="flex-1 flex flex-col space-y-4">
                <div>
                    <label className="block text-base font-medium text-slate-300 mb-2">
                        Refinement Prompt
                    </label>
                    <textarea 
                        className="w-full h-32 bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base resize-none"
                        placeholder="e.g. Make it black and white, Add a rain effect, Change the lighting to sunset..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        disabled={isProcessing}
                    />
                </div>
                
                {error && (
                    <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded">
                        {error}
                    </div>
                )}

                <div className="mt-auto pt-4">
                     <button
                        onClick={handleEdit}
                        disabled={isProcessing || !prompt.trim()}
                        className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-all text-base"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Sparkles size={18} />
                                Generate Changes
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
