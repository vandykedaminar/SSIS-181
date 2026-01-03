"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import HeaderButton from "../HeaderButton";
import InfoCardData from "./InfoCardData";
import "./InfoCard.css";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { supabase } from "../../lib/supabaseClient"; 

const DEFAULT_IMAGE = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

export default function InfoCard({
  visibility = [false, () => {}],
  values = [],
  headers = [],
  onDelete = null,
  onUpdate = null,
  updateEndpoint = null, 
  onRefresh = null,
  showImage = false,
  editDropdowns = null,
  colleges = [],
  programs = [],
}) {
  const [visible, setVisible] = visibility;
  const [isEditing, setIsEditing] = useState(false);
  const [editedValues, setEditedValues] = useState([...values]);
  
  const [newPhotoFile, setNewPhotoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (visible) {
      setEditedValues([...values]); 
      if (showImage) {
        setNewPhotoFile(null); 
        setPreviewUrl(null);
      }
    } else {
      setIsEditing(false); 
    }
  }, [visible, values, showImage]);


  const handleValueChange = (index, newValue) => {
    const newValues = [...editedValues];
    newValues[index] = newValue;
    setEditedValues(newValues);
  };

  const handleCancel = () => {
    setEditedValues([...values]); 
    if (showImage) {
      setNewPhotoFile(null);
      setPreviewUrl(null);
    }
    setIsEditing(false);
  };

  const handleSave = async () => {
    let finalValues = [...editedValues];

    if (showImage && newPhotoFile) {
        try {
            const fileName = `${Date.now()}_${newPhotoFile.name.replace(/\s/g, '')}`;
            const { error: uploadError } = await supabase.storage.from('student-photos').upload(fileName, newPhotoFile);
            if (uploadError) throw uploadError;
            const { data: publicData } = supabase.storage.from('student-photos').getPublicUrl(fileName);
            finalValues[7] = publicData.publicUrl; // Assuming Photo is at index 7
        } catch (err) {
            console.error("Image upload failed:", err);
            alert("Failed to upload new image.");
            return; 
        }
    }

    if (typeof onUpdate === "function") {
      await onUpdate(values, finalValues); 
      setIsEditing(false); 
    }
  };

  const doDelete = async () => {
    if (typeof onDelete === "function") await onDelete(values);
  };

  const onFileSelect = (e) => {
    if (!showImage || !e.target.files[0]) return;
    const file = e.target.files[0];
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) return alert("PNG/JPEG only.");
    setNewPhotoFile(file);
    setPreviewUrl(URL.createObjectURL(file)); 
  };

  const darkButtonStyle = { 
    width: "45px", backgroundColor: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", 
    display: "flex", alignItems: "center", justifyContent: "center"
  };

  const displayImage = showImage ? (previewUrl || (editedValues[7]?.startsWith('http') ? editedValues[7] : DEFAULT_IMAGE)) : null;

  return (
    <Dialog open={visible} onOpenChange={(open) => setVisible(open)}>
      <DialogContent className="max-w-[500px] w-[90%] p-0 overflow-hidden border border-white/10 bg-[#0f2a2f] shadow-2xl">
        <DialogTitle className="sr-only">Row Details</DialogTitle>

        <div className="header-pop-up bg-gradient-to-r from-[#0b5560] to-[#083f45] px-4 py-2 border-b border-white/10">
          <HeaderButton onClick={() => setVisible(false)} style={{ ...darkButtonStyle, borderTopRightRadius: "10px" }}>
            <Image src="/close.svg" alt="Close" width={28} height={28} className="invert" />
          </HeaderButton>
          {!isEditing ? (
            <>
              <HeaderButton onClick={doDelete} style={darkButtonStyle}>
                <Image src={"/trash.svg"} alt="Trash" width={28} height={28} className="invert" />
              </HeaderButton>
              <HeaderButton onClick={() => setIsEditing(true)} style={darkButtonStyle}>
                <Image src={"/edit.svg"} alt="Edit" width={28} height={28} className="invert" />
              </HeaderButton>
            </>
          ) : (
            <>
              <HeaderButton onClick={handleCancel} style={darkButtonStyle}>
                <Image src={"/cancel.svg"} alt="Cancel" width={28} height={28} className="invert" />
              </HeaderButton>
              <HeaderButton onClick={handleSave} style={darkButtonStyle}>
                <Image src={"/save.svg"} alt="Save" width={28} height={28} className="invert" />
              </HeaderButton>
            </>
          )}
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {showImage && (
            <div className="flex flex-col items-center mb-6 gap-3">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-emerald-600 shadow-lg bg-black/50">
                    <img src={displayImage} alt="Student" className="w-full h-full object-cover"/>
                </div>
                {isEditing && (
                    <label className="cursor-pointer bg-emerald-700 hover:bg-emerald-600 text-white text-xs py-1 px-3 rounded shadow">
                        Change Photo
                        <input type="file" accept="image/png, image/jpeg" className="hidden" onChange={onFileSelect}/>
                    </label>
                )}
            </div>
          )}

          {editedValues.length > 0 ? (
            editedValues.map((val, i) => {
                if (!headers[i]) return null;

                const isDropdown = editDropdowns && editDropdowns[i];

                // --- COLLEGE DROPDOWN LOGIC ---
                if (isEditing && isDropdown === 'college') {
                  const collegeOptions = colleges.map(c => ({ value: c[0], label: `${c[0]} - ${c[1]}` }));
                  
                 
                  
                  const isStudentTable = headers.includes("Sex") || headers.includes("Program"); 
                  
                  let currentCode = val;
                  if (isStudentTable) {
                    currentCode = colleges.find(c => c[1] === val)?.[0] || "";
                  }

                  return (
                    <div key={i} className='info-card-data w-full'>
                      <label className='block text-sm font-semibold text-gray-400 mb-1.5 pl-1'>{headers[i]}</label>
                      <Select value={currentCode} onValueChange={(newCode) => {
                        const newName = colleges.find(c => c[0] === newCode)?.[1] || "";
                        
                        setEditedValues(prev => {
                          const newVals = [...prev];
                          if (isStudentTable) {
                             // Student Table Logic: Update Name (index 4) and reset Program (index 3)
                             newVals[i] = newName; 
                             // Find index of 'Program' if it exists to reset it
                             const progIndex = headers.indexOf("Program");
                             if (progIndex !== -1) {
                                // Reset program if it doesn't belong to the new college
                                const currentProg = newVals[progIndex];
                                const valid = programs.some(p => p[0] === currentProg && p[2] === newCode);
                                if (!valid) newVals[progIndex] = "";
                             }
                          } else {
                             // Programs Table Logic: Just update the Code (index 2)
                             newVals[i] = newCode; 
                          }
                          return newVals;
                        });
                      }}>
                        <SelectTrigger className="w-full bg-white/5 border-white/10 text-white"><SelectValue placeholder="Select college" /></SelectTrigger>
                        <SelectContent>
                          {collegeOptions.map((o, idx) => <SelectItem key={idx} value={o.value}>{o.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  );

                } else if (isEditing && isDropdown === 'program') {
                  const editingCollegeName = editedValues[headers.indexOf("College")]; // Find college by header name
                  const editingCollegeCode = colleges.find(c => c[1] === editingCollegeName)?.[0];
                  
                  const programOptions = programs
                    .filter(p => !editingCollegeCode || p[2] === editingCollegeCode)
                    .map(p => ({ value: p[0], label: `${p[0]} - ${p[1]}` }));

                  return (
                    <div key={i} className='info-card-data w-full'>
                      <label className='block text-sm font-semibold text-gray-400 mb-1.5 pl-1'>{headers[i]}</label>
                      <Select value={val} onValueChange={(newVal) => handleValueChange(i, newVal)}>
                         <SelectTrigger className="w-full bg-white/5 border-white/10 text-white"><SelectValue placeholder="Select program" /></SelectTrigger>
                        <SelectContent>
                          {programOptions.map((o, idx) => <SelectItem key={idx} value={o.value}>{o.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  );
                
                // --- SEX DROPDOWN LOGIC ---
                } else if (isEditing && isDropdown === 'sex') {
                    return (
                        <div key={i} className='info-card-data w-full'>
                          <label className='block text-sm font-semibold text-gray-400 mb-1.5 pl-1'>{headers[i]}</label>
                          <Select value={val} onValueChange={(newVal) => handleValueChange(i, newVal)}>
                            <SelectTrigger className="w-full bg-white/5 border-white/10 text-white"><SelectValue placeholder="Select Sex" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      );
                } else {
                  return <InfoCardData key={i} text={`${headers[i]}: `} value={val} isEditable={isEditing} onChange={(e) => handleValueChange(i, e.target.value)} />;
                }
            })
          ) : <div className="info-empty text-center text-gray-400 py-8">No data</div>}
        </div>
      </DialogContent>
    </Dialog>
  );
}