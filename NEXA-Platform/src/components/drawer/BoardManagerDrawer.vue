<template>
  <q-drawer v-model="drawerOpen" side="right" bordered>
    <q-card flat>
      <q-card-section>
        <h4>넥사보드 관리</h4>
        <!-- 창/위젯 관리 UI -->
      </q-card-section>
      <q-card-actions>
        <q-btn label="확인" color="primary" @click="onConfirm" />
        <q-btn label="취소" flat @click="onCancel" />
      </q-card-actions>
    </q-card>
  </q-drawer>
</template>

<script>
export default {
  name: 'BoardManagerDrawer',
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    drawerOpen: {
      get() {
        return this.isOpen
      },
      set(value) {
        this.$emit('update:isOpen', value)
      },
    },
  },
  methods: {
    onConfirm() {
      this.$emit('confirm')
    },
    onCancel() {
      this.$emit('cancel')
    },
  },
}
</script>
