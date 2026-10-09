export function VB5() {
    return (
        <div className="bg-white rounded-lg p-6 border border-gray-100 font-sans">
            <h4 className="text-sm font-semibold text-gray-800 mb-6 text-center">Three-Schema Architecture & Data Independence</h4>
            <div className="relative max-w-2xl mx-auto flex flex-col gap-6 pl-4 md:pl-20">
                {/* External Level */}
                <div className="relative bg-blue-50 border border-blue-200 rounded-xl p-4 shadow-sm z-10 w-full md:w-3/4 mx-auto">
                    <div className="absolute -left-6 md:-left-24 top-6 w-5 md:w-20 border-b border-gray-300 border-dashed"></div>
                    <span className="absolute -top-3 left-4 bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-200 uppercase tracking-widest">External Level</span>
                    <div className="flex flex-col sm:flex-row gap-4 mt-2 justify-center">
                        <div className="bg-white border text-center border-blue-300 p-2 rounded shadow-sm text-[10px] text-blue-700 font-semibold flex-1">Student View<br /><span className="text-[9px] font-mono text-gray-500">(name, dept)</span></div>
                        <div className="bg-white border text-center border-blue-300 p-2 rounded shadow-sm text-[10px] text-blue-700 font-semibold flex-1">Accounts View<br /><span className="text-[9px] font-mono text-gray-500">(roll no, fees)</span></div>
                    </div>
                </div>

                <div className="w-full flex justify-center mt-[-10px] mb-[-10px] z-0">
                    <div className="bg-gray-100 border border-gray-300 px-3 py-1 rounded text-[9px] font-bold text-gray-600 uppercase tracking-widest relative">
                        Mapping
                        {/* Braces/Pointers for Logical Data Independence */}
                        <div className="hidden md:block absolute top-1/2 -translate-y-1/2 right-[110%] w-[150px] border-l-2 border-t-2 border-b-2 border-brand-400 h-28 rounded-l-lg p-2 flex items-center shadow-sm bg-brand-50">
                            <span className="text-[10px] font-bold text-brand-700 uppercase leading-tight ml-1 text-center w-full">Logical Data<br />Independence</span>
                        </div>
                    </div>
                </div>

                {/* Conceptual Level */}
                <div className="relative bg-brand-50 border border-brand-200 rounded-xl p-4 shadow-sm z-10 w-full md:w-3/4 mx-auto">
                    <span className="absolute -top-3 left-4 bg-brand-100 text-brand-800 text-[10px] font-bold px-2 py-0.5 rounded border border-brand-200 uppercase tracking-widest">Conceptual Level</span>
                    <div className="mt-2 text-center">
                        <div className="bg-white border border-brand-300 p-3 rounded shadow-sm text-[11px] text-brand-800 font-semibold">
                            Whole Database Structure
                            <div className="text-[9px] font-mono text-gray-500 mt-1 flex justify-center gap-4">
                                <span className="bg-gray-50 px-2 py-0.5 border border-gray-200 rounded">student table</span>
                                <span className="bg-gray-50 px-2 py-0.5 border border-gray-200 rounded">fee table</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full flex justify-center mt-[-10px] mb-[-10px] z-0">
                    <div className="bg-gray-100 border border-gray-300 px-3 py-1 rounded text-[9px] font-bold text-gray-600 uppercase tracking-widest relative">
                        Mapping
                        {/* Braces/Pointers for Physical Data Independence */}
                        <div className="hidden md:block absolute top-1/2 -translate-y-1/2 right-[110%] w-[150px] border-l-2 border-t-2 border-b-2 border-purple-400 h-28 rounded-l-lg p-2 flex items-center shadow-sm bg-purple-50">
                            <span className="text-[10px] font-bold text-purple-700 uppercase leading-tight ml-1 text-center w-full">Physical Data<br />Independence</span>
                        </div>
                    </div>
                </div>

                {/* Internal Level */}
                <div className="relative bg-purple-50 border border-purple-200 rounded-xl p-4 shadow-sm z-10 w-full md:w-3/4 mx-auto">
                    <span className="absolute -top-3 left-4 bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded border border-purple-200 uppercase tracking-widest">Internal Level</span>
                    <div className="mt-2 text-center">
                        <div className="bg-gray-800 border-2 border-gray-900 p-3 rounded-lg shadow-inner text-[11px] text-white font-semibold flex items-center justify-center gap-4">
                            Storage Hardware
                            <div className="text-[9px] font-mono text-gray-400 flex flex-col items-start text-left bg-gray-900 px-3 py-1 rounded">
                                <span>files</span>
                                <span>indexes (B-Trees)</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Callouts (fallback for mobile, complement for desktop) */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                <div className="bg-brand-50 border-l-4 border-brand-400 p-3 rounded shadow-sm">
                    <p className="text-[11px] font-bold text-brand-800 uppercase mb-1">Logical Independence</p>
                    <p className="text-[10px] text-brand-900">Split a table in two, keep the same view → applications unaffected.</p>
                </div>
                <div className="bg-purple-50 border-l-4 border-purple-400 p-3 rounded shadow-sm">
                    <p className="text-[11px] font-bold text-purple-800 uppercase mb-1">Physical Independence</p>
                    <p className="text-[10px] text-purple-900">Add an index to disk → conceptual schema & applications unaffected.</p>
                </div>
            </div>
        </div>
    );
}
