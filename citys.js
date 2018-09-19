
//省市区街道地址选择四级联动

; (function ($, window, document, undefined) {

    var cityObj = function (el, option) {
        //默认参数
        this.defaultOptions = {
            dataUrl: 'http://passer-by.com/data_location/list.json',    //数据库地址
            provinceField: 'province',                                  //省份字段名
            cityField: 'city',                                          //城市字段名
            areaField: 'area',                                          //地区字段名
            townField: 'town',                                           //乡镇字段名
            towncode: 0,                                                //街道乡镇编码
            provinceCode: 0,                                            //省份编码
            cityCode: 0,                                                //城市编码
            areaCode: 0,                                                //地区编码
            containerId: 'cityLinkage',                                 //地址选择的容器id
            isMobile: true,                                              //是否是移动设备
            callback: function () { },                                  //选择完毕后的回调函数，回传选择完整的省市县数据
            getSelectedCode: function () { }                              //获取已经选择的最小一级行政区域的编码
        };

        //合并默认参数和用户传入的参数
        var currentOptions = $.extend({}, this.defaultOptions, option);
        this.currentOptions = currentOptions;

        //定义需要使用的变量
        var $el = $(el),                                                        //当前选择器选中的html元素
            $container = $("#" + this.currentOptions.containerId),                       //地址选择容器对象
            $province = $("#" + this.currentOptions.provinceField),                 //当前的省级选择
            $lastProvince = $("#last" + this.currentOptions.provinceField),         //上次成功选择的省级区域
            $city = $("#" + this.currentOptions.cityField),                         //市级选择
            $lastCity = $("#last" + this.currentOptions.cityField),             //上次选择的市级区域
            $area = $("#" + this.currentOptions.areaField),                         //区县选择
            $lastArea = $("#last" + this.currentOptions.areaField),             //上次选择的区县
            $town = $("#" + this.currentOptions.townField),                     //乡镇街道选择
            $lastTown = $("#last" + this.currentOptions.townField),             //上次选择的乡镇街道
            provinces = {},                                                      //所有的省级数据
            citys = {},                                                           //所有的市级数据
            areas = {},                                                           //所有的区县数据
            selectedCode = "",                                                      //
            hasCity=false,                                                        //是否有市级选择
            currentProvince = {},                                                //当前选择的省级
            currentCity = {},                                                    //当前选择的市级
            currentArea = {},                                                     //当前选择的区县
            currentTown = {};                                                     //当前选择的乡镇

        //数据处理
        var dataHanlder = {
            //乡镇数据处理
            town: function () {
                toolHanlder.showContent(4);
                toolHanlder.showLoading();

                //缓存的上次加载的区县code
                var cacheAreaCode = $town.data('code');
                if (!cacheAreaCode  //如果缓存的code无效，就重新加载
                    || (!$.isEmptyObject(currentArea) && cacheAreaCode.toString() !== currentArea.code) //如果缓存的code和当前选择的code不一致，重新加载
                    || (!$.isEmptyObject(currentCity) && cacheAreaCode.toString() !== currentCity.code)
                    )
                {
                    //缓存当前区县的code
                    $town.data('code',currentArea.code);

                    //清空老数据
                    $town.empty();

                    //远程加载乡镇数据
                    loadDataHandler.townData(function (town) {

                        toolHanlder.hideLoading();

                        toolHanlder.createHtml(4, town);

                        var len = $town.find("li").length;
                        if (!len) {
                            $town.hide();
                            $lastTown.hide();
                            var areaLen = $area.find("li").length;
                            if (areaLen > 0) {
                                $area.show();
                                $lastArea.show();
                            } else {
                                $city.show();
                                $lastCity.show();
                            }

                            toolHanlder.close();
                        } else {
                            // 改变街道，街道输入域值改变
                            $town.find("li").click(function () {
                                var $this = $(this);
                                toolHanlder.liClick($this, 4);
                            });
                        }
                        
                    });
                } else {
                    toolHanlder.hideLoading();
                }
            },
            //市级数据处理
            city: function () {

                try {
                    toolHanlder.showContent(2);
                    toolHanlder.showLoading();
                    toolHanlder.createHtml(2);                    

                    //由于存在直辖市的问题，所以这里需要对市区进行特殊处理
                    var len = $city.find("li").length;
                    if (!len) {
                        hasCity = false;
                        $lastCity.hide();
                        $city.hide();
                        dataHanlder.area();
                    } else {
                        hasCity = true;   // 重置，使它表示非直辖市。否者如果先点击直辖市后，这里的值会是先前点击的直辖市，即 hasCity = false;                        
                        // 选择城市
                        $city.find("li")
                            .click(function() {
                                var $this = $(this);
                                toolHanlder.liClick($this, 2);
                            });
                    }
                } catch (e) {
                    console.log(e.message);
                } finally {
                    toolHanlder.hideLoading();
                }


            },
            //区县数据处理
            area: function () {

                try {
                    toolHanlder.showContent(3);
                    toolHanlder.showLoading();
                    toolHanlder.createHtml(3);

                    var len = $area.find("li").length;
                    if (!len) {
                        $lastArea.hide();
                        $area.hide();
                        var temp = currentCity;
                        currentArea = temp;
                        currentCity = {};
                        dataHanlder.town();
                    } else {
                        $area.find("li").click(function () {
                            var $this = $(this);
                            toolHanlder.liClick($this, 3);
                        });
                    }
                    
                } catch (e) {
                    console.log(e.message);
                } finally {
                    toolHanlder.hideLoading();
                }

            },
            //省级数据处理
            province: function () {

                try {
                    toolHanlder.showContent(1);
                    toolHanlder.showLoading();
                    toolHanlder.createHtml(1);

                    //点击省级事件
                    $province.find("li").click(function () {
                        var $this = $(this);
                        //省级选择后的样式
                        toolHanlder.liClick($this, 1);
                    });
                } catch (e) {
                    console.log(e.message);
                } finally {
                    toolHanlder.hideLoading();
                }
                
            },
            //区分省市县数据
            splitData: function (data) {
                for (var code in data) {

                    if (!(code % 10000)) {     //获取所有的省级行政单位
                        provinces[code] = data[code];
                        currentOptions.provinceCode = code;
                        hasCity = false;
                    } else {
                        //同省的城市或地区
                        var p = code - currentOptions.provinceCode;
                        if (currentOptions.provinceCode &&  p>0 && p<10000) {
                            if (!(code%100)) {
                                hasCity = true;
                                citys[code] = data[code];
                                currentOptions.cityCode = code;
                            }
                            else if (p > 8000) {//省直辖县级行政单位
                                citys[code] = data[code];
                                if (!currentOptions.cityCode) {
                                    currentOptions.cityCode = code;
                                }
                            }
                            else if (hasCity) {//非直辖市
                                var c = code - currentOptions.cityCode;
                                if (currentOptions.cityCode && c > 0 && c < 100) {//同个城市的地区
                                    areas[code] = data[code];
                                    currentOptions.areaCode = code;
                                }
                            } else {
                                areas[code] = data[code];
                                currentOptions.areaCode = code;
                            }
                        }
                    }
                }
            },
            //回显
            loadSelected: function () {
                if ($.isFunction(currentOptions.getSelectedCode)) {
                    //获取需要回显的编码
                    var code = currentOptions.getSelectedCode();
                    if (code
                        && !$.isEmptyObject(provinces)
                        && !$.isEmptyObject(citys)
                        && !$.isEmptyObject(areas)
                        ) {

                        //todo 这里的各级区域还原，还不够严谨
                        //获取各级编码
                        selectedCode = code.toString();
                        var provinceCode = selectedCode.substring(0, 2) + "0000";
                        var cityCode = selectedCode.substring(0, 4) + "00";
                        var areaCode = selectedCode.substring(0, 6);

                        //还原省市区当前选中对象
                        if (provinceCode in provinces) {
                            currentProvince = {
                                code: provinceCode,
                                name: provinces[provinceCode]
                            };

                            toolHanlder.showContent(1);
                        }

                        //还原市级
                        if (cityCode in citys) {
                            currentCity = {
                                code: cityCode,
                                name: citys[cityCode]
                            };
                            toolHanlder.showContent(2);
                        }
                        else if (areaCode in citys) {
                            currentCity = {
                                code: areaCode,
                                name:citys[areaCode]
                            };
                            toolHanlder.showContent(2);
                        }
                        else {
                            hasCity = false;
                        }

                        //还原县级
                        if (areaCode in areas) {
                            currentArea = {
                                code: areaCode,
                                name: areas[areaCode]
                            };
                            toolHanlder.showContent(3);
                        } 

                        //当前选中的行政区域不是街道，乡镇一级
                        if (selectedCode.length === 9) {
                            currentTown = { code: selectedCode, name: "" };
                            $town.hide().siblings("ul").hide();
                            dataHanlder.town();
                        } 

                        
                    }
                }
            }
        };

        //数据获取
        var loadDataHandler = {
            //加载省市区数据
            areaData: function () {
                $.ajax({
                    url: currentOptions.dataUrl,
                    type: 'GET',
                    crossDomain: true,
                    dataType: 'json',
                    success: function (data) {
                        //区分省市县
                        dataHanlder.splitData(data);
                    }
                });
            },
            //加载乡镇数据
            townData: function (callback) {
                if (currentArea && currentArea.code) {

                    toolHanlder.showLoading();

                    $.ajax({
                        url: 'http://passer-by.com/data_location/town/' + currentArea.code + '.json',
                        dataType: 'json',
                        success: function (town) {
                            toolHanlder.hideLoading();
                            if ($.isFunction(callback)) {
                                callback(town);
                            }
                        },
                        error:function() {
                            toolHanlder.hideLoading();
                            if ($.isFunction(callback)) {
                                callback(null);
                            }
                        }
                    });
                } else {
                    console.log("区县级未选择，或者无效。");
                }
            }
        };

        //工具
        var toolHanlder = {
            //绑定相关事件
            bindEvent: function () {

                //绑定元素点击事件
                $el.click(function () {
                    toolHanlder.show();
                });
                
                //已经选择的省级点击事件
                $lastProvince.click(function () {

                    if ($province.find("li").length == 0) {
                        dataHanlder.province();
                    } else {
                        $province.find('li[id="' + currentProvince.code + '"]').addClass("active");
                    }

                    toolHanlder.showContent(1);
                });

                //已经选择的市级点击事件
                $lastCity.click(function () {

                    if ($city.find("li").length == 0) {
                        dataHanlder.city();
                    }

                    toolHanlder.showContent(2);
                });

                //已经选择的区县点击事件
                $lastArea.click(function () {

                    if ($area.find("li").length == 0) {
                        dataHanlder.area();
                    }

                    toolHanlder.showContent(3);
                });

                //已经选择的乡镇点击事件
                $lastTown.click(function () {
                    toolHanlder.showContent(4);
                });
            },
            //初始化
            init: function () {
                //相关事件绑定
                toolHanlder.bindEvent();
                //加载项目数据
                loadDataHandler.areaData();
            },
            //地区数据项点击操作
            liClick: function ($el, level) {
                //点击后的选中样式设置
                $el.siblings("li").removeClass("active");
                $el.addClass("active");
                
                switch (level) {
                    case 1:   //省级
                        {
                            if (currentProvince && currentProvince.code) {
                                //已经选择过的
                                $lastProvince.nextAll().text("请选择").hide();
                                currentTown=currentCity=currentArea = {};
                            }

                            currentProvince = {
                                code: $el.data("code"),
                                name: $el.text()
                            };

                            $lastProvince.text(currentProvince.name);
                            $province.hide();
                            //市级相关处理
                            dataHanlder.city();
                        }
                        break;
                    case 2: //市级
                        {
                            if (currentCity && currentCity.code) {
                                $lastCity.nextAll().text("请选择").hide();
                                currentTown = currentArea = {};
                            }

                            currentCity = {
                                code: $el.data("code"),
                                name: $el.text()
                            };

                            $lastCity.text(currentCity.name);
                            $city.hide();

                            dataHanlder.area();
                        }
                        break;
                    case 3://区县
                        {
                            if (currentArea && currentArea.code) {
                                $lastArea.nextAll().text("请选择").hide();
                                currentTown = {};
                            }

                            currentArea = {
                                code: $el.data("code"),
                                name: $el.text()
                            };

                            $lastArea.text(currentArea.name);
                            $area.hide();
                            dataHanlder.town();
                        }
                        break;
                    case 4://乡镇
                        {
                            currentTown = {
                                code: $el.data("code"),
                                name: $el.text()
                            };

                            $lastTown.text(currentTown.name);
                            toolHanlder.close();
                        }
                        break;

                };
            },
            //关闭地址选择窗体
            close: function () {
                if ($.isFunction(currentOptions.callback)) {
                    currentOptions.callback(toolHanlder.returnData());
                }

                currentArea = null;
                currentCity = null;
                currentProvince = null;
                currentTown = null;

                $container.hide();
                $province.hide();
                $lastProvince.hide();
                $city.hide();
                $lastCity.hide();
                $area.hide();
                $lastArea.hide();
                $town.hide();
                $lastTown.hide();
            },
            //显示地址选择窗体
            show: function () {
                
                //先让窗体显示出来
                $container.show();

                //显示省级数据
                dataHanlder.province();
                //加载已经选择过的
                dataHanlder.loadSelected();
            },
            //组装返回数据
            returnData: function () {

                var rsData = {
                    province: currentProvince,
                    city: currentCity,
                    area: currentArea,
                    town: currentTown,
                    addr: "",
                    code:""
                };
                
                if (rsData.province && !$.isEmptyObject(rsData.province)) {
                    rsData.addr += rsData.province.name;
                    rsData.code = rsData.province.code;
                }
                if (rsData.city && !$.isEmptyObject(rsData.city)) {
                    rsData.addr += rsData.city.name;
                    rsData.code = rsData.city.code;
                }
                if (rsData.area && !$.isEmptyObject(rsData.area)) {
                    rsData.addr += rsData.area.name;
                    rsData.code = rsData.area.code;
                }
                if (rsData.town && !$.isEmptyObject(rsData.town)) {
                    rsData.addr += rsData.town.name;
                    rsData.code = rsData.town.code;
                }

                return rsData;
            },
            //显示加载动画
            showLoading: function() {
                $container.find("div.address-content").append('<div class="loading">加载中</div>');
            },
            //隐藏加载动画
            hideLoading: function() {
                $container.find("div.loading").remove();
            },
            //显示地区选择区域
            showContent: function(level) {
                //显示对应的区域选择框

                //先移除所有的选择效果
                $lastProvince.siblings().addBack().removeClass('active');
                $province.siblings().addBack().hide();

                switch (level) {
                case 1:
                    {
                        $lastProvince.addClass('active').show();
                        $province.show();
                    }
                    break;
                case 2:
                    {
                        $lastCity.addClass('active').show();
                        $city.show();
                    }
                    break;
                case 3:
                    {
                        $lastArea.addClass('active').show();
                        $area.show();
                    }
                    break;
                case 4:
                    {
                        $lastTown.addClass('active').show();
                        $town.show();
                    }
                    break;
                }
            },
            //html组装,用于省市区切换和初次显示时，html的生成
            createHtml: function (level, para) {
                if (town!=null) {
                    switch (level) {
                        case 1:
                            {
                                $province.empty();
                                //组装省级选择项
                                for (var p in provinces) {
                                    if (currentProvince && currentProvince.code && p === currentProvince.code) {
                                        $province.append('<li city class="active" id="' + p + '" data-code="' + p + '">' + provinces[p] + '</li>');
                                    } else {
                                        $province.append('<li city id="' + p + '" data-code="' + p + '">' + provinces[p] + '</li>');
                                    }
                                }
                            } break;
                        case 2:
                            {
                                $city.empty();

                                //加载市级选择
                                for (var i in citys) {
                                    //筛选已经选择的省下面的市
                                    var p = i - currentProvince.code;
                                    if (currentProvince && currentProvince.code && p > 0 && p < 10000) {
                                        if (currentCity && currentCity.code && currentCity.code === i) {
                                            $city.append('<li city class="active" id="' + i + '" data-code="' + i + '">' + citys[i] + '</li>');
                                        } else {
                                            $city.append('<li city id="' + i + '" data-code="' + i + '">' + citys[i] + '</li>');
                                        }
                                    }
                                }
                            } break;
                        case 3:
                            {
                                $area.empty();

                                for (var i in areas) {
                                    if (!hasCity) {
                                        var c = i - currentProvince.code;
                                        if (!(currentProvince.code && c > 100 && c < 200)) {
                                            continue;
                                        }
                                    } else {
                                        var c = i - currentCity.code;
                                        if (!(currentCity.code && c > 0 && c < 100)) {     //同个城市的地区
                                            continue;
                                        }
                                    }

                                    if (currentArea && currentArea.code && currentArea.code === i) {
                                        $area.append('<li city class="active" id="' + i + '" data-code="' + i + '">' + areas[i] + '</li>');
                                    } else {
                                        $area.append('<li city id="' + i + '" data-code="' + i + '">' + areas[i] + '</li>');
                                    }
                                }
                            } break;
                        case 4:
                            {
                                if (para) {
                                    for (i in para) {
                                        if (currentTown && currentTown.code && i === currentTown.code) {
                                            $town.append('<li city class="active" id="' + i + '" data-code="' + i + '">' + para[i] + '</li>');
                                            $lastTown.text(para[i]);
                                        } else {
                                            $town.append('<li city id="' + i + '" data-code="' + i + '">' + para[i] + '</li>');
                                        }
                                    }
                                }
                            } break;

                    }
                }
                
            }
        };

        toolHanlder.init();
    };

    //联动插件
    $.fn.cityLinkage = function (options) {

        return this.each(function () {
            var $this = $(this);

            var data = $this.data("aec.city");

            if (!data) {
                data = new cityObj(this, options);
                $this.data("aec.city", data);
            }
            else if (typeof options == "string") {
                data[options].apply(this, Array.prototype.slice.call(arguments, 1));
            }
        });
    };

})(jQuery, window, document);