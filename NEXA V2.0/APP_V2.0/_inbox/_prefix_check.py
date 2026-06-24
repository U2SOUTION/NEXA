import re, sys
sys.stdout = open('prefix_check.txt', 'w', encoding='utf-8')

with open('용어집_NEXA전용_v2.0 1 1.md', 'r', encoding='utf-8') as f:
    content = f.read()
    lines = content.split('\n')

# 4대 번호 체계의 모든 변형 패턴 검사
prefixes = ['ML', 'PT', 'AL', 'T1', 'T2', 'T3', 'CT', 'UI', 'AXON', 'COSMIC']

print('=== 1. TAG/CODE 열에서 "T" 또는 "CT" 또는 "ML/PT/AL/UI/AXON/COSMIC" 으로 시작하는 1~4글자 식별자 스캔 ===\n')

for i, line in enumerate(lines, 1):
    if not line.startswith('|'):
        continue
    if '---' in line and ':' in line:
        continue
    m = re.match(r'^\|\s*`([^`]+)`\s*\|', line)
    if not m:
        continue
    tag = m.group(1)
    # 1~4글자 대문자+숫자 토큰 (식별자 가능성)
    if re.match(r'^[A-Z][A-Z0-9]{0,3}$', tag):
        print(f'  L{i:3d} TAG=`{tag}` (4자 이하 식별자)')

print('\n=== 2. 본문 전체에서 "T1", "T2", "T3" 또는 " CT" 검색 (빈도/위치) ===\n')
for i, line in enumerate(lines, 1):
    if 'T1' in line or 'T2' in line or 'T3' in line or 'CT' in line:
        snippet = line.strip()[:160]
        print(f'  L{i:3d}: {snippet}')

print('\n=== 3. CT로 시작하는 기존 식별자 검색 (충돌 여부) ===\n')
ct_matches = []
for i, line in enumerate(lines, 1):
    for match in re.finditer(r'\bCT[0-9A-Za-z]*\b', line):
        ct_matches.append((i, match.group(0), line.strip()[:120]))
for ln, m, snippet in ct_matches:
    print(f'  L{ln:3d} `{m}`: {snippet}')
print(f'\n총 CT 매치: {len(ct_matches)}건')
