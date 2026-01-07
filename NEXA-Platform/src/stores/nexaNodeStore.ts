import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Blueprint } from '../schemas/modules/blueprint'
import { FormulatorGroupEnum } from '../schemas/common/taxonomy'
import type { z } from 'zod'

const defaultMetadata = (id: string) => ({
  id,
  createdAt: new Date(),
  source: 'USER',
  target: 'SYSTEM',
  version: '1.0.0',
})

type FormulatorGroup = z.infer<typeof FormulatorGroupEnum>

const mapGroupToType = (group: FormulatorGroup) => {
  if (group === 'TIME') return 'trigger'
  if (group === 'LOGIC' || group === 'MATH' || group === 'FILTER') return 'logic'
  return 'action'
}

const deviceCatalog = [
  { id: 'dev-01', name: 'NEXA V-EDGE 01', type: '온도/냉각', status: 'online' },
  { id: 'dev-02', name: 'NEXA V-EDGE 02', type: '습도/환기', status: 'online' },
  { id: 'dev-03', name: 'NEXA V-EDGE 03', type: '전력/조명', status: 'offline' },
]

export const getDeviceCatalog = () => deviceCatalog

export const useNexaNodeStore = defineStore('nexaNode', () => {
  const viewMode = ref<'doc' | 'canvas'>('doc')
  const activeBlueprint = ref<Blueprint | null>(null)
  const selectedElementId = ref<string | null>(null)
  const selectedElementType = ref<'panel' | 'formulator' | 'connection' | null>(null)
  const isSimulatorVisible = ref(false)

  const selectedElement = computed(() => {
    if (!activeBlueprint.value || !selectedElementId.value) return null

    const { panels, formulators, connections } = activeBlueprint.value.composition
    if (selectedElementType.value === 'panel') return panels.find((p) => p.metadata.id === selectedElementId.value)
    if (selectedElementType.value === 'formulator') return formulators.find((f) => f.metadata.id === selectedElementId.value)
    if (selectedElementType.value === 'connection') {
      return connections.find((c: any) => (c.id || c.metadata?.id) === selectedElementId.value)
    }
    return null
  })

  const selectedDeviceIds = ref<string[]>([])

  const selectedDevices = computed(() => {
    return deviceCatalog.filter((device) => selectedDeviceIds.value.includes(device.id))
  })

  const canvasNodes = computed(() => {
    if (selectedDevices.value.length === 0) return []
    return selectedDevices.value.map((device, index) => ({
      id: device.id,
      label: device.name,
      type: 'trigger',
      x: 180 + (index % 3) * 260,
      y: 140 + Math.floor(index / 3) * 180,
      ports: createPorts(),
    }))
  })

  function createPorts() {
    const count = Math.floor(Math.random() * 3) + 2
    const portTypes = ['input', 'output', 'control'] as const
    return Array.from({ length: count }).map((_, idx) => ({
      id: `port-${idx}`,
      type: portTypes[idx % portTypes.length],
    }))
  }

  const canvasLinks = computed(() => {
    if (!activeBlueprint.value) return []
    return activeBlueprint.value.composition.connections.map((connection) => ({
      source: connection.source.formulatorId,
      target: connection.target.formulatorId,
    }))
  })

  const canvasReady = computed(() => Boolean(activeBlueprint.value))

  function createDefaultBlueprint(skipHelperNotification = false) {
    const blueprint: Blueprint = {
      metadata: defaultMetadata('blueprint-default'),
      config: {
        name: '기본 설계도',
        description: '초기 캔버스 (노드 없음)',
        isLocked: false,
      },
      composition: {
        panels: [],
        formulators: [],
        connections: [],
      },
      viewport: {
        zoom: 1,
        pan: { x: 0, y: 0 },
      },
      runtime: {
        isActive: true,
        priority: 1,
      },
    }

    activeBlueprint.value = blueprint
    if (!skipHelperNotification) {
      window.dispatchEvent(new CustomEvent('nexa-node-new-canvas'))
    }
  }

  function toggleDeviceSelection(deviceId: string) {
    const index = selectedDeviceIds.value.indexOf(deviceId)
    if (index >= 0) {
      selectedDeviceIds.value.splice(index, 1)
      if (selectedDeviceIds.value.length === 0) {
        window.dispatchEvent(new CustomEvent('nexa-node-helper-hide'))
      }
      return
    }
    selectedDeviceIds.value.push(deviceId)
    if (!activeBlueprint.value) {
      createDefaultBlueprint(true)
    }
    if (selectedDeviceIds.value.length === 1) {
      window.dispatchEvent(new CustomEvent('nexa-node-helper-hide'))
    }
  }

  function isDeviceSelected(deviceId: string) {
    return selectedDeviceIds.value.includes(deviceId)
  }

  function resetBlueprint() {
    activeBlueprint.value = null
    selectedElementId.value = null
    selectedElementType.value = null
    viewMode.value = 'doc'
  }

  function openSimulator() {
    isSimulatorVisible.value = true
  }

  function closeSimulator() {
    isSimulatorVisible.value = false
  }

  return {
    viewMode,
    activeBlueprint,
    selectedElementId,
    selectedElementType,
    selectedElement,
    canvasNodes,
    canvasLinks,
    canvasReady,
    createDefaultBlueprint,
    resetBlueprint,
    isSimulatorVisible,
    openSimulator,
    closeSimulator,
    selectedDeviceIds,
    selectedDevices,
    toggleDeviceSelection,
    isDeviceSelected,
  }
})
