"use client";
import { useEffect, useState } from "react";
import Table from "../page";
import InsertForm from "../InsertForm";

export default function Students() {
  const [student_id, set_student_id] = useState("");
  const [first_name, set_first_name] = useState("");
  const [last_name, set_last_name] = useState("");
  const [course, set_course] = useState("");
  const [year, set_year] = useState("");
  const [gender, set_gender] = useState("");

  const [table_data, set_table_data] = useState([]);

  const updateTableData = async () => {
    console.log("Fetching Students...");
    const data = await fetch("http://192.168.1.9:5000/get/students");
    const result = await data.json();
    set_table_data(result);
  };

  const submitForm = async () => {
      console.log(
        `Submitting Student [${student_id} | ${first_name} | ${last_name} | ${course} | ${year} | ${gender}]`
      );

      // client-side validation for ID format YYYY-NNNN
      if (!/^\d{4}-\d{4}$/.test(student_id)) {
        console.error("Invalid student ID format. Expected YYYY-NNNN.");
        return;
      }

      try {
        const parts = [student_id, first_name, last_name, course, year, gender].map(encodeURIComponent);
        const res = await fetch(`http://192.168.1.9:5000/insert/student/${parts.join('/')}`);

        if (res.ok) {
          // success -> refresh table and clear form
          await updateTableData();
          clearFields();
          console.log("Student inserted successfully.");
        } else {
          const body = await res.text();
          console.error("Insert failed:", res.status, body);
        }
      } catch (err) {
        console.error("Network error:", err);
      }
    };

  const clearFields = () => {
    set_student_id("");
    set_first_name("");
    set_last_name("");
    set_course("");
    set_year("");
    set_gender("");
  };

  useEffect(() => {
    updateTableData();
  }, []);

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
      />
    </>
  );
}