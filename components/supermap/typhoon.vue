<template>
</template>
<script>
import depression from '@/static/image/gis/tropical-depression.png';        // 热带低压
import storm from '@/static/image/gis/tropical-storm.png';        // 热带风暴
import severe from '@/static/image/gis/severe-tropical-storm.png';      // 强热带风暴
import typhoon from '@/static/image/gis/typhoon.png';           // 台风
import strong from '@/static/image/gis/strong-typhoon.png';         // 强台风
import superTyphoon from '@/static/image/gis/super-typhoon.png';       // 超强台风
import vanishing from '@/static/image/gis/typhoon-vanishing-point.png';     // 台风消亡点
import centerIcon from '@/static/image/gis/current-point.gif';       // 当前位置

import typhoonJson from '@/static/json/typhoon.json';

const typeList = [
  { title: '热带低压', iconUrl: depression },
  { title: '热带风暴', iconUrl: storm },
  { title: '强热带风暴', iconUrl: severe },
  { title: '台风', iconUrl: typhoon },
  { title: '强台风', iconUrl: strong },
  { title: '超强台风', iconUrl: superTyphoon },
  { title: '台风消亡点', iconUrl: vanishing },
];
const colorLine = [
  { name: '中国', color: '#E73B52' },
  { name: '中国台湾', color: '#C52ECF' },
  { name: '日本', color: '#2FB63A' },
  { name: '美国', color: '#31A3B1' },
  { name: '中国香港', color: '#E75F3B' },
];

export default {
  inject: ['getMap', 'getUI', 'getLayer'],
  head: {
    script: [
      { src: '/libs/supermap/clipper.js' },
      { src: '/libs/supermap/clipper_unminified.js' },
      { src: '/libs/supermap/GProj.js' },
      { src: '/libs/supermap/GRoute.js' }
    ]
  },
  data() {
    return {
      shutdownSignal: {},
      eventIdList: [],
    };
  },
  methods: {
    init() {
      this.map = this.getMap();
      this.ui = this.getUI();
      this.layer = this.getLayer();
    },
    // 时间格式化 tested
    format(time) {
      const timeArr = time.split(' ');
      const [ year, month, date ] = timeArr[0].split('/');
      const hour = timeArr[1].split(':')[0];

      return `${year}年${month}月${date}日${hour}时`;
    },
    // 用户自定义颜色的折线 
    // param data.tm 国家名称：中国 | 中国台湾 | 日本 | 美国 | 中国香港
    // return polyline tested
    genPolyline(data, predPoints, target) {
      const { ui } = this;

      const colorItem = colorLine.find(c => c.name === data.tm);
      const option = { 
        color: colorItem ? colorItem.color : '#E73B52',
        weight: 2,
        dashArray: '5'
      };
      
      ui.addPolyline(predPoints, option, target);
    },
    // 根据台风强度确定不同点据图标
    // param strong 台风强度
    // return icon tested
    genTyphoonIcon(data) {
      if (data.isCenter) {
        return {
          iconUrl: centerIcon,
          iconSize: [48, 48]
        }
      }
      const type = typeList.find(t => t.title === data.strong);
      const iconOption = {
        iconUrl: type ? type.iconUrl : typhoon,
        iconSize: [12, 12]
      };
      // console.log(iconOption);
      return iconOption;
    },
    // 正向影响半径polygon tested
    calcEffeRegionCoords(lng, lat, radius) {
      if (!radius) {
        return;
      }

      const centerPoint = turf.point([lng, lat]);
      const options = { steps: 500 };
      let polygonPointArr = [];

      radius.split('|').forEach((r, i) => {
        // 0 NE 0 - 90  | 1 SE 270 - 360 | 2 SW 180 - 270 | 3 NW 90 - 180
        const startAngle = i ? 360 - i * 90 : 0;
        const endAngle = startAngle + 90;
        const arc = turf.lineArc(centerPoint, r, startAngle, endAngle, options);
        polygonPointArr.push(...arc.geometry.coordinates);
      });

      return polygonPointArr.map(p => p.reverse());
    },
    // 影响半径边界线点转换
    calculateBoundLine(coords) {
      let myRoute = new GRoute();
      let projScale = 100000.0;
      // 将经纬度转为墨卡托投影
      let myProj = new GProj();
      coords.forEach(item => {
        let projCoord = myProj.getMercator({lng: item.lng, lat: item.lat});
        if (item.radius7 === '') {
          return;
        }
        let radius = item.radius7.split('|');
        let maxRadiu = radius.reduce(function (a, b) {
          return b > a ? b : a;
        });
        myRoute.appendPoint([projCoord.x / projScale, projCoord.y / projScale], (maxRadiu * 1000) / projScale);
      });
      // 剔除重复点
      myRoute.deleteRecuplication();
      // 剔除自相交
      myRoute.deleteSelfIntersection();
      // 获取最小半径，生成中轴线的扩充线
      let minRadiu = myRoute.getMinRadius();
      let epsilon = minRadiu / 10.0;
      let edgeLine = myRoute.getBufferEdgeLine(epsilon);
      // 计算缓冲区
      let latlngs = [];
      let subj = new ClipperLib.Paths();
      let solution = new ClipperLib.Paths();
      subj[0] = [];
      for (let item of edgeLine) {
        subj[0].push({
          X: item.x,
          Y: item.y
        });
      }
      subj[0].push({
        X: edgeLine[0].x,
        Y: edgeLine[0].y
      });
      let scale = 100;
      ClipperLib.JS.ScaleUpPaths(subj, scale);
      let co = new ClipperLib.ClipperOffset(2, 0.25);
      co.AddPaths(subj, ClipperLib.JoinType.jtRound, ClipperLib.EndType.etClosedPolygon);
      co.Execute(solution, (minRadiu - epsilon) * scale);
      for (let item of solution[0]) {
        // console.log(item.X + "," + item.Y);
        var latlngCoord = myProj.getLngLat({ x: (item.X / scale) * projScale, y: (item.Y / scale) * projScale });
        latlngs.push([latlngCoord.lat, latlngCoord.lng]);
      }
      return latlngs;
    },
    // 添加台风预测路径
    addPredictPath(tpPredictPath, target) {
      const { ui, genTyphoonIcon, genPolyline } = this;
      const { genSingleMarker } = ui;
      
      tpPredictPath.forEach((path) => {
        const predPoints = path.forecastpoints.map((point) => {
          const { lat: latitude, lng: longitude, markericon } = point;
          const marker = genSingleMarker({ ...point, latitude, longitude }, genTyphoonIcon);
          marker.addTo(target);

          return [latitude, longitude];
        });

        genPolyline(path, predPoints, target);
      });
    },
    // 台风路径点信息查询
    showTPPop(e) {
      console.log(e.target);
      e.cancelBubble = true;
      const TPinfo = e.target.options;
      let screenX = e.originalEvent.clientX;
      let screenY = e.originalEvent.clientY;
    },
    // 台风路径点信息关闭
    closeTPPop() {
      console.log(111);
    },
    // 添加台风实际路径
    addTpActualPath(tpActualPath, tpPredictPath, effeRegionPoints, typhoonName, typhoonId, eventId, target) {
      const { format, genTyphoonIcon: iconFunc, addPredictPath, 
        closeTPPop, showTPPop, addTPRegion, showTPaffects,  ui } = this;
      const { addSingleMarker, addPolyline, addPolygon } = ui;

      // 添加预测路径
      const len = tpActualPath.length;
      // 关闭信号
      this.shutdownSignal[`shutdown${eventId}`] = false;
      
      const tooltipOption = { direction: 'right', permanent: 'true' };
      const lineOption = {};
      const polygonOption = {
        color: '#FF8247',
        fillOpacity: 0.3,
        weight: 0.5
      };
      const event = {
        'mouseout': closeTPPop,
        'mouseover': showTPPop
      };
      let centerMarker = {};

      // 台风路径foucs on
      const latlngs = [
        [tpActualPath[0].lat, tpActualPath[0].lng],
        [tpActualPath[len - 1].lat, tpActualPath[len - 1].lng]
      ];
      this.map.fitBounds(latlngs, { padding: [20, 20] });
  
      let i = 0;
      const interval = window.setInterval(() => {
        if (i >= len || this.shutdownSignal[`shutdown${eventId}`]) {
          clearInterval(interval);
          return;
        }

        // 添加路径点
        const point = tpActualPath[i];
        const { lat: latitude, lng: longitude, markericon } = point;
        const nextPoint = i < len - 1 ? tpActualPath[i + 1] : tpActualPath[i];

        let tip;
        if (i === 0) {
          tip = `${typhoonName}`;
          // 添加中心点
          const isCenter = true;
          centerMarker = addSingleMarker({ ...point, latitude, longitude, isCenter }, target, { iconFunc, event });
        }

        if (i === len - 1) {
          const time = tpActualPath[i] && tpActualPath[i].time && format(tpActualPath[i].time);
          tip = `${typhoonName}(${time})`;
        }

        // 移动中心点
        centerMarker.setLatLng([point.lat, point.lng]);
        const renderTooltip = (point) => tip;
        
        if (tip) {
          addSingleMarker({ ...point, latitude, longitude }, target, { iconFunc, tooltipOption, renderTooltip, event });
        } else {
          addSingleMarker({ ...point, latitude, longitude }, target, { iconFunc, event });
        }

        // 添加实际影响半径
        target.hasLayer(this.polygon1) && target.removeLayer(this.polygon1);
        target.hasLayer(this.polygon2) && target.removeLayer(this.polygon2);
        if (point.effectRegionPoly7) {
          this.polygon1 = addPolygon(point.effectRegionPoly7, polygonOption, target);
        }
        if (point.effectRegionPoly10) {
          this.polygon2 = addPolygon(point.effectRegionPoly10, polygonOption, target);
        }
        // 添加实际路径
        addPolyline([[point.lat, point.lng], [nextPoint.lat, nextPoint.lng]], lineOption, target);

        if (i === len - 1) {
          // 添加预测点路径
          addPredictPath(tpPredictPath, target);
          // 添加包络线
          addPolygon(effeRegionPoints, {color: '#FFAD06', fillOpacity: 0.3}, target);
        }
        i++;
      }, 50);
    },

    // 入口
    // param eventId 台风编号
    addTyphoon(eventId) {
      if (!eventId) {
        return ;
      }

      const { genTyphoonIcon, calcEffeRegionCoords, common, layer } = this;
      const { last } = common;
      const { genLayerGroup } = layer;

      const data = typhoonJson[0];
      const { name: typhoonName, emergencyOutId: typhoonId, typhoonPoints } = data;
      const typhoonInfo = JSON.parse(typhoonPoints);

      // 考虑是否存在数据点为空
      if (!typhoonInfo || !typhoonInfo.points || typhoonInfo.points.length === 0) {
        console.log(`id为${eventId}的台风无数据`);
        return ;
      }

      // 创建图层组
      const target = genLayerGroup(`typhoon${eventId}`);
      this.eventIdList.push(eventId);

      // 构造实际路径每个点的icon类型和影响半径
      const tpActualPoint = typhoonInfo.points.map(t => {
        const markericon = genTyphoonIcon(t.strong);
        const effectRegionPoly7 = calcEffeRegionCoords(t.lng, t.lat, t.radius7);
        const effectRegionPoly10 = calcEffeRegionCoords(t.lng, t.lat, t.radius10);

        return { ...t, markericon, effectRegionPoly7, effectRegionPoly10 };
      });
      // 构造预测路径的icon
      const forecast = last(tpActualPoint).forecast;

      const tpPredictPath = forecast.map((f) => {
        const forecastpoints =  f.forecastpoints.map((p) => { 
          return { 
            ...p,
            markericon: genTyphoonIcon(p.strong)
          }
        });

        return {
          forecastpoints,
          tm: f.tm
        }
      });

      const effeRegionPoints = this.calculateBoundLine(tpActualPoint);
      this.addTpActualPath(tpActualPoint, tpPredictPath, effeRegionPoints, 
        typhoonName, typhoonId, eventId, target);
    },
    // 清除台风
    clearTyphoon(eventId) {
      this.shutdownSignal[`shutdown${eventId}`] = true;
      this.common.remove(this.eventIdList, eventId);
      this.layer.clearGroup(`typhoon${eventId}`);
    },
    // 清除所有台风
    clearAllTyphon() {
      if (!this.eventIdList.length) {
        return;
      }
      this.eventIdList.forEach(eid => {
        this.clearTyphoon(eid);
      });
    }
  },
  beforeDestroy() {
    this.clearAllTyphon();
  }
};
</script>
