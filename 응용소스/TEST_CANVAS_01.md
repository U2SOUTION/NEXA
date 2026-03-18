<!doctype html>
<html lang="ko">
    <head>
        <meta charset="UTF-8" />
        <title>Big Dot Matrix Background</title>
        <style>
            body,
            html {
                margin: 0;
                padding: 0;
                width: 100%;
                height: 100%;
                overflow: hidden;
                background-color: #030504; /* 아주 깊은 어둠 */
            }
            #bgCanvas {
                display: block;
            }
            .content {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: #00ff66;
                font-family: "Courier New", monospace;
                text-align: center;
                text-shadow: 0 0 20px #00ff66;
                pointer-events: none;
                letter-spacing: 5px;
            }
        </style>
    </head>
    <body>
        <canvas id="bgCanvas"></canvas>
        <div class="content">
            <h1>[ SYSTEM READY ]</h1>
            <p>PostgreSQL : ONLINE</p>
            <p>Docker : ACTIVE</p>
            <p>Ollama : IDLE</p>
        </div>

        <script>
            const canvas = document.getElementById("bgCanvas");
            const ctx = canvas.getContext("2d");

            function drawBigDots() {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;

                // 1. 베이스 배경색 (거의 검은색에 가까운 녹색)
                ctx.fillStyle = "#030504";
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // 2. 설정값: 도트 크기와 간격
                const dotSize = 3; // 도트의 크기 (확 키웠습니다!)
                const spacing = 6; // 도트 사이의 간격 (격자 느낌 강조)

                for (let x = 0; x < canvas.width; x += spacing) {
                    for (let y = 0; y < canvas.height; y += spacing) {
                        // 무작위 밝기 조절 (0.2 ~ 0.7 사이로 매우 선명하게)
                        const opacity = Math.random() * 0.5 + 0.2;
                        // 녹색의 채도를 높여서 '전자 기기' 느낌 극대화
                        const greenBase = Math.floor(Math.random() * 100) + 100;

                        ctx.fillStyle = `rgba(0, ${greenBase}, 100, ${opacity})`;

                        // 사각형 도트 그리기 (dotSize x dotSize)
                        ctx.fillRect(x, y, dotSize, dotSize);
                    }
                }
            }

            // 초기 실행 및 리사이즈 대응
            drawBigDots();
            window.addEventListener("resize", drawBigDots);
        </script>
    </body>
</html>
