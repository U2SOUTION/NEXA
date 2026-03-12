<!--
  [NEXA-AUTH-01] 로그인/회원가입 전용 레이아웃 (사이드바 없음)
-->
<template>
  <q-layout view="hHh lpR fFf" class="auth-layout">
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
//
</script>

<style lang="scss" scoped>
.auth-layout {
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    var(--nexa-primary) 0%,
    var(--nexa-button-primary-bg) 100%
  );
}
</style>
