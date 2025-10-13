"use client";
import { useState, useEffect } from "react";
import "./table.css";
import InsertForm from "./InsertForm";
import InfoCard from "./InfoCard";

export default function Table({
  table_name = "Table",
  headers = ["header1", "header2"],
  table_data = [],
  deleteEndpoint = null,
  onDelete = null,
  onRefresh = null,
}) {
  const [visibleInfoCard, setVisibleInfoCard] = useState(false);
  const [rowValue, setRowValue] = useState([]);
  const [data, setData] = useState(Array.isArray(table_data) ? table_data : []);

  useEffect(() => {
    setData(Array.isArray(table_data) ? table_data : []);
  }, [table_data]);

  // Called by InfoCard via onDelete prop
  const handleDelete = async (values) => {
    const id = values && values[0];
    if (!id) return;

    if (typeof onDelete === "function") {
      await onDelete(values);
      setVisibleInfoCard(false);
      return;
    }

    if (deleteEndpoint) {
      const url = typeof deleteEndpoint === "function" ? deleteEndpoint(values) : `${deleteEndpoint}/${encodeURIComponent(id)}`;
      try {
        const res = await fetch(url, { method: "DELETE" });
        if (!res.ok) {
          console.error("Delete failed:", res.status, await res.text());
          return;
        }
        // remove locally to update UI
        setData((prev) => prev.filter((r) => r[0] !== id));
        setVisibleInfoCard(false);
        if (typeof onRefresh === "function") await onRefresh();
      } catch (err) {
        console.error("Delete error:", err);
      }
      return;
    }

    console.warn("No onDelete or deleteEndpoint provided to Table.");
  };

  return (
    <>
      <InfoCard visibility={[visibleInfoCard, setVisibleInfoCard]} values={rowValue} headers={headers} onDelete={handleDelete} />

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