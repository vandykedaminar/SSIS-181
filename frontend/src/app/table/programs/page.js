"use client";
import { useEffect, useState } from "react";
import Table from "../page";
import InsertForm from "../InsertForm";

export default function Programs() {
  const [program_code, set_program_code] = useState("");
  const [program_name, set_program_name] = useState("");
  const [program_college, set_program_college] = useState("");

  const [table_data, set_table_data] = useState([]);

  const updateTableData = async () => {
    console.log("Fetching Programs...");
    const res = await fetch("http://192.168.1.9:5000/get/programs");
    const result = await res.json();
    console.log("GET /get/programs ->", result);
    set_table_data(result);
  };

  const submitForm = async () => {
    const parts = [program_code, program_name, program_college].map(encodeURIComponent);
    try {
      const res = await fetch(`http://192.168.1.9:5000/insert/program/${parts.join('/')}`);
      const text = await res.text();
      console.log("INSERT program response:", res.status, text);
      if (res.ok) {
        await updateTableData();
        clearFields();
      } else {
        console.error("Insert failed:", res.status, text);
      }
    } catch (err) {
      console.error("Network error:", err);
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
      />
    </>
  );
}