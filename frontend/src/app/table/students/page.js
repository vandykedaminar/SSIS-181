"use client";
import { useEffect, useState } from "react";
import Table from "../page";
import InsertForm from "../InsertForm";
import { useToast } from '../../../components/ToastContext';

const API_BASE = "http://192.168.1.9:5000"; // adjust if needed

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

  const { showToast } = useToast();

  const submitForm = async () => {
    if (!/^\d{4}-\d{4}$/.test(student_id)) { showToast('Invalid ID format. Must be YYYY-NNNN.', { type: 'error' }); return; }
    const parts = [student_id, first_name, last_name, course, year, gender].map(encodeURIComponent);
    const res = await fetch(`${API_BASE}/insert/student/${parts.join("/")}`);
    if (res.ok) {
      await updateTableData();
      clearFields();
      showToast('Student inserted', { type: 'success' });
    } else {
      let errTxt = "";
      try {
        const j = await res.json();
        errTxt = j && j.error ? j.error : JSON.stringify(j);
      } catch (e) {
        errTxt = await res.text();
      }
      showToast(`Error inserting student: ${errTxt}`, { type: 'error' });
      console.error(errTxt);
    }
  };

  const clearFields = () => {
    set_student_id(""); set_first_name(""); set_last_name(""); set_course(""); set_year(""); set_gender("");
  };

  useEffect(() => { updateTableData(); }, []);

  // build unique program list for filter dropdown (program codes stored in course column index 3? adjust if different)
  // Note: adjust filterColumn index below if your table_data structure differs.
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

  // handle update from InfoCard: originalValues, editedValues
  const handleUpdate = async (originalValues, editedValues) => {
    const originalId = originalValues && originalValues[0];
    if (!originalId) return;

    // map editedValues according to headers: [ID, First Name, Last Name, Course, Year, Gender]
    const payload = {
      id: editedValues[0],
      first_name: editedValues[1],
      last_name: editedValues[2],
      course: editedValues[3],
      year: editedValues[4],
      gender: editedValues[5],
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
        // enable filter by program (course) - column index 3
        filterOptions={programOptions}
        filterColumn={3}
      />
    </>
  );
}