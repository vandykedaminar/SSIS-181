// ...existing code...
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
  filterColumn = null, // index of column used for filter
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

  // pagination
  const PAGE_SIZE = 50;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setData(Array.isArray(table_data) ? table_data : []);
    setFilterValue("");
    setCurrentPage(1);
  }, [table_data]);

  // reset page when search/filter/sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [query, filterValue, sortColumn, sortDirection]);

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

  // pagination computed values
  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageEnd = Math.min(pageStart + PAGE_SIZE, totalItems);
  const pageRows = filteredData.slice(pageStart, pageEnd);

  const changePage = (p) => {
    const target = Math.max(1, Math.min(totalPages, p));
    setCurrentPage(target);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPageButtons = () => {
    const pages = [];
    let start = Math.max(1, currentPage - 3);
    let end = Math.min(totalPages, start + 6);
    if (end - start < 6) start = Math.max(1, end - 6);

    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          className={`pager-btn ${i === currentPage ? "active" : ""}`}
          onClick={() => changePage(i)}
          aria-current={i === currentPage ? "page" : undefined}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

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
        // remove from local data
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
        <div style={{ width: 72 }} />
        <div style={{ flex: 1, textAlign: "center", fontWeight: 700, fontSize: 18 }}>{table_name}</div>

        <div style={{ display: "flex", gap: 8, alignItems: "center", minWidth: 320 }}>
          <div style={{ width: 260 }}>
            <SearchBar value={query} onChange={setQuery} placeholder={`Search ${table_name}`} />
          </div>

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
            {pageRows.map((row, rowIdx) => (
              <tr
                key={pageStart + rowIdx}
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
            {pageRows.length === 0 && (
              <tr>
                <td colSpan={headers.length} style={{ textAlign: "center", padding: 12, color: "var(--muted, #6b7280)" }}>
                  No results
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="pagination-bar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12 }}>
          <div className="pagination-info" style={{ color: "var(--muted)" }}>
            Showing {totalItems === 0 ? 0 : pageStart + 1} - {pageEnd} of {totalItems}
          </div>

          <div className="pagination-controls" style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            <button className="pager-btn" onClick={() => changePage(1)} disabled={currentPage === 1}>
              First
            </button>
            <button className="pager-btn" onClick={() => changePage(currentPage - 1)} disabled={currentPage === 1}>
              Prev
            </button>

            {renderPageButtons()}

            <button className="pager-btn" onClick={() => changePage(currentPage + 1)} disabled={currentPage === totalPages}>
              Next
            </button>
            <button className="pager-btn" onClick={() => changePage(totalPages)} disabled={currentPage === totalPages}>
              Last
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
// ...existing code...