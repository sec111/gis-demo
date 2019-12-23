<script>
const initLoading = {
  latitude: 30,
  longitude: 118,
  maxLoadingNum: 10,
  loadingInterval: 200,
};

export default {
  inject: ['getMap'],
  methods: {
    init() {
      this.map = this.getMap();
    },

    genIcon(iconOption) {
      return L.icon(iconOption);
    },
    // 生成单个icon
    genSingleMarker(markerData, iconFunction) {
      const { genIcon } = this;

      const latitude = (markerData && markerData.latitude) || initLoading.latitude;
      const longitude = (markerData && markerData.longitude) || initLoading.longitude;
      const icon = genIcon(iconFunction(markerData));
      return L.marker([ latitude, longitude ], { ...markerData, icon });
    },
    // 生成不同icon的标注点或点群
    genMarker(markerData, iconFunction) {
      if (!markerData) {
        console.log('未定义标注点信息');
        return;
      }
      if (Array.isArray(markerData)) {
        if (!markerData.length) {
          cnosole.log('标注点数量为零');
          return ;
        }
        return markerData.map(data => this.genSingleMarker(markerData, iconFunction));
      } else {
        return this.genSingleMarker(markerData, iconFunction);
      }
    },
    // 添加单个标注点
    addSingleMarker(markerData, iconFunction, target) {
      const marker = this.genSingleMarker(markerData, iconFunction);
      marker.addTo(target);
    },
    // 添加多个标注点
    addMarker(markerData, iconFunction, target, finishInfo = '加载完毕！') {
      if (Array.isArray(markerData)){
        const len = markerData.length;
        console.log(len);
        if (len <= maxLoadingNum) {
          return markerData.map(m => this.addSingleMarker(m, iconFunction, target));
        }

        const { maxLoadingNum, loadingInterval } = initLoading;
        const fun = (i, j) => markerData.slice(i, j).map(m => {
          this.addSingleMarker(m, iconFunction, target)
        });
        const callback = () => {
          return {
            showClose: true,
            duration: 2000,
            message: finishInfo,
            type: 'success'
          };
        };
        this.common.loadingInterval(0, maxLoadingNum, len, loadingInterval, fun, callback);
      } else {
        this.addSingleMarker(markerData, iconFunction, target);
      }
    },
    genPopup() {

    },
    bindPopup(target) {

    }
  }
};
</script>
<template>
</template>