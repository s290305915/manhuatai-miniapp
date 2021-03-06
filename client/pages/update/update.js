const apiUpdate = require('../../api/update');

// 导航栏的高度 42px
const tagListHeight = 42;

Page({
  data: {
    currentIndex: 6,
    update: [],
    swiperHeight: 0,
    first: {},
    second: {},
    third: {},
    fourth: {},
    fifth: {},
    sixth: {},
    seventh: {},
  },
  onLoad: function() {
    this.getUpdateList();
    wx.getSystemInfo({
      success: (info) => {
        this.setData({
          swiperHeight: info.windowHeight - tagListHeight,
        });
      },
    });
  },
  // 点击顶部tag栏
  switchTag: function(e) {
    const currentIndex = e.currentTarget.dataset.index;
    this.setData({
      currentIndex,
    });
  },
  // 滑动swiper，current 改变时会触发 change 事件
  swiperChange: function(e) {
    const currentIndex = e.detail.current;
    const update = this.data.update;
    const data = update[currentIndex];
    this.setData({
      currentIndex,
    });
    if (currentIndex === 0 && !this.data.first.comicUpdateDate) {
      this._setData('first', data);
    }
    if (currentIndex === 1 && !this.data.second.comicUpdateDate) {
      this._setData('second', data);
    }
    if (currentIndex === 2 && !this.data.third.comicUpdateDate) {
      this._setData('third', data);
    }
    if (currentIndex === 3 && !this.data.fourth.comicUpdateDate) {
      this._setData('fourth', data);
    }
    if (currentIndex === 4 && !this.data.fifth.comicUpdateDate) {
      this._setData('fifth', data);
    }
    if (currentIndex === 5 && !this.data.sixth.comicUpdateDate) {
      this._setData('sixth', data);
    }
    if (currentIndex === 6 && !this.data.seventh.comicUpdateDate) {
      this._setData('seventh', data);
    }
  },
  _setData: function(key, val) {
    this.setData({
      [key]: val,
    });
  },
  getUpdateList: function() {
    apiUpdate.getUpdateList((res) => {
      const update = res.data.update;
      this.setData({
        update,
        currentIndex: update.length - 1,
        seventh: update[update.length - 1],
      });
    });
  },
});
