import { useEffect, useState } from "react"
import { io } from "socket.io-client";

export function LivePulse() {

    const [count, setCount] = useState(0);

    useEffect(() => {
        const socket = io('http://localhost:3000')

        socket.on('live_event', () => {
            setCount(prev => prev + 1)
        })

        return () => {
            socket.disconnect()
        };
    }, [])
    return (
        <div style={styles.card}>
            <div style={{ display: 'flex', alignItems: "center", gap: '12px' }}>
                <div style={styles.pulseDot}></div>
                <h3 style={styles.title}>Live Pulse</h3>
            </div>
            <div style={{ textAlign: 'right' }}>
                <div style={styles.label}>Event Processed</div>
                <div style={styles.number}>{count}</div>
            </div>
        </div>
    )
}

const styles: any = {
    card: {
        backgroundColor: 'rgb(17, 24, 39, 0.7)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '16px 24px', marginBottom: '24px', boxShadow: '0 4px 30px rgba(0, 0, 0, 0.8)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
    },
    title: {
        margin: 0, color: "#8898a8", fontSize: '18px'
    },
    label: {
        color: '#9ca3af', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold', marginBottom: '4px'
    },
    number: {
        color: '#d1d5db', fontSize: '32px', fontWeight: '900', lineHeight: '1'
    },
    pulseDot: {
        width: '10px', height: '10px', backgroundColor: '#10b981', borderRadius: '50%', boxShadow: '0 0 10px #10b981, 0 0 20px #10b981'
    }
}