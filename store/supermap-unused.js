const state = ({
  mapList: {}
});

const mutations = {
  SET_MAPLIST({state}, mapList) {
    state.mapList = mapList;
  }
};

const actions = {
  addMap({state, mutations}, mapId, map) {
    if (typeof str !== 'string') {
      return '地图id必须为字符串';
    }

    const mapList = state.mapList;

    if (mapList.hasOwnProperty(mapId)) {
      return '地图id冲突';
    }
    mapList[mapId] = map;
    mutations.SET_MAPLIST(mapList);
    return null;
  },
  removeMap({state, mutations}, mapId) {
    const mapList = state.mapList;

    if (!mapList.hasOwnProperty(mapId)) {
      return `不存在id为${mapId}的地图`;
    }

    delete mapList[mapId];
    mutations.SET_MAPLIST(mapList);
    return null;
  },
  getMap({state}, mapId) {
    const mapList = state.mapList;

    if (!mapList.hasOwnProperty(mapId)) {
      return `不存在id为${mapId}的地图`;
    }

    return mapList[mapId];
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
