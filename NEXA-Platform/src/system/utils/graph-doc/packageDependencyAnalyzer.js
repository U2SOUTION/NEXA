import { getApiBaseUrl } from '@system/utils/apiBaseUrl'

const apiBaseUrl = getApiBaseUrl()
/**
 * PackageDependencyAnalyzer.js
 * 패키지 의존성 그래프 분석기
 * package.json을 읽어서 npm 패키지 의존성 관계를 분석
 */

/**
 * package.json 파일 읽기
 * @param {string} projectRoot - 프로젝트 루트 경로 (기본값: 현재 프로젝트)
 * @returns {Promise<Object>} package.json 내용
 */
async function readPackageJson(projectRoot = '') {
  try {
    // 방법 1: fetch를 사용하여 읽기 (개발 서버에서 작동)
    // Vite 개발 서버는 public 폴더의 파일을 루트에서 제공
    // package.json을 public 폴더에 복사하거나, 서버 API를 통해 읽어야 함
    // 일단 /package.json으로 시도
    const packageJsonPath = projectRoot ? `${projectRoot}/package.json` : '/package.json'
    
    try {
      const response = await fetch(packageJsonPath)
      if (response.ok) {
        const packageJson = await response.json()
        return packageJson
      }
    } catch (fetchError) {
      console.warn('[PackageDependencyAnalyzer] fetch 실패, 서버 API 시도:', fetchError)
    }

    // 방법 2: 서버 API를 통해 읽기 (서버가 있다면)
    // 서버 API가 우선적으로 시도됨 (가장 안정적)
    try {
      const apiResponse = await fetch(`${apiBaseUrl}/package-json`)
      if (apiResponse.ok) {
        const packageJson = await apiResponse.json()
        console.log('[PackageDependencyAnalyzer] 서버 API를 통해 package.json 읽기 성공')
        return packageJson
      } else {
        console.warn('[PackageDependencyAnalyzer] 서버 API 응답 실패:', apiResponse.status, apiResponse.statusText)
      }
    } catch (apiError) {
      console.warn('[PackageDependencyAnalyzer] 서버 API 실패 (서버가 실행 중이지 않을 수 있음):', apiError.message)
    }

    // 방법 3: Vite의 import.meta.env를 사용하여 빌드 시점에 주입된 데이터 사용
    // 이 방법은 빌드 시점에 package.json을 읽어서 환경 변수로 주입해야 함
    // 현재는 지원하지 않음

    throw new Error('package.json을 읽을 수 없습니다.')
  } catch (error) {
    console.error('[PackageDependencyAnalyzer] package.json 읽기 실패:', error)
    throw new Error('package.json을 읽을 수 없습니다. 프로젝트 루트에 package.json이 있는지 확인하거나, 서버 API를 통해 제공해야 합니다.')
  }
}

/**
 * 패키지 이름에서 색상 생성 (일관된 색상 매핑)
 * @param {string} packageName - 패키지 이름
 * @returns {string} 색상 (hex)
 */
function getPackageColor(packageName) {
  if (!packageName) return '#6c757d'

  // 주요 패키지에 대한 색상 매핑
  const colorMap = {
    vue: '#42b883',
    quasar: '#1976d2',
    d3: '#f9a03c',
    dagre: '#ff6b6b',
    pinia: '#ffd93d',
    'vue-router': '#4fc08d',
    '@quasar/extras': '#1976d2',
    '@tiptap/starter-kit': '#ff6b6b',
    codemirror: '#d73a49',
    mermaid: '#ff6b6b',
    jspdf: '#f39c12',
    xlsx: '#2ecc71',
    qrcode: '#3498db',
    splitpanes: '#9b59b6',
  }

  // 정확한 매칭
  if (colorMap[packageName]) {
    return colorMap[packageName]
  }

  // @로 시작하는 scoped 패키지
  if (packageName.startsWith('@')) {
    const scopedName = packageName.split('/')[1]
    if (scopedName && colorMap[scopedName]) {
      return colorMap[scopedName]
    }
    // scoped 패키지는 기본 색상 사용
    return '#6c757d'
  }

  // 해시 기반 색상 생성 (일관성 유지)
  let hash = 0
  for (let i = 0; i < packageName.length; i++) {
    hash = packageName.charCodeAt(i) + ((hash << 5) - hash)
  }

  // 밝은 색상 생성 (다크 모드 대응)
  const hue = hash % 360
  const saturation = 60 + (hash % 20) // 60-80%
  const lightness = 45 + (hash % 15) // 45-60%

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}

/**
 * 패키지 이름에서 반지름 계산 (의존성 수에 비례)
 * @param {string} packageName - 패키지 이름
 * @param {number} dependencyCount - 이 패키지를 의존하는 패키지 수
 * @returns {number} 반지름
 */
function getPackageRadius(packageName, dependencyCount = 0) {
  // 기본 반지름
  let baseRadius = 30

  // 주요 프레임워크는 더 크게
  const majorPackages = ['vue', 'quasar', 'd3', 'pinia', 'vue-router']
  if (majorPackages.includes(packageName) || packageName.startsWith('@quasar/')) {
    baseRadius = 50
  } else if (packageName.startsWith('@tiptap/')) {
    baseRadius = 40
  } else if (packageName.startsWith('@codemirror/')) {
    baseRadius = 35
  }

  // 의존성 수에 따라 크기 조정 (최대 10개까지 반영)
  const dependencyBonus = Math.min(dependencyCount, 10) * 2

  return baseRadius + dependencyBonus
}

/**
 * 패키지 의존성 그래프 분석
 * @param {string} projectRoot - 프로젝트 루트 경로 (선택사항, 기본값: 현재 프로젝트)
 * @param {Object} options - 분석 옵션
 * @param {boolean} options.includeDevDependencies - devDependencies 포함 여부 (기본: true)
 * @param {string[]} options.excludedPackages - 제외할 패키지 목록
 * @param {string[]} options.includedPackages - 포함할 패키지 목록 (지정하면 이것만 포함)
 * @returns {Promise<Object>} 그래프 데이터 { packages: [], dependencies: [] }
 */
export async function analyzePackageDependencies(projectRoot = '', options = {}) {
  const {
    includeDevDependencies = true,
    excludedPackages = [],
    includedPackages = [],
  } = options

  console.log('[PackageDependencyAnalyzer] 패키지 의존성 분석 시작:', { projectRoot, options })

  try {
    // package.json 읽기
    const packageJson = await readPackageJson(projectRoot)
    console.log('[PackageDependencyAnalyzer] package.json 읽기 완료:', {
      name: packageJson.name,
      dependencies: Object.keys(packageJson.dependencies || {}).length,
      devDependencies: Object.keys(packageJson.devDependencies || {}).length,
    })

    // 모든 패키지 수집
    const allDependencies = { ...(packageJson.dependencies || {}) }
    if (includeDevDependencies) {
      Object.assign(allDependencies, packageJson.devDependencies || {})
    }

    // 제외할 패키지 필터링
    let packagesToInclude = Object.keys(allDependencies)
    if (excludedPackages.length > 0) {
      packagesToInclude = packagesToInclude.filter((pkg) => !excludedPackages.includes(pkg))
    }
    if (includedPackages.length > 0) {
      packagesToInclude = packagesToInclude.filter((pkg) => includedPackages.includes(pkg))
    }

    console.log('[PackageDependencyAnalyzer] 분석 대상 패키지 개수:', packagesToInclude.length)

    // 패키지 노드 생성
    const packages = []
    const packageMap = new Map() // 패키지 이름 -> 패키지 객체

    // 각 패키지의 의존성 수 계산 (다른 패키지가 이 패키지를 의존하는 횟수)
    const dependencyCountMap = new Map()
    packagesToInclude.forEach((pkgName) => {
      dependencyCountMap.set(pkgName, 0)
    })

    // 패키지 노드 생성
    packagesToInclude.forEach((pkgName) => {
      const dependencyCount = dependencyCountMap.get(pkgName) || 0
      const packageNode = {
        id: pkgName,
        name: pkgName,
        version: allDependencies[pkgName],
        radius: getPackageRadius(pkgName, dependencyCount),
        color: getPackageColor(pkgName),
        isDevDependency: includeDevDependencies && packageJson.devDependencies?.[pkgName] !== undefined,
      }

      packages.push(packageNode)
      packageMap.set(pkgName, packageNode)
    })

    // 의존성 관계 생성
    // 현재는 package.json의 직접 의존성만 표시
    // 실제로는 각 패키지의 package.json을 읽어서 전체 의존성 트리를 만들 수 있음
    const dependencies = []

    // 패키지 간 의존성 관계는 실제로는 각 패키지의 package.json을 읽어야 하지만,
    // 여기서는 간단하게 패키지 그룹별로 관계를 생성
    // 예: @quasar/* 패키지들은 quasar에 의존
    // @tiptap/* 패키지들은 서로 연관
    // @codemirror/* 패키지들은 codemirror에 의존

    // 패키지 그룹별 의존성 생성
    const packageGroups = {
      quasar: packagesToInclude.filter((pkg) => pkg.startsWith('@quasar/')),
      tiptap: packagesToInclude.filter((pkg) => pkg.startsWith('@tiptap/')),
      codemirror: packagesToInclude.filter((pkg) => pkg.startsWith('@codemirror/')),
    }

    // quasar 그룹 -> quasar
    if (packagesToInclude.includes('quasar') && packageGroups.quasar.length > 0) {
      packageGroups.quasar.forEach((pkg) => {
        if (pkg !== 'quasar') {
          dependencies.push({
            from: pkg,
            to: 'quasar',
            label: '',
          })
        }
      })
    }

    // tiptap 그룹 -> @tiptap/starter-kit (핵심 패키지)
    if (packagesToInclude.includes('@tiptap/starter-kit')) {
      packageGroups.tiptap.forEach((pkg) => {
        if (pkg !== '@tiptap/starter-kit') {
          dependencies.push({
            from: pkg,
            to: '@tiptap/starter-kit',
            label: '',
          })
        }
      })
    }

    // codemirror 그룹 -> codemirror
    if (packagesToInclude.includes('codemirror') && packageGroups.codemirror.length > 0) {
      packageGroups.codemirror.forEach((pkg) => {
        if (pkg !== 'codemirror') {
          dependencies.push({
            from: pkg,
            to: 'codemirror',
            label: '',
          })
        }
      })
    }

    // 주요 프레임워크 간 관계
    if (packagesToInclude.includes('vue') && packagesToInclude.includes('quasar')) {
      dependencies.push({
        from: 'quasar',
        to: 'vue',
        label: '',
      })
    }

    if (packagesToInclude.includes('vue') && packagesToInclude.includes('pinia')) {
      dependencies.push({
        from: 'pinia',
        to: 'vue',
        label: '',
      })
    }

    if (packagesToInclude.includes('vue') && packagesToInclude.includes('vue-router')) {
      dependencies.push({
        from: 'vue-router',
        to: 'vue',
        label: '',
      })
    }

    if (packagesToInclude.includes('quasar') && packagesToInclude.includes('@tiptap/vue-3')) {
      dependencies.push({
        from: '@tiptap/vue-3',
        to: 'quasar',
        label: '',
      })
    }

    // 중복 제거
    const uniqueDependencies = []
    const dependencySet = new Set()
    dependencies.forEach((dep) => {
      const key = `${dep.from}->${dep.to}`
      if (!dependencySet.has(key)) {
        dependencySet.add(key)
        uniqueDependencies.push(dep)
      }
    })

    console.log('[PackageDependencyAnalyzer] 분석 완료:', {
      packagesCount: packages.length,
      dependenciesCount: uniqueDependencies.length,
    })

    return {
      packages,
      dependencies: uniqueDependencies,
      metadata: {
        projectName: packageJson.name,
        projectVersion: packageJson.version,
        totalDependencies: Object.keys(packageJson.dependencies || {}).length,
        totalDevDependencies: Object.keys(packageJson.devDependencies || {}).length,
      },
    }
  } catch (error) {
    console.error('[PackageDependencyAnalyzer] 패키지 의존성 분석 실패:', error)
    throw error
  }
}

/**
 * package.json 파일을 직접 읽는 대체 방법 (Vite 환경)
 * @returns {Promise<Object>} package.json 내용
 */
export async function readPackageJsonDirect() {
  try {
    // Vite의 import.meta.env를 사용하여 프로젝트 루트 확인
    // 또는 fetch를 사용하여 /package.json 읽기
    const response = await fetch('/package.json')
    if (!response.ok) {
      throw new Error(`package.json을 읽을 수 없습니다: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error('[PackageDependencyAnalyzer] package.json 직접 읽기 실패:', error)
    throw error
  }
}
