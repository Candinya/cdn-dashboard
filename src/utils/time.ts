export const roughTimeSpace = (deltaTs: number): string => {
  let ago = deltaTs;

  if (ago < 60) {
    return `${ago.toFixed(0)}秒`;
  }

  ago /= 60; // 分钟
  if (ago < 60) {
    return `${ago.toFixed(0)}分钟`;
  }

  ago /= 60; // 小时
  if (ago < 24) {
    return `${ago.toFixed(0)}小时`;
  }

  ago /= 24; // 天
  if (ago < 30) {
    return `${ago.toFixed(0)}天`;
  }

  ago /= 30; // 月
  if (ago < 12) {
    return `${ago.toFixed(0)}个月`;
  }

  ago /= 12; // 年
  if (ago < 100) {
    return `${ago.toFixed(0)}年`;
  }

  ago /= 100; // 世纪 // 真的会有地方用到这个嘛

  return `${ago.toFixed(0)}个世纪`;
};

export const dateString = (unixTs: number, includeTime: boolean = false): string => {
  const timestamp = new Date(unixTs * 1000);

  let res = `${timestamp.getFullYear()}年${timestamp.getMonth() + 1}月${timestamp.getDate()}日`;
  if (includeTime) {
    res += ` ${timestamp.getHours()}:${timestamp.getMinutes()}:${timestamp.getSeconds()}`;
  }

  return res;
};
