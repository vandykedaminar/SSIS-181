"use client";
import { useEffect, useState } from "react";
import Table from "../page";
import InsertForm from "../InsertForm";

const API_BASE = "http://192.168.1.9:5000";

export default function Colleges() {
  const [college_code, set_college_code] = useState("");
  const [college_name, set_college_name] = useState("");
  const [table_data, set_table_data] = useState([]);

  const updateTableData = async () => {
    const res = await fetch(`${API_BASE}/get/colleges`);
    const result = await res.json();
    set_table_data(result);
  };

  const submitForm = async () => {
    const parts = [college_code, college_name].map(encodeURIComponent);
    const res = await fetch(`${API_BASE}/insert/college/${parts.join("/")}`);
    if (res.ok) {
      await updateTableData();
      clearFields();
    } else {
      let errTxt = "";
      try {
        const j = await res.json();
        errTxt = j && j.error ? j.error : JSON.stringify(j);
      } catch (e) {
        errTxt = await res.text();
      }
      alert(`Error inserting college: ${errTxt}`);
      console.error(errTxt);
    }
  };

  const clearFields = () => { set_college_code(""); set_college_name(""); };

  useEffect(() => { updateTableData(); }, []);

  const handleDelete = async (values) => {
    const code = values && values[0];
    if (!code) return;
    if (!confirm(`Delete college ${code}? This will update associated programs.`)) return;
    const res = await fetch(`${API_BASE}/delete/college/${encodeURIComponent(code)}`, { method: "DELETE" });
    if (res.ok) await updateTableData(); else console.error(await res.text());
  };

  const handleUpdate = async (originalValues, newValues) => {
    const originalCode = originalValues[0];
    const updatePayload = {
        code: newValues[0],
        name: newValues[1],
    };

    const res = await fetch(`${API_BASE}/update/college/${encodeURIComponent(originalCode)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload),
    });

    if (res.ok) {
        await updateTableData();
    } else {
        const err_txt = await res.text();
        console.error("Update failed:", err_txt);
        alert(`Update failed: ${err_txt}`); // Show error to user
    }
  };

  return (
    <>
      <InsertForm fields={[["Code: ", college_code, set_college_code], ["Name: ", college_name, set_college_name]]} functions={[updateTableData, submitForm, clearFields]} />
      <Table table_name={"College Table"} headers={["Code", "Name"]} table_data={table_data} onDelete={handleDelete} onUpdate={handleUpdate} />
    </>
  );
}