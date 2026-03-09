// src/DLQMonitor.tsx
import { useState, useEffect } from 'react';

export function DLQMonitor() {
    const [deadLetters, setDeadLetters] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchDLQ = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/dlq');
            const data = await res.json();
            if (Array.isArray(data)) {
                setDeadLetters(data);
            }
        } catch (err) {
            console.error("Failed to fetch DLQ:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDLQ();
        // Poll the DLQ every 5 seconds
        const interval = setInterval(fetchDLQ, 5000);
        return () => clearInterval(interval);
    }, []);

    const clearDlq = async () => {
        try {
            await fetch('http://localhost:3000/api/dlq', { method: 'DELETE' });
            setDeadLetters([])
        } catch (err) {
            console.error("Failed to clear DLQ:", err)
        }
    }

    if (loading) return null;

    const hasErrors = deadLetters.length > 0;

    return (
        <div style={{
            ...styles.card, borderColor: hasErrors ? 'rgba(239, 68, 68, 0.5)' : 'rgba(16, 185, 129, 0.2)', backgroundColor: hasErrors ? 'rgba(127, 29, 29, 0.3)' : 'rgba(17, 24, 39, 0.7)'
        }}>
            <div style={styles.header}>
                <h3 style={{ margin: 0, color: hasErrors ? '#991b1b' : '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {hasErrors ? 'Dead Letter Queue Alert' : 'System Health'}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontWeight: 'bold', color: hasErrors ? '#dc2626' : '#10b981' }}>
                        {deadLetters.length} Failed Events
                    </span>
                    {hasErrors && (
                        <button onClick={clearDlq}
                            style={{ padding: '4px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                        >Clear Dlq</button>
                    )}
                </div>
            </div>

            {hasErrors && (
                <div style={styles.list}>
                    {deadLetters.slice(0, 5).map((item, idx) => (
                        <div key={item._id || idx} style={styles.errorRow}>
                            <div>
                                <strong style={{ color: '#7f1d1d', display: 'block' }}>
                                    {item.payload?.original?.type || 'Unknown Event'}
                                </strong>
                                <span style={{ color: '#991b1b', fontSize: '12px', fontFamily: 'monospace' }}>
                                    User: {item.payload?.original?.userId || 'N/A'}
                                </span>
                            </div>
                            <div style={{ color: '#b91c1c', fontSize: '13px', textAlign: 'right', maxWidth: '50%' }}>
                                {item.payload?.error || 'Processing failed'}
                            </div>
                        </div>
                    ))}
                    {deadLetters.length > 5 && (
                        <div style={{ textAlign: 'center', fontSize: '12px', color: '#991b1b', marginTop: '8px' }}>
                            ...and {deadLetters.length - 5} more. Check backend logs.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

const styles: any = {
    card: { backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderRadius: '12px', padding: '16px', marginBottom: '24px', transition: 'all 0.3s', boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)', border: '1px solid' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    list: { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' },
    errorRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.2)' }
};