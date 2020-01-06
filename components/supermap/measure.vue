<script>
export default {
  inject: ['getMap', 'getUI', 'getLayer', 'getMapId'],
  data() {
    return {
      map: undefined,
      measureGroup: [],
      mesureTipGroup: [],

      tempPoint: null,
      tempLine: null,
      tempDistance: 0,
      tempPolygon: null,
    };
  },
  methods: {
    init() {
      this.map = this.getMap();
      this.ui = this.getUI();
      this.layer = this.getLayer();

      this.dom = document.getElementById(this.getMapId());
      this.measureGroup = this.layer.genLayerGroup('meature');
      this.mesureTipGroup = this.layer.genLayerGroup('meatureTip');
    },
    removeMeasure() {
      this.measureGroup.clearLayers();
    },
    showTip(point, dis = undefined) {
      const { map, ui, common, mesureTipGroup } = this;
      const { parseUnit } = common;
      const { genPopup } = ui;
      
      let tip, className;

      if (!dis) {
        tip = '<p class="tip">左键单击绘制点</br>回车绘制结束</p>';
        className = 'measure-tip';
      } else {
        const distance = parseUnit(dis, '米');
        tip = `<p>距离：${distance}</p>`;
        className = 'measure-tip-dis';
      }
      const pupupOption = {
        className,
        closeButton: false
      };
      
      genPopup(pupupOption, point, tip, mesureTipGroup);
    },

    removeTip() {
      this.mesureTipGroup.clearLayers();
    },
    /**
     * measureDistance
     **/ 
    handleMeasureDistance() {
      const { map, drawLine, endLine, dom, measureGroup, ui } = this;

      if (!map) {
        console.log('地图未初始化！');
        return;
      }

      dom.style.cursor = 'crosshair';

      const lineOption = { color: 'orange' };
      this.tempLine = ui.addPolyline([], lineOption, measureGroup);

      map.off('click');
      map.off('keypress');
      map.on('click', drawLine);
      map.on('keypress', endLine);
    },
    drawLine(e) {
      const { latlng } = e;
      let { tempDistance } = this;
      const { tempPoint: prevPoint, showTip, ui } = this;

      const tempPoint = ui.genLnt(latlng.lat, latlng.lng);
      console.log(tempPoint, prevPoint, latlng);
      // 显示提示
      showTip(tempPoint);

      if (!prevPoint) { // 若为第一个点，则不进行计算
        this.tempPoint = tempPoint;
        this.tempLine.addLatLng(latlng);
        this.measureGroup.addLayer(this.tempLine);
        return;
      }

      const dis = prevPoint.distanceTo(tempPoint);
      tempDistance += dis;
      const pointMiddle = {
        lat: (prevPoint.lat + tempPoint.lat) / 2,
        lng: (prevPoint.lng + tempPoint.lng) / 2
      };

      showTip(pointMiddle, dis);

      this.tempPoint = tempPoint;
      this.tempDistance = tempDistance;
      this.tempLine.addLatLng(latlng);
      this.measureGroup.addLayer(this.tempLine);
    },
    endLine(e) {
      const { map, tempLine, tempDistance, measureGroup, removeTip, showTip, ui, dom, common } = this;
      const { bindTooltip } = ui;

      dom.style.cursor = 'default';

      removeTip();
      // this.showTip(tempLine.getCenter(), tempDistance);

      const distance = common.parseUnit(tempDistance, '米');
      const tip = `<p>总距离：${distance}</p>`;
      const tooltipOption = { opacity: 0.8, direction: 'top', className: 'tooltip', permanent: true };
      bindTooltip(tip, tempLine, tooltipOption, tempLine.getCenter()) 

      this.tempPoint = null;
      this.tempLine = null;
      this.tempDistance = 0;
      map.off('click');
      map.off('keypress');
    },

    /**
     * measureArea
     *  */ 
    
    handleMeasureArea() {
      const { map, drawPoly, endPoly, dom, measureGroup, ui } = this;

      dom.style.cursor = 'crosshair';

      const polygonOption = { color: 'orange', fillColor: 'orange', fillOpacity: 0.5 };
      this.tempPolygon = ui.addPolygon([], polygonOption, measureGroup);

      map.off('click');
      map.off('keypress');
      map.on('click', drawPoly);
      map.on('keypress', endPoly);
    },
    drawPoly(e) {
      const tempPoint = e.latlng;
      this.showTip(tempPoint);
      this.tempPolygon.addLatLng(tempPoint);
      // this.measureGroup.addLayer(this.tempPolygon);
    },
    endPoly(e) {
      const { map, dom, removeTip, tempPolygon, ui } = this;
      const { bindTooltip, genLnt } = ui;

      dom.style.cursor = 'default';
      removeTip();

      const geoJson = tempPolygon.toGeoJSON()
      const area = turf.area(geoJson);
      const center = turf.centroid(geoJson);
      const [ lng, lat ] = center.geometry.coordinates;
      const content = '面积：' + Math.round(area / 1000000) + '平方千米';
      const tooltipOption = { opacity: 0.8, direction: 'top', className: 'tooltip', permanent: true };
      bindTooltip(content, tempPolygon, tooltipOption, genLnt(lat, lng));

      map.off('click');
      map.off('keypress');
    }
  }
};
</script>
<template>
</template>
<style>
  .measure-tip {
    /* position: absolute; */
    /* border-radius: 5px; */
    background: rgba(0, 0, 0, 0.7);
    color: white;
    /* width: 150px; */
    /* height: 50px; */
    /* padding: 10px; */
  }
  .measure-tip .leaflet-popup-content-wrapper, .measure-tip .leaflet-popup-tip {
    background: transparent;
    color: white;
  }
  .measure-tip .leaflet-popup-content {
    margin: 8px;
  }
  .measure-tip .tip {
    margin: 4px 0;
  }

</style>