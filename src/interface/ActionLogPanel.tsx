import { Check, ChevronDown, ChevronRight, Copy, Download, Eye, Filter, MessageSquare, Terminal, Zap } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { getAgentSet, getAllAgents } from '../data/agents'
import { USER_COLOR, USER_COLOR_LIGHT } from '../theme/brand'
import { DebugLogEntry, useCoreStore } from '../integration/store/coreStore'
import { useTeamStore, useActiveTeam } from '../integration/store/teamStore'
import { formatTokens } from './ProjectView'

function formatTime(ts: number): string {
    return new Date(ts).toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    })
}

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleCopy}
            className={`p-1 transition-all cursor-pointer ${copied ? 'text-emerald-500' : 'opacity-40 hover:opacity-90'}`}
            style={copied ? undefined : { color: 'var(--fg-base)' }}
            title="Copy to clipboard"
        >
            {copied ? <Check size={10} /> : <Copy size={10} />}
        </button>
    );
};

const DebugEntryView: React.FC<{ entry: DebugLogEntry }> = ({ entry }) => {
    const [isOpen, setIsOpen] = useState(false);
    const activeTeam = useActiveTeam();
    const agents = getAllAgents(activeTeam);
    const agent = entry.agentIndex === -1
        ? { name: 'System', color: '#71717a' }
        : agents.find(a => a.index === entry.agentIndex);

    const totalTools = entry.phase === 'request'
        ? entry.systemTools?.reduce((acc: number, t: any) => acc + (t.functionDeclarations?.length || 0), 0) || 0
        : 0;

    const fullContent = `
AGENT: ${agent?.name} (${entry.phase})
TIME: ${formatTime(entry.timestamp)}
PHASE: ${entry.phase}

${entry.phase === 'request' ? `
SYSTEM INSTRUCTION:
${entry.systemInstruction || 'None'}

USER BRIEF / MESSAGES:
${JSON.stringify(entry.contents, null, 2)}
` : `
CONTENT:
${entry.content || 'None'}

RAW RESPONSE:
${JSON.stringify(entry.raw, null, 2)}
`}
    `.trim();

    return (
        <div className="py-3 group" style={{ borderBottom: '3px solid var(--stroke)' }}>
            <div className="flex items-center gap-1 mb-1 pr-1">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex-1 flex items-center justify-between text-left p-1 transition-colors cursor-pointer hover:opacity-80"
                >
                    <div className="flex flex-col gap-1.5 w-full">
                        <div className="flex items-center justify-between w-full overflow-hidden">
                            <div className="flex flex-col gap-1 overflow-hidden">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: agent?.color ?? '#ccc' }} />
                                    <span className="text-[10px] font-black uppercase tracking-widest leading-none truncate font-sketch" style={{ color: 'var(--fg-base)' }}>
                                        {agent?.name}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 ml-4">
                                    <span
                                        className="text-[8px] font-bold px-1.5 py-0.5 uppercase tracking-tighter whitespace-nowrap"
                                        style={entry.phase === 'request' ? {
                                            backgroundColor: USER_COLOR_LIGHT,
                                            color: USER_COLOR,
                                            border: `2px solid ${USER_COLOR}`,
                                            borderRadius: 0,
                                        } : {
                                            backgroundColor: '#ecfdf5',
                                            color: '#059669',
                                            border: '2px solid #059669',
                                            borderRadius: 0,
                                        }}
                                    >
                                        {entry.phase}
                                    </span>
                                    {entry.phase === 'response' && entry.usage && (
                                        <span className="text-[8px] font-mono font-bold px-1 py-0.5 leading-none whitespace-nowrap" style={{ color: 'var(--fg-base)', opacity: 0.6, border: '2px solid var(--stroke)', borderRadius: 0 }}>
                                            T: {formatTokens(entry.usage.totalTokens)}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 self-start mt-0.5">
                                <span className="text-[8px] font-mono" style={{ color: 'var(--fg-base)', opacity: 0.55 }}>{formatTime(entry.timestamp)}</span>
                                {isOpen ? <ChevronDown size={12} style={{ color: 'var(--fg-base)', opacity: 0.5 }} /> : <ChevronRight size={12} style={{ color: 'var(--fg-base)', opacity: 0.5 }} />}
                            </div>
                        </div>

                        {/* Summary of tool calls in preview */}
                        {entry.phase === 'response' && entry.tool_calls && entry.tool_calls.length > 0 && !isOpen && (
                            <div className="flex flex-wrap gap-1 pl-4">
                                {entry.tool_calls.map((tc, i) => (
                                    <span key={i} className="flex items-center gap-1 text-[8px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5" style={{ border: '2px solid #059669', borderRadius: 0 }}>
                                        <Zap size={8} />
                                        {tc.function?.name || '(unknown)'}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </button>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <CopyButton text={fullContent} />
                </div>
            </div>

            {isOpen && (
                <div className="mt-2 space-y-2 pl-4 border-l-[3px]" style={{ borderColor: 'var(--stroke)' }}>
                    {entry.phase === 'request' ? (
                        <>
                            {/* System Instruction — collapsed by default */}
                            {entry.systemInstruction && (
                                <details className="group/sp">
                                    <summary className="flex items-center justify-between gap-1.5 py-1 cursor-pointer list-none">
                                        <div className="flex items-center gap-1.5 opacity-50 hover:opacity-100 transition-opacity" style={{ color: 'var(--fg-base)' }}>
                                            <ChevronRight size={10} className="group-open/sp:rotate-90 transition-transform" />
                                            <Terminal size={10} />
                                            <span className="font-sketch uppercase tracking-[1.5px] text-[9px]">System Instruction</span>
                                        </div>
                                        <div onClick={e => e.stopPropagation()}>
                                            <CopyButton text={entry.systemInstruction} />
                                        </div>
                                    </summary>
                                    <pre className="mt-1.5 text-[10px] p-2 leading-relaxed whitespace-pre-wrap font-mono" style={{ background: 'var(--bg-surface)', color: 'var(--fg-base)', border: '3px solid var(--stroke)', borderRadius: 0 }}>
                                        {entry.systemInstruction}
                                    </pre>
                                </details>
                            )}

                            {/* Tools — collapsed by default */}
                            <details className={`group/tools ${totalTools === 0 ? 'pointer-events-none' : ''}`}>
                                <summary className="flex items-center justify-between gap-1.5 py-1 cursor-pointer list-none">
                                    <div className={`flex items-center gap-1.5 ${totalTools === 0 ? 'opacity-20' : 'opacity-50 hover:opacity-100 transition-opacity'}`} style={{ color: 'var(--fg-base)' }}>
                                        <ChevronRight size={10} className={`group-open/tools:rotate-90 transition-transform ${totalTools === 0 ? 'invisible' : ''}`} />
                                        <Zap size={10} />
                                        <span className="font-sketch uppercase tracking-[1.5px] text-[9px]">System Tools ({totalTools})</span>
                                    </div>
                                    {totalTools > 0 && (
                                        <div onClick={e => e.stopPropagation()}>
                                            <CopyButton text={JSON.stringify(entry.systemTools, null, 2)} />
                                        </div>
                                    )}
                                </summary>
                                {totalTools > 0 && (
                                    <div className="mt-1.5 flex flex-wrap gap-1 p-2" style={{ background: 'var(--bg-surface)', border: '3px solid var(--stroke)', borderRadius: 0 }}>
                                        {entry.systemTools.map((toolGroup, i) => (
                                            <React.Fragment key={i}>
                                                {toolGroup.functionDeclarations?.map((fd: any, j: number) => (
                                                    <span key={j} className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5" style={{ border: '2px solid #059669', borderRadius: 0 }}>
                                                        {fd.name}
                                                    </span>
                                                ))}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                )}
                            </details>

                            {/* Contents Array — collapsed by default */}
                            {entry.contents && entry.contents.length > 0 && (
                                <details className="group/msgs" open>
                                    <summary className="flex items-center justify-between gap-1.5 py-1 cursor-pointer list-none">
                                        <div className="flex items-center gap-1.5 opacity-50 hover:opacity-100 transition-opacity" style={{ color: 'var(--fg-base)' }}>
                                            <ChevronRight size={10} className="group-open/msgs:rotate-90 transition-transform" />
                                            <MessageSquare size={10} />
                                            <span className="font-sketch uppercase tracking-[1.5px] text-[9px]">Contents / Messages ({entry.contents.length})</span>
                                        </div>
                                        <div onClick={e => e.stopPropagation()}>
                                            <CopyButton text={JSON.stringify(entry.contents, null, 2)} />
                                        </div>
                                    </summary>
                                    <div className="mt-2 space-y-2 max-h-80 overflow-y-auto pr-1 customize-scrollbar border-l-[3px] pl-2" style={{ borderColor: 'var(--stroke)' }}>
                                        {entry.contents.map((m, i) => (
                                            <div key={i} className="p-2 group/msg transition-all" style={m.role === 'user' ? {
                                                background: 'var(--bg-surface)', border: '3px solid var(--stroke)', borderRadius: 0
                                            } : {
                                                background: 'rgba(5,150,105,0.06)', border: '3px solid #059669', borderRadius: 0
                                            }}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-sketch uppercase tracking-[1.5px] text-[8px]" style={{ color: m.role === 'user' ? 'var(--fg-base)' : '#059669', opacity: m.role === 'user' ? 0.6 : 1 }}>{m.role}</span>
                                                    <div className="opacity-0 group-hover/msg:opacity-100 transition-opacity">
                                                        <CopyButton text={JSON.stringify(m, null, 2)} />
                                                    </div>
                                                </div>
                                                <div className="mt-1.5 space-y-2">
                                                    {/* Standard content (string) support */}
                                                    {m.content && (
                                                        <div className="text-[10px] leading-relaxed font-mono whitespace-pre-wrap py-1" style={{ color: 'var(--fg-base)', opacity: 0.85 }}>
                                                            {m.content}
                                                        </div>
                                                    )}

                                                    {/* Standard tool_calls support */}
                                                    {m.tool_calls && m.tool_calls.length > 0 && (
                                                        <div className="space-y-2 mt-2">
                                                            {m.tool_calls.map((tc: any, idx: number) => (
                                                                <div key={idx} className="overflow-hidden" style={{ background: '#1A1521', border: '3px solid var(--stroke)', borderRadius: 0 }}>
                                                                    <div className="px-2.5 py-1.5 flex items-center justify-between" style={{ borderBottom: '2px solid rgba(245,241,232,0.15)' }}>
                                                                        <span className="text-[9px] font-black text-emerald-400 font-mono tracking-wider">{tc.function?.name}</span>
                                                                        <span className="text-[8px] font-bold uppercase tracking-tighter" style={{ color: '#9C95A8' }}>Call</span>
                                                                    </div>
                                                                    <div className="p-2.5">
                                                                        <pre className="text-[9px] font-mono wrap-break-word whitespace-pre-wrap" style={{ color: '#F5F1E8' }}>
                                                                            {tc.function?.arguments}
                                                                        </pre>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </details>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="pt-2">
                                <div className="flex items-center justify-between gap-1.5 mb-1.5 opacity-50" style={{ color: 'var(--fg-base)' }}>
                                    <div className="flex items-center gap-1.5">
                                        <MessageSquare size={10} />
                                        <span className="font-sketch uppercase tracking-[1.5px] text-[9px]">Response Details</span>
                                    </div>
                                    <CopyButton text={entry.content || ''} />
                                </div>
                                <div className="space-y-3">
                                    {/* Formatted Text Content */}
                                    {entry.content && (
                                        <div className="text-[11px] p-3 leading-relaxed relative italic whitespace-pre-wrap font-hand" style={{ background: 'var(--bg-surface)', color: 'var(--fg-base)', border: '3px solid var(--stroke)', borderRadius: 0 }}>
                                            <div className="absolute -top-2 left-2 px-1 font-sketch uppercase tracking-[1px] text-[8px]" style={{ background: 'var(--bg-base)', color: 'var(--fg-base)', border: '2px solid var(--stroke)', borderRadius: 0 }}>Text</div>
                                            {entry.content}
                                        </div>
                                    )}

                                    {/* Formatted Tool Calls */}
                                    {entry.tool_calls && entry.tool_calls.length > 0 && (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-1.5 ml-1">
                                                <Zap size={10} className="text-emerald-500" />
                                                <span className="font-sketch uppercase tracking-[1.5px] text-[9px] text-emerald-600">Tool calls</span>
                                            </div>
                                            {entry.tool_calls.map((tc, i) => {
                                                const name = tc.function?.name || '(unknown)';
                                                let args: Record<string, unknown> | null = null;
                                                try { args = JSON.parse(tc.function?.arguments ?? '{}'); } catch { args = (tc as any).args ?? null; }
                                                return (
                                                    <div key={i} className="overflow-hidden" style={{ background: '#1A1521', border: '3px solid var(--stroke)', borderRadius: 0 }}>
                                                        <div className="px-2.5 py-1.5 flex items-center justify-between" style={{ borderBottom: '2px solid rgba(245,241,232,0.15)' }}>
                                                            <span className="text-[10px] font-black text-emerald-400 font-mono tracking-wider">{name}</span>
                                                            <span className="text-[8px] font-bold uppercase tracking-tighter" style={{ color: '#9C95A8' }}>Arguments</span>
                                                        </div>
                                                        <div className="p-2.5">
                                                            {args && Object.keys(args).length > 0 ? (
                                                                <div className="space-y-1.5">
                                                                    {Object.entries(args).map(([key, value]) => (
                                                                        <div key={key} className="flex flex-col gap-0.5">
                                                                            <span className="text-[8px] font-bold uppercase tracking-tighter" style={{ color: '#9C95A8' }}>{key}</span>
                                                                            <div className="text-[9px] font-mono p-1.5 wrap-break-word whitespace-pre-wrap" style={{ color: '#F5F1E8', background: 'rgba(245,241,232,0.06)', border: '2px solid rgba(245,241,232,0.15)', borderRadius: 0 }}>
                                                                                {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <span className="text-[9px] italic" style={{ color: '#9C95A8' }}>No arguments</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Raw LLM Response — collapsed by default */}
                            {entry.raw && (
                                <details className="group/raw">
                                    <summary className="flex items-center justify-between gap-1.5 py-1 cursor-pointer list-none">
                                        <div className="flex items-center gap-1.5 opacity-50 hover:opacity-100 transition-opacity" style={{ color: 'var(--fg-base)' }}>
                                            <ChevronRight size={10} className="group-open/raw:rotate-90 transition-transform" />
                                            <Download size={10} />
                                            <span className="font-sketch uppercase tracking-[1.5px] text-[9px]">Raw LLM Response</span>
                                        </div>
                                        <div onClick={e => e.stopPropagation()}>
                                            <CopyButton text={JSON.stringify(entry.raw, null, 2)} />
                                        </div>
                                    </summary>
                                    <pre className="mt-1.5 text-[9px] p-2 leading-relaxed whitespace-pre overflow-x-auto font-mono" style={{ background: '#1A1521', color: '#F5F1E8', border: '3px solid var(--stroke)', borderRadius: 0 }}>
                                        {JSON.stringify(entry.raw, null, 2)}
                                    </pre>
                                </details>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export function ActionLogPanel() {
    const { setLogOpen, actionLog, debugLog, logFilterAgentIndex } = useCoreStore()
    const activeTeam = useActiveTeam();
    const agents = getAllAgents(activeTeam);
    const [activeTab, setActiveTab] = useState<'activity' | 'technical'>('technical')
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false)
    const topRef = useRef<HTMLDivElement>(null)

    const handleDownloadAll = () => {
        const content = debugLog.map(entry => {
            const agent = entry.agentIndex === -1
                ? { name: 'System' }
                : agents.find(a => a.index === entry.agentIndex);
            return `
=========================================
AGENT: ${agent?.name} (${entry.phase})
TIME: ${new Date(entry.timestamp).toLocaleString()}
PHASE: ${entry.phase}
=========================================

${entry.phase === 'request' ? `
SYSTEM INSTRUCTION:
${entry.systemInstruction || 'None'}

USER BRIEF / MESSAGES:
${JSON.stringify(entry.contents, null, 2)}

SYSTEM TOOLS:
${JSON.stringify(entry.systemTools, null, 2)}
` : `
CONTENT:
${entry.content || 'None'}

TOOL CALLS:
${JSON.stringify(entry.tool_calls || [], null, 2)}

RAW RESPONSE:
${JSON.stringify(entry.raw, null, 2)}
`}
`.trim();
        }).join('\n\n\n');

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kanban-agents-technical-logs-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Auto-scroll to top when a new log entry arrives (since order is reversed)
    useEffect(() => {
        setTimeout(() => topRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    }, [actionLog, debugLog, activeTab])

    const filterAgent =
        logFilterAgentIndex !== null ? agents.find(a => a.index === logFilterAgentIndex) ?? null : null

    const entries =
        logFilterAgentIndex !== null
            ? actionLog.filter((e) => e.agentIndex === logFilterAgentIndex).reverse()
            : [...actionLog].reverse()

    const debugEntries =
        logFilterAgentIndex !== null
            ? debugLog.filter((e) => e.agentIndex === logFilterAgentIndex).reverse()
            : [...debugLog].reverse()

    return (
        <div className="w-[320px] h-full border-r-[3px] flex flex-col pointer-events-auto overflow-hidden shrink-0 relative" style={{ background: 'var(--bg-base)', borderColor: 'var(--stroke)' }}>
            {/* Header */}
            <div className="h-10 px-5 border-b-[3px] flex items-center justify-between shrink-0 z-10" style={{ background: 'var(--bg-base)', borderColor: 'var(--stroke)' }}>
                <div className="flex items-center gap-2">
                    <span className="font-sketch uppercase tracking-[1.5px] text-[11px]" style={{ color: 'var(--fg-base)', opacity: 0.7 }}>Logs</span>
                    {filterAgent && (
                        <div
                            className="flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-tighter animate-in fade-in zoom-in duration-200"
                            style={{ backgroundColor: filterAgent.color, border: '2px solid var(--stroke)', borderRadius: 0 }}
                        >
                            {filterAgent.name}
                            <button
                                onClick={() => setLogOpen(true, null)}
                                className="hover:scale-110 transition-transform cursor-pointer"
                            >
                                ×
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <button
                            onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                            className="p-1.5 transition-colors cursor-pointer"
                            style={isFilterMenuOpen || logFilterAgentIndex !== null
                                ? { background: 'var(--fg-base)', color: 'var(--bg-base)', border: '2px solid var(--stroke)', borderRadius: 0 }
                                : { color: 'var(--fg-base)', opacity: 0.6, border: '2px solid transparent', borderRadius: 0 }}
                            title="Filter by agent"
                        >
                            <Filter size={14} />
                        </button>

                        {isFilterMenuOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-20"
                                    onClick={() => setIsFilterMenuOpen(false)}
                                />
                                <div className="absolute right-0 mt-2 w-48 z-30 py-1.5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200" style={{ background: 'var(--bg-base)', border: '3px solid var(--stroke)', boxShadow: '4px 4px 0 0 var(--stroke)', borderRadius: 0 }}>
                                    <button
                                        onClick={() => {
                                            setLogOpen(true, null);
                                            setIsFilterMenuOpen(false);
                                        }}
                                        className="w-full px-4 py-2 text-left font-sketch uppercase tracking-[1.5px] text-[10px] flex items-center gap-2 transition-colors hover:opacity-80"
                                        style={{ color: 'var(--fg-base)', opacity: logFilterAgentIndex === null ? 1 : 0.55 }}
                                    >
                                        <div className="w-2 h-2 rounded-full" style={logFilterAgentIndex === null ? { background: 'var(--fg-base)' } : { border: '2px solid var(--stroke)' }} />
                                        All Agents
                                    </button>
                                    <div className="h-[2px] my-1" style={{ background: 'var(--stroke)', opacity: 0.3 }} />
                                    {agents.map((agent) => (
                                        <button
                                            key={agent.index}
                                            onClick={() => {
                                                setLogOpen(true, agent.index);
                                                setIsFilterMenuOpen(false);
                                            }}
                                            className="w-full px-4 py-2 text-left font-sketch uppercase tracking-[1.5px] text-[10px] flex items-center gap-2 transition-colors hover:opacity-80"
                                            style={{ color: 'var(--fg-base)', opacity: logFilterAgentIndex === agent.index ? 1 : 0.55 }}
                                        >
                                            <div
                                                className="w-2 h-2 rounded-full"
                                                style={{ backgroundColor: agent.color }}
                                            />
                                            {agent.name}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {activeTab === 'technical' && debugEntries.length > 0 && (
                        <button
                            onClick={handleDownloadAll}
                            className="transition-opacity p-1 cursor-pointer opacity-60 hover:opacity-100"
                            style={{ color: 'var(--fg-base)' }}
                            title="Download all as .txt"
                        >
                            <Download size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex border-b-[3px]" style={{ borderColor: 'var(--stroke)', background: 'var(--bg-surface)' }}>
                <button
                    onClick={() => setActiveTab('activity')}
                    className="flex-1 py-2 font-sketch uppercase tracking-[1.5px] text-[10px] transition-all cursor-pointer"
                    style={activeTab === 'activity'
                        ? { background: 'var(--bg-base)', borderBottom: '3px solid var(--stroke)', color: 'var(--fg-base)' }
                        : { color: 'var(--fg-base)', opacity: 0.5 }}
                >
                    Activity
                </button>
                <button
                    onClick={() => setActiveTab('technical')}
                    className="flex-1 py-2 font-sketch uppercase tracking-[1.5px] text-[10px] transition-all cursor-pointer"
                    style={activeTab === 'technical'
                        ? { background: 'var(--bg-base)', borderBottom: '3px solid var(--stroke)', color: 'var(--fg-base)' }
                        : { color: 'var(--fg-base)', opacity: 0.5 }}
                >
                    Technical
                </button>
            </div>

            {/* Entries */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div ref={topRef} />

                {activeTab === 'activity' ? (
                    entries.length === 0 ? (
                        <p className="font-sketch uppercase tracking-[1.5px] text-[10px] text-center py-16" style={{ color: 'var(--fg-base)', opacity: 0.4 }}>Awaiting actions...</p>
                    ) : (
                        entries.map((entry) => {
                            const agent = agents.find(a => a.index === entry.agentIndex)
                            return (
                                <div key={entry.id} className="flex flex-col gap-1.5 group">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-1.5 h-1.5 rounded-full"
                                                style={{ backgroundColor: agent?.color ?? '#e4e4e7' }}
                                            />
                                            <span className="text-[10px] font-black uppercase tracking-widest leading-none font-sketch" style={{ color: 'var(--fg-base)' }}>
                                                {agent?.name ?? 'System'}
                                            </span>
                                        </div>
                                        <span className="text-[9px] font-medium font-mono" style={{ color: 'var(--fg-base)', opacity: 0.5 }}>
                                            {formatTime(entry.timestamp)}
                                        </span>
                                    </div>

                                    <div className="pl-3.5 border-l-[3px] transition-colors" style={{ borderColor: 'var(--stroke)' }}>
                                        <p className="text-xs leading-relaxed font-hand" style={{ color: 'var(--fg-base)', opacity: 0.85 }}>
                                            {entry.action}
                                        </p>
                                    </div>
                                </div>
                            )
                        })
                    )
                ) : (
                    debugEntries.length === 0 ? (
                        <p className="font-sketch uppercase tracking-[1.5px] text-[10px] text-center py-16" style={{ color: 'var(--fg-base)', opacity: 0.4 }}>No technical data...</p>
                    ) : (
                        debugEntries.map((entry) => (
                            <DebugEntryView key={entry.id} entry={entry} />
                        ))
                    )
                )}
            </div>
        </div>
    )
}
