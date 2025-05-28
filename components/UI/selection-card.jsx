import React from "react";

export function SelectionCard({ title, items, selectedItem, onSelect }) {
  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.1)",
        padding: "1.5rem",
        borderRadius: "10px",
        width: "300px",
      }}
    >
      <h2 style={{ marginBottom: "1rem" }}>{title}</h2>
      {items.map((item) => (
        <div
          key={item.id}
          onClick={() => onSelect(item)}
          style={{
            padding: "1rem",
            margin: "0.5rem 0",
            background:
              selectedItem.id === item.id
                ? "rgba(255, 255, 255, 0.2)"
                : "rgba(255, 255, 255, 0.1)",
            borderRadius: "5px",
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
        >
          {item.name}
        </div>
      ))}
    </div>
  );
}
