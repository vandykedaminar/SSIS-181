"use client";
import { useState, useEffect } from "react";
import "./table.css";
import InsertForm from "./InsertForm";
import InfoCard from "./InfoCard";

export default function Table({
  table_name = "Table",
  headers = ["header1", "header2"],
  table_data = [],
  deleteEndpoint = null, // This prop is no longer used, logic moved to parent pages
  onDelete = null,
  onRefresh = null,
  onUpdate = null, // Add onUpdate prop
}) {
  const [visibleInfoCard, setVisibleInfoCard] = useState(false);
  const [rowValue, setRowValue] = useState([]);
  const [data, setData] = useState(Array.isArray(table_data) ? table_data : []);

  useEffect(() => {
    setData(Array.isArray(table_data) ? table_data : []);
  }, [table_data]);

  // The handleDelete logic is now fully managed by the parent page (e.g., students/page.js)
  // This simplifies the Table component.
  const handleDelete = async (values) => {
    if (typeof onDelete === "function") {
      await onDelete(values);
      setVisibleInfoCard(false);
    } else {
      console.warn("No onDelete provided to Table.");
    }
  };

  // The handleUpdate logic is also fully managed by the parent page
  const handleUpdate = async (originalValues, newValues) => {
     if (typeof onUpdate === "function") {
      await onUpdate(originalValues, newValues);
      // Let the parent handle closing the card if needed, or we can do it here
      setVisibleInfoCard(false);
    } else {
      console.warn("No onUpdate provided to Table.");
    }
  };

  return (
    <>
      <InfoCard
        visibility={[visibleInfoCard, setVisibleInfoCard]}
        values={rowValue}
        headers={headers}
        onDelete={handleDelete}
        onUpdate={handleUpdate} // Pass the handler to InfoCard
      />

      <div className="table-header">
        <label>{table_name}</label>
      </div>

      <div className="my-table">
        <table>
          <thead>
            <tr>{headers.map((h, i) => (<th key={i}>{h}</th>))}</tr>
          </thead>
          <tbody>
            {data.map((row, rowIdx) => (
              <tr key={rowIdx} className="h-10 college" onClick={() => { setVisibleInfoCard(true); setRowValue(row); }}>
                {headers.map((_, cIdx) => (<td key={cIdx}>{(row && row[cIdx] !== undefined) ? row[cIdx] : ""}</td>))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}