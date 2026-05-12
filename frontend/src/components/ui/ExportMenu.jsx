import React, { useState, useRef, useEffect } from 'react';
import { Download, FileSpreadsheet, FileText, FileDown, Copy, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ExportMenu({ 
    onExportCSV, 
    onExportExcel, 
    onExportPDF, 
    onCopyClipboard,
    label = "Export",
    compact = false
}) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAction = (action) => {
        setIsOpen(false);
        if (action) action();
    };

    return (
        <div className="relative inline-block text-left" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 font-medium transition-colors bg-white/10 hover:bg-white/20 border border-white/10 rounded-md
                    ${compact ? 'px-2 py-1 text-xs' : 'px-4 py-2 text-sm'}`}
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <Download size={compact ? 14 : 16} />
                {!compact && <span>{label}</span>}
                <ChevronDown size={compact ? 14 : 16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-[#1e1e2d] ring-1 ring-black ring-opacity-5 z-50 border border-white/10 overflow-hidden"
                    >
                        <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                            {onExportCSV && (
                                <button
                                    onClick={() => handleAction(onExportCSV)}
                                    className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                                    role="menuitem"
                                >
                                    <FileText size={16} className="mr-2 text-blue-400" />
                                    Export CSV
                                </button>
                            )}
                            {onExportExcel && (
                                <button
                                    onClick={() => handleAction(onExportExcel)}
                                    className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                                    role="menuitem"
                                >
                                    <FileSpreadsheet size={16} className="mr-2 text-green-400" />
                                    Export Excel
                                </button>
                            )}
                            {onExportPDF && (
                                <button
                                    onClick={() => handleAction(onExportPDF)}
                                    className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                                    role="menuitem"
                                >
                                    <FileDown size={16} className="mr-2 text-red-400" />
                                    Export PDF Summary
                                </button>
                            )}
                            {(onExportCSV || onExportExcel || onExportPDF) && onCopyClipboard && (
                                <div className="border-t border-white/10 my-1"></div>
                            )}
                            {onCopyClipboard && (
                                <button
                                    onClick={() => handleAction(onCopyClipboard)}
                                    className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                                    role="menuitem"
                                >
                                    <Copy size={16} className="mr-2 text-gray-400" />
                                    Copy Table Data
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
