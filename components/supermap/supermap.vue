/* eslint-disable */
<template>
  <div :id="`map${initOption.id}`" />
</template>
<script>
export default {
  data() {
    return {
      initOption: {
        list: ['id', 'center', 'zoom', 'mapUrl'],
        id: (new Date()).getTime() + Math.floor(Math.random(100)),
        center: [30, 110],
        zoom: 4,
        mapUrl: [
          'http://t0.tianditu.com/vec_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=vec&tileMatrixSet=w&TileMatrix={z}&TileRow={y}&TileCol={x}&style=default&format=tiles&tk=1a905b663dde38d7c6169e1ea9ca418f',
          'http://t0.tianditu.com/cva_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cva&tileMatrixSet=w&TileMatrix={z}&TileRow={y}&TileCol={x}&style=default&format=tiles&tk=1a905b663dde38d7c6169e1ea9ca418f'
        ]
      },
      mapXZQHUrl: 'http://10.96.6.138:8090/iserver/services/map-China2/rest/maps/ChinaSatellite',
      map: {},
      RasterLayer: [],
      markerLayer: [],
      tooltipLayer: [],
      polygonLayer: [],
      popupLayer: [],
      tempLayer: [],

      // control
      tempPoint: null,
      tempLine: null,
      tempPolygon: null,
      points: [],
      tempDistance: 0,
      measureLayer: [],
      tipLayer: {}
    };
  },
  methods: {
    initSupermap() {
      this.map = L.map(`map${this.initOption.id}`, {
        crs: L.CRS.EPSG4326,
        center: this.initOption.center,
        // maxZoom: 11,
        minZoom: 2,
        zoom: this.initOption.zoom,
        zoomControl: false,
        attributionControl: false
      });
      this.RasterLayer = L.layerGroup().addTo(this.map);
      this.markerLayer = L.layerGroup().addTo(this.map);
      this.popupLayer = L.layerGroup().addTo(this.map);
      this.tempLayer = L.layerGroup().addTo(this.map);
      this.polylineLayer = L.layerGroup().addTo(this.map);
      this.polygonLayer = L.layerGroup().addTo(this.map);
      this.measureLayer = L.layerGroup().addTo(this.map);
      this.tipLayer = L.layerGroup().addTo(this.map);
    },

    setInitOption(key, value) {
      if (!this.initOption.list.includes(key)) {
        console.log(`地图初始化设置${key}失败！`);
        return;
      }
      this.initOption[key] = value;
    },

    getMapId() {
      return this.initOption.id;
    },

    addTileLayer(mapUrl, flush = false) {
      if (flush) {
        this.removeTileLayer();
      }
      this.mapUrl.forEach((url) => {
        L.tileLayer(url).addTo(this.RasterLayer);
      });
    },
    removeTileLayer() {
      this.RasterLayer.clearLayers();
    },

    addSupermapTileLayer(urlOptionList, flush = false) {
      if (flush) {
        this.removeTileLayer();
      }
      urlOptionList.map((option, i) => {
        if (!option) {
          return;
        }
        const layer = option.map(l => L.supermap.tiandituTileLayer(0));
        if (i === 0) {
          this.RasterLayer = L.layerGroup(layer).addTo(this.RasterLayer);
        }
        this.RasterLayer = L.layerGroup(layer);
      });
    },

    addMarker(markerData, flush = false) {
      if (flush) {
        this.removeMarker();
      }
      markerData.forEach((data) => {
        const marker = L.marker([data.latitude, data.longitude], data.option).bindPopup(data.label, {
          direction: 'top',
          className: 'tooltip',
          offset: [0, -10]
        }).openPopup();
        marker.addTo(this.markerLayer);
      });
    },
    removeMarker() {
      this.markerLayer.clearLayers();
    },

    setIcon(iconUrl, size = [24, 24]) {
      if (iconUrl && Array.isArray(iconUrl)) {
        return iconUrl.map(icon => {
          return L.icon({
            iconUrl: icon,
            iconSize: [24, 24]
          });
        });
      }
    },

    addPolygon(polygonData, flush = false) {
      if (flush) {
        this.removePolygon();
      }
      polygonData.forEach((data) => {
        const { latlngs, option } = data;
        L.polygon(latlngs, option).addTo(this.polygonLayer);
      });
    },
    removePolygon() {
      this.polygonLayer.clearLayers();
    },

    removePolyline() {
      this.polylineLayer.clearLayers();
    },
    addPolyline(polygonData, flush = false) {
      if (flush) {
        this.removePolygon();
      }
      polygonData.forEach((data) => {
        const { latlngs, option } = data;
        L.polygon(latlngs, option).addTo(this.polylineLayer);
      });
    },

    addPopup({ content, option = {}, marker, isTip, location, flush }) {
      if (!content) {
        console.log(`无信息，请检查!`);
        return;
      }

      if (flush) {
        this.popupLayer.clearLayers();
      }

      if (marker) {
        marker.bindPopup(content, option).openPopup();
        return;
      }

      if (!location) {
        console.log(`无坐标信息，请检查!`);
        return;
      }
      const popup = L.popup(option).setLatLng(L.latLng([location.lat, location.lng])).openOn(this.map);
      isTip ? popup.addTo(this.tipLayer) : popup.addTo(this.popupLayer);
    },
    removePoup() {
      this.popupLayer.clearLayers();
    },

    removeTip() {
      this.tipLayer.clearLayers();
    },
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
      const content = '总距离：' + this.parseUnit(this.tempDistance, '米');
      this.addPopup({ marker: this.lines, content, location: this.lines.getCenter(), option: { closeButton: false } });

      this.map.off('click');
      this.map.off('keypress');
      this.tempPoint = null;
      this.tempDistance = 0;
    },
    // measureArea
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
    },
    removeMeasure(measureGroup) {
      this.measureGroup.clearLayers();
    },
    parseUnit(value, unit) {
      if (Array.isArray(value)) {
        return value.map((v) => {
          return v > 1000 ? (v / 1000).toFixed(2) + `千${unit}` : v.toFixed(2) + unit;
        });
      }
      return value > 1000 ? (value / 1000).toFixed(2) + `千${unit}` : value.toFixed(2) + unit;
    }
  }
};
</script>