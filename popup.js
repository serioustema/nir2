"use strict";
/**
 * @author Lobanoff
 * @year 2020
 */
$(document).ready(function () {
    let currentTabId;
    let currentVal = 100;
    const i = document.querySelector(".tabs__title");
    const j = document.querySelector(".tabs__list");

    const getPopupGetGainValue = () => {
        chrome.runtime.sendMessage({
            action: 'popup-get-gain-value',
            tabId: currentTabId
        }, (response) => {
            if (null !== response.gainValue) {
                const val =  response.gainValue;
                var v = ((val*100)*230)/600;
                drag.curCx = v;
                $("#ctrlCirce").attr("cx", v );
                $("#ctrlLineF").attr("x2", v );

                if(val >= 600){
                    $("#ctrlCirce").attr("cx", 100 );
                    $("#ctrlLineF").attr("x2", 100 );
                 }
                currentVal = v;
            } else {
                $("#ctrlCirce").attr("cx", 50 );
                drag.curCx = 50;


            }
        })
    };

    const insetOpenTab = () => {
        chrome.tabs.query({audible: true}, (tabs) => {
            tabs.sort((c, a) => a.id - c.id);
            i.textContent = 0 < tabs.length ? chrome.i18n.getMessage('popup_list_tabs') : chrome.i18n.getMessage('popup_list_tabs_no_play');
            tabs.forEach((tab) => {
                const template = document.getElementById("template-tab").content;
                template.querySelector(".tab").dataset.tabId = tab.id;
                template.querySelector(".tab__icon-image").src = tab.favIconUrl;
                template.querySelector(".tab__title").textContent = tab.title;
                j.appendChild(document.importNode(template, true))
            });

        })
    };
    j.addEventListener("click", (a) => {
        a.preventDefault();
        const b = a.target;
        const c = b.closest(".tab");
        const d = parseInt(c.dataset.tabId, 10);
        chrome.tabs.update(d, {active: true}, (a) => {
            chrome.windows.update(a.windowId, {focused: true})
        })

    });

    document.documentElement.addEventListener("keypress", (a) => {
        a.preventDefault();
        if (a.key.toLowerCase() === 'r') {
            window.location.reload()
        }
    });
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        currentTabId = tabs[0].id;
        if(chrome.runtime.lastError) {
            console.log(chrome.runtime.lastError)
        } else {
            getPopupGetGainValue();
            insetOpenTab();
        }
    });




    var qs = function qs() {
        var el = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
        return document.querySelector(el);
    };
    var fromTo = function fromTo(from, to) {
        var prgrs = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
        return from + (to - from) * prgrs;
    };
    var getCenter = function getCenter() {
        var line = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        return {
            x: (+line.getAttribute("x1") + +line.getAttribute("x2")) / 2,
            y: (+line.getAttribute("y1") + +line.getAttribute("y2")) / 2
        };
    };
    var getScalePoint = function getScalePoint() {
        var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var onScene = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

        if (!onScene) {
            var svgRect = obj.getBBox();
            return {
                x: svgRect.x + svgRect.width / 2,
                y: svgRect.y + svgRect.height / 2
            };
        }
        var rect = obj.getBoundingClientRect();
        return {
            x: rect.width / 2,
            y: rect.height / 2
        };
    };

    var volObj = {
        speakB: qs("#speakB"),
        arcBigB: qs("#arcBigB"),
        arcSmB: qs("#arcSmB"),

        speakF: qs("#speakF"),
        arcBigF: qs("#arcBigF"),
        arcSmF: qs("#arcSmF"),

        crossLtRb: qs("#crossLtRb"),
        crossLbRt: qs("#crossLbRt"),

        ctrlCirce: qs("#ctrlCirce"),
        ctrlLineF: qs("#ctrlLineF"),
        ctrlLineB: qs("#ctrlLineB")
    };

    var pathLen = {
        arcBigLen: volObj.arcBigF.getTotalLength(),
        arcSmLen: volObj.arcSmF.getTotalLength(),
        speakLen: volObj.speakF.getTotalLength()
    };

    var transforms = {
        translate3D: function translate3D() {
            var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
            var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
            var z = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
            var el = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "px";

            return "translate3D(" + x + el + ", " + y + el + ", " + z + el + ")";
        },
        translate: function translate() {
            var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
            var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
            var el = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "px";

            return "translate(" + x + el + ", " + y + el + ")";
        },
        rotate3d: function rotate3d() {
            var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
            var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
            var z = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
            var deg = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

            return "rotate3d(" + x + ", " + y + ", " + z + ", " + deg + "deg)";
        },

        rotate: function rotate() {
            var deg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

            return "rotate(" + deg + "deg)";
        },

        scale: function scale() {
            var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
            var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

            return "scale(" + x + ", " + y + ")";
        },

        perspective: function perspective() {
            var val = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
            var el = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "px";

            return "perspective(" + val + el + ")";
        }
    };

    var easing = {
        inCubic: function inCubic(t, b, c, d) {
            var ts = (t /= d) * t;
            var tc = ts * t;
            return b + c * (1.7 * tc * ts - 2.05 * ts * ts + 1.5 * tc - 0.2 * ts + 0.05 * t);
        },

        outElastic: function outElastic(t, b, c, d) {
            var ts = (t /= d) * t;
            var tc = ts * t;
            return b + c * (33 * tc * ts + -106 * ts * ts + 126 * tc + -67 * ts + 15 * t);
        },

        customSin: function customSin(t, b, c, d) {
            var ts = (t /= d) * t;
            var tc = ts * t;
            return b + c * (81 * tc * ts + -210 * ts * ts + 190 * tc + -70 * ts + 10 * t);
        }
    };

    var play = {
        dx: 1 / 5,
        ds: 0.03,
        flag: true,
        step: 0,
        speed: 5,

        curPosBig: {
            x: 0,
            y: 0,
            scale: 1
        },

        curPosSm: {
            x: 0,
            y: 0,
            scale: 1
        },

        curPos: 1,

        off: false,
        offCurStep: 100,
        offMaxStep: 100,
        offSpeed: 2,
        offRefresh: function offRefresh() {
            this.offCurStep = this.offMaxStep;
            this.off = true;
        },

        on: false,
        onCurStep: 0,
        onMaxStep: 20,
        onSpeed: 2,
        onRefresh: function onRefresh() {
            this.off = false;
            this.onCurStep = 0;
            this.on = true;
        },

        pointLbRt: getCenter(volObj.crossLbRt),
        pointLtRb: getCenter(volObj.crossLtRb),

        animation: function animation() {
            var _this = this;

            if (this.off) {
                [volObj.arcBigB, volObj.arcBigF, volObj.arcSmB, volObj.arcSmF].forEach(function (el) {
                    el.setAttribute("visibility", "hidden");
                });
                [volObj.crossLbRt, volObj.crossLtRb].forEach(function (el) {
                    el.setAttribute("visibility", "visible");
                });


                var len = pathLen.speakLen;
                var step1 = 20;
                var step2 = this.offMaxStep - step1;
                var backLen = 0.7;

                if (this.offCurStep >= this.offMaxStep - step1) {
                    var progress = (step1 + this.offCurStep - this.offMaxStep) / step1;
                    var progressB = fromTo(1, backLen, 1 - progress);
                    volObj.speakF.setAttribute("stroke-dasharray", len * progress + "," + len * 1.05);
                    volObj.speakF.setAttribute("stroke-dashoffset", -len * (1 - progress) / 2 + "");
                    volObj.speakB.setAttribute("stroke-dasharray", len * progressB + "," + len * 1.05);
                    volObj.speakB.setAttribute("stroke-dashoffset", -len * (1 - progressB) / 2 + "");
                }

                if (this.offCurStep < step2 && this.offCurStep >= step2 - step1) {
                    var _progress = 1 - (this.offCurStep - step2 + step1) / step1;
                    var _progressB = fromTo(backLen, 1, _progress);
                    volObj.speakB.setAttribute("stroke-dasharray", len * _progressB + "," + len * 1.05);
                    volObj.speakB.setAttribute("stroke-dashoffset", -len * (1 - _progressB) / 2 + "");
                }

                if (this.offCurStep < step2 && this.offCurStep >= 0) {
                    volObj.speakF.setAttribute("visibility", "hidden");
                    var _progress2 = this.offCurStep / step2;
                    [volObj.crossLbRt, volObj.crossLtRb].forEach(function (el, index) {
                        var scale = easing.outElastic(1 - _progress2, 0, 1, 1);
                        var dx = index == 0 ? easing.customSin(1 - _progress2, -3, 3, 1) : easing.customSin(1 - _progress2, -2, 2, 1);
                        var dy = index == 0 ? easing.customSin(1 - _progress2, -2, 2, 1) : easing.customSin(1 - _progress2, 2, -2, 1);
                        var x = -_this.pointLbRt.x * (scale - 1) + dx;
                        var y = -_this.pointLbRt.y * (scale - 1) + dy;
                        el.setAttribute("transform", transforms.translate(x, y, "") + transforms.scale(scale, scale));
                    });
                }
                this.offCurStep += -this.offSpeed;
            } else {
                if (this.on) {
                    [volObj.speakF, volObj.arcBigB, volObj.arcSmB, volObj.arcSmF].forEach(function (el) {
                        el.setAttribute("visibility", "visible");
                    });
                    [volObj.crossLbRt, volObj.crossLtRb].forEach(function (el) {
                        el.setAttribute("visibility", "hidden");
                        el.setAttribute("transform", "scale(0)");
                    });
                    var _len = pathLen.speakLen;
                    var _progress4 = this.onCurStep / this.onMaxStep;
                    volObj.speakF.setAttribute("stroke-dasharray", _len * _progress4 + "," + _len * 1.05);
                    volObj.speakF.setAttribute("stroke-dashoffset", -_len * (1 - _progress4) / 2 + "");
                    this.onCurStep += this.onSpeed;
                }

                var dxBig = void 0,
                    dxSm = void 0,
                    sclFactB = void 0,
                    sclFactSm = void 0;
                if (this.step >= this.speed) {
                    this.flag = !this.flag;
                    this.step = 0;
                }
                var _progress3 = this.step / this.speed;
                var amplitudeB = 1 - easing.inCubic(1 - this.curPos, 0, 1, 0.5);
                var amplitudeS = 1 - easing.inCubic(1 - this.curPos, 0, 1, 1);

                if (this.curPos < 0.5) amplitudeB = 0;
                if (amplitudeS <= 0 || !amplitudeS) amplitudeS = 0;

                if (this.flag) {
                    dxBig = fromTo(0, this.dx * 3, _progress3);
                    dxSm = fromTo(0, -this.dx * 2, _progress3);
                    sclFactB = fromTo(0, this.ds, _progress3);
                    sclFactSm = fromTo(0, -this.ds, _progress3);
                } else {
                    dxBig = fromTo(this.dx * 3, 0, _progress3);
                    dxSm = fromTo(-this.dx * 2, 0, _progress3);
                    sclFactB = fromTo(this.ds, 0, _progress3);
                    sclFactSm = fromTo(-this.ds, 0, _progress3);
                }


                [volObj.arcBigF, volObj.arcBigB].forEach(function (el) {
                    var scale = _this.curPosBig.scale + sclFactB * amplitudeB;
                    var y = -drag.pointBig.y * (scale - 1) * 1.5;
                    el.setAttribute("transform", transforms.translate(_this.curPosBig.x + dxBig * amplitudeB, y, "") + transforms.scale(scale, scale));
                });

                [volObj.arcSmF, volObj.arcSmB].forEach(function (el) {
                    var scale = _this.curPosSm.scale + sclFactSm * amplitudeS;
                    var y = -drag.pointSm.y * (scale - 1) * 3;
                    el.setAttribute("transform", transforms.translate(_this.curPosSm.x + dxSm * amplitudeS, y, "") + transforms.scale(scale, scale));
                });
                this.step++;
            }
            requestAnimationFrame(this.animation.bind(play));
        }
    };

     requestAnimationFrame(play.animation.bind(play));

    const drag = {
        dx: 0,
        maxX: +volObj.ctrlCirce.getAttribute("cx"),
        minX: +volObj.ctrlLineF.getAttribute("x1"),
        curCx: +volObj.ctrlCirce.getAttribute("cx"),

        pointBig: getScalePoint(volObj.arcBigF),
        pointSm: getScalePoint(volObj.arcSmF),

        interact: false,

        animateDrag: function animateDrag() {
            var _this2 = this;
            this.curCx += drag.dx;

            var cx = this.curCx;

            var smLen = pathLen.arcSmLen;
            var bgLen = pathLen.arcBigLen;
            if (cx > this.maxX) {
                cx = this.maxX;
            }
            if (cx < this.minX) {
                cx = this.minX;
            }
            var progress = (cx - this.minX) / (this.maxX - this.minX);
            play.curPos = progress;
            volObj.ctrlCirce.setAttribute("cx", cx);
            volObj.ctrlLineF.setAttribute("x2", cx);

            var scaleFactor = fromTo(1, 0.85, 1 - progress);
            var scaleDxBig = fromTo(0, -3, 1 - progress);
            var scaleDxSm = fromTo(0, -1, 1 - progress);

            [volObj.arcBigF, volObj.arcBigB].forEach(function (el) {
                play.curPosBig.x = -_this2.pointBig.x * (scaleFactor - 1) + scaleDxBig;
                play.curPosBig.y = -_this2.pointBig.y * (scaleFactor - 1) * 1.5;
                play.curPosBig.scale = scaleFactor;
                el.setAttribute("transform", transforms.translate(play.curPosBig.x, play.curPosBig.y, "") + transforms.scale(scaleFactor, scaleFactor));
            });

            [volObj.arcSmF, volObj.arcSmB].forEach(function (el) {
                play.curPosSm.x = -_this2.pointSm.x * (scaleFactor - 1) + scaleDxSm;
                play.curPosSm.y = -_this2.pointSm.y * (scaleFactor - 1) * 3;
                play.curPosSm.scale = scaleFactor;
                el.setAttribute("transform", transforms.translate(play.curPosSm.x, play.curPosSm.y, "") + transforms.scale(scaleFactor, scaleFactor));
            });

            if (progress > 0.5) {
                if (play.off) {
                    play.onRefresh();
                }
                var prgForBig = fromTo(1, -1, 1 - progress);
                volObj.arcBigF.setAttribute("visibility", "visible");
                volObj.arcSmF.setAttribute("visibility", "visible");
                volObj.arcBigF.setAttribute("stroke-dasharray", bgLen * prgForBig + "," + bgLen * 1.05);
                volObj.arcBigF.setAttribute("stroke-dashoffset", -bgLen * (1 - prgForBig) / 2 + "");
                volObj.arcSmF.setAttribute("stroke-dasharray", smLen + "");
                volObj.arcSmF.setAttribute("stroke-dashoffset", "0");
            }

            if (progress <= 0.5 && progress > 0) {
                if (play.off) {
                    play.onRefresh();
                }
                var prgForSm = fromTo(1, 0, 1 - progress * 2);
                volObj.arcBigF.setAttribute("visibility", "hidden");
                volObj.arcSmF.setAttribute("visibility", "visible");
                volObj.arcSmF.setAttribute("stroke-dasharray", smLen * prgForSm + "," + smLen * 1.05);
                volObj.arcSmF.setAttribute("stroke-dashoffset", -smLen * (1 - prgForSm) / 2 + "");
            }

            if (progress <= 0) {
                volObj.arcSmF.setAttribute("visibility", "hidden");
                if (play.off == false) {
                    play.offRefresh();
                }
            }

             let value = parseInt(progress * 600);


            chrome.runtime.sendMessage({
                action: 'popup-volume-change',
                tabId: currentTabId,
                sliderValue: value
            });



        }
    };

    $(document).on("mousedown touchstart", "#ctrlCirce, #ctrlLineB, #ctrlLineF", function (e) {
        var startX = e.pageX || e.originalEvent.touches[0].pageX;
        if(startX > 261){
            startX = 261;
        }
        e.preventDefault();
        drag.interact = true;

        if (this == volObj.ctrlLineB || this == volObj.ctrlLineF) {
            var rect = volObj.ctrlCirce.getBoundingClientRect();
            var center = (rect.left + rect.right) / 2.0;
            drag.dx = startX - center;
            drag.animateDrag();
        }

        $(document).on("mousemove touchmove", function (e) {
            e.preventDefault();
            var curX = e.pageX || e.originalEvent.touches[0].pageX;
            drag.dx = curX - startX;
            startX = curX;
            drag.animateDrag();
        });

        $(document).on("mouseup touchend", function (e) {
            if (drag.curCx < drag.minX) drag.curCx = drag.minX;
            if (drag.curCx > drag.maxX) drag.curCx = drag.maxX;
            $(document).off("mousemove touchmove mouseup touchend");
        });
    });

    var memory = {
        flag: false,
        last: 0
    };

    $(document).on("mousedown touchstart", ".speaker", function (e) {
        e.preventDefault();
        drag.interact = true;
        drag.dx = 0;
        if (memory.flag) {
            memory.flag = false;
            memory.last = drag.curCx;
            drag.curCx = 0;
            drag.animateDrag();
        } else {
            memory.flag = true;
            drag.curCx = memory.last;
            drag.animateDrag();
        }
    });
});


function localizeHtmlPage() {
    var data = document.querySelectorAll('[data-i18n]');

    for (var i in data) if (data.hasOwnProperty(i)) {
        var obj = data[i];
        var tag = obj.getAttribute('data-i18n').toString();

        replace_i18n(obj, tag);
    }
    var page = document.getElementsByTagName('html');
    for (var j = 0; j < page.length; j++) {
        var obj = page[j];
        var tag = obj.innerHTML.toString();
        replace_i18n(obj, tag);
    }
}
localizeHtmlPage();