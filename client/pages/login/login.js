const loginApi = require('../../api/login');
const cache = require('../../utils/cache');
const filter = require('../../utils/filter');

const app = getApp();

Page({
  data: {
    imgCode: '',
    content: '',
    showValidateModal: false,
    phoneNumber: 0,
    validateCode: 0,
    loading: false,
    hasSendSms: false,
    seconds: 60,
  },
  onLoad: function() {
    // 设置图片点击的次数 默认没有点击
    this.imgTapTimes = 0;
  },
  // 获取验证码
  getValidateCode: function() {
    if (this.data.hasSendSms) {
      return;
    }
    if (String(this.data.phoneNumber).length !== 11) {
      wx.showToast({
        title: '无效的手机号',
        icon: 'none',
      });
      return;
    }

    const requestData = {
      mobile: this.data.phoneNumber,
      refresh: 0,
    };
    this.setData({
      loading: true,
    });

    loginApi.sendsms(requestData, (res) => {
      this.setData({
        loading: false,
      });
      if (res.data.data.Content) {
        // 拼凑出图形验证码的base64格式的url
        const imgCodeBase64 = 'data:image/jpg;base64,' + res.data.data.Image;
        this.setData({
          showValidateModal: true,
          imgCode: imgCodeBase64,
          content: res.data.data.Content,
        });
      }
      if (res.data.status === 0) {
        this._SendSmsSuccess();
      }
      // 操作过于频繁时，提示我们
      if (res.data.status === 1021) {
        wx.showToast({
          title: res.data.msg,
          icon: 'none',
        });
      }
    });
  },
  // 输入手机号码
  inputPhoneNumber: function(e) {
    this.setData({
      phoneNumber: e.detail.value,
    });
  },
  // 输入验证码
  inputValidateCode: function(e) {
    this.setData({
      validateCode: e.detail.value,
    });
  },
  // 图形验证成功
  validateSuccess: function() {
    this.setData({
      showValidateModal: false,
      imgCode: '',
      content: '',
      hasSendSms: true,
    });
    this._SendSmsSuccess();
  },
  // 取消图形验证
  validateCancel: function() {
    this.setData({
      showValidateModal: false,
      imgCode: '',
      content: '',
    });
  },
  // 登录
  login: function() {
    // 验证手机号
    if (String(this.data.phoneNumber).length !== 11) {
      wx.showToast({
        title: '无效的手机号',
        icon: 'none',
      });
      return;
    }
    // 验证手机验证码
    if (!this.data.validateCode) {
      wx.showToast({
        title: '验证码不能为空',
        icon: 'none',
      });
      return;
    }
    wx.showLoading({
      title: '登录中...',
    });
    const requestData = {
      mobile: this.data.phoneNumber,
      vcode: this.data.validateCode,
    };
    // 发送数据 获取用户信息的token
    loginApi.mobilebind(requestData, (res) => {
      if (res.data.status === 0) {
        const token = res.data.data.appToken;
        // 获取用户信息
        loginApi.getComicUserInfo({ token }, (resp) => {
          const userInfo = resp.data;
          const id = userInfo.Uid;
          const imgHost =
            'https://image.samanlehua.com/file/kanmanhua_images/head/';
          // 生成用户的头像的url
          const Uavatar = filter.makeImgUrlById(id, imgHost, 'l1x1');

          userInfo.Uavatar = Uavatar;

          app.globalData.comicUserInfo = userInfo;
          cache.saveUserInfo(userInfo);

          wx.hideLoading({
            success: () => {
              // 登陆后，回退到上一级页面
              app.globalData.isNavigateBack = true;
              wx.navigateBack({
                delta: 1,
              });
            },
          });
        });
      } else {
        wx.showToast({
          title: res.data.msg,
          icon: 'none',
        });
      }
    });
  },
  // 短信倒计时
  _SendSmsSuccess: function() {
    let seconds = 60;
    this.timer = setInterval(() => {
      seconds--;
      this.setData({
        seconds,
      });

      if (seconds < 0) {
        clearInterval(this.timer);
        this.timer = null;
        this.setData({
          hasSendSms: false,
          seconds: 60,
        });
      }
    }, 1000);

    this.setData({
      hasSendSms: true,
    });

    wx.showToast({
      title: '短信发送成功',
    });
  },
});
