"use client";
import './InsertForm.css'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { useState } from 'react';

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

    // Inline style object for dark inputs
    const inputStyle = {
        backgroundColor: 'rgba(0, 0, 0, 0.3)', 
        color: 'white', 
        borderColor: 'rgba(255, 255, 255, 0.1)',
        width: '100%'
    };

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

            <div className='p-6 space-y-5'>
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

                <div className="pt-4 flex justify-end">
                    <Button 
                        onClick={submitButton} 
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 shadow-md transition-all"
                    >
                        Done
                    </Button>
                </div>
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
                accept="image/*"
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
                        // FIXED: Forced dimensions to prevent it from being too big
                        style={{ 
                            width: '500px', 
                            height: '300px', 
                            objectFit: 'cover' 
                        }}
                        className="rounded-full border-2 border-emerald-500 shadow-sm"
                    />
                </div>
            )}
        </div>
    );
}