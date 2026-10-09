export function VB1() {
    return (
        <div className="bg-white rounded-lg p-6 border border-gray-100 flex flex-col md:flex-row gap-8 items-stretch font-sans">
            {/* Left side: File-processing */}
            <div className="flex-1 bg-gray-50 rounded-xl p-5 shadow-sm border border-gray-200 flex flex-col">
                <h4 className="text-sm font-semibold text-gray-700 mb-6 text-center border-b border-gray-200 pb-2">File-Processing System</h4>
                <div className="flex-1 flex flex-col gap-6 justify-center">
                    {['Registrar', 'Hostel', 'Library'].map((app) => (
                        <div key={app} className="flex items-center gap-4">
                            <div className="flex-1 bg-white border border-gray-300 p-3 rounded-lg shadow-sm text-center relative z-10 transition-transform hover:-translate-y-1">
                                <div className="text-xs font-bold text-gray-800 mb-1">{app} Program</div>
                                <div className="text-[10px] text-gray-500 italic">Layout hard-coded</div>
                            </div>
                            <div className="text-gray-300 text-lg flex-shrink-0">→</div>
                            <div className="w-24 bg-blue-50 border border-blue-200 p-2 rounded flex flex-col items-center justify-center shadow-inner relative z-10">
                                <span className="text-[10px] text-blue-800 font-mono mb-1">{app.toLowerCase()}_students.dat</span>
                                <div className="text-[9px] text-blue-500 whitespace-nowrap">Asha: 12 Lake Rd</div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-6 pt-3 text-center border-t border-gray-200 text-[11px] text-gray-500 font-medium">
                    Same student stored three times.
                </div>
            </div>

            {/* Middle: vs indicator */}
            <div className="hidden md:flex flex-col items-center justify-center text-gray-300 text-xs font-bold tracking-widest uppercase">
                VS
            </div>

            {/* Right side: DBMS */}
            <div className="flex-1 bg-brand-50 rounded-xl p-5 shadow-sm border border-brand-200 flex flex-col">
                <h4 className="text-sm font-semibold text-brand-800 mb-6 text-center border-b border-brand-200 pb-2">DBMS Approach</h4>
                <div className="flex-1 flex flex-col md:flex-row gap-4 items-center justify-center">
                    {/* Applications */}
                    <div className="flex flex-col gap-4 w-full md:w-32">
                        {['Registrar', 'Hostel', 'Library'].map((app) => (
                            <div key={app} className="bg-white border border-brand-300 p-2 rounded-lg shadow-sm text-center">
                                <div className="text-xs font-bold text-gray-800">{app} Program</div>
                            </div>
                        ))}
                    </div>

                    <div className="text-brand-300 md:rotate-0 rotate-90 flex-shrink-0">→</div>

                    {/* DBMS Box */}
                    <div className="flex-1 bg-white border-2 border-brand-400 p-4 rounded-xl text-center shadow-md">
                        <div className="font-bold text-brand-700 text-sm mb-3">DBMS</div>
                        <div className="flex flex-col gap-2">
                            <div className="bg-brand-100 text-brand-800 text-[10px] p-2 rounded border border-brand-200 font-medium">
                                Query Processor
                            </div>
                            <div className="bg-brand-100 text-brand-800 text-[10px] p-2 rounded border border-brand-200 font-medium">
                                Catalog (Data definitions)
                            </div>
                        </div>
                    </div>

                    <div className="text-brand-300 md:rotate-0 rotate-90 flex-shrink-0">→</div>

                    {/* Shared Data Store */}
                    <div className="w-full md:w-28 flex flex-col items-center">
                        <div className="w-20 h-28 bg-gray-800 border-b-8 border-gray-900 rounded-lg flex flex-col items-center justify-center shadow-xl relative overflow-hidden">
                            {/* DB Cylinders styling */}
                            <div className="absolute top-0 w-full h-4 rounded-[50%] bg-gray-700"></div>
                            <div className="absolute top-2 w-full h-4 rounded-[50%] bg-gray-800 border-b border-gray-600"></div>

                            <div className="text-xs font-bold text-white z-10 mt-4">Shared store</div>
                            <div className="text-[9px] text-gray-300 mt-2 z-10 text-center">Asha: 12 Lake Rd<br />(One copy)</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
