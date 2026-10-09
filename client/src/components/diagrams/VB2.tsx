export function VB2() {
    return (
        <div className="bg-white rounded-lg p-6 border border-gray-100 font-sans">
            <h4 className="text-sm font-semibold text-gray-800 mb-6 text-center">One Address Change, Three Files</h4>
            <div className="flex flex-col md:flex-row items-center md:items-stretch gap-6">
                {/* Step 1 */}
                <div className="flex-1 w-full bg-gray-50 border border-gray-200 rounded-xl p-4 relative">
                    <div className="absolute -top-3 left-4 bg-gray-200 text-gray-600 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full border border-gray-300">STEP 1</div>
                    <div className="text-xs font-semibold text-gray-600 mb-3 ml-2 mt-2">Same data in 3 files</div>
                    <div className="space-y-2">
                        {['Registrar', 'Hostel', 'Library'].map(t => (
                            <div key={t} className="bg-white border border-gray-200 rounded p-2 flex justify-between shadow-sm">
                                <span className="text-[10px] font-bold text-gray-500">{t} file:</span>
                                <span className="text-[10px] text-gray-700 font-mono">12 Lake Road</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="text-gray-300 text-lg md:rotate-0 rotate-90">→</div>

                {/* Step 2 */}
                <div className="flex-1 w-full bg-blue-50 border border-blue-200 rounded-xl p-4 relative">
                    <div className="absolute -top-3 left-4 bg-brand-100 text-brand-600 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full border border-brand-200">STEP 2</div>
                    <div className="text-xs font-semibold text-brand-700 mb-3 ml-2 mt-2">Update applied to two</div>
                    <div className="space-y-2">
                        {['Registrar', 'Hostel'].map(t => (
                            <div key={t} className="bg-green-50 border border-green-300 rounded p-2 flex justify-between shadow-sm relative overflow-hidden">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500"></div>
                                <span className="text-[10px] font-bold text-green-700 ml-1">{t} file:</span>
                                <span className="text-[10px] text-green-800 font-mono font-semibold">40 Hill Street</span>
                            </div>
                        ))}
                        <div className="bg-white border border-gray-300 rounded p-2 flex justify-between shadow-sm relative opacity-60">
                            <span className="text-[10px] font-bold text-gray-500">Library file:</span>
                            <span className="text-[10px] text-gray-500 font-mono line-through">12 Lake Road</span>
                        </div>
                    </div>
                </div>

                <div className="text-gray-300 text-lg md:rotate-0 rotate-90">→</div>

                {/* Step 3 */}
                <div className="flex-1 w-full bg-red-50 border border-red-200 rounded-xl p-4 relative">
                    <div className="absolute -top-3 left-4 bg-red-100 text-red-600 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-200">STEP 3</div>
                    <div className="text-xs font-semibold text-red-700 mb-3 ml-2 mt-2">Ask a question</div>
                    <div className="text-[11px] italic text-gray-700 mb-3 text-center">"Where does Asha live?"</div>
                    <div className="flex flex-col gap-2 relative">
                        <div className="bg-white border-2 border-red-400 rounded-lg p-3 text-center shadow-lg relative z-10 animate-pulse">
                            <div className="text-sm font-bold text-red-600">40 Hill Street?</div>
                            <div className="text-[10px] font-bold text-gray-400 my-1">OR</div>
                            <div className="text-sm font-bold text-red-600">12 Lake Road?</div>
                        </div>
                    </div>
                    <div className="text-[10px] text-center text-red-500 font-semibold mt-3">Two different answers</div>
                </div>
            </div>
        </div>
    );
}
