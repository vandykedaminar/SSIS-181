"use client";
import { useState, useEffect, useMemo } from "react";
import "./table.css";
import InsertForm from "./InsertForm";
import InfoCard from "./InfoCard";
import SearchBar from "./SearchBar";

export default function Table({
  table_name = "Table",
  headers = ["header1", "header2", "header3"],
  table_data = [],
  deleteEndpoint = null,
  onDelete = null,
  onRefresh = null,
  filterOptions = null, // e.g. ["All", "College A", "College B"] or []
  filterColumn = null,  // index of column used for filter
}) {
  const [visibleInfoCard, setVisibleInfoCard] = useState(false);
  const [rowValue, setRowValue] = useState([]);
  const [data, setData] = useState(Array.isArray(table_data) ? table_data : []);
  const [query, setQuery] = useState("");

  // sorting state
  const [sortColumn, setSortColumn] = useState(0); // index of column to sort by
  const [sortDirection, setSortDirection] = useState("asc"); // "asc" or "desc"

  // filter state (selected value from filterOptions)
  const [filterValue, setFilterValue] = useState("");

  useEffect(() => {
    setData(Array.isArray(table_data) ? table_data : []);
    // reset filter options selection when data changes
    setFilterValue("");
  }, [table_data]);

  // derived / filtered / sorted data
  const filteredData = useMemo(() => {
    let rows = Array.isArray(data) ? data.slice() : [];

    // search
    const q = (query || "").trim().toLowerCase();
    if (q) {
      rows = rows.filter((row) =>
        Array.isArray(row) &&
        row.some((cell) => {
          if (cell === null || cell === undefined) return false;
          return String(cell).toLowerCase().includes(q);
        })
      );
    }

    // filter by selected filterValue (if filterColumn is provided and filterValue is not empty)
    if (filterColumn !== null && filterValue) {
      rows = rows.filter((row) => {
        const cell = (row && row[filterColumn] !== undefined && row[filterColumn] !== null) ? String(row[filterColumn]) : "";
        return cell === String(filterValue);
      });
    }

    // sort (if sortColumn valid)
    const colIdx = Number(sortColumn);
    if (!Number.isNaN(colIdx)) {
      rows.sort((a, b) => {
        const va = a && a[colIdx] !== undefined && a[colIdx] !== null ? a[colIdx] : "";
        const vb = b && b[colIdx] !== undefined && b[colIdx] !== null ? b[colIdx] : "";

        // try numeric compare if both numbers
        const na = Number(va);
        const nb = Number(vb);
        if (!Number.isNaN(na) && !Number.isNaN(nb)) {
          return sortDirection === "asc" ? na - nb : nb - na;
        }

        // string compare
        const sa = String(va).toLowerCase();
        const sb = String(vb).toLowerCase();
        if (sa < sb) return sortDirection === "asc" ? -1 : 1;
        if (sa > sb) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return rows;
  }, [data, query, filterColumn, filterValue, sortColumn, sortDirection]);

  const handleDelete = async (values) => {
    const id = values && values[0];
    if (!id) return;

    if (typeof onDelete === "function") {
      try {
        await onDelete(values);
        setVisibleInfoCard(false);
      } catch (err) {
        console.error("onDelete failed:", err);
      }
      return;
    }

    if (deleteEndpoint) {
      const url =
        typeof deleteEndpoint === "function"
          ? deleteEndpoint(values)
          : `${deleteEndpoint}/${encodeURIComponent(id)}`;
      try {
        const res = await fetch(url, { method: "DELETE" });
        if (!res.ok) {
          const body = await res.text();
          throw new Error(`Delete failed: ${res.status} ${body}`);
        }
        setData((prev) => prev.filter((r) => r[0] !== id));
        setVisibleInfoCard(false);
        if (typeof onRefresh === "function") await onRefresh();
      } catch (err) {
        console.error("Delete request error:", err);
      }
      return;
    }

    console.warn("No onDelete or deleteEndpoint provided to Table.");
  };

  return (
    <>
      <InfoCard
        visibility={[visibleInfoCard, setVisibleInfoCard]}
        values={rowValue}
        headers={headers}
        onDelete={handleDelete}
      />

      {/* wide gray bar containing centered table title and search + sort + optional filter on the right */}
      <div
        className="table-header-bar"
        style={{
          background: "var(--accent, #3b3b3b)",
          padding: "14px 20px",
          borderRadius: 0,
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <div style={{ width: 72 }} /> {/* reserved space for sidebar */}

        <div style={{ flex: 1, textAlign: "center", fontWeight: 700, fontSize: 18 }}>
          {table_name}
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center", minWidth: 320 }}>
          <div style={{ width: 260 }}>
            <SearchBar value={query} onChange={setQuery} placeholder={`Search ${table_name}`} />
          </div>

          {/* sort controls: choose column and direction */}
          <select
            aria-label="Sort column"
            value={sortColumn}
            onChange={(e) => setSortColumn(Number(e.target.value))}
            style={{ padding: "8px 10px", borderRadius: 6 }}
          >
            {headers.map((h, i) => (
              <option key={i} value={i}>
                {h}
              </option>
            ))}
          </select>

          <select
            aria-label="Sort direction"
            value={sortDirection}
            onChange={(e) => setSortDirection(e.target.value)}
            style={{ padding: "8px 10px", borderRadius: 6 }}
          >
            <option value="asc">Asc</option>
            <option value="desc">Desc</option>
          </select>

          {/* optional filter dropdown (only rendered if filterOptions provided and filterColumn set) */}
          {filterOptions && filterColumn !== null && (
            <select
              aria-label="Filter"
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              style={{ padding: "8px 10px", borderRadius: 6 }}
            >
              <option value="">All</option>
              {filterOptions.map((opt, idx) => (
                <option key={idx} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="my-table">
        <table>
          <thead>
            <tr>
              {headers.map((header, i) => (
                <th key={i}>{header}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filteredData.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className="h-10 college"
                onClick={() => {
                  setVisibleInfoCard(true);
                  setRowValue(row);
                }}
              >
                {headers.map((_, colIdx) => (
                  <td key={colIdx}>{row && row[colIdx] !== undefined && row[colIdx] !== null ? row[colIdx] : ""}</td>
                ))}
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={headers.length} style={{ textAlign: "center", padding: 12, color: "var(--muted, #6b7280)" }}>
                  No results
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}