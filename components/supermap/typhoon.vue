<template>
</template>
<script>
const colorLine = [
  { name: '中国', color: '#E73B52' },
  { name: '中国台湾', color: '#C52ECF' },
  { name: '日本', color: '#2FB63A' },
  { name: '美国', color: '#31A3B1' },
  { name: '中国香港', color: '#E75F3B' },
];

export default {
  inject: ['getMap', 'getUI', 'getLayer'],
  data() {
    return {
      tempPoint();
    };
  },
  methods: {
    init() {
      this.map = this.getMap();
      this.ui = this.getUI();
      this.layer = this.getLayer();
    },
    add() {
      
    },
    // 用户自定义颜色
    genPolyline(data) {
      const { colorLine, ui } = this;
      const colorItem = colorLine.find(c => c.name === data.tm);
      const option = { 
        color: colorItem.color,
        weight: 2,
        dashArray: '5'
      }
      return ui.addPolyline(data, option);
    }
  }
};
</script>