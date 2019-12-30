import Vue from 'vue';

/**
 * 全局公共方法或变量
 */
const common = {
  install(Vue) {
    Vue.prototype.common = {
      getTiandituKey: function () {
        return '55d4661b37331450725f6e4c14aeb387';
      },
      
      /**
       * 单位转化
       */
      parseUnit(value, unit) {
        if (Array.isArray(value)) {
          return value.map((v) => {
            return v > 1000 ? (v / 1000).toFixed(2) + `千${unit}` : v.toFixed(2) + unit;
          });
        }
        return value > 1000 ? (value / 1000).toFixed(2) + `千${unit}` : value.toFixed(2) + unit;
      },
      /**
       * 检查某个全局变量是否加载完成
       */
      checkLoading(val, content = 'sourse', maxTime = 7) {
        let i = 0;
        const time = setInterval(() => {
          i++;
          if (this.checkVar(val, window)) {
            clearInterval(time);
            console.log(`success, ${content} loaded successfully！`)
          }
          if(i > maxTime * 1000 / 10) {
            clearInterval(time);
            console.log(`fail, ${content} did not loaded successfully in ${maxTime} s`)
          }
        }, 100);
      },
      /**
       * 检查变量是否存在 aaa.dsafs.dsfa   b / l.supermap window
       */
      checkVar(attr, obj) {
        if (attr.indexOf('.') === -1) {
          return this.isObject(obj) && obj.hasOwnProperty(attr);
        }
        const [ temp, attrNew ] = attr.split('.');    
        return this.isObject(obj) && this.checkVar(attrNew, obj[temp]);
      },
      /**
       * 检查是否为空对象
       */
      isEmptyObject(obj) {
        return this.isObject(obj) && obj.keys().length === 0;
      },
      /**
       * 检查是否为对象
       */
      isObject(obj) {
        return obj && Object.prototype.toString.call(obj) === '[Object Object]'; 
      },
      isString(str){ 
        return (typeof str === 'string') && str.constructor === String; 
      },
      /**
       * interval 执行某个函数
       */
      loadingInterval(begin, step, max, time, fun, callback) {
        let i = begin;
        fun(begin, begin + step);
        const count = setInterval(() => {
          if (i >= max) {
            clearInterval(count);
            callback && callback();
          }
          i += step;
          fun(i, i + step);
        }, time);
        return count;
      },
      stopInterval(interval) {
        clearInterval(interval);
      },
      /**
       * 数据渲染成html 
       */ 
      str2htmlElement(str) {
        let ele = document.createElement('div');
        ele.innerHTML = str;
        return ele.childNodes[0];
      },
    };
  }
};
Vue.use(common);
