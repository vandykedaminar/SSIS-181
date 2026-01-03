"use client";
import { useEffect, useState } from "react";
import Table from "../page";
import InsertDialog from "../InsertDialog"; 
import { useToast } from '../../../components/ToastContext';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"; 

export default function Programs() {
  const [program_code, set_program_code] = useState("");
  const [program_name, set_program_name] = useState("");
  const [program_college, set_program_college] = useState("");

  const [table_data, set_table_data] = useState([]);
  const [colleges, set_colleges] = useState([]);

  const updateTableData = async () => {
    try {
      const res = await fetch(`${API_BASE}/get/programs`);
      if (!res.ok) throw new Error("Failed to fetch programs");
      const result = await res.json();
      set_table_data(result);
    } catch (error) {
      console.error(error);
    }
  };

  const updateColleges = async () => {
    try {
      const res = await fetch(`${API_BASE}/get/colleges`);
      if (!res.ok) throw new Error("Failed to fetch colleges");
      const result = await res.json();
      set_colleges(result);
    } catch (error) {
      console.error(error);
    }
  };

  const { showToast } = useToast();

  const submitForm = async () => {
    const parts = [program_code, program_name, program_college].map(encodeURIComponent);
    const res = await fetch(`${API_BASE}/insert/program/${parts.join("/")}`);
    if (res.ok) {
      showToast('Program inserted', { type: 'success' });
    } else {
      let errTxt = "";
      try {
        const j = await res.json();
        errTxt = j && j.error ? j.error : JSON.stringify(j);
      } catch (e) {
        errTxt = await res.text();
      }
      showToast(`Error inserting program: ${errTxt}`, { type: 'error' });
      console.error(errTxt);
    }
  };

  const clearFields = () => {
    set_program_code("");
    set_program_name("");
    set_program_college("");
  };

  useEffect(() => {
    updateTableData();
    updateColleges();
  }, []);

  const collegeOptions = colleges.map(college => ({
    value: college[0],
    label: `${college[0]} - ${college[1]}`
  }));

  const handleDelete = async (values) => {
    const code = values && values[0];
    if (!code) return;
    if (!confirm(`Delete program ${code}?`)) return;
    const res = await fetch(`${API_BASE}/delete/program/${encodeURIComponent(code)}`, { method: "DELETE" });
    if (res.ok) await updateTableData();
    else console.error(await res.text());
  };

  const handleUpdate = async (originalValues, editedValues) => {
    const originalCode = originalValues && originalValues[0];
    if (!originalCode) return;

    const payload = {
      code: editedValues[0],
      name: editedValues[1],
      college: editedValues[2],
    };

    try {
      const res = await fetch(`${API_BASE}/update/program/${encodeURIComponent(originalCode)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Update failed: ${res.status} ${body}`);
      }
        await updateTableData();
        showToast('Program updated', { type: 'success' });
    } catch (err) {
      console.error("Program update error:", err);
        showToast(`Update failed: ${err.message}`, { type: 'error' });
        await updateTableData();
    }
  };

  return (
    <>
      <div className="flex justify-end mb-4 px-4">
        <InsertDialog
          label="Add Program"
          formName="New Program"
          fields={[
            ["Code: ", program_code, set_program_code],
            ["Name: ", program_name, set_program_name],
            // This was already correct for the Insert Form:
            ["College: ", program_college, set_program_college, "select", collegeOptions],
          ]}
          functions={[updateTableData, submitForm, clearFields]}
        />
      </div>

      <Table
        table_name={"Program Table"}
        headers={["Code", "Name", "College"]}
        table_data={table_data}
        onDelete={handleDelete}
        onUpdate={handleUpdate}
        filterOptions={collegeOptions}
        filterColumn={2}
        editDropdowns={{ 2: 'college' }} 
        colleges={colleges} 
      />
    </>
  );
}