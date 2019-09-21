import {
  apiStatisticActionLog
} from "@/api/index";
import Cookie from "js-cookie";

export default {
  /**
   * 自家统计方法--收集页面
   * @param {String} page 页面名称
   * @param {Array} args 附带数据
   */
  selfPage(page = '', args = {}) {
    const action = {
      a: 'P',
      st: this.startTime,
      et: +new Date(),
      page,
    };

    if (this.source_id) {
      args.source_id = this.source_id;
    }
    Object.keys(args).forEach((key) => {
      if (args[key] === null || args[key] === '' || args[key] === undefined) {
        delete args[key];
      }
    });

    action.args = args;

    console.log('--页面统计--', action)
    dataUserAnalysis([action], this);
  },
  /**
   * 自家统计方法--收集事件
   * @param {String} input 事件标签
   * @param {String} output 事件输出
   * @param {Object} args 附带数据
   */
  selfEvent(input, output, args = {}) {
    const action = {
      a: 'E',
      f: output,
      t: input,
      st: +new Date(),
    };
    if (output === null || output === '') {
      delete action.f;
    }

    args.source_page = args.source_page || this.pageName;
    if (this.source_id) {
      args.source_id = this.source_id;
    }
    Object.keys(args).forEach((key) => {
      if (args[key] === null || args[key] === '' || args[key] === undefined) {
        delete args[key];
      }
    });

    action.args = args;

    console.log('--事件统计--', action, this)
    dataUserAnalysis([action], this);
  }
}

/**
 * 判断是否具备上传条件
 * @param {Array} data 事件列表
 */
const isCanUpAnalysis = data => {
  return data.uid !== 'visitor' || data.cid !== 0;
}
/**
 * 自家统计方法--上传用户行为
 * @param {Array} actions 行为列表
 */

async function dataUserAnalysis(actions = [], vm) {
  const { userInfo } = vm.$store.state.user;
  const { cid } = userInfo;
  let { uid } = userInfo;
  let cookieUid = '';
  let cookieCid = '';
  let storageUid = '';
  let storageCid = '';
  try {
    cookieUid = Cookie.get(CONFIG.cookie_uid_key);
    cookieCid = Cookie.get(CONFIG.cookie_cid_key);
    storageUid = localStorage.getItem(CONFIG.storage_uid_key);
    storageCid = localStorage.getItem(CONFIG.cookie_cid_key);
    console.log('Cookie.get(CONFIG.cookie_uid_key)', cookieUid);
    console.log('Cookie.get(CONFIG.cookie_cid_key)', cookieCid);
  } catch (error) {}

  if (!uid || uid === -1) {
    uid = storageUid || cookieUid;
  }
  const postData = {
    uid: uid || 'visitor',
    cid: cid || storageCid || cookieCid || $nuxt.$store.state.user.userInfo.cid || "",
    actions
  };

  if (actions.length) {
    console.log('--统计上报--', postData)
    await apiStatisticActionLog(postData);
  }
}
