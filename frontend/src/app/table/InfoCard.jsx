"use client";
import Image from "next/image";
import HeaderButton from "../HeaderButton";
import InfoCardData from "./InfoCardData";
import "./InfoCard.css";

export default function InfoCard({
  visibility = [false, () => {}],
  values = [],
  headers = [],
  deleteEndpoint = null,
  onDelete = null,
}) {
  const [visible, setVisible] = visibility;

  const doDelete = async () => {
    const idLabel = values && values[0] ? values[0] : "this item";
    if (!window.confirm(`Delete ${idLabel}?`)) return;

    if (typeof onDelete === "function") {
      await onDelete(values);
      return;
    }

    if (deleteEndpoint) {
      const id = values && values[0];
      const url =
        typeof deleteEndpoint === "function"
          ? deleteEndpoint(values)
          : `${deleteEndpoint}/${encodeURIComponent(id)}`;
      try {
        const res = await fetch(url, { method: "DELETE" });
        if (!res.ok) {
          const txt = await res.text();
          console.error("Delete failed:", res.status, txt);
          return;
        }
        setVisible(false);
      } catch (err) {
        console.error("Delete request error:", err);
      }
      return;
    }

    console.warn("No onDelete or deleteEndpoint provided to InfoCard.");
  };

  if (!visible) return null;

  return (
    <>
      <div className="bg-pop-up" onClick={() => setVisible(false)} />
      <div className="pop-up">
        <div className="header-pop-up">
          <HeaderButton onClick={() => setVisible(false)} style={{ borderTopRightRadius: "10px", width: "45px" }}>
            <Image src="/close.svg" alt="Close" width={28} height={28} className="invert" />
          </HeaderButton>

          <HeaderButton onClick={() => doDelete()} style={{ width: "45px" }}>
            <Image src={"/trash.svg"} alt="Trash" width={28} height={28} className="invert" />
          </HeaderButton>

          <HeaderButton style={{ width: "45px" }}>
            <Image src={"/edit.svg"} alt="Edit" width={28} height={28} className="invert" />
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