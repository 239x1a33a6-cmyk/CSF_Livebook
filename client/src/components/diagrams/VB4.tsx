export function VB4() {
    return (
        <div className="bg-white rounded-lg p-6 border border-gray-100 font-sans flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 w-full flex justify-center items-center relative py-6">
                {/* Outer Circle (DBMS) */}
                <div className="w-64 h-64 border-4 border-gray-300 rounded-full bg-gray-50 flex flex-col items-center pt-4 relative shadow-inner">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">DBMS</span>
                    <span className="text-[10px] text-gray-400 mt-1">(Any Data Model)</span>

                    {/* Inner Circle (RDBMS) */}
                    <div className="w-52 h-48 border-4 border-blue-300 rounded-full bg-blue-50 mt-2 flex flex-col items-center pt-3 relative shadow-inner">
                        <span className="text-xs font-bold text-blue-700 uppercase tracking-widest">Relational DBMS</span>
                        <span className="text-[9px] text-blue-600 mt-0.5 px-3 text-center leading-tight">Data organized as relations (tables) with keys</span>

                        {/* Innermost Circle (SQL Products) */}
                        <div className="w-36 h-28 border-2 border-brand-400 rounded-full bg-brand-100 mt-2 flex flex-col items-center justify-center relative shadow-sm">
                            <span className="text-[10px] font-bold text-brand-800 text-center px-2 leading-tight uppercase">SQL Products</span>
                            <span className="text-[9px] text-brand-700 mt-1 text-center font-mono">PostgreSQL, MySQL<br />SQLite, Oracle</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full md:w-64 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg shadow-sm">
                <h5 className="text-xs font-bold text-yellow-800 mb-2 uppercase flex items-center gap-2">⚠️ Clarification</h5>
                <p className="text-xs text-yellow-900 leading-relaxed">
                    How closely real SQL products follow the pure "relational model" is debated. <strong>Relational</strong> describes the underlying theory, while the products execute practical variations (like SQL).
                </p>
                <div className="mt-4 pt-3 border-t border-yellow-200">
                    <p className="text-xs text-yellow-800 font-semibold italic">Every RDBMS is a DBMS. Not every DBMS is an RDBMS.</p>
                </div>
            </div>
        </div>
    );
}
