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
            ...styles.card, borderColor: hasErrors ? '#fca5a5' : '#a7f3d0', backgroundColor: hasErrors ? '#fef2f2' : '#ecfdf5'
        }}>
            <div style={styles.header}>
                <h3 style={{ margin: 0, color: hasErrors ? '#991b1b' : '#065f46', display: 'flex', alignItems: 'center', gap: '8px' }}>
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
    card: { border: '1px solid', borderRadius: '12px', padding: '16px', marginBottom: '24px', transition: 'all 0.3s', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    list: { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' },
    errorRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: '#fee2e2', borderRadius: '6px', border: '1px solid #fecaca' }
};