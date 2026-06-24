import re, os, sys
sys.stdout = open('t123_all.txt', 'w', encoding='utf-8')

base = r'e:\NEXA System\NEXA'
files = [
    r'NEXA V2.0\APP_V2.0\_inbox\LOOP 설계도- 랭그래프 CI 파이프라인 설계.md',
    r'NEXA V2.0\APP_V2.0\_inbox\LOOP 기억-듀얼 RAG와 지식 진화 엔진.md',
    r'NEXA V2.0\APP_V2.0\용어집_NEXA전용_v2.0.md',
    r'NEXA V2.0\APP_V2.0\08_TDD\NEXAOS\08_TDD_NEXAOS_전역아키텍처표준_GlobalArchitectureStandard_v1.0.md',
    r'NEXA V2.0\DEV_V2.0\NEXA_Dev_UI-Driven_기능설계및_전이_로드맵.md',
    r'NEXA V2.0\APP_V2.0\08_TDD\Galthon\08_TDD_Galthon_TrustWatch_신뢰감시독립주체_v1.0.md',
    r'NEXA V2.0\APP_V2.0\08_TDD\AI\08_TDD_AI_지능위계및하드웨어사양.md',
    r'NEXA V2.0\APP_V2.0\08_TDD\Cosmic\08_TDD_CosmicLanguage_전역데이터아키텍처.md',
    r'NEXA V2.0\APP_V2.0\08_TDD\Cosmic\08_TDD_CSIM_AXON프로토콜_정본.md',
    r'NEXA V2.0\APP_V2.0\08_TDD\NEXIA\Nexaon\08_TDD_Nexaon_Distillation오케스트레이터_v1.0.md',
    r'NEXA V2.0\APP_V2.0\08_TDD\NEXIA\Kineton\08_TDD_Kineton_PhysicalBridge_ACTON_ROS2_v1.0.md',
    r'NEXA-Platform\docs\Robot\ROS2-Gcode-Mcode 융합 제어 알고리즘.md',
]

for rel in files:
    path = os.path.join(base, rel)
    if not os.path.exists(path):
        print(f'=== {rel} (NOT FOUND) ===\n')
        continue
    print(f'=== {rel} ===')
    with open(path, 'r', encoding='utf-8') as f:
        lines = f.read().split('\n')
    hit = 0
    for i, line in enumerate(lines, 1):
        if re.search(r'\bT[123]\b', line):
            hit += 1
            print(f'  L{i:4d}: {line.strip()[:200]}')
    if hit == 0:
        print('  (no match)')
    print()
