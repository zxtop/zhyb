/**
 * 开发环境
 */
; (function () {
  window.SITE_CONFIG = {};

  // api接口请求地址
  // window.SITE_CONFIG['baseUrl'] = 'http://localhost:8090/renren-fast';
  window.SITE_CONFIG['baseUrl'] = 'http://jxyb.7766.org:9090/renren-fast';
  //window.SITE_CONFIG['baseUrl'] = 'http://jxyb.7766.org:8090/renren-fast';
  // window.SITE_CONFIG['baseUrl'] = 'http://192.168.10.211:9090/renren-fast';

  // cdn地址 = 域名 + 版本号
  window.SITE_CONFIG['domain'] = './';  // 域名
  window.SITE_CONFIG['version'] = '';   // 版本号(年月日时分)
  window.SITE_CONFIG['cdnUrl'] = window.SITE_CONFIG.domain + window.SITE_CONFIG.version;
})();
