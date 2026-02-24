import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { X } from "lucide-react";

export default function MediaModal({ isOpen, onClose, mediaUrl, isVideo, title }) {
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") onClose();
        };
        const globalWindow = typeof window === 'object' ? globalThis.window : undefined;
        if (globalWindow) globalWindow.addEventListener("keydown", handleEsc);
        return () => {
            if (globalWindow) globalWindow.removeEventListener("keydown", handleEsc);
        };
    }, [onClose]);

    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn"
            onClick={onClose}
            role="presentation"
        >
            <div
                className="relative bg-black rounded-lg shadow-2xl overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
                role="presentation"
            >
                {/* Header with Title and Close Button */}
                <div className="absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/70 to-transparent flex justify-between items-center z-10">
                    <h3 className="text-white font-medium truncate pr-8 drop-shadow-md">{title || "Mídia do Anúncio"}</h3>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-1.5 transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Media Content */}
                <div className="flex-1 flex items-center justify-center p-0 md:p-8 overflow-hidden min-h-[50vh]">
                    {isVideo ? (
                        <video
                            src={mediaUrl}
                            controls
                            autoPlay
                            muted
                            playsInline
                            className="w-full h-full max-h-[80vh] object-contain rounded"
                        >
                            <track kind="captions" />
                        </video>
                    ) : (
                        <img
                            src={mediaUrl}
                            alt={title || "Imagem do anúncio"}
                            className="w-full h-full max-h-[80vh] object-contain rounded"
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

MediaModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    mediaUrl: PropTypes.string,
    isVideo: PropTypes.bool.isRequired,
    title: PropTypes.string
};
