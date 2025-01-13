import { useState } from "react";

export default function HiddenMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const tab = (
    <div className="flex px-4">
      <button
        className="bg-black text-white p-2 rounded-b-xl "
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="h-4 flex place-content-center aspect-square">
          {isOpen ? "▲" : "▼"}
        </div>
      </button>
    </div>
  );

  const menu = (
    <div className="bg-black text-white h-14">
      <ul className="flex gap-4 p-4 ">
        <li>Menu item 1</li>
        <li>Menu item 2</li>
        <li>Menu item 3</li>
      </ul>
    </div>
  );

  return (
    <div
      className="absolute data-[open=true]:translate-y-0 data-[open=false]:-translate-y-14 transition-transform duration-300 ease-in-out"
      data-open={isOpen}
    >
      {menu}
      {tab}
    </div>
  );
}
