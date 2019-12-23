<script>
export default {
  props: ['id'],
  data() {
    return {
      map: {},
      tempPoint: null,
      tempLine: null,
      tempPolygon: null,
      points: [],
      tempDistance: 0,
      measureLayer: [],
      tipLayer: []
    };
  },
  computed: {
    ...mapState('supermap', ['mapList'])
  },
  methods: {
    removeTip() {
      this.tipLayer.clearLayers();
    },
    /**
     * measureArea
     *  */ 
    handleMeasureDistance() {
      document.getElementById(this.initOption.id).style.cursor = 'crosshair';
      this.tempLine = L.polyline({ color: 'orange' });
      this.map.off('click');
      this.map.off('keypress');
      this.map.on('click', (e) => this.drawLine(e));
      this.map.on('keypress', (e) => this.endLine(e));
    },
    drawLine(e) {
      const { lat, lng } = e.latlng;
      this.points.push(e.latlng);
      this.removeTip();
      const prevPoint = this.tempPoint;
      this.tempPoint = L.latLng(lat, lng);
      this.addPopup({ content: `<p>左键单击绘制点</br>回车绘制结束</p>`, location: this.tempPoint, flush: true });
      if (!prevPoint) {
        return;
      }
      this.tempLine.addLatLng(e.latlng);
      this.measureGroup.addLayer(this.tempLine);

      this.tempDistance = this.tempDistance + prevPoint.distanceTo(this.tempPoint);
      const content = Math.round(this.tempDistance / 1000) + '千米';
      const pointMiddle = {
        lat: (prevPoint.lat + this.tempPoint.lat) / 2,
        lng: (prevPoint.lng + this.tempPoint.lng) / 2
      };
      this.addPopup({ content, location: pointMiddle });
    },
    endLine(e) {
      document.getElementById(this.initOption.id).style.cursor = 'default';
      this.removeTip();
      const content = '总距离：' + this.common.parseUnit(this.tempDistance, '米');
      this.addPopup({ marker: this.lines, content, location: this.lines.getCenter(), option: { closeButton: false } });

      this.map.off('click');
      this.map.off('keypress');
      this.tempPoint = null;
      this.tempDistance = 0;
    },

    /**
     * measureArea
     *  */ 
    removeMeasure() {
      this.measureGroup.clearLayers();
    },
    handleMeasureArea() {
      this.points = [];
      this.tempPolygon = L.polygon(this.points, { color: 'orange', fillColor: 'orange', fillOpacity: 0.5 });
      document.getElementById(this.initOption.id).style.cursor = 'crosshair';
      this.map.off('click');
      this.map.off('keypress');
      this.map.on('click', (e) => this.drawPoly(e));
      this.map.on('keypress', (e) => this.endPoly(e));
    },
    drawPoly(e) {
      this.points.push(e.latlng);
      this.removePoup();
      this.addPopup({ content: `<p>左键单击绘制点</br>回车绘制结束</p>`, location: this.tempPoint, flush: true });
      this.tempPolygon.addLatLng(e.latlng);
      this.measureGroup.addLayer(this.tempPolygon);
    },
    endPoly(e) {
      document.getElementById(this.initOption.id).style.cursor = 'default';
      this.removePoup();
      const area = turf.area(this.tempPolygon.toGeoJSON());
      const center = turf.centroid(this.tempPolygon.toGeoJSON());
      const [ lon, lat ] = center.geometry.coordinates[1];
      const content = '面积：' + Math.round(area / 1000000) + '平方千米';
      this.addPopup({ marker: this.tempPolygon, content, location: { lon, lat }, option: { closeButton: false } });

      this.map.off('click');
      this.map.off('keypress');
    }
  }
};
</script>
<template>
</template>