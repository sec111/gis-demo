<template>
  <div>
    aaa
    <div class="map-test">
      <label>切换底图：</label>
      <select name="public-choice" v-model="basemapName" @change="changeBasemap">                                        
          <option v-for="mapUrl in mapUrlList" :key="mapUrl.name" :value="mapUrl.name">{{mapUrl.label}}</option>                                    
      </select>
      <button @click="addSingleMarker()">添加单个点</button>
      <button @click="clearGroup('singlePoint')">删除单个点</button>
      <button @click="addMarker()">添加批量点</button>
      <button @click="clearGroup('multiPoint')">删除批量点</button>
      <button @click="console.log(1)">添加线</button>
      <button @click="console.log(1)">添加面</button>
      <button @click="console.log(1)">添加标注</button>
      <button @click="console.log(1)">添加范围</button>
      <button @click="console.log(1)">添加popup</button>

      <button @click="console.log(1)">绑定popup</button>

      <button @click="console.log(1)">添加台风</button>
      <button @click="console.log(1)">取消台风</button>
      <button @click="console.log(1)">激活测量</button>
      <button @click="console.log(1)">取消测量</button>
      <button @click="console.log(1)">添加点</button>
      
      <div>
        <supermap :ref="id" :id="id" :option="option" />
      </div>
      
    </div>
  </div>
</template>
<script>
import supermap from '@/components/supermap';
import damJson from '@/static/json/damData.json';
import dzIconThirty from '@/static/image/地质灾害点-高亮.png';
import panoIcon from '@/static/image/red.png';

export default {
  layout: 'none',
  components: { supermap },
  data() {
    return {
      id: 'testmap',
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
    // 数据对应个性化icon
    genIcon(data) {
      const iconUrl = data.damType > 2 ? damJson : panoIcon;
      return {
        iconUrl,
        iconSize: [14, 14]
      };   
    },
    // 添加标注点
    addUserMarker(markerData, genIcon, groupName) {
      const { supermap } = this;
      const { addMarker } = supermap.ui;
      const { genLayerGroup, getLayerGroup } = supermap.layer;

      genLayerGroup(groupName);
      const group = getLayerGroup(groupName);
      addMarker(markerData, genIcon, group);
    },
    // 示例： 添加单个标注点
    addSingleMarker() {
      const { genIcon, addUserMarker } = this;
      const groupName = 'singlePoint';
      const markerData = damJson[5];
      addUserMarker(markerData, genIcon, groupName);
    },
    
    // 示例： 添加多个标注点
    addMarker() {
      const { genIcon, addUserMarker } = this;
      const groupName = 'multiPoint';
      const markerData = damJson;
      addUserMarker(markerData, genIcon, groupName);
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
      const { clearLayers, getLayerGroup } = this.supermap.layer;
      const group = getLayerGroup(groupName);
      group && clearLayers(group);
    }

  },
  mounted() {
    this.supermap = this.$refs[this.id];
    this.changeBasemap();
  }
};
</script>
<style scope>
  .map-test {
    position: absolute;
    width: 100%;
    height: 600px;
  }
  select {
    margin: 8px;
  }
  button {
    margin: 8px;
  }
</style>