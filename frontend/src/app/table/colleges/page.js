"use client";
import { useEffect, useState } from "react";
import Table from "../page";
import InsertForm from "../InsertForm";

const API_BASE = "http://localhost:5000";

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
    if (res.ok) { await updateTableData(); clearFields(); } else console.error(await res.text());
  };

  const clearFields = () => { set_college_code(""); set_college_name(""); };

  useEffect(() => { updateTableData(); }, []);

  const handleDelete = async (values) => {
    const code = values && values[0];
    if (!code) return;
    if (!confirm(`Delete college ${code}?`)) return;
    const res = await fetch(`${API_BASE}/delete/college/${encodeURIComponent(code)}`, { method: "DELETE" });
    if (res.ok) await updateTableData(); else console.error(await res.text());
  };

  return (
    <>
      <InsertForm fields={[["Code: ", college_code, set_college_code], ["Name: ", college_name, set_college_name]]} functions={[updateTableData, submitForm, clearFields]} />
      <Table table_name={"College Table"} headers={["Code", "Name"]} table_data={table_data} onDelete={handleDelete} />
    </>
  );
}