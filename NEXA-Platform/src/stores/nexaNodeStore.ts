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

  const canvasNodes = computed(() => {
    if (!activeBlueprint.value) return []
    return activeBlueprint.value.composition.formulators.map((formulator, index) => ({
      id: formulator.metadata.id,
      label: formulator.display.label,
      type: mapGroupToType(formulator.identity.group),
      x: 180 + index * 260,
      y: 160,
    }))
  })

  const canvasLinks = computed(() => {
    if (!activeBlueprint.value) return []
    return activeBlueprint.value.composition.connections.map((connection) => ({
      source: connection.source.formulatorId,
      target: connection.target.formulatorId,
    }))
  })

  const canvasReady = computed(() => Boolean(activeBlueprint.value))

  function createDefaultBlueprint() {
    const nodesMetadata = [
      { id: 'trigger-sensor', label: 'Sensor Trigger', group: 'TIME' as FormulatorGroup },
      { id: 'logic-adder', label: 'Adder Logic', group: 'MATH' as FormulatorGroup },
      { id: 'action-device', label: 'Device Control', group: 'CONVERT' as FormulatorGroup },
    ]

    const formulators = nodesMetadata.map((node) => ({
      metadata: { ...defaultMetadata(node.id) },
      identity: {
        group: node.group,
        type: node.label.replace(' ', '_').toUpperCase(),
        version: '1.0.0',
      },
      interface: {
        ingredients: [{ id: 'input', label: 'Input', type: 'NUMBER' as const }],
        results: [{ id: 'output', label: 'Output', type: 'NUMBER' as const }],
      },
      display: {
        label: node.label,
        icon: 'spark_line',
        color: node.group === 'TIME' ? 'var(--nexa-success)' : node.group === 'MATH' ? 'var(--nexa-button-primary-bg)' : 'var(--nexa-accent)',
        description: `${node.label}의 기본 자동화 노드`,
      },
      settings: {},
    }))

    const connections = [
      {
        metadata: { ...defaultMetadata('conn-trigger-logic') },
        source: { formulatorId: 'trigger-sensor', resultId: 'output' },
        target: { formulatorId: 'logic-adder', ingredientId: 'input' },
        status: { isActive: true, isValidated: true },
        display: { color: 'var(--nexa-text-secondary)' },
      },
      {
        metadata: { ...defaultMetadata('conn-logic-action') },
        source: { formulatorId: 'logic-adder', resultId: 'output' },
        target: { formulatorId: 'action-device', ingredientId: 'input' },
        status: { isActive: true, isValidated: true },
        display: { color: 'var(--nexa-text-secondary)' },
      },
    ]

    const blueprint: Blueprint = {
      metadata: defaultMetadata('blueprint-default'),
      config: {
        name: '기본 자동화 흐름',
        description: '센서 → 연산 → 디바이스 순의 기본 흐름',
        isLocked: false,
      },
      composition: {
        panels: [],
        formulators,
        connections,
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
  }
})
