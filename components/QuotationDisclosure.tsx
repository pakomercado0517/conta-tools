"use client";

import { useState, type ReactNode } from "react";
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io";

interface QuotationDisclosureProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

/**
 * Bloque opcional, cerrado por defecto, con borde bajo.
 */
export default function QuotationDisclosure({
  title,
  children,
  defaultOpen = false,
}: QuotationDisclosureProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-lg border border-dashed border-gray-600 bg-gray-900/30">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-gray-300"
        aria-expanded={open}
      >
        <span>{title}</span>
        {open ? (
          <IoIosArrowDown className="shrink-0 text-base" aria-hidden />
        ) : (
          <IoIosArrowForward className="shrink-0 text-base" aria-hidden />
        )}
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}
