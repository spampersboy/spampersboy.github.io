window.onload = function () {
    var copiedObject;
    var copiedObjects = new Array();

    var canvas = new fabric.Canvas('c');
    canvas.backgroundColor = "#F5F5F5";

    createListenersKeyboard();

    function createListenersKeyboard() {
        document.onkeydown = onKeyDownHandler;
    }

    function onKeyDownHandler(event) {
        var key;
        if (window.event) {
            key = window.event.keyCode;
        }
        else {
            key = event.keyCode;
        }

        switch (key) {
            //Esc                                              
            case 27:
                $.unblockUI();
                $(".blockUI").fadeOut("slow");
                break;
            case 46: // Delete
                event.preventDefault();
                del();
                break;
            // Copy (Ctrl+C)                                                                                                                                                  
            case 67: // Ctrl+C
                if (event.ctrlKey) {
                    event.preventDefault();
                    copy();
                }
                break;
            // Paste (Ctrl+V)                                                                                                                                                  
            case 86: // Ctrl+V
                if (event.ctrlKey) {
                    event.preventDefault();
                    paste();
                }
                break;
            // Cut (Ctrl+X)                                                                                                                                                  
            case 88:
                if (event.ctrlKey) {
                    event.preventDefault();
                    copy();
                    del();
                }
                break;
        }
    }

    function del() {
        if (canvas.getActiveGroup()) {
            for (var i in canvas.getActiveGroup().objects) {
                canvas.getActiveGroup().forEachObject(function (o) { canvas.remove(o) });
                canvas.discardActiveGroup().renderAll();
            }
        }
        else if (canvas.getActiveObject()) {
            canvas.remove(canvas.getActiveObject());
        }
    }

    function copy() {
        if (canvas.getActiveGroup()) {
            for (var i in canvas.getActiveGroup().objects) {
                copiedObjects[i] = canvas.getActiveGroup().objects[i];
            }
        }
        else if (canvas.getActiveObject()) {
            copiedObject = canvas.getActiveObject();
            copiedObjects = new Array();
        }
    }

    function paste() {
        canvas.deactivateAll().renderAll();
        if (copiedObjects.length > 0) {
            for (var i in copiedObjects) {
                cloneAndPasteObject(copiedObjects[i]);
            }
        }
        else if (copiedObject) {
            cloneAndPasteObject(copiedObject);
            copiedObjects = new Array();
        }
        canvas.renderAll();
    }

    function cloneAndPasteObject(object) {
        var tempObject = fabric.util.object.clone(object);
        tempObject.set("top", tempObject.top + 5);
        tempObject.set("left", tempObject.left + 5);
        copiedObject = tempObject;
        canvas.add(copiedObject);
    }

    var isNewText;
    var isNewCircle;
    var isNewImage;
    $('#insertTextBtn').click(function () {
        isNewText = true;
        $.blockUI({ message: $('#editTextForm') });
        $("#editTextString").val("");
    });

    canvas.dblclick(function (e) {
        if (canvas.getActiveObject().get('type') == "text") {
            isNewText = false;
            $.blockUI({ message: $('#editTextForm') });
            $("#editTextString").val(canvas.getActiveObject().get('text'));
        }
        if (canvas.getActiveObject().get('type') == "circle") {
            isNewCircle = false;
            $.blockUI({ message: $('#insertCircleForm') });
            var tempColorCode = canvas.getActiveObject().get('fill').split("#");
            document.getElementById('colorCode').color.fromString(tempColorCode[1]);
        }
        //TODO:更改已存在的圖片src
        /*if (canvas.getActiveObject().get('type') == "image") {
        isNewImage = false;
        $("#imageInput").val("");
        $.blockUI({ message: $('#insertImageForm') });
        }*/
    });
    $("#editTextOK").click(function () {
        if (isNewText) {
            var text = new fabric.Text($("#editTextString").val(), {
                left: 200,
                top: 100
            });
            text.hasRotatingPoint = true;
            canvas.add(text);
        }
        else {
            canvas.getActiveObject().set('text', $("#editTextString").val());
            canvas.renderAll(); //Update the canvas
        }
        $.unblockUI();
    });
    $("#editTextCancel").click(function () {
        $.unblockUI();
    });

    $("#insertImage").click(function () {
        isNewImage = true;
        $("#imageInput").val("");
        $.blockUI({ message: $('#insertImageForm') });
    });

    $("#imageInput").change(function handleImage(e) {
        if (isNewImage) {
            var reader = new FileReader();
            reader.onload = function (event) {
                var imgObj = new Image();
                imgObj.src = event.target.result;
                imgObj.onload = function () {
                    var image = new fabric.Image(imgObj);
                    image.set({
                        left: 200,
                        top: 300,
                        scaleX: .20,
                        scaleY: .20
                    });
                    canvas.add(image);
                }
            }
            reader.readAsDataURL(e.target.files[0]);
        }
        else {
            //TODO:更改已存在的圖片src
            //canvas.getActiveObject().src = event.target.result;
        }
        $.unblockUI();
    });

    $("#insertCircle").click(function () {
        isNewCircle = true;
        $.blockUI({ message: $('#insertCircleForm') });
    });

    $("#inertCircleOK").click(function () {
        if (isNewCircle) {
            var circle = new fabric.Circle({
                left: 50,
                top: 50,
                radius: 50
            });
            circle.set("fill", "#" + $("#colorCode").val());
            circle.hasRotatingPoint = true;
            canvas.add(circle);
        }
        else {
            canvas.getActiveObject().set("fill", "#" + $("#colorCode").val());
            canvas.renderAll();
        }
        $.unblockUI();
    });

    $("#inertCircleCancel").click(function () {
        $.unblockUI();
    });

    $('#group').click(function () {
        if (canvas.getActiveGroup()) {
            var activegroup = canvas.getActiveGroup();
            var objectsInGroup = activegroup.getObjects();

            activegroup.clone(function (newgroup) {
                canvas.discardActiveGroup();
                objectsInGroup.forEach(function (object) {
                    canvas.remove(object);
                });
                canvas.add(newgroup);
            });
        }
        else {
            //alert(canvas.getActiveObject().top);
            alert("請選取兩個以上物件");
        }
    });

    $("#ungroup").click(function () {
        var activeObject = canvas.getActiveObject();
        if (activeObject.type == "group") {
            var items = activeObject._objects;
            //alert(items);
            activeObject._restoreObjectsState();
            canvas.remove(activeObject);
            for (var i = 0; i < items.length; i++) {
                canvas.add(items[i]);
                canvas.item(canvas.size() - 1).hasControls = true;
            }
            canvas.renderAll();
        }
    });

    $('#sendBackwards').click(function () {
        canvas.getActiveObject().sendBackwards();
    });
    $('#sendToBack').click(function () {
        canvas.getActiveObject().sendToBack();
    });
    $('#bringForward').click(function () {
        canvas.getActiveObject().bringForward();
    });
    $('#bringToFront').click(function () {
        canvas.getActiveObject().bringToFront();
    });

}