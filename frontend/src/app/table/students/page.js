"use client";
import { useEffect, useState } from "react";
import Table from "../page";
import InsertForm from "../InsertForm";

const API_BASE = "http://192.168.1.9:5000"; // adjust to your backend

export default function Students() {
  const [student_id, set_student_id] = useState("");
  const [first_name, set_first_name] = useState("");
  const [last_name, set_last_name] = useState("");
  const [course, set_course] = useState("");
  const [year, set_year] = useState("");
  const [gender, set_gender] = useState("");
  const [table_data, set_table_data] = useState([]);

  const updateTableData = async () => {
    const res = await fetch(`${API_BASE}/get/students`);
    const result = await res.json();
    set_table_data(result);
  };

  const submitForm = async () => {
    if (!/^\d{4}-\d{4}$/.test(student_id)) { alert("Invalid ID format. Must be YYYY-NNNN."); return; }
    const parts = [student_id, first_name, last_name, course, year, gender].map(encodeURIComponent);
    const res = await fetch(`${API_BASE}/insert/student/${parts.join("/")}`);
    if (res.ok) { await updateTableData(); clearFields(); } else { console.error(await res.text()); }
  };

  const clearFields = () => {
    set_student_id(""); set_first_name(""); set_last_name(""); set_course(""); set_year(""); set_gender("");
  };

  useEffect(() => { updateTableData(); }, []);

  const handleDelete = async (values) => {
    const id = values && values[0];
    if (!id) return;
    if (!confirm(`Delete student ${id}?`)) return;
    const res = await fetch(`${API_BASE}/delete/student/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (res.ok) await updateTableData(); else console.error(await res.text());
  };

  const handleUpdate = async (originalValues, newValues) => {
    const originalId = originalValues[0];
    if (!/^\d{4}-\d{4}$/.test(newValues[0])) { alert("Invalid ID format. Must be YYYY-NNNN."); return; }
    const updatePayload = {
        id: newValues[0],
        first_name: newValues[1],
        last_name: newValues[2],
        course: newValues[3],
        year: newValues[4],
        gender: newValues[5],
    };

    const res = await fetch(`${API_BASE}/update/student/${encodeURIComponent(originalId)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload),
    });

    if (res.ok) {
        await updateTableData();
    } else {
        const err_txt = await res.text();
        console.error("Update failed:", err_txt);
        alert(`Update failed: ${err_txt}`);
    }
  };

  return (
    <>
      <InsertForm
        fields={[
          ["ID: ", student_id, set_student_id],
          ["First Name: ", first_name, set_first_name],
          ["Last Name: ", last_name, set_last_name],
          ["Course: ", course, set_course],
          ["Year: ", year, set_year],
          ["Gender: ", gender, set_gender],
        ]}
        functions={[updateTableData, submitForm, clearFields]}
      />

      <Table 
        table_name={"Student Table"} 
        headers={["ID", "First Name", "Last Name", "Course", "Year", "Gender"]} 
        table_data={table_data} 
        onDelete={handleDelete} 
        onUpdate={handleUpdate}
      />
    </>
  );
}