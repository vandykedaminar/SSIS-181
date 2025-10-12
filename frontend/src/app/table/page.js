"use client";
import { useState } from 'react';
import './table.css'
import InsertForm from './InsertForm';
import InfoCard from './InfoCard';

export default function Table({ table_name="Table", headers=["header1", "header2", "header3"], table_data=[] }) {

    const [visibleInfoCard, setVisibleInfoCard] = useState(false);
    const [collegeValue, setCollegeValue] = useState([]);

    return (
    <>
        <InfoCard visibility={[visibleInfoCard, setVisibleInfoCard]} values={collegeValue} />

        <div className='table-header'>
            <label>{table_name}</label>
        </div>

        <div className='my-table'>
            <table> 
                <thead>
                    <tr>
                        {headers.map((header, i) => (
                            <th key={i}>{header}</th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {table_data.map((row, rowIdx) => (
                        <tr
                            key={rowIdx}
                            className='h-10 college'
                            onClick={() => {
                                setVisibleInfoCard(true);
                                setCollegeValue(row); // pass whole row array to InfoCard
                            }}
                        >
                            {headers.map((_, colIdx) => (
                                <td key={colIdx}>{(row && row[colIdx] !== undefined) ? row[colIdx] : ""}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </>
    )
}