"use client";
import { useEffect, useState } from "react";
import Table from "../page";
import InsertForm from "../InsertForm";

const API_BASE = "http://192.168.1.9:5000";

export default function Programs() {
  const [program_code, set_program_code] = useState("");
  const [program_name, set_program_name] = useState("");
  const [program_college, set_program_college] = useState("");
  const [table_data, set_table_data] = useState([]);

  const updateTableData = async () => {
    const res = await fetch(`${API_BASE}/get/programs`);
    const result = await res.json();
    set_table_data(result);
  };

  const submitForm = async () => {
    const parts = [program_code, program_name, program_college].map(encodeURIComponent);
    const res = await fetch(`${API_BASE}/insert/program/${parts.join("/")}`);
    if (res.ok) { await updateTableData(); clearFields(); } else console.error(await res.text());
  };

  const clearFields = () => { set_program_code(""); set_program_name(""); set_program_college(""); };

  useEffect(() => { updateTableData(); }, []);

  const handleDelete = async (values) => {
    const code = values && values[0];
    if (!code) return;
    if (!confirm(`Delete program ${code}? This will update associated students.`)) return;
    const res = await fetch(`${API_BASE}/delete/program/${encodeURIComponent(code)}`, { method: "DELETE" });
    if (res.ok) await updateTableData(); else console.error(await res.text());
  };

  const handleUpdate = async (originalValues, newValues) => {
    const originalCode = originalValues[0];
    const updatePayload = {
        code: newValues[0],
        name: newValues[1],
        college: newValues[2],
    };

    const res = await fetch(`${API_BASE}/update/program/${encodeURIComponent(originalCode)}`, {
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
      <InsertForm fields={[["Code: ", program_code, set_program_code], ["Name: ", program_name, set_program_name], ["College: ", program_college, set_program_college]]} functions={[updateTableData, submitForm, clearFields]} />
      <Table table_name={"Program Table"} headers={["Code", "Name", "College"]} table_data={table_data} onDelete={handleDelete} onUpdate={handleUpdate} />
    </>
  );
}