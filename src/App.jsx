import React, { useState, useEffect } from 'react';

// 1. Bat_SOC용 색상 함수
const getSocColor = (val) => {
  if (val >= 75) return '#009dff'; 
  if (val >= 50) return '#00ff59'; 
  if (val >= 25) return '#FFD600'; 
  return '#FF0000'; 
};

// 2. Bat_Temp용 색상 함수
const getTempColor = (val) => {
  return val < 50 ? '#C8CCCE' : '#FF0000';
};

// 3. Brake_Press용 색상 함수
const getBrakeColor = (val) => {
  return val < 80 ? '#27F4D2' : '#FF0000';
};

// 4. Torque용 색상 함수 (추가)
const getTorqueColor = (val) => {
  return val >= 0 ? '#00EBFF' : '#FF8C00';
};

function App() {
  const [data, setData] = useState({
    speed: 197, bat_soc: 100, bat_temp: 30, bat_volt: 400, bat_curr: 88,
    accel_pedal: 80, brake_pedal: 40, accel_x: "0.00", accel_y: "0.00",
    brake_f: 10, brake_r: 20, t_fl: 43, t_fr: 90, t_rl: 10, t_rr: 48
  });

  const [history, setHistory] = useState(Array(80).fill(100));

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        // 1. 배터리 SOC 및 기본 전압 계산 (SOC는 서서히 줄어들어야 하므로 유지)
        const nextSoc = prev.bat_soc <= 1 ? 100 : prev.bat_soc - Math.floor(Math.random()*3.5);
        const nextVolt = (350 + (nextSoc / 100) * 50).toFixed(0);
        const nextCurr = (60 + Math.random() * 20).toFixed(0);
        
        // 2. 배터리 온도 (15~60도 범위, 30도 근처 요동, 전 값과 무관하게 생성)
        // Math.random() * 45 + 15 => 15 ~ 60 범위 생성
        const nextTemp = (Math.random() * 45 + 15).toFixed(1);

        // 3. 가속도 X, Y 시뮬레이션
        const nextAccelX = (Math.random() * 2 - 1).toFixed(2);
        const nextAccelY = (Math.random() * 2 - 1).toFixed(2);

        // 4. 브레이크 프레스 (20~100 범위 생성)
        const nextBrakeF = Math.floor(Math.random() * 81 + 20); // 20 ~ 100
        const nextBrakeR = Math.floor(Math.random() * 81 + 20); // 20 ~ 100

        // 5. 토크 계산 (-400 ~ 1000 범위 생성)
        const generateTorque = () => Math.floor(Math.random() * 1401 - 400);

        setHistory(prevHist => [...prevHist.slice(1), nextSoc]);

        return {
          ...prev,
          // 속도: 0 ~ 190 범위
          speed: Math.floor(Math.random() * 191),
          bat_soc: nextSoc,
          bat_temp: nextTemp,
          bat_volt: nextVolt,
          bat_curr: nextCurr,
          accel_x: nextAccelX,
          accel_y: nextAccelY,
          accel_pedal: Math.floor(Math.random() * 100),
          brake_pedal: Math.floor(Math.random() * 100),
          // 브레이크 프레스 적용
          brake_f: nextBrakeF,
          brake_r: nextBrakeR,
          // 토크 적용
          t_fl: generateTorque(), 
          t_fr: generateTorque(),
          t_rl: generateTorque(), 
          t_rr: generateTorque(),
        };
      });
    }, 200);

    return () => clearInterval(interval);
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
  const labelStyle = { position: 'absolute', top: '3px', left: '6px', fontSize: '0.7vw', color: '#888', zIndex: 10 };

  return (
    <div style={{
      backgroundColor: '#000', color: '#fff', height: '100vh', width: '100vw',
      display: 'grid', gridTemplateColumns: '2.8fr 4.4fr 2.8fr', gridTemplateRows: 'repeat(5, 1fr)',
      fontFamily: 'Orbitron, sans-serif', padding: '4px', boxSizing: 'border-box'
    }}>
      
      {/* --- LEFT AREA --- */}
      <div style={{ gridColumn: '1', gridRow: '1 / 6', display: 'grid', gridTemplateRows: '1.2fr 2.6fr 1.2fr' }}>
        <div style={{ ...boxStyle, fontSize: '4.5vw', color: getTempColor(data.bat_temp), borderBottom: 'none' }}>
          {data.bat_temp}°C
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', border: '1px solid #444', borderBottom: 'none' }}>
          <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', borderRight: '1px solid #444' }}>
            <div style={{ ...boxStyle, border: 'none', borderBottom: '1px solid #444', fontSize: '2.5vw', color: '#C8CCCE' }}>{data.bat_volt}V</div>
            <div style={{ ...boxStyle, border: 'none', fontSize: '2.5vw', color: '#C8CCCE' }}>{data.bat_curr}A</div>
          </div>
          <div style={{ ...boxStyle, border: 'none', flexDirection: 'column' }}>
            <div style={{ width: '45%', height: '65%', border: '4px solid #fff', borderRadius: '4px', position: 'relative' }}>
              <div style={{ width: '50%', height: '10px', background: '#fff', position: 'absolute', top: '-14px', left: '25%' }} />
              <div style={{ width: '100%', height: `${data.bat_soc}%`, background: getSocColor(data.bat_soc), position: 'absolute', bottom: 0, transition: 'all 0.4s' }} />
            </div>
            <div style={{ fontSize: '3.5vw', fontWeight: 'bold', marginTop: '12px', color: getSocColor(data.bat_soc) }}>{Math.round(data.bat_soc)}%</div>
          </div>
        </div>

        <div style={{ ...boxStyle, padding: '25px 8px 8px 8px' }}>
          <span style={labelStyle}>BATTERY DISCHARGE TREND</span>
          <svg viewBox="0 0 300 100" preserveAspectRatio="none" style={{ width: '100%', height: '85%', overflow: 'visible' }}>
            <line x1="0" y1="0" x2="300" y2="0" stroke="#222" strokeWidth="1" />
            <line x1="0" y1="50" x2="300" y2="50" stroke="#222" strokeWidth="1" />
            <line x1="0" y1="100" x2="300" y2="100" stroke="#222" strokeWidth="1" />
            {renderMultiColorPath()}
            <circle cx="300" cy={100 - data.bat_soc} r="5" fill="#fff" />
          </svg>
        </div>
      </div>

      {/* --- CENTER AREA --- */}
      <div style={{ gridColumn: '2', gridRow: '1 / 6', display: 'grid', gridTemplateRows: '5fr 1fr 0.7fr 0.7fr' }}>
        <div style={{ ...boxStyle, fontSize: '18vw', fontWeight: '900', color: '#27F4D2', borderBottom: 'none' }}>{data.speed}</div>
        
        <div style={{ ...boxStyle, borderBottom: 'none', flexDirection: 'row', gap: '40px', justifyContent: 'center' }}>
          <span style={labelStyle}>G-FORCE</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
             <span style={{ fontSize: '3vw', color: '#888' }}>X</span>
             <div style={{ fontSize: '3.5vw', fontWeight: 'bold', color: '#27F4D2', minWidth: '16vw', textAlign: 'right' }}>
               {data.accel_x}
             </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
             <span style={{ fontSize: '3vw', color: '#888' }}>Y</span>
             <div style={{ fontSize: '3.5vw', fontWeight: 'bold', color: '#27F4D2', minWidth: '16vw', textAlign: 'right' }}>
               {data.accel_y}
             </div>
          </div>
        </div>

        <div style={{ ...boxStyle, padding: '0 25px', borderBottom: 'none' }}>
          <span style={labelStyle}>ACCEL</span>
          <div style={{ width: '100%', height: '25px', background: '#111', border: '1px solid #555' }}>
            <div style={{ width: `${data.accel_pedal}%`, height: '100%', background: '#C8CCCE' }} />
          </div>
        </div>

        <div style={{ ...boxStyle, padding: '0 25px' }}>
          <span style={labelStyle}>BRAKE</span>
          <div style={{ width: '100%', height: '25px', background: '#111', border: '1px solid #555' }}>
            <div style={{ width: `${data.brake_pedal}%`, height: '100%', background: '#C8CCCE' }} />
          </div>
        </div>
      </div>

      {/* --- RIGHT AREA (TORQUE 섹션 대폭 수정) --- */}
      <div style={{ gridColumn: '3', gridRow: '1 / 6', display: 'grid', gridTemplateRows: '5fr 5fr' }}>
        <div style={{ ...boxStyle, borderBottom: 'none', padding: '15px' }}>
          <span style={labelStyle}>BRAKE PRESS</span>
          <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', gap: '60px', alignItems: 'center' }}>
            <div style={{ fontSize: '4.5vw', fontWeight: 'bold', color: getBrakeColor(data.brake_f) }}>{data.brake_f}</div>
            <div style={{ fontSize: '4.5vw', fontWeight: 'bold', color: getBrakeColor(data.brake_r) }}>{data.brake_r}</div>
          </div>
          <div style={{ flex: 1, height: '90%', position: 'relative' }}>
            <svg viewBox="0 0 100 200" preserveAspectRatio="none" style={{ height: '100%', width: '100%' }}>
              <path d="M50 0 L100 45 L75 45 L75 98 L25 98 L25 45 L0 45 Z" fill={getBrakeColor(data.brake_f)} />
              <rect x="25" y="102" width="50" height="98" fill={getBrakeColor(data.brake_r)} />
            </svg>
            <div style={{ position: 'absolute', top: '22%', left: '50%', transform: 'translateX(-50%)', color: 'white', fontWeight: 'bold', fontSize: '3vw', pointerEvents: 'none' }}>F</div>
            <div style={{ position: 'absolute', top: '72%', left: '50%', transform: 'translateX(-50%)', color: 'white', fontWeight: 'bold', fontSize: '3vw', pointerEvents: 'none' }}>R</div>
          </div>
        </div>

        <div style={{ ...boxStyle, display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr', gridTemplateRows: '1fr 1fr', padding: '15px' }}>
          <span style={labelStyle}>TORQUE (Nm)</span>
          {[ 
            { v: data.t_fl, r: 1, c: 1 }, { v: data.t_fr, r: 1, c: 3 }, 
            { v: data.t_rl, r: 2, c: 1 }, { v: data.t_rr, r: 2, c: 3 } 
          ].map((t, i) => {
            const max = 1000; const min = -400;
            const range = max - min;
            const zeroPos = (max / range) * 100; // 상단에서의 0점 위치 %
            const barHeight = (Math.abs(t.v) / range) * 100;
            const barTop = t.v >= 0 ? zeroPos - barHeight : zeroPos;

            return (
              <div key={i} style={{ gridRow: t.r, gridColumn: t.c, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {/* 눈금선 */}
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '80px', opacity: 0.3 }}>
                    <div style={{ width: '4px', borderTop: '1px solid #fff' }} />
                    <div style={{ width: '6px', borderTop: '2px solid #fff' }} /> {/* 0점 눈금 */}
                    <div style={{ width: '4px', borderTop: '1px solid #fff' }} />
                  </div>
                  {/* 게이지 바 배경 */}
                  <div style={{ width: '35px', height: '80px', background: '#111', border: '1px solid #444', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: `${zeroPos}%`, width: '100%', height: '1px', background: '#555', zIndex: 2 }} />
                    <div style={{ 
                      width: '100%', 
                      height: `${barHeight}%`, 
                      background: getTorqueColor(t.v), 
                      position: 'absolute', 
                      top: `${barTop}%`,
                      transition: 'all 0.2s'
                    }} />
                  </div>
                </div>
                <div style={{ fontSize: '1.3vw', marginTop: '4px', fontWeight: 'bold', color: getTorqueColor(t.v) }}>{t.v}</div>
              </div>
            );
          })}
          {/* 중앙 차량 가이드 아이콘 */}
          <div style={{ gridColumn: '2', gridRow: '1 / 3', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <svg viewBox="0 0 100 160" style={{ height: '85%', opacity: 0.7 }}>
              <rect x="25" y="20" width="50" height="120" rx="12" fill="none" stroke="#fff" strokeWidth="2" />
              <circle cx="50" cy="50" r="10" fill="none" stroke="#fff" strokeWidth="2" />
              <line x1="25" y1="80" x2="75" y2="80" stroke="#333" strokeWidth="1" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;