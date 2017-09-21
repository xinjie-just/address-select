# address-select
# 仿京东app开发省市区街道-四级地址选择插件

## 数据源
1.省市区数据源
  http://passer-by.com/data_location/list.json  

2.街道(乡镇)数据源
  'http://passer-by.com/data_location/town/' + currentArea.code + '.json'
  currentArea.code 是当前选中的区县一级的地址的编码，6位。
