"use client";
import { useEffect, useState } from "react";
import Table from "../page";
import InsertDialog from "../InsertDialog";
import { useToast } from '../../../components/ToastContext';
import { supabase } from "../../../lib/supabaseClient"; 

const API_BASE = "http://192.168.1.9:5000"; 

export default function Students() {
  const [student_id, set_student_id] = useState("");
  const [first_name, set_first_name] = useState("");
  const [last_name, set_last_name] = useState("");
  const [course, set_course] = useState("");
  const [year, set_year] = useState("");
  const [gender, set_gender] = useState("");
  const [photoFile, setPhotoFile] = useState(null);

  const [table_data, set_table_data] = useState([]);

  const updateTableData = async () => {
    const res = await fetch(`${API_BASE}/get/students`);
    const result = await res.json();
    set_table_data(result);
  };

  const { showToast } = useToast();

  const submitForm = async () => {
    if (!/^\d{4}-\d{4}$/.test(student_id)) { 
        showToast('Invalid ID format. Must be YYYY-NNNN.', { type: 'error' }); 
        return; 
    }

    let photoUrl = "";

    if (photoFile) {
        const fileName = `${Date.now()}_${photoFile.name.replace(/\s/g, '')}`;
        const { data, error } = await supabase.storage
            .from('student-photos')
            .upload(fileName, photoFile);

        if (error) {
            console.error("Supabase upload error:", error);
            showToast("Failed to upload image", { type: "error" });
            return;
        }

        const { data: publicUrlData } = supabase.storage
            .from('student-photos')
            .getPublicUrl(fileName);
            
        photoUrl = publicUrlData.publicUrl;
    }

    const payload = {
        id: student_id,
        first_name: first_name,
        last_name: last_name,
        course: course,
        year: year,
        gender: gender,
        photo_url: photoUrl
    };

    try {
        const res = await fetch(`${API_BASE}/insert/student`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            showToast('Student inserted', { type: 'success' });
        } else {
            const errJson = await res.json();
            showToast(`Error: ${errJson.error}`, { type: 'error' });
        }
    } catch (err) {
        console.error("Fetch error:", err);
        showToast("Server error", { type: "error" });
    }
  };

  const clearFields = () => {
    set_student_id(""); set_first_name(""); set_last_name(""); 
    set_course(""); set_year(""); set_gender(""); 
    setPhotoFile(null);
  };

  useEffect(() => { updateTableData(); }, []);

  const programOptions = Array.from(
    new Set(
      table_data
        .map((r) => (r && r[3] !== undefined && r[3] !== null ? String(r[3]) : ""))
        .filter((v) => v)
    )
  );

  const handleDelete = async (values) => {
    const id = values && values[0];
    if (!id) return;
    if (!confirm(`Delete student ${id}?`)) return;
    const res = await fetch(`${API_BASE}/delete/student/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (res.ok) await updateTableData(); else console.error(await res.text());
  };

  const handleUpdate = async (originalValues, editedValues) => {
    const originalId = originalValues && originalValues[0];
    if (!originalId) return;

    const payload = {
      id: editedValues[0],
      first_name: editedValues[1],
      last_name: editedValues[2],
      course: editedValues[3],
      year: editedValues[4],
      gender: editedValues[5],
      photo_url: editedValues[6]
    };

    try {
      const res = await fetch(`${API_BASE}/update/student/${encodeURIComponent(originalId)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Update failed: ${res.status} ${body}`);
      }
      await updateTableData();
      showToast('Student updated', { type: 'success' });
    } catch (err) {
      console.error("Student update error:", err);
      showToast(`Update failed: ${err.message}`, { type: 'error' });
      await updateTableData();
    }
  };

  return (
    <>
      <div className="flex justify-end mb-4 px-4">
        <InsertDialog
          label="Add Student"
          formName="New Student"
          fields={[
            ["ID: ", student_id, set_student_id],
            ["First Name: ", first_name, set_first_name],
            ["Last Name: ", last_name, set_last_name],
            ["Course: ", course, set_course],
            ["Year: ", year, set_year],
            ["Gender: ", gender, set_gender],
            ["Photo: ", null, setPhotoFile, "file"],
          ]}
          functions={[updateTableData, submitForm, clearFields]}
        />
      </div>

      <Table
        table_name={"Student Table"}
        // FIXED: Removed "Photo" from headers so it doesn't show in the table.
        // Data still exists at index 6, but the table won't render a column for it.
        headers={["ID", "First Name", "Last Name", "Course", "Year", "Gender"]}
        table_data={table_data}
        onDelete={handleDelete}
        onUpdate={handleUpdate}
        filterOptions={programOptions}
        filterColumn={3}
      />
    </>
  );
}