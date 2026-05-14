import React, { useState, useEffect } from 'react';

const getSocColor = (val) => {
  if (val >= 75) return '#009dff';
  if (val >= 50) return '#00ff59';
  if (val >= 25) return '#FFD600';
  return '#FF0000';
};

const getTempColor = (val) => {
  return val < 50 ? '#C8CCCE' : '#FF0000';
};

const getBrakeColor = (val) => {
  return val < 1.5 ? '#27F4D2' : '#FF0000';
};

const getTorqueColor = (val) => {
  return val >= 0 ? '#00EBFF' : '#FF8C00';
};

function App() {
  const [data, setData] = useState({
    speed: 0, bat_soc: 80, bat_temp: 35, bat_volt: 320, bat_curr: 0,
    accel_pedal: 0, brake_pedal: 0, accel_x: 0, accel_y: 0,
    brake_f: 1.0, brake_r: 0.9, t_fl: 50, t_fr: 50, t_rl: 45, t_rr: 45
  });

  const [history, setHistory] = useState(Array(80).fill(80));

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8765');

    ws.onmessage = (event) => {
      try {
        const wsData = JSON.parse(event.data);
        
        setData(prev => {
          setHistory(prevHist => [...prevHist.slice(1), wsData.bat_soc]);
          return {
            speed: Math.round(wsData.speed || 0),
            bat_soc: wsData.bat_soc || 0,
            bat_temp: (wsData.bat_temp || 0).toFixed(1),
            bat_volt: Math.round(wsData.bat_volt || 0),
            bat_curr: Math.round(wsData.bat_curr || 0),
            
            // --- 선배님 dummy_ws.py 데이터 이름과 1:1 매핑 ---
            accel_x: wsData.accel_x || 0,
            accel_y: wsData.accel_y || 0,
            
            accel_pedal: Math.round(wsData.accel_pedal || 0),
            brake_pedal: Math.round(wsData.brake_pedal || 0),
            
            // 브레이크 압력 필드명 수정 (brake_press_f -> brake_f)
            brake_f: (wsData.brake_press_f || 0).toFixed(1),
            brake_r: (wsData.brake_press_r || 0).toFixed(1),
            
            t_fl: Math.round(wsData.torque_fl || 0),
            t_fr: Math.round(wsData.torque_fr || 0),
            t_rl: Math.round(wsData.torque_rl || 0),
            t_rr: Math.round(wsData.torque_rr || 0),
          };
        });
      } catch (error) {
        console.error('데이터 파싱 에러:', error);
      }
    };

    return () => ws.close();
  }, []);

  const renderMultiColorPath = () => {
    const w = 300; const h = 100;
    const len = history.length;
    return history.map((val, i) => {
      if (i === 0) return null;
      const x1 = ((i - 1) / (len - 1)) * w;
      const y1 = h - (history[i - 1] / 100) * h;
      const x2 = (i / (len - 1)) * w;
      const y2 = h - (val / 100) * h;
      return (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={getSocColor(val)} strokeWidth="4" strokeLinecap="round" />
      );
    });
  };

  const boxStyle = { border: '1px solid #444', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' };
  const labelStyle = { position: 'absolute', top: '5px', left: '8px', fontSize: '10px', color: '#888', zIndex: 10, letterSpacing: '1px' };

  return (
    <div style={{
      backgroundColor: '#000', color: '#fff',
      width: '1024px', height: '600px',
      display: 'grid', gridTemplateColumns: '2.8fr 4.4fr 2.8fr', gridTemplateRows: 'repeat(5, 1fr)',
      fontFamily: 'Orbitron, sans-serif', padding: '6px', boxSizing: 'border-box'
    }}>
      
      {/* --- LEFT --- */}
      <div style={{ gridColumn: '1', gridRow: '1 / 6', display: 'grid', gridTemplateRows: '1.2fr 2.6fr 1.2fr' }}>
        <div style={{ ...boxStyle, fontSize: '46px', color: getTempColor(data.bat_temp), borderBottom: 'none' }}>
          {data.bat_temp}°C
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', border: '1px solid #444', borderBottom: 'none' }}>
          <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', borderRight: '1px solid #444' }}>
            <div style={{ ...boxStyle, border: 'none', borderBottom: '1px solid #444', fontSize: '26px', color: '#C8CCCE' }}>{data.bat_volt}V</div>
            <div style={{ ...boxStyle, border: 'none', fontSize: '26px', color: '#C8CCCE' }}>{data.bat_curr}A</div>
          </div>
          <div style={{ ...boxStyle, border: 'none', flexDirection: 'column' }}>
            <div style={{ width: '45%', height: '65%', border: '4px solid #fff', borderRadius: '4px', position: 'relative' }}>
              <div style={{ width: '50%', height: '10px', background: '#fff', position: 'absolute', top: '-14px', left: '25%' }} />
              <div style={{ width: '100%', height: `${data.bat_soc}%`, background: getSocColor(data.bat_soc), position: 'absolute', bottom: 0, transition: 'all 0.05s linear' }} />
            </div>
            <div style={{ fontSize: '36px', fontWeight: 'bold', marginTop: '12px', color: getSocColor(data.bat_soc) }}>{Math.round(data.bat_soc)}%</div>
          </div>
        </div>
        <div style={{ ...boxStyle, padding: '25px 8px 8px 8px' }}>
          <span style={labelStyle}>BATTERY DISCHARGE TREND</span>
          <svg viewBox="0 0 300 100" preserveAspectRatio="none" style={{ width: '100%', height: '85%', overflow: 'visible' }}>
            {renderMultiColorPath()}
            <circle cx="300" cy={100 - data.bat_soc} r="5" fill="#fff" />
          </svg>
        </div>
      </div>

      {/* --- CENTER --- */}
      <div style={{ gridColumn: '2', gridRow: '1 / 6', display: 'grid', gridTemplateRows: '12fr 4.5fr 1fr 1fr' }}>
        <div style={{ ...boxStyle, fontSize: '180px', fontWeight: '900', color: '#27F4D2', borderBottom: 'none' }}>{data.speed}</div>
        <div style={{ ...boxStyle, borderBottom: 'none', flexDirection: 'column', padding: '10px' }}>
          <span style={labelStyle}>G-FORCE</span>
          <svg viewBox="-3 -3 6 6" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            <circle cx="0" cy="0" r="2.5" fill="none" stroke="#333" strokeWidth="0.08" />
            {[0.3, 0.8, 1.3, 1.8, 2.3].map((r) => (
              <circle key={`grid-${r}`} cx="0" cy="0" r={r} fill="none" stroke="#394b55" strokeWidth="0.4" />
            ))}
            {/* 왼쪽 끝 2.5 추가 */}
              <text x="+5.2" y="0.1" fontSize="0.6" fill="#888" textAnchor="end">2.5G</text>
            <line x1="-2.7" y1="0" x2="2.7" y2="0" stroke="#666" strokeWidth="0.05" />
            <line x1="0" y1="-2.7" x2="0" y2="2.7" stroke="#666" strokeWidth="0.05" />
            
            {/* G-FORCE 실시간 점 연동 */}
            <circle
              cx={Number(data.accel_x)}
              cy={Number(data.accel_y)}
              r="0.15"
              fill="#CCFF00"
              style={{ transition: 'all 0.05s linear' }}
            />
          </svg>
        </div>
        <div style={{ ...boxStyle, padding: '0 25px', borderBottom: 'none' }}>
          <span style={labelStyle}>ACCEL</span>
          <div style={{ width: '100%', height: '25px', background: '#111', border: '1px solid #555' }}>
            <div style={{ width: `${data.accel_pedal}%`, height: '100%', background: '#C8CCCE', transition: 'width 0.05s linear' }} />
          </div>
        </div>
        <div style={{ ...boxStyle, padding: '0 25px' }}>
          <span style={labelStyle}>BRAKE</span>
          <div style={{ width: '100%', height: '25px', background: '#111', border: '1px solid #555' }}>
            <div style={{ width: `${data.brake_pedal}%`, height: '100%', background: '#C8CCCE', transition: 'width 0.05s linear' }} />
          </div>
        </div>
      </div>

      {/* --- RIGHT --- */}
      <div style={{ gridColumn: '3', gridRow: '1 / 6', display: 'grid', gridTemplateRows: '5fr 5fr' }}>
        <div style={{ ...boxStyle, borderBottom: 'none', padding: '15px' }}>
          <span style={labelStyle}>BRAKE PRESS</span>
          <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', gap: '50px', alignItems: 'center' }}>
            <div style={{ fontSize: '46px', fontWeight: 'bold', color: getBrakeColor(data.brake_f) }}>{data.brake_f}</div>
            <div style={{ fontSize: '46px', fontWeight: 'bold', color: getBrakeColor(data.brake_r) }}>{data.brake_r}</div>
          </div>
          <div style={{ flex: 1, height: '90%', position: 'relative' }}>
            <svg viewBox="0 0 100 200" preserveAspectRatio="none" style={{ height: '100%', width: '100%' }}>
              <path d="M50 0 L100 45 L75 45 L75 98 L25 98 L25 45 L0 45 Z" fill={getBrakeColor(data.brake_f)} />
              <rect x="25" y="102" width="50" height="98" fill={getBrakeColor(data.brake_r)} />
            </svg>
          </div>
        </div>
        <div style={{ ...boxStyle, display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr', gridTemplateRows: '1fr 1fr', padding: '15px' }}>
          <span style={labelStyle}>TORQUE (Nm)</span>
          {[
            { v: data.t_fl, r: 1, c: 1 }, { v: data.t_fr, r: 1, c: 3 },
            { v: data.t_rl, r: 2, c: 1 }, { v: data.t_rr, r: 2, c: 3 }
          ].map((t, i) => {
            const max = 1000; const min = -400; const range = max - min;
            const zeroPos = (max / range) * 100;
            const barHeight = (Math.abs(t.v) / range) * 100;
            const barTop = t.v >= 0 ? zeroPos - barHeight : zeroPos;
            return (
              <div key={i} style={{ gridRow: t.r, gridColumn: t.c, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '35px', height: '80px', background: '#111', border: '1px solid #444', position: 'relative' }}>
                  <div style={{ width: '100%', height: `${barHeight}%`, background: getTorqueColor(t.v), position: 'absolute', top: `${barTop}%`, transition: 'all 0.05s linear' }} />
                </div>
                <div style={{ fontSize: '14px', marginTop: '6px', color: getTorqueColor(t.v) }}>{t.v}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default App;