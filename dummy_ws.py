# dummy_ws.py — PC에서 실행
import asyncio, json, math
import websockets

async def handler(ws):
    print(f"클라이언트 연결됨: {ws.remote_address}")
    t = 0
    try:
        while True:
            t += 0.05
            
            # 1. SOC (배터리 잔량): 100%에서 0%로 서서히 떨어지다가 리셋되도록 반복
            soc = 100 - (t * 2) % 100 
            
            # 2. 브레이크 압력: 0 ~ 2.5 범위로 출렁이게 (임계값을 넘어 색상이 변하는지 확인)
            bp_f = abs(math.sin(t * 2)) * 2.5
            bp_r = abs(math.cos(t * 1.8)) * 2.5

            await ws.send(json.dumps({
                # 속도는 0~180 사이를 폭넓게 왔다갔다 하도록 수정
                "speed": 30 + 150 * abs(math.sin(t * 0.5)), 
                
                # G-Force (X, Y축): -1.5 ~ +1.5 범위로 흔들림
                "accel_x": math.sin(t * 2) * 1.5,
                "accel_y": math.cos(t * 2) * 1.5,
                
                # 페달: 0 ~ 100% 게이지가 꽉 차게 움직임
                "accel_pedal": 50 + 50 * math.sin(t), 
                "brake_pedal": 50 + 50 * math.cos(t), 
                
                # 토크: -400 ~ 1000 범위 스케일에 맞춰 넓게 진동
                "torque_fl": 300 + 700 * math.sin(t * 0.8),
                "torque_fr": 300 + 700 * math.cos(t * 0.9),
                "torque_rl": 300 + 700 * math.sin(t * 1.1),
                "torque_rr": 300 + 700 * math.cos(t * 1.2),
                
                # 배터리 전압 및 전류도 출렁이게 설정
                "bat_volt": 350 + 50 * math.sin(t * 0.1), # 300V ~ 400V
                "bat_curr": 50 + 40 * math.sin(t * 0.5),  # 10A ~ 90A
                "bat_soc": soc,
                
                # 배터리 온도: 10도 ~ 60도 (50도가 넘으면 빨간색으로 경고등 들어오는지 확인용)
                "bat_temp": 35 + 25 * math.sin(t * 0.2), 
                
                # GPS 데이터도 미세하게 움직이도록 처리
                "lat": 37.618 + 0.001 * math.sin(t * 0.1), 
                "lon": 127.098 + 0.001 * math.cos(t * 0.1),
                "alt": 74 + 10 * math.sin(t), 
                "gps_speed": 28 + 10 * math.sin(t),
                "heading": (180 + t * 10) % 360, 
                "fix": 1,
                "gps_satellites": int(8 + 4 * math.sin(t * 0.5)), 
                "hdop": 1.2 + 0.5 * math.sin(t),
                
                "brake_press_f": bp_f,
                "brake_press_r": bp_r,
            }))
            await asyncio.sleep(0.05)
            
    # 클라이언트가 연결을 끊었을 때 발생하는 예외 처리
    except websockets.exceptions.ConnectionClosed:
        print(f"클라이언트 연결 종료: {ws.remote_address}")
    except Exception as e:
        print(f"예상치 못한 에러: {e}")

async def main():
    async with websockets.serve(handler, "localhost", 8765):
        print("WS 서버 실행 중: ws://localhost:8765")
        await asyncio.Future()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        # Ctrl+C 로 서버를 종료할 때 발생하는 에러 메시지 숨김
        print("\n서버를 종료합니다.")