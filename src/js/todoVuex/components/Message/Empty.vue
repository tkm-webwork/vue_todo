<template lang="html">
  <p class="empty">{{ emptyMessage }}</p>
</template>

<script>

export default {
  computed: {
    // store/index.js内のstateにあるemptyMessageを返している
    // setEmptyMessageアクションを実行したときに、呼び出されたsetEmptyMessageミューテーションが実行され、stateであるemptyMessageが変更される。
    emptyMessage() {
      return this.$store.state.emptyMessage;
    },
  },
};
</script>

<style lang="scss" scoped>
.empty {
  font-size: 14px;
  text-align: center;
}
</style>
