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
    },
    // 计算方位角 https://www.3mbang.com/p-5456761.html
    // @param x1, y1, x2, y2 number 
    // @return azimuth number
    // untest
    calculateAzimuth(x1, y1, x2, y2) {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const dl = Math.sqrt(dx * dx + dy * dy);
      const epsilon = 0.0001;
      if (dl < epsilon) {
        return 0;
      }
      if (Math.abs(dx) < epsilon) {
        return dy > 0 ? 90 : 270;
      }
      if (Math.abs(dy) < epsilon) {
        return dy > 0 ? 0 : 180;
      }
      const a = Math.atan(Math.abs(dy / dx)) / Math.PI * 180;
      if (dx > 0) {
        return dy > 0 ? a : 360 - a;
      } else {
        return dy > 0 ? 180 - a : 180 + a;
      }
    }
  }
};
</script>