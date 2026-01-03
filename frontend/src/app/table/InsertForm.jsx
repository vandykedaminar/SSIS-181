"use client";
import './InsertForm.css'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

export default function InsertForm({ 
    insert_form_name="Insert Form", 
    fields=[], 
    functions=[],
    onSuccess 
}) {
    const submitButton = async () => {
        await functions[1]();
        await new Promise(resolve => setTimeout(resolve, 100));
        functions[0]();
        functions[2]();
        if (onSuccess) onSuccess();
    }

    return (
        <div className="w-full bg-[#0f2a2f] border border-white/10 shadow-2xl rounded-lg overflow-hidden relative">
            
            <div className="p-4 pr-14 bg-gradient-to-r from-[#0b5560] to-[#083f45] border-b border-white/10 flex items-center justify-between">
                <label 
                    className="text-lg font-bold tracking-wide font-sans truncate"
                    style={{ color: 'white' }} 
                >
                    {insert_form_name}
                </label>
            </div>

            <div className='p-6 space-y-5 max-h-96 overflow-y-auto'>
                {fields.map((f, i) => (
                    <div key={i} className="w-full">
                        <label 
                            className="block text-xs font-bold uppercase mb-1.5 ml-1"
                            style={{ color: 'white' }} 
                        >
                            {f[0].replace(':', '')}
                        </label>
                        
                        {f[3] === 'file' ? (
                            <FileField fieldData={f} />
                        ) : f[3] === 'select' ? (
                            <Select value={f[1]} onValueChange={f[2]}>
                                <SelectTrigger className="w-full" style={{ color: 'white', backgroundColor: 'rgba(0,0,0,0.3)', borderColor: 'rgba(255,255,255,0.2)' }}>
                                    <SelectValue placeholder="Select an option" />
                                </SelectTrigger>
                                <SelectContent>
                                    {f[4] && f[4].map((option, idx) => (
                                        <SelectItem key={idx} value={option.value || option}>
                                            {option.label || option}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <Input 
                                value={f[1]} 
                                onChange={(e) => f[2](e.target.value)} 
                                style={{ color: 'white', backgroundColor: 'rgba(0,0,0,0.3)', borderColor: 'rgba(255,255,255,0.2)' }}
                                className="focus:ring-emerald-500 rounded-md py-2.5 placeholder:text-gray-400"
                            />
                        )}
                    </div>
                ))}
            </div>

            <div className="p-6 pt-4 border-t border-white/10 flex justify-end bg-[#0f2a2f]">
                <Button 
                    onClick={submitButton} 
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 shadow-md transition-all"
                >
                    Done
                </Button>
            </div>
        </div>
    )
}

// Sub-component to handle file preview state locally
function FileField({ fieldData }) {
    const [preview, setPreview] = useState(null);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // VALIDATION: Check Type (PNG/JPEG)
            if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
                alert("Only PNG or JPEG images are allowed.");
                e.target.value = null; // Clear input
                return;
            }

            // VALIDATION: Check Size (Max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert("Image size must be less than 5MB.");
                e.target.value = null; // Clear input
                return;
            }

            // 1. Update parent state
            fieldData[2](file);
            // 2. Update local preview
            setPreview(URL.createObjectURL(file));
        }
    };

    return (
        <div className="flex flex-col gap-3">
            <input 
                type="file"
                accept="image/png, image/jpeg"
                onChange={handleFileChange} 
                style={{ color: 'white', backgroundColor: 'rgba(0,0,0,0.3)' }}
                className="block w-full text-sm
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-emerald-600 file:text-white
                    hover:file:bg-emerald-500
                    cursor-pointer
                    rounded-lg border border-white/10"
            />
            
            {/* PREVIEW AREA */}
            {preview && (
                <div className="flex justify-center mt-2 p-2 bg-black/20 rounded border border-white/5">
                    <img 
                        src={preview} 
                        alt="Preview" 
                        style={{ 
                            width: '200px', // Reduced preview size to be more manageable
                            height: '200px', 
                            objectFit: 'cover' 
                        }}
                        className="rounded-full border-2 border-emerald-500 shadow-sm"
                    />
                </div>
            )}
        </div>
    );
}