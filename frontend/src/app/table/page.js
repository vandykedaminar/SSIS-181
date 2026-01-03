"use client";
import { useState, useEffect, useMemo } from "react";
import Image from 'next/image';
import "./table.css";
import InsertForm from "./InsertForm";
import InfoCard from "./InfoCard";
import SearchBar from "./SearchBar";
import Button from '../../components/ui/Button'
import { Card, CardHeader, CardContent } from '../../components/ui/Card'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../../components/ui/select'

const DEFAULT_PROFILE = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

export default function Table({
  table_name = "Table",
  headers = ["header1", "header2", "header3"],
  table_data = [],
  deleteEndpoint = null,
  onDelete = null,
  onRefresh = null,
  onUpdate = null,
  updateEndpoint = null,
  filterOptions = null, 
  filterColumn = null,
  showImage = false,
  editDropdowns = null, // object like { 3: 'program', 4: 'college' }
  colleges = [], // for dropdowns
  programs = [], // for dropdowns
}) {
  const [visibleInfoCard, setVisibleInfoCard] = useState(false);
  const [rowValue, setRowValue] = useState([]);
  const [data, setData] = useState(Array.isArray(table_data) ? table_data : []);
  const [query, setQuery] = useState("");

  // sorting state
  const [sortColumn, setSortColumn] = useState(0); 
  const [sortDirection, setSortDirection] = useState("asc"); 

  // filter state 
  const [filterValue, setFilterValue] = useState("");

  // pagination
  const PAGE_SIZE = 10;
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

    // filter 
    if (filterColumn !== null && filterValue) {
      rows = rows.filter((row) => {
        const cell = (row && row[filterColumn] !== undefined && row[filterColumn] !== null) ? String(row[filterColumn]) : "";
        return cell === String(filterValue);
      });
    }

    // sort 
    const colIdx = Number(sortColumn);
    if (!Number.isNaN(colIdx)) {
      rows.sort((a, b) => {
        const va = a && a[colIdx] !== undefined && a[colIdx] !== null ? a[colIdx] : "";
        const vb = b && b[colIdx] !== undefined && b[colIdx] !== null ? b[colIdx] : "";

        // try numeric compare 
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
        <Button
          key={i}
          className={`${i === currentPage ? "pager-btn active" : "pager-btn"}`}
          onClick={() => changePage(i)}
          size="sm"
          aria-current={i === currentPage ? "page" : undefined}
          variant={i === currentPage ? 'secondary' : 'ghost'}
        >
          {i}
        </Button>
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

  const handleUpdate = async (originalValues, editedValues) => {
    try {
      const id = originalValues && originalValues[0];
      if (!id) return;

      setData((prev) => prev.map((r) => (r && r[0] === id ? editedValues : r)));
      setVisibleInfoCard(false);

      if (updateEndpoint) {
        const url =
          typeof updateEndpoint === "function"
            ? updateEndpoint(originalValues, editedValues)
            : `${updateEndpoint}/${encodeURIComponent(id)}`;

        const payload = {};
        for (let i = 0; i < headers.length; i++) {
          const key = headers[i] || `col_${i}`;
          payload[key] = editedValues[i];
        }

        const res = await fetch(url, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const body = await res.text();
          throw new Error(`Update failed: ${res.status} ${body}`);
        }
      } else {
        if (typeof onRefresh === "function") await onRefresh();
      }
    } catch (err) {
      console.error("Update error:", err);
      if (typeof onRefresh === "function") await onRefresh();
    }
  };

  return (
    <>
      <InfoCard
        visibility={[visibleInfoCard, setVisibleInfoCard]}
        values={rowValue}
        headers={headers}
        onDelete={handleDelete}
        updateEndpoint={updateEndpoint}
        onRefresh={onRefresh}
        onUpdate={onUpdate || handleUpdate}
        showImage={showImage}
        editDropdowns={editDropdowns}
        colleges={colleges}
        programs={programs}
      />

      <Card className="mb-4">
          <CardHeader className="flex items-center gap-4" style={{ alignItems: 'center' }}>
          <div style={{ width: 72 }} />
          <div style={{ flex: 1, textAlign: "center", fontWeight: 700, fontSize: 18 }}>{table_name}</div>

          <div className="header-controls" style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ width: 260, minWidth: 120 }}>
              <SearchBar value={query} onChange={setQuery} placeholder={`Search ${table_name}`} />
            </div>

            <Select onValueChange={(val) => setSortColumn(Number(val))}>
              <SelectTrigger className="select-trigger w-40">
                <SelectValue placeholder="Sort column" />
              </SelectTrigger>
              <SelectContent>
                {headers.map((h, i) => (
                  <SelectItem key={i} value={String(i)}>{h}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select onValueChange={(val) => setSortDirection(val)}>
              <SelectTrigger className="select-trigger w-28">
                <SelectValue placeholder="Direction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Asc</SelectItem>
                <SelectItem value="desc">Desc</SelectItem>
              </SelectContent>
            </Select>

            {filterOptions && filterColumn !== null && (
              <Select onValueChange={(val) => setFilterValue(val === 'ALL' ? '' : val)}>
                <SelectTrigger className="select-trigger w-40">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  {filterOptions.map((opt, idx) => {
                    const value = typeof opt === 'object' && opt.value ? opt.value : opt;
                    const label = typeof opt === 'object' && opt.label ? opt.label : opt;
                    return <SelectItem key={idx} value={String(value)}>{label}</SelectItem>;
                  })}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardHeader>
      </Card>

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
                className="h-10 college table-row"
                tabIndex={0}
                role="button"
                onClick={() => {
                  setVisibleInfoCard(true);
                  setRowValue(row);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setVisibleInfoCard(true);
                    setRowValue(row);
                  }
                }}
              >
                    {headers.map((_, colIdx) => {
                      const cellValue = row && row[colIdx] !== undefined && row[colIdx] !== null ? row[colIdx] : "";
                      const headerName = String(headers[colIdx] || `col_${colIdx}`);
                      
                      return (
                        <td key={colIdx} data-label={headerName} style={{ verticalAlign: 'middle' }}>
                           {headerName === "Photo" ? (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                          {/* This wrapper div enforces the size and shape */}
                          <div style={{
                            position: 'relative', // Crucial for the `fill` prop to work
                            width: '50px',        // Fixed width
                            height: '50px',       // Fixed height
                            borderRadius: '50%',  // Makes it a circle
                            overflow: 'hidden',   // Hides parts of the image outside the circle
                            border: '1px solid rgba(255, 255, 255, 0.1)' // Optional border
                          }}>
                            <Image 
                              src={cellValue || DEFAULT_PROFILE} 
                              alt="student"
                              fill // This prop makes the image fill its parent div
                              style={{ 
                                  objectFit: 'cover' // This crops the image to fit without distortion
                              }}
                              unoptimized
                              className="bg-black/20"
                              onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = DEFAULT_PROFILE;
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        cellValue
                      )}
                        </td>
                      )
                    })}
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
            <Button className="pager-btn" size="sm" onClick={() => changePage(1)} disabled={currentPage === 1} variant="ghost">First</Button>
            <Button className="pager-btn" size="sm" onClick={() => changePage(currentPage - 1)} disabled={currentPage === 1} variant="ghost">Prev</Button>

            {renderPageButtons()}

            <Button className="pager-btn" size="sm" onClick={() => changePage(currentPage + 1)} disabled={currentPage === totalPages} variant="ghost">Next</Button>
            <Button className="pager-btn" size="sm" onClick={() => changePage(totalPages)} disabled={currentPage === totalPages} variant="ghost">Last</Button>
          </div>
        </div>
      </div>
    </>
  );
}