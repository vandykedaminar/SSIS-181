"use client";
import './InfoCard.css'
import '../HeaderButton'
import HeaderButton from '../HeaderButton';
import Image from 'next/image';
import InfoCardData from './InfoCardData';

export default function InfoCard({ visibility = [false, () => {}], values = [], headers = [], deleteEndpoint = null, onDelete = null }) {

    const doDelete = async () => {
        const idLabel = values && values[0] ? values[0] : "this item";
        const isConfirm = window.confirm(`Are you sure you want to delete ${idLabel}?`);
        if (!isConfirm) return;

        if (typeof onDelete === "function") {
            await onDelete(values);
            return;
        }

        if (deleteEndpoint) {
            // deleteEndpoint should be a string like '/delete/college' or a function that returns a URL
            const url = (typeof deleteEndpoint === "function") ? deleteEndpoint(values) : `${deleteEndpoint}/${encodeURIComponent(values[0])}`;
            try {
                const res = await fetch(url);
                console.log("delete response", res.status);
            } catch (err) {
                console.error("delete error", err);
            }
        } else {
            console.warn("No deleteEndpoint or onDelete provided.");
        }
    }

    if (!visibility[0]) return null;

    return (
        <>
            <div className="bg-pop-up" onClick={() => { visibility[1](false) }} />

            <div className="pop-up">
                <div className='header-pop-up'>
                    <HeaderButton onClick={() => { visibility[1](false) }} style={{ borderTopRightRadius: '10px', width: '45px' }}>
                        <Image src='/close.svg' alt='Close' width={28} height={28} className='invert' />
                    </HeaderButton>
                    <HeaderButton onClick={() => { doDelete(); }} style={{ width: '45px' }}>
                        <Image src={'/trash.svg'} alt='Trash' width={28} height={28} className='invert' />
                    </HeaderButton>
                    <HeaderButton style={{ width: '45px' }}>
                        <Image src={'/edit.svg'} alt='Edit' width={28} height={28} className='invert' />
                    </HeaderButton>
                </div>

                {values && values.length > 0 ? (
                    values.map((val, i) => (
                        <InfoCardData key={i} text={(headers && headers[i]) ? `${headers[i]}: ` : `Field ${i + 1}: `} value={val} />
                    ))
                ) : (
                    <div className="info-empty">No data</div>
                )}
            </div>
        </>
    );
}