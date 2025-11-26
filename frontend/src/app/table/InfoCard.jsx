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
}) {
  const [visible, setVisible] = visibility;
  const [isEditing, setIsEditing] = useState(false);
  const [editedValues, setEditedValues] = useState([...values]);
  
  const [newPhotoFile, setNewPhotoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (visible) {
      setEditedValues([...values]); 
      setNewPhotoFile(null); 
      setPreviewUrl(null);   
    } else {
      setIsEditing(false); 
    }
  }, [visible, values]);


  const handleValueChange = (index, newValue) => {
    const newValues = [...editedValues];
    newValues[index] = newValue;
    setEditedValues(newValues);
  };

  const handleCancel = () => {
    setEditedValues([...values]); 
    setNewPhotoFile(null);
    setPreviewUrl(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    let finalValues = [...editedValues];

    if (newPhotoFile) {
        try {
            const fileName = `${Date.now()}_${newPhotoFile.name.replace(/\s/g, '')}`;
            
            const { error: uploadError } = await supabase.storage
                .from('student-photos')
                .upload(fileName, newPhotoFile);

            if (uploadError) throw uploadError;

            const { data: publicData } = supabase.storage
                .from('student-photos')
                .getPublicUrl(fileName);

            const newPhotoUrl = publicData.publicUrl;

            // Since "Photo" might not be in headers anymore, we assume it's the last index 
            // OR we check where the URL string is. In your case, it's always index 6.
            const photoIndex = 6; 
            if (photoIndex < finalValues.length) {
                finalValues[photoIndex] = newPhotoUrl;
            }
        } catch (err) {
            console.error("Image upload failed:", err);
            alert("Failed to upload new image. Try again.");
            return; 
        }
    }

    if (typeof onUpdate === "function") {
      await onUpdate(values, finalValues); 
      setIsEditing(false); 
    } else if (typeof updateEndpoint === "string" && updateEndpoint.length > 0) {
      const payload = {};
      for (let i = 0; i < headers.length; i++) {
        const key = headers[i] || `col_${i}`;
        payload[key] = finalValues[i];
      }

      try {
        const res = await fetch(updateEndpoint, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error(`Update failed: ${res.status}`);
        setIsEditing(false);
        if (typeof onRefresh === "function") onRefresh();
      } catch (err) {
        console.error("InfoCard update error:", err);
      }
    } else {
      console.warn("No onUpdate function provided to InfoCard.");
    }
  };

  const doDelete = async () => {
    if (typeof onDelete === "function") {
      await onDelete(values);
    } else {
      console.warn("No onDelete provided to InfoCard.");
    }
  };

  const onFileSelect = (e) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setNewPhotoFile(file);
          setPreviewUrl(URL.createObjectURL(file)); 
      }
  };

  const darkButtonStyle = { 
    width: "45px", 
    backgroundColor: "rgba(0,0,0,0.4)", 
    border: "1px solid rgba(255,255,255,0.1)", 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center"
  };

  // Logic to find the photo URL (Index 6)
  const currentPhotoUrl = editedValues[6];
  const displayImage = previewUrl || (currentPhotoUrl && currentPhotoUrl.startsWith('http') ? currentPhotoUrl : DEFAULT_IMAGE);

  return (
    <Dialog open={visible} onOpenChange={(open) => setVisible(open)}>
      <DialogContent className="max-w-[500px] w-[90%] p-0 overflow-hidden border border-white/10 bg-[#0f2a2f] shadow-2xl">
        <DialogTitle className="sr-only">Row Details</DialogTitle>

        <div className="header-pop-up bg-gradient-to-r from-[#0b5560] to-[#083f45] px-4 py-2 border-b border-white/10">
          <HeaderButton 
            onClick={() => setVisible(false)} 
            style={{ ...darkButtonStyle, borderTopRightRadius: "10px" }}
          >
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
          
          <div className="flex flex-col items-center mb-6 gap-3">
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-emerald-600 shadow-lg bg-black/50">
                  <img 
                      src={displayImage} 
                      alt="Student" 
                      className="w-full h-full object-cover"
                  />
              </div>
              
              {isEditing && (
                  <label className="cursor-pointer bg-emerald-700 hover:bg-emerald-600 text-white text-xs py-1 px-3 rounded shadow transition-colors">
                      Change Photo
                      <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={onFileSelect}
                      />
                  </label>
              )}
          </div>

          {editedValues.length > 0 ? (
            editedValues.map((val, i) => {
                // FIXED: If we ran out of headers (because we removed "Photo" from headers), skip rendering
                if (!headers[i]) return null;

                return (
                  <InfoCardData
                    key={i}
                    text={`${headers[i]}: `}
                    value={val}
                    isEditable={isEditing}
                    onChange={(e) => handleValueChange(i, e.target.value)}
                  />
                )
            })
          ) : (
            <div className="info-empty text-center text-gray-400 py-8">No data</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}