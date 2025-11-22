"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import HeaderButton from "../HeaderButton";
import InfoCardData from "./InfoCardData";
import "./InfoCard.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "../../components/ui/dialog";

export default function InfoCard({
  visibility = [false, () => {}],
  values = [],
  headers = [],
  onDelete = null,
  onUpdate = null, // New prop for handling updates
  updateEndpoint = null, // optional endpoint string for PUT updates
  onRefresh = null, // optional callback to refresh parent data after update
}) {
  const [visible, setVisible] = visibility;
  const [isEditing, setIsEditing] = useState(false);
  const [editedValues, setEditedValues] = useState([...values]);

  // Effect to reset state when a new row is clicked or the card is closed
  useEffect(() => {
    if (visible) {
      setEditedValues([...values]); // Reset edited values to original when card opens
    } else {
      setIsEditing(false); // Exit edit mode when card closes
    }
  }, [visible, values]);


  const handleValueChange = (index, newValue) => {
    const newValues = [...editedValues];
    newValues[index] = newValue;
    setEditedValues(newValues);
  };

  const handleCancel = () => {
    setEditedValues([...values]); // Revert changes
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (typeof onUpdate === "function") {
      await onUpdate(values, editedValues); // Pass original and new values
      setIsEditing(false); // Exit edit mode on successful save
    } else if (typeof updateEndpoint === "string" && updateEndpoint.length > 0) {
      // Build payload from headers -> values mapping (best-effort)
      const payload = {};
      for (let i = 0; i < headers.length; i++) {
        const key = headers[i] || `col_${i}`;
        payload[key] = editedValues[i];
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
        // keep editing mode so user can retry
      }
    } else {
      console.warn("No onUpdate function provided to InfoCard.");
    }
  };

  const doDelete = async () => {
    const idLabel = values && values[0] ? values[0] : "this item";
    // The browser confirm dialog is now in the parent page for better control
    if (typeof onDelete === "function") {
      await onDelete(values);
    } else {
      console.warn("No onDelete provided to InfoCard.");
    }
  };

  return (
    <Dialog open={visible} onOpenChange={(open) => setVisible(open)}>
      <DialogContent>
        <div className="header-pop-up">
          <HeaderButton onClick={() => setVisible(false)} style={{ borderTopRightRadius: "10px", width: "45px" }}>
            <Image src="/close.svg" alt="Close" width={28} height={28} className="invert" />
          </HeaderButton>

          {!isEditing ? (
            // Buttons for VIEW mode
            <>
              <HeaderButton onClick={doDelete} style={{ width: "45px" }}>
                <Image src={"/trash.svg"} alt="Trash" width={28} height={28} className="invert" />
              </HeaderButton>
              <HeaderButton onClick={() => setIsEditing(true)} style={{ width: "45px" }}>
                <Image src={"/edit.svg"} alt="Edit" width={28} height={28} className="invert" />
              </HeaderButton>
            </>
          ) : (
            // Buttons for EDIT mode
            <>
              <HeaderButton onClick={handleCancel} style={{ width: "45px" }}>
                <Image src={"/cancel.svg"} alt="Cancel" width={28} height={28} className="invert" />
              </HeaderButton>
              <HeaderButton onClick={handleSave} style={{ width: "45px" }}>
                <Image src={"/save.svg"} alt="Save" width={28} height={28} className="invert" />
              </HeaderButton>
            </>
          )}
        </div>

        {editedValues.length > 0 ? (
          editedValues.map((val, i) => (
            <InfoCardData
              key={i}
              text={`${headers[i]}: `}
              value={val}
              isEditable={isEditing}
              onChange={(e) => handleValueChange(i, e.target.value)}
            />
          ))
        ) : (
          <div className="info-empty">No data</div>
        )}
      </DialogContent>
    </Dialog>
  );
}