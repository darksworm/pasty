var urlSh = {
    hidden: true,
    txtBox: null,
    txt: null,
    target: null,
    alertEl: null,
    langSelector: null,
    toggleTexts: function (sw, clear) {
        if(clear){
            urlSh.txtBox.value = '';
        }
        urlSh.txtBox.style.display = sw ? 'block' : 'none';
        urlSh.txt.style.display = sw ? 'none' : 'block';
        urlSh.hidden = sw;
    },
    postText: function () {
        if (urlSh.txtBox.value.trim() == '') {
            urlSh.alert('No text specified');
            return;
        }

        var xhr = new XMLHttpRequest();
        xhr.open("POST", "/add", true);
        xhr.setRequestHeader("Content-type", "application/json");
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status >= 200 && xhr.status <= 500) {
                    var json = JSON.parse(xhr.responseText);
                    urlSh.onResponse(json);
                } else {
                    urlSh.alert('Service currently not available!')
                }
                urlSh.hidden = true;
            }
        };
        var data = JSON.stringify({
            "text": urlSh.txtBox.value,
            "language": urlSh.langSelector.value
        });
        xhr.send(data);
    },
    copy: function (str) {
        var copy = document.getElementById('copy'),
            copyTxt = document.getElementById('copy-input'),
            overlay = document.getElementById('overlay');

        var clipboard = new Clipboard('#copy-button', {
            text: function () {
                return str;
            }
        });

        function reset() {
            copy.style.display = 'none';
            urlSh.txt.style.display = 'block';
            urlSh.txtBox.style.display = 'block';
            overlay.style.display = 'none';
            urlSh.txtBox.focus();
        }

        clipboard.on('success', reset);
        overlay.onclick = reset;

        copyTxt.textContent = str;
        copy.style.display = 'block';
        urlSh.txt.style.display = 'none';
        overlay.style.display = 'block';
    },
    onResponse: function (data) {
        if (data.success) {
            urlSh.copy(data.url);
            urlSh.toggleTexts(false, true);
        } else {
            urlSh.onFail(data.error);
        }
    },
    onFail: function (error) {
        urlSh.alert(error);
    },
    onLoad: function () {
        urlSh.txtBox = document.getElementById("text-cont");
        urlSh.txt = document.getElementById("main-text");
        urlSh.alertEl = document.getElementById('alert');
        var submitBtn = document.getElementById('submit');

        submitBtn.onclick = function() {
            urlSh.postText();
        };

        document.body.onclick = function (e) {
            e = e || event;
            if(e.target.id != 'lang-selector') {
                urlSh.txtBox.focus();
                e.preventDefault();
            } else {
                return true;
            }
        };

        urlSh.txtBox.focus();
        urlSh.setTxtBoxTriggers();
        urlSh.addWindowListeners();

        urlSh.langSelector = document.getElementById('lang-selector');
        var langs = hljs.listLanguages();
        langs.unshift('none');
        for (var l in langs) {
            var lang = langs[l];
            var option = document.createElement("option");
            option.text = lang;
            option.value = lang;
            urlSh.langSelector.appendChild(option);
        }
    },
    setTxtBoxTriggers: function () {
        urlSh.txtBox.onpaste = function () {
            urlSh.toggleTexts(true, false);
            return true;
        };

        urlSh.txtBox.onkeydown = function (e) {
            e = e || event;
            if (urlSh.hidden && e.key != 'Meta' && e.key != 'Escape'
                && e.key != 'AltGraph' && !e.ctrlKey && !e.shiftKey
                && !e.altKey && e.key != 'Tab') {
                urlSh.toggleTexts(true, false);
                urlSh.hidden = false;
            }
            return true;
        };

        urlSh.txtBox.onkeyup = function () {
            if (urlSh.txtBox.value == "") {
                urlSh.txt.style.display = 'block';
                urlSh.hidden = true;
            }
            return true;
        };
    },
    addWindowListeners: function () {
        window.addEventListener("dragover", function (e) {
            e = e || event;
            e.preventDefault();
        }, false);

        window.addEventListener("drop", function (e) {
            e = e || event;
            urlSh.toggleTexts(true, false);
            urlSh.txtBox.value = e.dataTransfer.getData('text');
            e.preventDefault();
        }, false);

        window.addEventListener('keydown', function (e) {
            if (e.key != 'Enter' && urlSh.alertEl.style.display == 'block') {
                urlSh.toggleAlert(false);
            }
            return true;
        })
    },
    once: function (seconds, callback) {
        var counter = 0;
        var time = window.setInterval(function () {
            counter++;
            if (counter >= seconds) {
                callback();
                window.clearInterval(time);
            }
        }, 400);
    },
    toggleAlert: function (sw) {
        if (!sw) {
            urlSh.alertEl.style.maxHeight = '0';
            urlSh.once(1, function () {
                urlSh.alertEl.style.display = 'none';
            });
        } else {
            urlSh.alertEl.style.maxHeight = '1000px';
            urlSh.alertEl.style.display = 'block';
        }
    },
    alert: function (message) {
        urlSh.alertEl.textContent = message;
        urlSh.toggleAlert(true);
    }
};

window.onload = urlSh.onLoad;