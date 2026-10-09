export function VB3() {
    return (
        <div className="bg-white rounded-lg p-6 border border-gray-100 font-sans">
            <h4 className="text-sm font-semibold text-gray-800 mb-6 text-center">A Transfer Interrupted by a Crash</h4>
            <div className="flex flex-col gap-8">
                {/* Lane 1: File-Processing */}
                <div className="relative border border-orange-200 bg-orange-50/50 rounded-xl p-4">
                    <span className="absolute -top-3 left-4 bg-orange-100 text-orange-800 text-[10px] font-bold px-2 py-0.5 rounded border border-orange-200">FILE-PROCESSING</span>
                    <div className="flex flex-col md:flex-row items-center gap-4 mt-3">
                        <div className="bg-white border border-gray-300 p-2 rounded shadow-sm flex-1 text-center">
                            <span className="text-xs font-semibold text-gray-700">Debit ₹500 from A</span>
                            <div className="text-[10px] text-green-600 mt-1 italic w-full text-center">(Written to disk)</div>
                        </div>
                        <div className="text-orange-500 font-bold text-xl md:rotate-0 rotate-90">→</div>
                        <div className="bg-red-500 text-white font-bold px-4 py-2 rounded-lg flex items-center justify-center transform -rotate-6 shadow-lg border-2 border-red-700">
                            💥 CRASH
                        </div>
                        <div className="text-orange-500 font-bold text-xl md:rotate-0 rotate-90">→</div>
                        <div className="bg-white border border-gray-300 p-2 rounded shadow-sm opacity-50 flex-1 text-center">
                            <span className="text-xs font-semibold text-gray-500 line-through">Credit ₹500 to B</span>
                            <div className="text-[10px] text-red-500 mt-1 italic w-full text-center">(Never happens)</div>
                        </div>
                    </div>
                    <div className="mt-4 p-2 bg-orange-100 rounded text-center text-xs font-bold text-orange-900 border border-orange-200">
                        Result: ₹500 has vanished from the system.
                    </div>
                </div>

                {/* Lane 2: DBMS */}
                <div className="relative border border-green-200 bg-green-50/50 rounded-xl p-4">
                    <span className="absolute -top-3 left-4 bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded border border-green-200">DBMS (TRANSACTION)</span>
                    <div className="flex flex-col md:flex-row items-center gap-4 mt-3">
                        <div className="bg-blue-100 border-2 border-blue-400 p-2 rounded shadow-sm flex-1 text-center relative overflow-visible">
                            <div className="absolute -top-3 -right-2 bg-blue-500 text-white text-[8px] font-bold px-1 rounded-sm uppercase tracking-wider">Start Unit</div>
                            <span className="text-xs font-semibold text-blue-900">Debit ₹500 from A</span>
                        </div>
                        <div className="text-green-500 font-bold text-xl md:rotate-0 rotate-90">→</div>
                        <div className="bg-red-500 text-white font-bold px-4 py-2 rounded-lg flex items-center justify-center transform 6 shadow-lg border-2 border-red-700">
                            💥 CRASH
                        </div>
                        <div className="text-green-500 font-bold text-xl md:rotate-0 rotate-90">→</div>
                        <div className="bg-white border-2 border-green-400 p-2 rounded flex-1 text-center shadow-lg relative">
                            <span className="text-xs font-semibold text-green-700">DBMS Rolled Back</span>
                            <div className="text-[10px] text-green-600 mt-1 italic w-full text-center">(Undo unfinished work)</div>
                        </div>
                    </div>
                    <div className="mt-4 p-2 bg-green-100 rounded text-center text-xs font-bold text-green-900 border border-green-200">
                        Result: Accounts A and B remain completely unchanged.
                    </div>
                </div>
            </div>
        </div>
    );
}
