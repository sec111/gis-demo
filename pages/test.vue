<template>
  <div>
    <div class="map-test">
      <label>切换底图：</label>
      <select name="public-choice" v-model="basemapName" @change="changeBasemap">                                        
          <option v-for="mapUrl in mapUrlList" :key="mapUrl.name" :value="mapUrl.name">{{mapUrl.label}}</option>                                    
      </select>
      <button @click="addSingleMarker()">添加单个点</button>
      <button @click="clearGroup('singlePoint')">删除单个点</button>

      <!-- <button @click="addSinglePulseMarker()">添加单个闪烁点</button>
      <button @click="clearGroup('singlePulsePoint')">删除单个闪烁点</button> -->

      <button @click="addMultiMarker()">添加批量点</button>
      <button @click="clearGroup('multiPoint')">删除批量点</button>

      <button @click="addUserPolygon()">添加面</button>
      <button @click="clearGroup('polygon')">删除面</button>

      <button @click="addMarkerWithTooltip()">添加tooltip</button>
      <button @click="clearGroup('tooltip')">删除tooltip</button>

      <button @click="addMarkerWithPopup()">添加popup</button>
      <button @click="clearGroup('popup')">删除popup</button>

      <button @click="addEvent()">监听事件点</button>
      <button @click="clearGroup('eventMarker')">删除事件点</button>
      <br/>
      
      <div class="map1">
        <supermap :ref="id" :id="id" :option="option" />
      </div>

      <button @click="handleMeasureDistance()">测距</button>
      <button @click="handleMeasureArea()">测面</button>
      <button @click="removeMeasure()">清除测量</button>

      <button @click="addTyphoon(17219)">添加台风</button>
      <button @click="removeTyphoon(17219)">取消台风</button>
      <br/>

      <div class="map2">
        <supermap :ref="id2" :id="id2" :option="option" />
      </div>
      
    </div>
  </div>
</template>
<script>
import supermap from '@/components/supermap';
import damJson from '@/static/json/damData.json';
import dzIconThirty from '@/static/image/gis/disaster.png';
import panoIcon from '@/static/image/gis/red.png';

export default {
  layout: 'none',
  components: { supermap },
  data() {
    return {
      id: 'testmap',
      id2: 'testmap2',
      option: {
        crs: L.CRS.EPSG4326,
        center: [30, 110],
        zoom: 4,
      },
      mapUrlList: [
        { 
          label: '天地图',
          name: 'tianditu',
          url: [
            {
              layerType: 'img',
              crs: L.CRS.TianDiTu_WGS84,
              transparent: true,
              opacity: 1
            },
            {
              layerType: 'img',
              isLabel: true,
            }
          ]
        }, 
        {
          label: '城市地图',
          name: 'city',
          url: [
            {
              crs: L.CRS.TianDiTu_WGS84,
              transparent: true,
              opacity: 1
            },
            {
              isLabel: true,
            }
          ]
        }
      ],
      
      basemapName: 'tianditu',
      basemapName2: 'city',
      tempIcon: {}
    };
  },
  methods: {
    // 切换地图
    changeBasemap() {
      const { basemapName, mapUrlList } = this;
      const { addTiandituBaseMap } = this.supermap.layer;

      const basemapOption = mapUrlList.find(m => m.name === basemapName);
      addTiandituBaseMap(basemapName, basemapOption.url);
    },

    // 示例：数据映射--个性化icon
    genIcon(data) {
      const iconUrl = data.damType > 2 ? dzIconThirty : panoIcon;
      return {
        iconUrl,
        iconSize: [14, 14]
      };
    },

    // 示例： 添加单个标注点
    addSingleMarker() {
      const { genIcon, supermap } = this;
      const { addMarker } = supermap.ui;
      const { genLayerGroup } = supermap.layer;

      const groupName = 'singlePoint';
      const group = genLayerGroup(groupName);

      const markerData = damJson[5];
      addMarker(markerData, group, { iconFunc: genIcon });
    },
    
    // 示例： 添加多个标注点
    addMultiMarker() {
      const { genIcon, supermap } = this;
      const { addMarker } = supermap.ui;
      const { genLayerGroup } = supermap.layer;

      const groupName = 'multiPoint';
      const group = genLayerGroup(groupName);

      const markerData = damJson;
      addMarker(markerData, group, { iconFunc: genIcon });
    },

    // 示例：添加多个带tooltip的点
    addMarkerWithTooltip() {
      const { genIcon, supermap, renderTooltip } = this;
      const { addMarker } = supermap.ui;
      const { genLayerGroup } = supermap.layer;

      const groupName = 'tooltip';
      const group = genLayerGroup(groupName);

      const markerData = damJson;
      const tooltipOption = { opacity: 0.8, direction: 'top', className: 'tooltip', permanent: true };

      addMarker(markerData, group, { iconFunc: genIcon, tooltipOption, renderTooltip });
    },
    renderTooltip(data) { // return <String|HTMLElement|Function|Tooltip>
      const fontSize = data.damType > 2 ? 20 : 16;
      const color = data.damType > 2 ? 'blue' : 'red';
      const style = 'font-size: ' + fontSize + 'px; color: ' + color;

      // const content = data.damName;
      
      const content = '<span style="' + style + '">' + data.damName + '</span>';

      return this.common.str2htmlElement(content);
    },

    // 示例：添加多个带popup的点
    addMarkerWithPopup() {
      const { genIcon, supermap, renderPopup } = this;
      const { addMarker } = supermap.ui;
      const { genLayerGroup } = supermap.layer;

      const groupName = 'popup';
      const group = genLayerGroup(groupName);

      const markerData = damJson;
      const popupOption = { closeOnEscapeKey: 'auto', closeButton: false, keepInView: true, isOpen: true };

      addMarker(markerData, group, { iconFunc: genIcon, popupOption, renderPopup });
    },

    renderPopup(data) { // return <String|HTMLElement|Function|Tooltip>
      const fontSize = data.damType > 2 ? 20 : 16;
      const color = data.damType > 2 ? 'blue' : 'red';
      const style = 'font-size: ' + fontSize + 'px; color: ' + color;

      // const content = data.damName;
      
      const content = '<span style="' + style + '">' + data.damName + '</span>';

      return this.common.str2htmlElement(content);
    },

    // 示例：添加多个点击闪烁的点
    addEvent() {
      const { genIcon, supermap, renderPopup, focusOnMarker, focusOutMarker } = this;
      const { addMarker } = supermap.ui;
      const { genLayerGroup } = supermap.layer;

      const groupName = 'eventMarker';
      const group = genLayerGroup(groupName);
      
      const markerData = damJson;
      const event = {
        'popupopen': focusOnMarker,
        'popupclose': focusOutMarker
      };

      const popupOption = { closeOnEscapeKey: 'auto', closeButton: false, keepInView: true };

      addMarker(markerData, group, { iconFunc: genIcon, popupOption, renderPopup, event });
    },
    // 设置闪烁
    focusOnMarker(e) {
      const marker = e.target;
      this.tempIcon = marker.options.icon;
      this.supermap.ui.setActiveIcon(marker);
    },
    // 取消闪烁
    focusOutMarker(e) {
      const marker = e.target;
      marker.setIcon(this.tempIcon);
    },

    // 示例：添加区域
    addUserPolygon() {
      const { supermap } = this;
      const { addPolygon } = supermap.ui;
      const { genLayerGroup, getLayerGroup } = supermap.layer;

      const groupName = 'polygon';
      genLayerGroup(groupName);
      const group = getLayerGroup(groupName);

      const polygonData = [
        [[37, 114.05],[41, 111.03],[41, 112.05],[37, 112.04]],
        [[41, 115.05],[40, 112.03],[36, 112.05],[35, 112.04]],
      ];
      polygonData.forEach((p, i) => {
        const color = i === 1 ? '#ffff00' : '#ff00ff';
        const option = { fillColor: color, fillOpacity: 0.5, stroke: false };
        addPolygon(p, option, group);
      });
    },

    // 示例： 关闭图层组
    closeMarker(groupName) {

    },
    // 示例： 开启图层组
    openGroup(groupName) {

    },
    // 示例：添加图层组
    addGroup(groupName) {
      this.supermap.layer.genLayerGroup(groupName);
    },
    // 示例： 移除图层组
    clearGroup(groupName) {
      const group = this.supermap.layer.getLayerGroup(groupName);
      this.supermap.layer.clearLayers(group);
    },

    // 切换地图
    changeBasemap2() {
      const { basemapName, mapUrlList } = this;
      const { addTiandituBaseMap } = this.supermap2.layer;

      const basemapOption = mapUrlList.find(m => m.name === basemapName);
      addTiandituBaseMap(basemapName, basemapOption.url);
    },
    // 测距
    handleMeasureDistance() {
      this.supermap2.measure.handleMeasureDistance();
    },
    // 测面
    handleMeasureArea() {
      this.supermap2.measure.handleMeasureArea();
    },
    // 取消测量
    removeMeasure() {
      this.supermap2.measure.removeMeasure();
    },
    // 添加台风
    addTyphoon(eventId) {
      this.supermap2.typhoon.addTyphoon(eventId);
    },
    // 删除台风
    removeTyphoon(eventId) {
      this.supermap2.typhoon.clearTyphoon(eventId);
    }
  },
  mounted() {
    this.supermap = this.$refs[this.id];
    this.supermap2 = this.$refs[this.id2];
    this.changeBasemap();
    this.changeBasemap2();
  }
};
</script>
<style scope>
  .map-test {
    position: absolute;
    width: 100%;
    height: 600px;
  }
  .map-test .map1 {
    width: 100%;
    height: 350px;
  }
  .map-test .map2 {
    width: 100%;
    height: 350px;
  }
  select {
    margin: 8px;
  }
  button {
    margin: 8px;
  }
</style>