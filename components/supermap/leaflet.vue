<template>
  <div :id="`map${initOption.id}`" />
</template>
<script>
import L from 'leaflet';

export default {
  data() {
    return {
      initOption: {
        list: ['id', 'center', 'zoom', 'mapUrl'],
        id: (new Date()).getTime() + Math.floor(Math.random(100)),
        center: [30, 110],
        zoom: 6,
        mapUrl: [
          'http://t0.tianditu.com/vec_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=vec&tileMatrixSet=w&TileMatrix={z}&TileRow={y}&TileCol={x}&style=default&format=tiles&tk=1a905b663dde38d7c6169e1ea9ca418f',
          'http://t0.tianditu.com/cva_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cva&tileMatrixSet=w&TileMatrix={z}&TileRow={y}&TileCol={x}&style=default&format=tiles&tk=1a905b663dde38d7c6169e1ea9ca418f'
        ]
      },
      map: {},
      RasterLayer: [],
      markerLayer: [],
      tooltipLayer: [],
      polygonLayer: [],
      tempLayer: []
    };
  },
  methods: {
    initMap() {
      this.map = L.map(`map${this.initOption.id}`, {
        center: this.initOption.center,
        zoom: this.initOption.zoom,
        zoomControl: false
      });
      var latlngs = [[37, -109.05], [41, -109.03], [41, -102.05], [37, -102.04]];
      L.polygon(latlngs, {color: 'red'}).addTo(this.map);
      this.RasterLayer = L.layerGroup(this.initOption.mapUrl.map((url) => L.tileLayer(url).addTo(this.map)));
      this.markerLayer = L.layerGroup().addTo(this.map);
      this.polygonLayer = L.layerGroup().addTo(this.map);
    },
    setInitOption(key, value) {
      if (!this.initOption.list.includes(key)) {
        console.log(`地图初始化设置${key}失败！`);
        return;
      }
      this.initOption[key] = value;
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
    addMarker(markerData, flush = false) {
      if (flush) {
        this.removeMarker();
      }
      markerData.forEach((data) => {
        const marker = L.marker(data.location).bindTooltip(data.label, {
          direction: 'top',
          className: 'tooltip',
          offset: [0, -10]
        }).openTooltip();
        marker.addTo(this.markerLayer);
      });
    },
    removeMarker() {
      this.markerLayer.clearLayers();
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
    }
  }
};
</script>