/*
通用方法
*/
// 打开对话框
function openwind(div, url, width, height, title) {
    if (!url)
        return;
    var w = width || 800;
    var h = height || 600;
    var t = title || "窗口";
    var content = '<iframe id="' + 1111
			+ '" scrolling="auto" frameborder="0" width="100%" src="' + url
			+ '" style="height:98%"></iframe>';
    $("#" + div).window({
        title: t,
        width: w,
        height: h,
        content: content

    }).window('open').window('center');

}

// formtojson
function formToJsonData(formid) {
    var form = $("#" + formid);
    var array = form.serializeArray();
    var obj = {};
    $.each(array, function () {
        if (obj[this.name]) {
            if (!obj[this.name].push) {
                obj[this.name] = [obj[this.name]];
            }
            obj[this.name].push(this.value || '');
        } else {
            obj[this.name] = this.value || '';
        }
    });
    return obj;
}

function formtoJsonTrim(formid) {
    var form = $("#" + formid);

    var array = form.serializeArray();
    var obj = {};
    $.each(array, function () {

        if (obj[this.name]) {
            if (!obj[this.name].push) {
                obj[this.name] = [obj[this.name]];
            }
            if (this.value && this.value != "") {
                obj[this.name].push(this.value);
            }
        } else {
            if (this.value && this.value != "") {
                obj[this.name] = this.value;
            }
        }
    });
    return obj;
}
// get Date YYYY-mm-dd
function getNowDate() {
    var date = new Date();
    var str = date.getFullYear() + "-";
    str += +(date.getMonth() + 1) > 9 ? (date.getMonth() + 1).toString() : "0"
			+ (date.getMonth() + 1).toString();
    str += "-";
    str += (date.getDate() > 9 ? date.getDate().toString() : "0"
			+ date.getDate().toString());
    return str;
}
    