export function VB6() {
    return (
        <div className="bg-white rounded-lg p-6 border border-gray-100 font-sans">
            <h4 className="text-sm font-semibold text-gray-800 mb-6 text-center">Do I need a DBMS?</h4>

            <div className="max-w-xl mx-auto flex flex-col items-center gap-1 relative pb-10">
                {/* Start Node */}
                <div className="bg-gray-800 text-white font-bold text-[10px] px-4 py-2 uppercase tracking-widest rounded-full shadow-md z-10">Start</div>
                <div className="h-4 w-px bg-gray-300"></div>

                {/* Q1 */}
                <div className="bg-blue-50 border border-blue-300 p-3 rounded-lg shadow-sm w-64 text-center z-10 relative">
                    <span className="text-xs font-semibold text-blue-800">Shared by several programs or people?</span>

                    {/* No branch -> Plain file (using absolute positioning to place it left) */}
                    <div className="hidden md:flex absolute top-1/2 -left-32 items-center">
                        <div className="bg-gray-50 border border-gray-300 px-3 py-2 rounded shadow-sm text-center">
                            <span className="text-[10px] font-bold text-gray-500 uppercase">NO</span>
                            <div className="text-xs font-semibold text-gray-700 mt-1">Plain File</div>
                        </div>
                        <div className="w-8 border-b-2 border-gray-300 border-dashed"></div>
                    </div>
                </div>
                <div className="h-4 w-px bg-gray-300"></div>

                {/* Q2 */}
                <div className="bg-blue-50 border border-blue-300 p-3 rounded-lg shadow-sm w-64 text-center z-10">
                    <span className="text-xs font-semibold text-blue-800">Must it live a long time?</span>
                </div>
                <div className="h-4 w-px bg-gray-300"></div>

                {/* Q3 */}
                <div className="bg-blue-50 border border-blue-300 p-3 rounded-lg shadow-sm w-64 text-center z-10">
                    <span className="text-xs font-semibold text-blue-800">Rules enforced (integrity, permissions)?</span>
                </div>
                <div className="h-4 w-px bg-gray-300 relative">
                    <span className="absolute -left-12 top-1 text-[9px] font-bold text-gray-500">YES</span>
                </div>

                {/* Q4 */}
                <div className="bg-blue-50 border border-blue-300 p-3 rounded-lg shadow-sm w-64 text-center z-10 relative">
                    <span className="text-xs font-semibold text-blue-800">Many users updating at once?</span>

                    {/* No branch -> Embedded (Right side) */}
                    <div className="hidden md:flex absolute top-1/2 -right-40 items-center">
                        <div className="w-12 border-b-2 border-gray-300 border-dashed"></div>
                        <div className="bg-purple-50 border border-purple-300 px-3 py-2 rounded shadow-sm text-center">
                            <span className="text-[10px] font-bold text-purple-500 uppercase">NO</span>
                            <div className="text-xs font-semibold text-purple-700 mt-1 whitespace-nowrap">Embedded DBMS</div>
                            <div className="text-[9px] text-purple-600 font-mono italic">(e.g. SQLite)</div>
                        </div>
                    </div>
                </div>
                <div className="h-6 w-px bg-gray-300 relative">
                    <span className="absolute left-2 top-2 text-[9px] font-bold text-gray-500">YES</span>
                </div>
                <div className="bg-brand-50 border-2 border-brand-400 p-3 rounded-xl shadow-md w-64 text-center z-10">
                    <div className="text-sm font-bold text-brand-700 mb-1">Server DBMS</div>
                    <div className="text-[9px] text-brand-600 font-mono italic">(e.g. Postgres, MySQL)</div>
                </div>

                {/* Mobile Fallback Context */}
                <div className="mt-8 text-center text-xs text-gray-500 md:hidden bg-gray-50 p-4 border border-gray-200 rounded">
                    <strong>Note:</strong> If every answer is NO, a plain file is perfectly fine. If sharing or rules are needed but there's a single app/no server, use an Embedded DBMS. If multiple users update at once, use a Server DBMS.
                </div>
            </div>
        </div>
    );
}
