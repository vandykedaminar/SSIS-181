"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import Table from "../page";
import InsertDialog from "../InsertDialog";
import { useToast } from '../../../components/ToastContext';
import { supabase } from "../../../lib/supabaseClient";
import { Button } from "../../../components/ui/Button"; 
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"; 

export default function Students() {
  // --- FORM STATES ---
  const [student_id, set_student_id] = useState("");
  const [first_name, set_first_name] = useState("");
  const [last_name, set_last_name] = useState("");
  const [course, set_course] = useState("");
  const [year, set_year] = useState("");
  const [gender, set_gender] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [selected_college, set_selected_college] = useState("");

  // --- DATA STATES ---
  const [table_data, set_table_data] = useState([]);
  const [colleges, set_colleges] = useState([]);
  const [programs, set_programs] = useState([]);

  // --- FILTER STATES (NEW) ---
  const [filterCollege, setFilterCollege] = useState("All");
  const [filterProgram, setFilterProgram] = useState("All");
  const [filterSex, setFilterSex] = useState("All");
  const [filterYear, setFilterYear] = useState("All");

  const { showToast } = useToast();

  const sexOptions = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" }
  ];

  // --- DATA FETCHING ---
  const updateTableData = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/get/students`);
      if (!res.ok) throw new Error(`Students fetch failed: ${res.status}`);
      const students = await res.json();
      
      const programsRes = await fetch(`${API_BASE}/get/programs`);
      if (!programsRes.ok) throw new Error(`Programs fetch failed: ${programsRes.status}`);
      const programs = await programsRes.json();
      const programMap = {};
      programs.forEach(p => programMap[p[0]] = p[2]); 
      
      const collegesRes = await fetch(`${API_BASE}/get/colleges`);
      if (!collegesRes.ok) throw new Error(`Colleges fetch failed: ${collegesRes.status}`);
      const colleges = await collegesRes.json();
      const collegeMap = {};
      colleges.forEach(c => collegeMap[c[0]] = c[1]); 
      
      const result = students.map(student => [
        student[0], // 0: id
        student[1], // 1: first_name
        student[2], // 2: last_name
        student[3], // 3: program_code
        collegeMap[programMap[student[3]]] || '', // 4: college_name
        student[4], // 5: year
        student[5], // 6: gender/sex
        student[6]  // 7: photo_url
      ]);
      
      set_table_data(result);
    } catch (error) {
      console.error('Error updating table data:', error);
      showToast(`Failed to load data: ${error.message}`, { type: 'error' });
    }
  }, [showToast]);

  const updateColleges = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/get/colleges`);
      if (!res.ok) throw new Error(`Colleges fetch failed: ${res.status}`);
      const result = await res.json();
      set_colleges(result);
    } catch (error) {
      showToast(`Failed to load colleges: ${error.message}`, { type: 'error' });
    }
  }, [showToast]);

  const updatePrograms = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/get/programs`);
      if (!res.ok) throw new Error(`Programs fetch failed: ${res.status}`);
      const result = await res.json();
      set_programs(result);
    } catch (error) {
      showToast(`Failed to load programs: ${error.message}`, { type: 'error' });
    }
  }, [showToast]);

  useEffect(() => { 
    updateTableData(); 
    updateColleges();
    updatePrograms();
  }, [updateTableData, updateColleges, updatePrograms]);

  const getFilteredCount = (targetColIndex, targetValue) => {
    if (!table_data) return 0;

    return table_data.filter(row => {
      if (targetColIndex !== 4 && filterCollege !== "All" && row[4] !== filterCollege) return false;

      if (targetColIndex !== 3 && filterProgram !== "All" && row[3] !== filterProgram) return false;

      if (targetColIndex !== 6 && filterSex !== "All" && row[6] !== filterSex) return false;

      if (targetColIndex !== 5 && filterYear !== "All" && row[5] !== filterYear) return false;

      return String(row[targetColIndex]) === String(targetValue);
    }).length;
  };

  const filteredData = useMemo(() => {
    return table_data.filter((row) => {
      // Index 4 is College Name
      if (filterCollege !== "All" && row[4] !== filterCollege) return false;
      // Index 3 is Program Code
      if (filterProgram !== "All" && row[3] !== filterProgram) return false;
      // Index 6 is Sex/Gender
      if (filterSex !== "All" && row[6] !== filterSex) return false;
      // Index 5 is Year
      if (filterYear !== "All" && row[5] !== filterYear) return false;
      
      return true;
    });
  }, [table_data, filterCollege, filterProgram, filterSex, filterYear]);

  // Reset all filters
  const resetFilters = () => {
    setFilterCollege("All");
    setFilterProgram("All");
    setFilterSex("All");
    setFilterYear("All");
  };

  // --- FORM LOGIC ---
  const submitForm = async () => {
    if (!/^\d{4}-\d{4}$/.test(student_id)) { 
        showToast('Invalid ID format. Must be YYYY-NNNN.', { type: 'error' }); 
        return; 
    }

    let photoUrl = "";
    if (photoFile) {
        const fileName = `${Date.now()}_${photoFile.name.replace(/\s/g, '')}`;
        const { error } = await supabase.storage.from('student-photos').upload(fileName, photoFile);
        if (!error) {
            const { data } = supabase.storage.from('student-photos').getPublicUrl(fileName);
            photoUrl = data.publicUrl;
        }
    }

    const payload = {
        id: student_id,
        first_name: first_name,
        last_name: last_name,
        course: course,
        year: year,
        gender: gender,
        photo_url: photoUrl
    };

    try {
        const res = await fetch(`${API_BASE}/insert/student`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            showToast('Student inserted', { type: 'success' });
            updateTableData();
            clearFields();
        } else {
            const errJson = await res.json();
            showToast(`Error: ${errJson.error}`, { type: 'error' });
        }
    } catch (err) {
        showToast("Server error", { type: "error" });
    }
  };

  const clearFields = () => {
    set_student_id(""); set_first_name(""); set_last_name(""); 
    set_course(""); set_year(""); set_gender(""); 
    setPhotoFile(null); set_selected_college("");
  };

  useEffect(() => {
    if (selected_college && course) {
      const programExists = programs.some(p => p[0] === course && p[2] === selected_college);
      if (!programExists) set_course("");
    }
  }, [selected_college, programs, course]);

  useEffect(() => { set_course(""); }, [selected_college]);

  // Dropdown Options Generation
  const collegeOptions = colleges.map(c => ({ value: c[0], label: `${c[0]} - ${c[1]}` }));
  
  // Options for the INSERT Form
  const insertProgramOptions = programs
    .filter(p => !selected_college || p[2] === selected_college)
    .map(p => ({ value: p[0], label: `${p[0]} - ${p[1]}` }));

  const filterCollegeOptions = colleges.map(c => c[1]); 
  

  const selectedFilterCollegeCode = colleges.find(c => c[1] === filterCollege)?.[0];
  const filterProgramOptions = programs
    .filter(p => !selectedFilterCollegeCode || p[2] === selectedFilterCollegeCode)
    .map(p => p[0]); // List of Program Codes

  const handleUpdate = async (originalValues, editedValues) => {
    const originalId = originalValues && originalValues[0];
    if (!originalId) return;

    const oldPhotoUrl = originalValues && originalValues[7];
    const newPhotoUrl = editedValues && editedValues[7];


    if (oldPhotoUrl && oldPhotoUrl !== newPhotoUrl) {
      try {
        const fileName = oldPhotoUrl.split('/').pop();

        if (fileName) {
          console.log(`Attempting to delete old photo: ${fileName}`);
          const { error: storageError } = await supabase.storage
            .from('student-photos') 
            .remove([fileName]);   

          if (storageError) {
            console.warn("Failed to delete old photo from storage, but continuing with DB update.", storageError);
            showToast("Could not remove the old photo file, but student record will be updated.", { type: "warning" });
          } else {
            console.log("Successfully deleted old photo.");
          }
        }
      } catch (err) {
          console.error("An error occurred during old photo deletion:", err);
      }
    }

    const payload = {
      id: editedValues[0],
      first_name: editedValues[1],
      last_name: editedValues[2],
      course: editedValues[3], 
      year: editedValues[5], 
      gender: editedValues[6], 
      photo_url: editedValues[7] 
    };

    try {
      const res = await fetch(`${API_BASE}/update/student/${encodeURIComponent(originalId)}`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.text()));
      await updateTableData();
      showToast('Student updated', { type: 'success' });
    } catch (err) {
      showToast(`Update failed: ${err.message}`, { type: 'error' });
      await updateTableData();
    }
  };

  const handleDelete = async (values) => {
    const sid = values && values[0];
    const photoUrl = values && values[7]; 

    if (!sid || !confirm(`Delete student ${sid}? This will also permanently delete their photo.`)) {
      return;
    }

    try {
      if (photoUrl) {
 
        const fileName = photoUrl.split('/').pop();

        if (fileName) {
          const { error: storageError } = await supabase.storage
            .from('student-photos') 
            .remove([fileName]);   

          if (storageError) {
            console.warn("Could not delete photo from storage, but proceeding with DB deletion.", storageError);
            showToast("Could not delete student photo, but record will be removed.", { type: "warning" });
          }
        }
      }

      const res = await fetch(`${API_BASE}/delete/student/${encodeURIComponent(sid)}`, {
        method: "DELETE"
      });

      if (!res.ok) {
        throw new Error(`Failed to delete student record: ${await res.text()}`);
      }

      showToast('Student deleted successfully', { type: 'success' });
      await updateTableData(); 

    } catch (err) {
      console.error("Deletion process failed:", err);
      showToast(err.message, { type: 'error' });
    }
  };

  const selectStyle = "w-full bg-[#0f2a2f] border border-white/10 text-white h-10 rounded-md";

  return (
    <>
      <div className="flex flex-col gap-4 mb-6 px-4">
        
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">Student Records</h1>
            <InsertDialog
            label="Add Student"
            formName="New Student"
            fields={[
                ["ID: ", student_id, set_student_id],
                ["First Name: ", first_name, set_first_name],
                ["Last Name: ", last_name, set_last_name],
                ["College: ", selected_college, set_selected_college, "select", collegeOptions],
                ["Program: ", course, set_course, "select", insertProgramOptions],
                ["Year: ", year, set_year],
                ["Sex: ", gender, set_gender, "select", sexOptions], 
                ["Photo: ", null, setPhotoFile, "file"],
            ]}
            functions={[updateTableData, submitForm, clearFields]}
            />
        </div>

         <div className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 bg-[#0f2a2f]/50 border border-white/10 rounded-lg shadow-lg">
            
            {/* College Filter */}
            <div className="space-y-1">
                <label className="text-xs text-gray-400 font-semibold uppercase">College</label>
                <Select value={filterCollege} onValueChange={setFilterCollege}>
                    <SelectTrigger className={selectStyle}><SelectValue placeholder="All Colleges" /></SelectTrigger>
                    <SelectContent>
                        {/* The "All" option shows the total count based on other active filters */}
                        <SelectItem value="All">All Colleges</SelectItem>
                        {filterCollegeOptions.map((cName, i) => (
                            <SelectItem key={i} value={cName}>
                                {cName} ({getFilteredCount(4, cName)})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Program Filter */}
            <div className="space-y-1">
                <label className="text-xs text-gray-400 font-semibold uppercase">Program</label>
                <Select value={filterProgram} onValueChange={setFilterProgram}>
                    <SelectTrigger className={selectStyle}><SelectValue placeholder="All Programs" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Programs</SelectItem>
                        {filterProgramOptions.map((pCode, i) => {
                            // If a college is selected, only show programs for that college
                            // (You already have this logic in filterProgramOptions, which is good)
                            const count = getFilteredCount(3, pCode);
                            return (
                                <SelectItem key={i} value={pCode}>
                                    {pCode} ({count})
                                </SelectItem>
                            );
                        })}
                    </SelectContent>
                </Select>
            </div>

            {/* Sex Filter */}
            <div className="space-y-1">
                <label className="text-xs text-gray-400 font-semibold uppercase">Sex</label>
                <Select value={filterSex} onValueChange={setFilterSex}>
                    <SelectTrigger className={selectStyle}><SelectValue placeholder="All" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All</SelectItem>
                        <SelectItem value="Male">Male ({getFilteredCount(6, "Male")})</SelectItem>
                        <SelectItem value="Female">Female ({getFilteredCount(6, "Female")})</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Year Filter */}
            <div className="space-y-1">
                <label className="text-xs text-gray-400 font-semibold uppercase">Year Level</label>
                <Select value={filterYear} onValueChange={setFilterYear}>
                    <SelectTrigger className={selectStyle}><SelectValue placeholder="All" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All</SelectItem>
                        {[1, 2, 3, 4, 5, 6].map(y => (
                            <SelectItem key={y} value={String(y)}>
                                {y} ({getFilteredCount(5, y)})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-end">
                <Button variant="secondary" onClick={resetFilters} className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white">
                    Reset Filters
                </Button>
            </div>
        </div>
      </div>

      <Table
        table_name={"Student Table"}
        headers={["ID", "First Name", "Last Name", "Program", "College", "Year", "Sex", "Photo"]}
        table_data={filteredData} 
        onDelete={handleDelete}
        onUpdate={handleUpdate}
        showImage={true}
        editDropdowns={{3: 'program', 4: 'college', 6: 'sex'}}
        colleges={colleges}
        programs={programs}
      />
    </>
  );
}