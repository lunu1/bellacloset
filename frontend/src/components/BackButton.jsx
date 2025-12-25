import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function BackButton( { label ="Back", className = " "}) {
    const navigate = useNavigate();

    return ( 
        <button 
        onClick={() => navigate(-1)}
        className={`inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition ${className}`}>
            <ArrowLeft size={16} />
            {label}
        </button>
    )
}