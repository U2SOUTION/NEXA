<!doctype html>
<html lang="ko">
    <head>
        <meta charset="UTF-8" />
        <title>Sophisticated Dot Matrix</title>
        <style>
            body,
            html {
                margin: 0;
                padding: 0;
                width: 100%;
                height: 100%;
                overflow: hidden;
                background-color: #030504;
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
            <h1>[ SYSTEM MONITOR ]</h1>
            <p>STABLE BACKGROUND | SELECTIVE TWINKLE</p>
        </div>

        <script>
            const canvas = document.getElementById("bgCanvas");
            const ctx = canvas.getContext("2d");

            let dots = []; // 모든 도트의 위치와 기본 색상을 저장할 배열
            const dotSize = 10;
            const spacing = 11;
            let mouseX = -1000;
            let mouseY = -1000;

            // 1. 초기 도트 데이터 생성 (한 번만 실행)
            function initDots() {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                dots = [];
                for (let x = 0; x < canvas.width; x += spacing) {
                    for (let y = 0; y < canvas.height; y += spacing) {
                        dots.push({
                            x: x,
                            y: y,
                            // 기본 상태: 기존에 좋아하셨던 랜덤한 녹색과 투명도 고정
                            opacity: Math.random() * 0.4 + 0.1,
                            green: Math.floor(Math.random() * 80) + 70,
                        });
                    }
                }
            }

            // 2. 메인 렌더링 루프
            function render() {
                // 배경 초기화
                ctx.fillStyle = "#030504";
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                const radius = 500; // 반응 반경

                dots.forEach((dot) => {
                    const dx = mouseX - dot.x;
                    const dy = mouseY - dot.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    let drawOpacity = dot.opacity;
                    let drawGreen = dot.green;

                    // 마우스 반경 내에 있고, 아주 낮은 확률(약 1%)로만 반짝이게 설정
                    if (dist < radius && Math.random() < 0.01) {
                        drawOpacity = Math.random() * 0.1 + 0.1; // 살짝 밝아짐 (0.1 ~ 0.2)
                        drawGreen = 255; // 완전 밝은 형광 녹색
                    }

                    ctx.fillStyle = `rgba(0, ${drawGreen}, 100, ${drawOpacity})`;
                    ctx.fillRect(dot.x, dot.y, dotSize, dotSize);
                });

                requestAnimationFrame(render);
            }

            // 마우스 위치 업데이트
            window.addEventListener("mousemove", (e) => {
                mouseX = e.clientX;
                mouseY = e.clientY;
            });

            // 리사이즈 시 도트 재배치
            window.addEventListener("resize", initDots);

            // 실행
            initDots();
            render();
        </script>
    </body>
</html>
