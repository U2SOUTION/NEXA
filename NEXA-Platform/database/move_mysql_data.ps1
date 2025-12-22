# MySQL 데이터 디렉토리 이동 스크립트
# E:\NEXA System\MySQL_Data로 이동

$ErrorActionPreference = "Stop"

Write-Host "=== MySQL 데이터 디렉토리 이동 스크립트 ===" -ForegroundColor Cyan

# 경로 설정
$currentDataDir = "C:\ProgramData\MySQL\MySQL Server 9.0\Data"
$newDataDir = "E:\NEXA System\MySQL_Data"
$myIniPath = "C:\ProgramData\MySQL\MySQL Server 9.0\my.ini"
$serviceName = "MySQL90"

# 1. MySQL 서비스 상태 확인
Write-Host "`n[1/5] MySQL 서비스 상태 확인 중..." -ForegroundColor Yellow
$service = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
if (-not $service) {
    Write-Host "MySQL 서비스를 찾을 수 없습니다. 서비스 이름을 확인해주세요." -ForegroundColor Red
    exit 1
}

Write-Host "서비스 상태: $($service.Status)" -ForegroundColor Green

# 2. MySQL 서비스 중지
if ($service.Status -eq "Running") {
    Write-Host "`n[2/5] MySQL 서비스 중지 중..." -ForegroundColor Yellow
    Stop-Service -Name $serviceName -Force
    Start-Sleep -Seconds 3
    Write-Host "MySQL 서비스가 중지되었습니다." -ForegroundColor Green
} else {
    Write-Host "`n[2/5] MySQL 서비스가 이미 중지되어 있습니다." -ForegroundColor Green
}

# 3. 새 디렉토리 생성
Write-Host "`n[3/5] 새 데이터 디렉토리 생성 중..." -ForegroundColor Yellow
if (-not (Test-Path $newDataDir)) {
    New-Item -ItemType Directory -Path $newDataDir -Force | Out-Null
    Write-Host "디렉토리 생성 완료: $newDataDir" -ForegroundColor Green
} else {
    Write-Host "디렉토리가 이미 존재합니다: $newDataDir" -ForegroundColor Yellow
}

# 4. 데이터 복사
Write-Host "`n[4/5] 데이터 복사 중... (시간이 걸릴 수 있습니다)" -ForegroundColor Yellow
if (Test-Path $currentDataDir) {
    # Robocopy 사용 (더 안정적)
    $robocopyArgs = @(
        $currentDataDir,
        $newDataDir,
        "/E",           # 하위 디렉토리 포함
        "/COPYALL",     # 모든 속성 복사
        "/R:3",         # 재시도 3회
        "/W:5",         # 대기 5초
        "/NFL",         # 파일 목록 미표시
        "/NDL",         # 디렉토리 목록 미표시
        "/NP"           # 진행률 미표시
    )
    
    $result = & robocopy @robocopyArgs
    if ($LASTEXITCODE -le 1) {
        Write-Host "데이터 복사 완료!" -ForegroundColor Green
    } else {
        Write-Host "데이터 복사 중 오류 발생. 종료 코드: $LASTEXITCODE" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "원본 데이터 디렉토리를 찾을 수 없습니다: $currentDataDir" -ForegroundColor Red
    exit 1
}

# 5. my.ini 파일 수정
Write-Host "`n[5/5] my.ini 파일 수정 중..." -ForegroundColor Yellow
if (Test-Path $myIniPath) {
    # 백업 생성
    $backupPath = "$myIniPath.backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    Copy-Item $myIniPath $backupPath
    Write-Host "my.ini 백업 생성: $backupPath" -ForegroundColor Green
    
    # 파일 읽기
    $iniContent = Get-Content $myIniPath -Raw
    
    # datadir 경로 변경 (Windows 경로는 백슬래시를 슬래시로 변환)
    $newDataDirForIni = $newDataDir -replace '\\', '/'
    $oldDataDirForIni = $currentDataDir -replace '\\', '/'
    
    # datadir 설정 찾아서 변경
    if ($iniContent -match "datadir\s*=\s*.*") {
        $iniContent = $iniContent -replace "datadir\s*=\s*.*", "datadir=$newDataDirForIni"
        Write-Host "datadir 경로 변경: $oldDataDirForIni -> $newDataDirForIni" -ForegroundColor Green
    } else {
        # [mysqld] 섹션에 datadir 추가
        if ($iniContent -match "\[mysqld\]") {
            $iniContent = $iniContent -replace "(\[mysqld\])", "`$1`ndatadir=$newDataDirForIni"
            Write-Host "datadir 설정 추가" -ForegroundColor Green
        } else {
            Write-Host "my.ini 파일에 [mysqld] 섹션을 찾을 수 없습니다." -ForegroundColor Red
            exit 1
        }
    }
    
    # 파일 저장
    $iniContent | Set-Content $myIniPath -NoNewline
    Write-Host "my.ini 파일 수정 완료" -ForegroundColor Green
} else {
    Write-Host "my.ini 파일을 찾을 수 없습니다: $myIniPath" -ForegroundColor Red
    exit 1
}

# 6. MySQL 서비스 시작
Write-Host "`n[6/6] MySQL 서비스 시작 중..." -ForegroundColor Yellow
Start-Service -Name $serviceName
Start-Sleep -Seconds 5

$service = Get-Service -Name $serviceName
if ($service.Status -eq "Running") {
    Write-Host "`n=== 작업 완료! ===" -ForegroundColor Green
    Write-Host "MySQL 데이터 디렉토리가 성공적으로 이동되었습니다." -ForegroundColor Green
    Write-Host "새 위치: $newDataDir" -ForegroundColor Cyan
    Write-Host "`n주의: 원본 데이터는 백업 목적으로 남아있습니다." -ForegroundColor Yellow
    Write-Host "모든 것이 정상 작동하는지 확인한 후 원본 데이터를 삭제하세요." -ForegroundColor Yellow
} else {
    Write-Host "`nMySQL 서비스 시작 실패!" -ForegroundColor Red
    Write-Host "my.ini 파일과 데이터 디렉토리를 확인해주세요." -ForegroundColor Red
    Write-Host "백업 파일: $backupPath" -ForegroundColor Yellow
    exit 1
}

