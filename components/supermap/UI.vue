<script>
const initLoading = {
  latitude: 30,
  longitude: 118,
  maxLoadingNum: 1,
  interval: 50,
};

export default {
  inject: ['getMap'],
  data() {
    return {
      damActiveIcon: '<div class="active_marker"><div class="wave1"></div><div class="wave2"></div></div>'
    };
  },
  methods: {
    init() {
      this.map = this.getMap();
    },
    genLnt(lat, lng) {
      return L.latLng(lat, lng);
    },
    // 生成icon
    genIcon(iconOption) {
      if (iconOption.hasOwnProperty('pulse') && iconOption.pulse 
        && iconOption.hasOwnProperty('color')) {  //-untest
          delete iconOption.pulse;
          return L.icon.pulse(iconOption);
      }

      return L.icon(iconOption);
    },
    // 生成闪烁点 -untest
    genPulseIcon(iconOption) {
      return L.icon.pulse(iconOption);
    },
    // 设置闪烁点
    setActiveIcon(target, iconOption = undefined) {
      iconOption = iconOption ? iconOption : this.damActiveIcon;
      target.setIcon(L.divIcon({ html: this.common.str2htmlElement(iconOption) }));
      console.log(target);
    },

    // 生成单个标注点
    genSingleMarker(markerData, iconFunc, markerOption = undefined) {
      const { genIcon } = this;

      const latitude = (markerData && markerData.latitude) || initLoading.latitude;
      const longitude = (markerData && markerData.longitude) || initLoading.longitude;
      const option = markerOption ? markerOption(markerData): markerData;

      if (iconFunc) {
        return L.marker([ latitude, longitude ], { ...option, icon: genIcon(iconFunc(markerData)) });
      }
      return L.marker([ latitude, longitude ], option );
    },
    // 添加单个标注点
    addSingleMarker(markerData, target, props = {}) {
      if (!markerData) {
        console.log('未定义标注点信息');
        return;
      }

      const { genSingleMarker, bindThing } = this;
      const { iconFunc, markerOption } = props;
      
      const marker = genSingleMarker(markerData, iconFunc, markerOption);

      marker.addTo(target);
      
      bindThing(marker, markerData, props);

      return marker;
    },
    // 添加多个标注点
    addMarker(markerData, target, props = {}) {
      const { addSingleMarker, common } = this;
      const { loadingInterval } = common;

      if (Array.isArray(markerData)){
        if (!markerData.length) {
          cnosole.log('标注点数量为零');
          return ;
        }

        const len = markerData.length;
        if (len <= maxLoadingNum) {
          return markerData.map(m => addSingleMarker(m, target, props));
        }

        const { maxLoadingNum, interval } = initLoading;
        const fun = (i, j) => markerData.slice(i, j).map(m => {
          addSingleMarker(m, target, props);
        });
        const callback = () => {
          return {
            showClose: true,
            duration: 2000,
            message: '加载完毕！',
            type: 'success'
          };
        };
        loadingInterval(0, maxLoadingNum, len, interval, fun, callback);
      } else {
        addSingleMarker(markerData, target, props);
      }
    },
    // 绑定tooltip popup event
    bindThing(target, markerData, props) {
      const { bindTooltip, bindPopup } = this;
      const { markerOption, tooltipOption, renderTooltip, renderPopup, popupOption, event } = props;
      
      if (renderTooltip) {
        bindTooltip(renderTooltip(markerData), target, tooltipOption);
      }

      if (renderPopup) {
        bindPopup(renderPopup(markerData), target, popupOption);
      }

      if (event) {
        target.on(event);
      } 
    },
    
    // 添加折线 LatLng[]
    addPolyline(lineData, lineOption, target) {
      const option = lineOption ? lineOption : {};
      return L.polyline(lineData, option).addTo(target);
    },
    // 添加区域 undo
    addPolygon(lineData, lineOption, target, foucs = false) {
      const option = lineOption ? lineOption : {};
      const p = L.polygon(lineData, option).addTo(target); 
      foucs && this.map.fitBounds(p.getBounds());
      return p;
    },

    // 生成 popup undo
    genPopup(option, latlng, content, target) {
      L.popup(option).setLatLng(latlng).setContent(content).addTo(target);
    },
    // 绑定popup undo
    bindPopup(content, target, popupOption = {}, latLng = undefined) {
      const { isOpen } = popupOption;

      if (isOpen) {
        target.bindPopup(content, popupOption).openPopup(latLng);
        return;
      }
      target.bindPopup(content, popupOption);
    },
    // 绑定tooltip
    bindTooltip(content, target, tooltipOption = {}, latLng = undefined) {
      const { isOpen } = tooltipOption;

      if (isOpen) {
        target.bindTooltip(content, tooltipOption).openTooltip(latLng);
        return;
      }
      target.bindTooltip(content, tooltipOption);
    },
  }
};
</script>
<template>
</template>
<style>
  .active_marker {
    position: relative;
    width: 14px;
    height: 14px;
    background-color: rgba(127, 193, 254, 1);
    border: 1px solid #fff;
    border-radius: 50%;
    transition: all .3s;
  }
  .active_marker .wave1 {
    position: absolute;
    top: -1px;
    left: -1px;
    width: 14px;
    height: 14px;
    opacity: 0;
    background-color: rgba(127, 193, 254, .8);
    border-radius: 50%;
    z-index: -1;
    animation: circle-opacity 1s infinite;
  }
  .active_marker .wave2 {
    position: absolute;
    top: -3px;
    left: -3px;
    width: 18px;
    height: 18px;
    opacity: 0;
    background-color: rgba(127, 193, 254, .3);
    border-radius: 50%;
    z-index: -2;
    animation: circle-opacity 1s infinite;
  }

  @keyframes circle-opacity {
    from {
      opacity: 1;
      transform: scale(1);
    }

    to {
      opacity: 0;
      transform: scale(4);
    }
  }
</style>