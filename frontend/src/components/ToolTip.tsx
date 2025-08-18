'use client'

import { FC, useState } from "react";
import { Modal } from 'flowbite-react'

export interface ToolTipProps {
  children: React.ReactNode;
}

export const ToolTip: FC<ToolTipProps> = ({ children }) => {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  return (
    <>
    <div className="cursor-pointer inline-block" onClick={() => setIsTooltipOpen(true)}>ⓘ</div>
    <Modal show={isTooltipOpen} dismissible size="md" onClose={() => setIsTooltipOpen(false)} popup>
        <Modal.Header className="pb-0"/>
        <Modal.Body className="p-7 pt-0">
          <div className="text-sm">
            {children}
          </div>
        </Modal.Body>
      </Modal>
    </>
  )
};


export default ToolTip;
