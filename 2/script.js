"use strict";
var app;
(function (app) {
    var MainController = /** @class */ (function () {
        function MainController($scope, mdPickerColors, dlg) {
            var _this = this;
            this.$scope = $scope;
            this.mdPickerColors = mdPickerColors;
            this.dlg = dlg;
            this.initCanvas = function () {
                _this.canvas = new fabric.Canvas('c');
                _this.canvas.setDimensions({
                    width: window.innerWidth,
                    height: window.innerHeight
                });
                _this.canvas.setBackgroundColor('#eee', _this.canvas.renderAll.bind(_this.canvas));
                // extra canvas settings
                _this.canvas.preserveObjectStacking = true;
                _this.canvas.stopContextMenu = true;
                _this.canvas.on('object:selected', function () {
                    _this.$scope.$evalAsync(function () {
                        _this.activeObject = _this.canvas.getActiveObject();
                        _this.color = _this.mdPickerColors.getColor(_this.activeObject.get('fill'));
                        _this.opacity = _this.activeObject.get('opacity') * 100;
                    });
                });
                _this.canvas.on('selection:cleared', function () {
                    _this.$scope.$evalAsync(function () {
                        _this.activeObject = null;
                        _this.color = null;
                        _this.opacity = 0;
                    });
                });
                _this.canvas.on('selection:updated', function () {
                    _this.$scope.$evalAsync(function () {
                        _this.activeObject = _this.canvas.getActiveObject();
                        _this.color = _this.mdPickerColors.getColor(_this.activeObject.get('fill'));
                        _this.opacity = +(_this.activeObject.get('opacity') * 100).toFixed();
                    });
                });
            };
            this.addImage = function (ev) {
                var confirm = _this.dlg.prompt()
                    .title('Add Image')
                    .textContent('Copy and paste link of the image:')
                    .placeholder('http://myimageurl.com')
                    .ariaLabel('Image Url')
                    .targetEvent(ev)
                    .ok('Ok')
                    .cancel('Cancel');
                _this.dlg.show(confirm).then(function (result) {
                    fabric.Image.fromURL(result, function (img) {
                        _this.canvas.add(img);
                    });
                });
            };
            this.remove = function () {
                var activeObjects = _this.canvas.getActiveObjects();
                _this.canvas.discardActiveObject();
                if (activeObjects.length) {
                    _this.canvas.remove.apply(_this.canvas, activeObjects);
                }
            };
            this.initCanvas();
            this.canvas.setActiveObject(this.canvas.item(0));
            window.addEventListener('resize', this.onWindowResize);
        }
        MainController.$inject = ['$scope', 'mdPickerColors', '$mdDialog'];
        return MainController;
    }());
    angular
        .module('app', ['ngMaterial', 'mdColorMenu'])
        .controller('MainController', MainController);
})(app || (app = {}));