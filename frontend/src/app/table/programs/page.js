// filepath: [page.js](http://_vscodecontentref_/0)
"use client";
import { useEffect, useState } from "react";
import Table from "../page";
import InsertForm from "../InsertForm";

const API_BASE = "http://192.168.1.9:5000"; // adjust if needed

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
    if (res.ok) {
      await updateTableData();
      clearFields();
    } else {
      console.error(await res.text());
    }
  };

  const clearFields = () => {
    set_program_code("");
    set_program_name("");
    set_program_college("");
  };

  useEffect(() => {
    updateTableData();
  }, []);

  // build unique college list for filter dropdown (skip null/empty)
  const collegeOptions = Array.from(
    new Set(
      table_data
        .map((r) => (r && r[2] !== undefined && r[2] !== null ? String(r[2]) : ""))
        .filter((v) => v)
    )
  );

  const handleDelete = async (values) => {
    const code = values && values[0];
    if (!code) return;
    if (!confirm(`Delete program ${code}?`)) return;
    const res = await fetch(`${API_BASE}/delete/program/${encodeURIComponent(code)}`, { method: "DELETE" });
    if (res.ok) await updateTableData();
    else console.error(await res.text());
  };

  return (
    <>
      <InsertForm
        fields={[
          ["Code: ", program_code, set_program_code],
          ["Name: ", program_name, set_program_name],
          ["College: ", program_college, set_program_college],
        ]}
        functions={[updateTableData, submitForm, clearFields]}
      />

      <Table
        table_name={"Program Table"}
        headers={["Code", "Name", "College"]}
        table_data={table_data}
        onDelete={handleDelete}
        // enable filter by college (college column index is 2)
        filterOptions={collegeOptions}
        filterColumn={2}
      />
    </>
  );
}