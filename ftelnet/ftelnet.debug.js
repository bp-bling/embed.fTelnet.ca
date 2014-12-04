﻿var fTelnet = (function () {
    function fTelnet() {
    }
    fTelnet.Init = function () {
        var _this = this;
        if (document.getElementById('fTelnetContainer') === null) {
            alert('fTelnet Error: Element with id="fTelnetContainer" was not found');
            return false;
        }
        this._Container = document.getElementById('fTelnetContainer');

        this._InitMessageBar = document.createElement('div');
        this._InitMessageBar.id = 'fTelnetInitMessage';
        this._InitMessageBar.innerHTML = 'Initializing fTelnet...';
        this._Container.appendChild(this._InitMessageBar);

        if (navigator.appName === 'Microsoft Internet Explorer') {
            var Version = -1;
            var RE = new RegExp('MSIE ([0-9]{1,}[\\.0-9]{0,})');
            if (RE.exec(navigator.userAgent) !== null) {
                Version = parseFloat(RegExp.$1);
            }
            if (Version < 9.0) {
                this._InitMessageBar.innerHTML = 'fTelnet Error: Internet Explorer < 9 is not supported.<br /><br />Please upgrade to IE 9 or newer, or better still would be to use Firefox or Chrome instead of IE.';
                return false;
            }
        }

        this._ButtonBar = document.createElement('div');
        this._ButtonBar.id = 'fTelnetButtons';
        this._ButtonBar.innerHTML = '<a href="#" onclick="fTelnet.Connect();">Connect</a> | ' + '<a href="#" onclick="fTelnet.Download();">Download</a> | ' + '<a href="#" onclick="fTelnet.Upload();">Upload</a> | ' + '<a href="#" onclick="fTelnet.EnterScrollback();">Scrollback</a> | ' + '<a href="#" onclick="fTelnet.FullScreenToggle();">Full&nbsp;Screen<a/>';
        this._ButtonBar.style.display = (this._ButtonBarVisible ? 'block' : 'none');
        this._Container.appendChild(this._ButtonBar);

        this._ScrollbackBar = document.createElement('div');
        this._ScrollbackBar.id = 'fTelnetScrollback';
        this._ScrollbackBar.innerHTML = '<a href="#" onclick="Crt.PushKeyDown(Keyboard.UP, Keyboard.UP, false, false, false);">Line Up</a> | ' + '<a href="#" onclick="Crt.PushKeyDown(Keyboard.DOWN, Keyboard.DOWN, false, false, false);">Line Down</a> | ' + '<a href="#" onclick="Crt.PushKeyDown(Keyboard.PAGE_UP, Keyboard.PAGE_UP, false, false, false);">Page Up</a> | ' + '<a href="#" onclick="Crt.PushKeyDown(Keyboard.PAGE_DOWN, Keyboard.PAGE_DOWN, false, false, false);">Page Down</a> | ' + '<a href="#" onclick="fTelnet.ExitScrollback();">Exit</a>';
        this._ScrollbackBar.style.display = 'none';
        this._Container.appendChild(this._ScrollbackBar);

        this._FocusWarningBar = document.createElement('div');
        this._FocusWarningBar.id = 'fTelnetFocusWarning';
        this._FocusWarningBar.innerHTML = '*** CLICK HERE TO GIVE fTelnet FOCUS ***';
        this._FocusWarningBar.style.display = 'none';
        this._Container.appendChild(this._FocusWarningBar);

        if (Crt.Init(this._Container)) {
            this._InitMessageBar.style.display = 'none';

            Crt.onfontchange.on(function () {
                _this.OnCrtScreenSizeChanged();
            });
            Crt.onscreensizechange.on(function () {
                _this.OnCrtScreenSizeChanged();
            });
            Crt.BareLFtoCRLF = this._BareLFtoCRLF;
            Crt.Blink = this._Blink;
            Crt.LocalEcho = this._LocalEcho;
            Crt.SetFont(this._Font);
            Crt.SetScreenSize(this._ScreenColumns, this._ScreenRows);

            if (!('WebSocket' in window)) {
                Crt.WriteLn();
                Crt.WriteLn('Sorry, but your browser doesn\'t support the WebSocket protocol!');
                Crt.WriteLn();
                Crt.WriteLn('WebSockets are how fTelnet connects to the remote server, so without them that');
                Crt.WriteLn('means you won\'t be able to connect anywhere.');
                Crt.WriteLn();
                Crt.WriteLn('If you can, try upgrading your web browser.  If that\'s not an option (ie you\'re');
                Crt.WriteLn('already running the latest version your platform supports, like IE 8 on');
                Crt.WriteLn('Windows XP), then try switching to a different web browser.');
                Crt.WriteLn();
                Crt.WriteLn('Feel free to contact me (http://www.ftelnet.ca/contact/) if you think you\'re');
                Crt.WriteLn('seeing this message in error, and I\'ll look into it.  Be sure to let me know');
                Crt.WriteLn('what browser you use, as well as which version it is.');
                console.log('fTelnet Error: WebSocket not supported');
                return false;
            }

            this._StatusBar = document.createElement('div');
            this._StatusBar.id = 'fTelnetStatusBar';
            this._StatusBar.innerHTML = 'Not connected';
            this._StatusBar.style.display = (this._StatusBarVisible ? 'block' : 'none');
            this._Container.appendChild(this._StatusBar);

            VirtualKeyboard.Init(this._Container);

            this.OnCrtScreenSizeChanged();

            Ansi.onesc5n.on(function () {
                _this.OnAnsiESC5n();
            });
            Ansi.onesc6n.on(function () {
                _this.OnAnsiESC6n();
            });
            Ansi.onesc255n.on(function () {
                _this.OnAnsiESC255n();
            });
            Ansi.onescQ.on(function (font) {
                _this.OnAnsiESCQ(font);
            });

            Ansi.Write(atob(this._SplashScreen));
        } else {
            this._InitMessageBar.innerHTML = 'fTelnet Error: Unable to init Crt class';
            this._ButtonBar.style.display = 'none';
            this._ScrollbackBar.style.display = 'none';
            this._FocusWarningBar.style.display = 'none';
            return false;
        }

        this._Timer = setInterval(function () {
            _this.OnTimer();
        }, 50);

        var fTelnetUpload = document.createElement('input');
        fTelnetUpload.type = 'file';
        fTelnetUpload.id = 'fTelnetUpload';
        fTelnetUpload.onchange = function () {
            _this.OnUploadFileSelected();
        };
        fTelnetUpload.style.display = 'none';
        this._Container.appendChild(fTelnetUpload);

        return true;
    };

    Object.defineProperty(fTelnet, "BareLFtoCRLF", {
        get: function () {
            return this._BareLFtoCRLF;
        },
        set: function (value) {
            this._BareLFtoCRLF = value;
            Crt.BareLFtoCRLF = value;
        },
        enumerable: true,
        configurable: true
    });


    Object.defineProperty(fTelnet, "BitsPerSecond", {
        get: function () {
            return this._BitsPerSecond;
        },
        set: function (value) {
            this._BitsPerSecond = value;
        },
        enumerable: true,
        configurable: true
    });


    Object.defineProperty(fTelnet, "Blink", {
        get: function () {
            return this._Blink;
        },
        set: function (value) {
            this._Blink = value;
        },
        enumerable: true,
        configurable: true
    });


    Object.defineProperty(fTelnet, "ButtonBarVisible", {
        get: function () {
            return this._ButtonBarVisible;
        },
        set: function (value) {
            this._ButtonBarVisible = value;
            if (this._ButtonBar != null) {
                this._ButtonBar.style.display = (value ? 'block' : 'none');
            }
        },
        enumerable: true,
        configurable: true
    });


    Object.defineProperty(fTelnet, "ConnectionType", {
        get: function () {
            return this._ConnectionType;
        },
        set: function (value) {
            this._ConnectionType = value;
        },
        enumerable: true,
        configurable: true
    });


    fTelnet.Connect = function () {
        var _this = this;
        if ((this._Connection !== null) && (this._Connection.connected)) {
            return;
        }

        switch (this._ConnectionType) {
            default:
                this._Connection = new TelnetConnection();
                break;
        }

        this._Connection.LocalEcho = this._LocalEcho;
        this._Connection.onclose.on(function () {
            _this.OnConnectionClose();
        });
        this._Connection.onconnect.on(function () {
            _this.OnConnectionConnect();
        });
        this._Connection.onlocalecho.on(function (value) {
            _this.OnConnectionLocalEcho(value);
        });
        this._Connection.onioerror.on(function () {
            _this.OnConnectionIOError();
        });
        this._Connection.onsecurityerror.on(function () {
            _this.OnConnectionSecurityError();
        });

        Crt.NormVideo();
        Crt.ClrScr();

        if (this._ProxyHostname === '') {
            this._StatusBar.innerHTML = 'Connecting to ' + this._Hostname + ':' + this._Port;
            this._Connection.connect(this._Hostname, this._Port);
        } else {
            this._StatusBar.innerHTML = 'Connecting to ' + this._Hostname + ':' + this._Port + ' via proxy';
            this._Connection.connect(this._Hostname, this._Port, this._ProxyHostname, this._ProxyPort, this._ProxyPortSecure);
        }
    };

    Object.defineProperty(fTelnet, "Connected", {
        get: function () {
            if (this._Connection === null) {
                return false;
            }
            return this._Connection.connected;
        },
        enumerable: true,
        configurable: true
    });

    fTelnet.Disconnect = function (prompt) {
        if (this._Connection === null) {
            return true;
        }
        if (!this._Connection.connected) {
            return true;
        }

        if (!prompt || confirm('Are you sure you want to disconnect?')) {
            this._Connection.onclose.off();
            this._Connection.onconnect.off();
            this._Connection.onioerror.off();
            this._Connection.onlocalecho.off();
            this._Connection.onsecurityerror.off();
            this._Connection.close();
            this._Connection = null;

            this.OnConnectionClose();
            return true;
        }

        return false;
    };

    fTelnet.Download = function () {
        var _this = this;
        if (this._Connection === null) {
            return;
        }
        if (!this._Connection.connected) {
            return;
        }

        this._YModemReceive = new YModemReceive(this._Connection);

        clearInterval(this._Timer);
        this._YModemReceive.ontransfercomplete.on(function () {
            _this.OnDownloadComplete();
        });

        this._YModemReceive.Download();
    };

    Object.defineProperty(fTelnet, "Enter", {
        get: function () {
            return this._Enter;
        },
        set: function (value) {
            this._Enter = value;
        },
        enumerable: true,
        configurable: true
    });


    fTelnet.EnterScrollback = function () {
        if (this._ScrollbackBar.style.display = 'none') {
            Crt.EnterScrollBack();
            this._ScrollbackBar.style.display = 'block';
        }
    };

    fTelnet.ExitScrollback = function () {
        if (this._ScrollbackBar.style.display = 'block') {
            Crt.PushKeyDown(27 /* ESCAPE */, 27 /* ESCAPE */, false, false, false);
            this._ScrollbackBar.style.display = 'none';
        }
    };

    Object.defineProperty(fTelnet, "Font", {
        get: function () {
            return this._Font;
        },
        set: function (value) {
            this._Font = value;
        },
        enumerable: true,
        configurable: true
    });


    fTelnet.FullScreenToggle = function () {
        if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
            if (this._Container.requestFullscreen) {
                this._Container.requestFullscreen();
            } else if (this._Container.msRequestFullscreen) {
                this._Container.msRequestFullscreen();
            } else if (this._Container.mozRequestFullScreen) {
                this._Container.mozRequestFullScreen();
            } else if (this._Container.webkitRequestFullscreen) {
                this._Container.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }
    };

    Object.defineProperty(fTelnet, "Hostname", {
        get: function () {
            return this._Hostname;
        },
        set: function (value) {
            this._Hostname = value;
        },
        enumerable: true,
        configurable: true
    });


    Object.defineProperty(fTelnet, "LocalEcho", {
        get: function () {
            return this._LocalEcho;
        },
        set: function (value) {
            this._LocalEcho = value;

            Crt.LocalEcho = value;
            if ((this._Connection !== null) && (this._Connection.connected)) {
                this._Connection.LocalEcho = value;
            }
        },
        enumerable: true,
        configurable: true
    });


    fTelnet.OnAnsiESC5n = function () {
        this._Connection.writeString('\x1B[0n');
    };

    fTelnet.OnAnsiESC6n = function () {
        this._Connection.writeString(Ansi.CursorPosition());
    };

    fTelnet.OnAnsiESC255n = function () {
        this._Connection.writeString(Ansi.CursorPosition(Crt.WindCols, Crt.WindRows));
    };

    fTelnet.OnAnsiESCQ = function (font) {
        Crt.SetFont(font);
    };

    fTelnet.OnConnectionClose = function () {
        this._StatusBar.innerHTML = 'Disconnected from ' + this._Hostname + ':' + this._Port;
    };

    fTelnet.OnConnectionConnect = function () {
        Crt.ClrScr();

        if (this._ProxyHostname === '') {
            this._StatusBar.innerHTML = 'Connected to ' + this._Hostname + ':' + this._Port;
        } else {
            this._StatusBar.innerHTML = 'Connected to ' + this._Hostname + ':' + this._Port + ' via proxy';
        }
    };

    fTelnet.OnConnectionLocalEcho = function (value) {
        this._LocalEcho = value;
        Crt.LocalEcho = value;
    };

    fTelnet.OnConnectionIOError = function () {
        console.log('fTelnet.OnConnectionIOError');
    };

    fTelnet.OnConnectionSecurityError = function () {
        if (this._ProxyHostname === '') {
            this._StatusBar.innerHTML = 'Unable to connect to ' + this._Hostname + ':' + this._Port;
        } else {
            this._StatusBar.innerHTML = 'Unable to connect to ' + this._Hostname + ':' + this._Port + ' via proxy';
        }
    };

    fTelnet.OnCrtScreenSizeChanged = function () {
        var NewWidth = Crt.ScreenCols * Crt.Font.Width;

        if (this._FocusWarningBar != null) {
            this._FocusWarningBar.style.width = NewWidth - 10 + 'px';
        }
        if (this._ButtonBar != null) {
            this._ButtonBar.style.width = NewWidth - 10 + 'px';
        }
        if (this._ScrollbackBar != null) {
            this._ScrollbackBar.style.width = NewWidth - 10 + 'px';
        }
        if (this._StatusBar != null) {
            this._StatusBar.style.width = NewWidth - 10 + 'px';
        }

        var ScriptUrl = document.getElementById('fTelnetScript').src;
        var CssUrl = ScriptUrl.replace('/ftelnet.min.js', '/keyboard/keyboard-{size}.min.css');
        CssUrl = CssUrl.replace('/ftelnet.debug.js', '/keyboard/keyboard-{size}.min.css');
        var KeyboardSizes = [960, 800, 720, 640, 560, 480];
        for (var i = 0; i < KeyboardSizes.length; i++) {
            if ((NewWidth >= KeyboardSizes[i]) || (i === (KeyboardSizes.length - 1))) {
                document.getElementById('fTelnetKeyboardCss').href = CssUrl.replace('{size}', KeyboardSizes[i].toString(10));
                break;
            }
        }
    };

    fTelnet.OnDownloadComplete = function () {
        var _this = this;
        this._Timer = setInterval(function () {
            _this.OnTimer();
        }, 50);
    };

    fTelnet.OnTimer = function () {
        if ((this._Connection !== null) && (this._Connection.connected)) {
            if (document.hasFocus() && !this._HasFocus) {
                this._HasFocus = true;
                this._FocusWarningBar.style.display = 'none';
            } else if (!document.hasFocus() && this._HasFocus) {
                this._HasFocus = false;
                this._FocusWarningBar.style.display = 'block';
            }

            var MSecElapsed = new Date().getTime() - this._LastTimer;
            if (MSecElapsed < 1) {
                MSecElapsed = 1;
            }

            var BytesToRead = Math.floor(this._BitsPerSecond / 8 / (1000 / MSecElapsed));
            if (BytesToRead < 1) {
                BytesToRead = 1;
            }

            var Data = this._Connection.readString(BytesToRead);
            if (Data.length > 0) {
                Ansi.Write(Data);
            }

            while (Crt.KeyPressed()) {
                var KPE = Crt.ReadKey();

                if (KPE !== null) {
                    if (KPE.keyString.length > 0) {
                        if (KPE.keyString === '\r\n') {
                            this._Connection.writeString(this._Enter);
                        } else {
                            this._Connection.writeString(KPE.keyString);
                        }
                    }
                }
            }
        }
        this._LastTimer = new Date().getTime();
    };

    fTelnet.OnUploadComplete = function () {
        var _this = this;
        this._Timer = setInterval(function () {
            _this.OnTimer();
        }, 50);
    };

    fTelnet.OnUploadFileSelected = function () {
        var _this = this;
        if (this._Connection === null) {
            return;
        }
        if (!this._Connection.connected) {
            return;
        }

        var fTelentUpload = document.getElementById('fTelnetUpload');

        this._YModemSend = new YModemSend(this._Connection);

        clearInterval(this._Timer);
        this._YModemSend.ontransfercomplete.on(function () {
            _this.OnUploadComplete();
        });

        for (var i = 0; i < fTelentUpload.files.length; i++) {
            this.UploadFile(fTelentUpload.files[i], fTelentUpload.files.length);
        }
    };

    Object.defineProperty(fTelnet, "Port", {
        get: function () {
            return this._Port;
        },
        set: function (value) {
            this._Port = value;
        },
        enumerable: true,
        configurable: true
    });


    Object.defineProperty(fTelnet, "ProxyHostname", {
        get: function () {
            return this._ProxyHostname;
        },
        set: function (value) {
            this._ProxyHostname = value;
        },
        enumerable: true,
        configurable: true
    });


    Object.defineProperty(fTelnet, "ProxyPort", {
        get: function () {
            return this._ProxyPort;
        },
        set: function (value) {
            this._ProxyPort = value;
        },
        enumerable: true,
        configurable: true
    });


    Object.defineProperty(fTelnet, "ProxyPortSecure", {
        get: function () {
            return this._ProxyPortSecure;
        },
        set: function (value) {
            this._ProxyPortSecure = value;
        },
        enumerable: true,
        configurable: true
    });


    Object.defineProperty(fTelnet, "ScreenColumns", {
        get: function () {
            return this._ScreenColumns;
        },
        set: function (value) {
            this._ScreenColumns = value;
        },
        enumerable: true,
        configurable: true
    });


    Object.defineProperty(fTelnet, "ScreenRows", {
        get: function () {
            return this._ScreenRows;
        },
        set: function (value) {
            this._ScreenRows = value;
        },
        enumerable: true,
        configurable: true
    });


    Object.defineProperty(fTelnet, "SplashScreen", {
        get: function () {
            return this._SplashScreen;
        },
        set: function (value) {
            this._SplashScreen = value;
        },
        enumerable: true,
        configurable: true
    });


    Object.defineProperty(fTelnet, "StatusBarVisible", {
        get: function () {
            return this._StatusBarVisible;
        },
        set: function (value) {
            this._StatusBarVisible = value;

            if (this._StatusBar != null) {
                this._StatusBar.style.display = (value ? 'block' : 'none');
            }
        },
        enumerable: true,
        configurable: true
    });


    fTelnet.Upload = function () {
        if (this._Connection === null) {
            return;
        }
        if (!this._Connection.connected) {
            return;
        }

        document.getElementById('fTelnetUpload').click();
    };

    fTelnet.UploadFile = function (file, fileCount) {
        var _this = this;
        var reader = new FileReader();

        reader.onload = function () {
            var FR = new FileRecord(file.name, file.size);
            var Buffer = reader.result;
            var Bytes = new Uint8Array(Buffer);
            for (var i = 0; i < Bytes.length; i++) {
                FR.data.writeByte(Bytes[i]);
            }
            FR.data.position = 0;
            _this._YModemSend.Upload(FR, fileCount);
        };

        reader.readAsArrayBuffer(file);
    };

    Object.defineProperty(fTelnet, "VirtualKeyboardVisible", {
        get: function () {
            return this._VirtualKeyboardVisible;
        },
        set: function (value) {
            this._VirtualKeyboardVisible = value;
            VirtualKeyboard.Visible = value;
        },
        enumerable: true,
        configurable: true
    });

    fTelnet._ButtonBar = null;
    fTelnet._Connection = null;
    fTelnet._Container = null;
    fTelnet._FocusWarningBar = null;
    fTelnet._HasFocus = true;
    fTelnet._InitMessageBar = null;
    fTelnet._LastTimer = 0;
    fTelnet._ScrollbackBar = null;
    fTelnet._StatusBar = null;
    fTelnet._Timer = null;
    fTelnet._YModemReceive = null;
    fTelnet._YModemSend = null;

    fTelnet._BareLFtoCRLF = false;
    fTelnet._BitsPerSecond = 57600;
    fTelnet._Blink = true;
    fTelnet._ButtonBarVisible = true;
    fTelnet._ConnectionType = 'telnet';
    fTelnet._Enter = '\r';
    fTelnet._Font = 'CP437';
    fTelnet._Hostname = 'bbs.ftelnet.ca';
    fTelnet._LocalEcho = false;
    fTelnet._Port = 1123;
    fTelnet._ProxyHostname = '';
    fTelnet._ProxyPort = 1123;
    fTelnet._ProxyPortSecure = 11235;
    fTelnet._ScreenColumns = 80;
    fTelnet._ScreenRows = 25;
    fTelnet._SplashScreen = 'G1swbRtbMkobWzA7MEgbWzE7NDQ7MzRt2sTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEG1swOzQ0OzMwbb8bWzBtDQobWzE7NDQ7MzRtsyAgG1szN21XZWxjb21lISAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAbWzA7NDQ7MzBtsxtbMG0NChtbMTs0NDszNG3AG1swOzQ0OzMwbcTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTE2RtbMG0NCg0KG1sxbSAbWzBtIBtbMTs0NDszNG3axMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMQbWzA7NDQ7MzBtvxtbMG0NCiAgG1sxOzQ0OzM0bbMbWzA7MzRt29vb2xtbMzBt29vb29vb29vb29vb29vb29vb29vb2xtbMzRt29vb29vbG1s0NDszMG2zG1swbQ0KICAbWzE7NDQ7MzRtsxtbMDszNG3b29vbG1sxOzMwbdvb29vb29vb29vb29vb29vb29vb29sbWzA7MzBt29sbWzM0bdvb29sbWzQ0OzMwbbMbWzBtDQogIBtbMTs0NDszNG2zG1swOzM0bdvb29sbWzE7MzBt29vb2xtbMG3b29vb29vb29vb29sbWzFt29vb2xtbMzBt29sbWzA7MzBt29sbWzM0bdvb29sbWzQ0OzMwbbMbWzBtDQogIBtbMTs0NDszNG2zG1swOzM0bdvb29sbWzE7MzBt29vb2xtbMG3b29vb29vb29vbG1sxbdvb29sbWzBt29sbWzE7MzBt29sbWzA7MzBt29sbWzM0bdvb29sbWzQ0OzMwbbMbWzBtDQogIBtbMTs0NDszNG2zG1swOzM0bdvb29sbWzE7MzBt29vb2xtbMG3b29vb29vb2xtbMW3b29vbG1swbdvbG1sxbdvbG1szMG3b2xtbMDszMG3b2xtbMzRt29vb2xtbNDQ7MzBtsxtbMG0NCiAgG1sxOzQ0OzM0bbMbWzA7MzRt29vb2xtbMTszMG3b29vbG1swbdvb29vb2xtbMW3b29vbG1swbdvbG1sxbdvb29sbWzMwbdvbG1swOzMwbdvbG1szNG3b29vbG1s0NDszMG2zG1swbQ0KICAbWzE7NDQ7MzRtsxtbMDszNG3b29vbG1sxOzMwbdvb29sbWzBt29vb2xtbMW3b29vbG1swbdvbG1sxbdvb29vb2xtbMzBt29sbWzA7MzBt29sbWzM0bdvb29sbWzQ0OzMwbbMbWzQwOzM3bQ0KICAbWzE7NDQ7MzRtsxtbMDszNG3b29vbG1sxOzMwbdvbG1swOzMwbdvbG1sxbdvb29vb29vb29vb29vb29vb2xtbMDszMG3b2xtbMzRt29vb2xtbNDQ7MzBtsxtbNDA7MzdtDQogIBtbMTs0NDszNG2zG1swOzM0bdvb29sbWzE7MzBt29sbWzBt29vb29vb29vb29vb29vb29vb29sbWzMwbdvbG1szNG3b29vbG1s0NDszMG2zG1s0MDszN20NCiAgG1sxOzQ0OzM0bbMbWzA7MzBt29vb29vb29vb29vb29vb29vb29vb29vb29vb29vbG1szNG3b2xtbNDQ7MzBtsxtbNDA7MzdtDQogIBtbMTs0NDszNG2zG1s0MDszMG3b2xtbMG3b29vb29vb29vb29vb29vb29vb29vb29vb29vbG1szMG3b2xtbNDRtsxtbNDA7MzdtIBtbMzRtIBtbMTs0NzszN23axMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMQbWzMwbb8bWzBtDQogIBtbMTs0NDszNG2zG1swOzMwbdvbG1sxbdvb29vb29vb29vb29vb29sbWzA7MzBt29vb29vb29vb2xtbMW3b2xtbMDszMG3b2xtbNDRtsxtbNDA7MzdtIBtbMzRtIBtbMTs0NzszN22zICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAbWzMwbbMbWzBtDQogIBtbMTs0NDszNG2zG1s0MDszMG3b2xtbMG3b29vb29vb29vb29vb29vb29vb29vb29vb29vbG1szMG3b2xtbNDRtsxtbMG0gG1szNG0gG1sxOzQ3OzM3bbMgICAbWzM0bUh0bWxUZXJtIC0tIFRlbG5ldCBmb3IgdGhlIFdlYiAgICAgG1szMG2zG1swbQ0KG1sxbSAbWzBtIBtbMTs0NDszNG2zG1swOzMwbdvbG1sxbdvb29vb29vb29vb29vb29vb29vb29vb2xtbMDszMG3b29vb29sbWzQ0bbMbWzBtIBtbMzRtIBtbMTs0NzszN22zICAgICAbWzA7NDc7MzRtV2ViIGJhc2VkIEJCUyB0ZXJtaW5hbCBjbGllbnQgICAgG1sxOzMwbbMbWzBtDQogIBtbMTs0NDszNG2zG1swOzM0bdvbG1szMG3b29vb29vb29vb29vb29vb29vb29vb29vb29vbG1szNG3b2xtbNDQ7MzBtsxtbMG0gG1szNG0gG1sxOzQ3OzM3bbMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIBtbMzBtsxtbMG0NCiAgG1sxOzQ0OzM0bcAbWzA7NDQ7MzBtxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTZG1swbSAbWzM0bSAbWzE7NDc7MzdtwBtbMzBtxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTZG1swbQ0KDQobWzExQxtbMTszMm1Db3B5cmlnaHQgKEMpIDIwMDAtMjAxNCBSJk0gU29mdHdhcmUuICBBbGwgUmlnaHRzIFJlc2VydmVkDQobWzA7MzRtxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExA==';
    fTelnet._StatusBarVisible = true;
    fTelnet._VirtualKeyboardVisible = true;
    return fTelnet;
})();
(function () {
    if ('atob' in window && 'btoa' in window) {
        return;
    }

    var B64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    function atob(input) {
        input = String(input);
        var position = 0, output = [], buffer = 0, bits = 0, n;
        input = input.replace(/\s/g, '');
        if ((input.length % 4) === 0) {
            input = input.replace(/=+$/, '');
        }
        if ((input.length % 4) === 1) {
            throw Error('InvalidCharacterError');
        }
        if (/[^+/0-9A-Za-z]/.test(input)) {
            throw Error('InvalidCharacterError');
        }
        while (position < input.length) {
            n = B64_ALPHABET.indexOf(input.charAt(position));
            buffer = (buffer << 6) | n;
            bits += 6;
            if (bits === 24) {
                output.push(String.fromCharCode((buffer >> 16) & 0xFF));
                output.push(String.fromCharCode((buffer >> 8) & 0xFF));
                output.push(String.fromCharCode(buffer & 0xFF));
                bits = 0;
                buffer = 0;
            }
            position += 1;
        }
        if (bits === 12) {
            buffer = buffer >> 4;
            output.push(String.fromCharCode(buffer & 0xFF));
        } else if (bits === 18) {
            buffer = buffer >> 2;
            output.push(String.fromCharCode((buffer >> 8) & 0xFF));
            output.push(String.fromCharCode(buffer & 0xFF));
        }
        return output.join('');
    }
    ;
    function btoa(input) {
        input = String(input);
        var position = 0, out = [], o1, o2, o3, e1, e2, e3, e4;
        if (/[^\x00-\xFF]/.test(input)) {
            throw Error('InvalidCharacterError');
        }
        while (position < input.length) {
            o1 = input.charCodeAt(position++);
            o2 = input.charCodeAt(position++);
            o3 = input.charCodeAt(position++);

            e1 = o1 >> 2;
            e2 = ((o1 & 0x3) << 4) | (o2 >> 4);
            e3 = ((o2 & 0xf) << 2) | (o3 >> 6);
            e4 = o3 & 0x3f;
            if (position === input.length + 2) {
                e3 = 64;
                e4 = 64;
            } else if (position === input.length + 1) {
                e4 = 64;
            }
            out.push(B64_ALPHABET.charAt(e1), B64_ALPHABET.charAt(e2), B64_ALPHABET.charAt(e3), B64_ALPHABET.charAt(e4));
        }
        return out.join('');
    }
    ;
    window.atob = atob;
    window.btoa = btoa;
}());
var Offset;
(function (Offset) {
    'use strict';
    function getOffsetSum(elem) {
        var top = 0, left = 0;

        while (elem) {
            top = top + elem.offsetTop;
            left = left + elem.offsetLeft;
            elem = elem.offsetParent;
        }

        return { y: top, x: left };
    }

    function getOffsetRect(elem) {
        var box = elem.getBoundingClientRect();

        var body = document.body;
        var docElem = document.documentElement;

        var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
        var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;

        var clientTop = docElem.clientTop || body.clientTop || 0;
        var clientLeft = docElem.clientLeft || body.clientLeft || 0;

        var top = box.top + scrollTop - clientTop;
        var left = box.left + scrollLeft - clientLeft;

        return { y: Math.round(top), x: Math.round(left) };
    }

    function getOffset(elem) {
        if (elem.getBoundingClientRect) {
            return getOffsetRect(elem);
        } else {
            return getOffsetSum(elem);
        }
    }
    Offset.getOffset = getOffset;
})(Offset || (Offset = {}));

var TypedEvent = (function () {
    function TypedEvent() {
        this._listeners = [];
    }
    TypedEvent.prototype.on = function (listener) {
        this._listeners.push(listener);
    };
    TypedEvent.prototype.off = function (listener) {
        if (typeof listener === 'function') {
            for (var i = 0, l = this._listeners.length; i < l; l++) {
                if (this._listeners[i] === listener) {
                    this._listeners.splice(i, 1);
                    break;
                }
            }
        } else {
            this._listeners = [];
        }
    };

    TypedEvent.prototype.trigger = function () {
        var a = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            a[_i] = arguments[_i + 0];
        }
        var context = {};
        var listeners = this._listeners.slice(0);
        for (var i = 0, l = listeners.length; i < l; i++) {
            listeners[i].apply(context, a || []);
        }
    };
    return TypedEvent;
})();

var ByteArray = (function () {
    function ByteArray() {
        this._Bytes = [];
        this._Length = 0;
        this._Position = 0;
    }
    Object.defineProperty(ByteArray.prototype, "bytesAvailable", {
        get: function () {
            return this._Length - this._Position;
        },
        enumerable: true,
        configurable: true
    });

    ByteArray.prototype.clear = function () {
        this._Bytes = [];
        this._Length = 0;
        this._Position = 0;
    };

    Object.defineProperty(ByteArray.prototype, "length", {
        get: function () {
            return this._Length;
        },
        set: function (value) {
            if (value <= 0) {
                this.clear();
            } else {
                if (value < this._Length) {
                    this._Bytes.splice(value, this._Length - value);
                } else if (value > this._Length) {
                    for (var i = this._Length + 1; i <= value; i++) {
                        this._Bytes.push(0);
                    }
                }

                this._Length = value;
            }
        },
        enumerable: true,
        configurable: true
    });


    Object.defineProperty(ByteArray.prototype, "position", {
        get: function () {
            return this._Position;
        },
        set: function (value) {
            if (value <= 0) {
                value = 0;
            } else if (value >= this._Length) {
                value = this._Length;
            }

            this._Position = value;
        },
        enumerable: true,
        configurable: true
    });


    ByteArray.prototype.readBytes = function (bytes, offset, length) {
        if (typeof offset === 'undefined') {
            offset = 0;
        }
        if (typeof length === 'undefined') {
            length = 0;
        }

        if (this._Position + length > this._Length) {
            throw 'There is not sufficient data available to read.';
        }

        var BytesPosition = bytes.position;
        bytes.position = offset;

        for (var i = 0; i < length; i++) {
            bytes.writeByte(this._Bytes[this._Position++] & 0xFF);
        }

        bytes.position = BytesPosition;
    };

    ByteArray.prototype.readString = function (length) {
        if (typeof length === 'undefined') {
            length = this._Length;
        }

        var Result = '';
        while ((length-- > 0) && (this._Position < this._Length)) {
            Result += String.fromCharCode(this._Bytes[this._Position++]);
        }

        if (this.bytesAvailable === 0) {
            this.clear();
        }

        return Result;
    };

    ByteArray.prototype.readUnsignedByte = function () {
        if (this._Position >= this._Length) {
            throw 'There is not sufficient data available to read.';
        }

        return (this._Bytes[this._Position++] & 0xFF);
    };

    ByteArray.prototype.readUnsignedShort = function () {
        if (this._Position >= (this._Length - 1)) {
            throw 'There is not sufficient data available to read.';
        }

        return ((this._Bytes[this._Position++] & 0xFF) << 8) + (this._Bytes[this._Position++] & 0xFF);
    };

    ByteArray.prototype.toString = function () {
        var Result = '';
        for (var i = 0; i < this._Length; i++) {
            Result += String.fromCharCode(this._Bytes[i]);
        }

        return Result;
    };

    ByteArray.prototype.writeByte = function (value) {
        this._Bytes[this._Position++] = (value & 0xFF);
        if (this._Position > this._Length) {
            this._Length++;
        }
    };

    ByteArray.prototype.writeBytes = function (bytes, offset, length) {
        if (!offset) {
            offset = 0;
        }
        if (!length) {
            length = 0;
        }

        if (offset < 0) {
            offset = 0;
        }
        if (length < 0) {
            return;
        } else if (length === 0) {
            length = bytes.length;
        }

        if (offset >= bytes.length) {
            offset = 0;
        }
        if (length > bytes.length) {
            length = bytes.length;
        }
        if (offset + length > bytes.length) {
            length = bytes.length - offset;
        }

        var BytesPosition = bytes.position;
        bytes.position = offset;

        for (var i = 0; i < length; i++) {
            this.writeByte(bytes.readUnsignedByte());
        }

        bytes.position = BytesPosition;
    };

    ByteArray.prototype.writeShort = function (value) {
        this.writeByte((value & 0xFF00) >> 8);
        this.writeByte(value & 0x00FF);
    };

    ByteArray.prototype.writeString = function (text) {
        var Textlength = text.length;
        for (var i = 0; i < Textlength; i++) {
            this.writeByte(text.charCodeAt(i));
        }
    };
    return ByteArray;
})();
var Keyboard;
(function (Keyboard) {
    Keyboard[Keyboard["ALTERNATE"] = 18] = "ALTERNATE";
    Keyboard[Keyboard["APPMENU"] = 1001] = "APPMENU";
    Keyboard[Keyboard["BACKSPACE"] = 8] = "BACKSPACE";
    Keyboard[Keyboard["BREAK"] = 1000] = "BREAK";
    Keyboard[Keyboard["CAPS_LOCK"] = 20] = "CAPS_LOCK";
    Keyboard[Keyboard["CONTROL"] = 17] = "CONTROL";
    Keyboard[Keyboard["DELETE"] = 46] = "DELETE";
    Keyboard[Keyboard["DOWN"] = 40] = "DOWN";
    Keyboard[Keyboard["END"] = 35] = "END";
    Keyboard[Keyboard["ESCAPE"] = 27] = "ESCAPE";
    Keyboard[Keyboard["ENTER"] = 13] = "ENTER";
    Keyboard[Keyboard["F1"] = 112] = "F1";
    Keyboard[Keyboard["F2"] = 113] = "F2";
    Keyboard[Keyboard["F3"] = 114] = "F3";
    Keyboard[Keyboard["F4"] = 115] = "F4";
    Keyboard[Keyboard["F5"] = 116] = "F5";
    Keyboard[Keyboard["F6"] = 117] = "F6";
    Keyboard[Keyboard["F7"] = 118] = "F7";
    Keyboard[Keyboard["F8"] = 119] = "F8";
    Keyboard[Keyboard["F9"] = 120] = "F9";
    Keyboard[Keyboard["F10"] = 121] = "F10";
    Keyboard[Keyboard["F11"] = 122] = "F11";
    Keyboard[Keyboard["F12"] = 123] = "F12";
    Keyboard[Keyboard["HOME"] = 36] = "HOME";
    Keyboard[Keyboard["INSERT"] = 45] = "INSERT";
    Keyboard[Keyboard["LEFT"] = 37] = "LEFT";
    Keyboard[Keyboard["NUM_LOCK"] = 1002] = "NUM_LOCK";
    Keyboard[Keyboard["PAGE_DOWN"] = 34] = "PAGE_DOWN";
    Keyboard[Keyboard["PAGE_UP"] = 33] = "PAGE_UP";
    Keyboard[Keyboard["PRINT_SCREEN"] = 1006] = "PRINT_SCREEN";
    Keyboard[Keyboard["RIGHT"] = 39] = "RIGHT";
    Keyboard[Keyboard["SHIFT"] = 16] = "SHIFT";
    Keyboard[Keyboard["SHIFTLEFT"] = 1004] = "SHIFTLEFT";
    Keyboard[Keyboard["SHIFTRIGHT"] = 1005] = "SHIFTRIGHT";
    Keyboard[Keyboard["SPACE"] = 32] = "SPACE";
    Keyboard[Keyboard["TAB"] = 9] = "TAB";
    Keyboard[Keyboard["WINDOWS"] = 1003] = "WINDOWS";
    Keyboard[Keyboard["UP"] = 38] = "UP";
})(Keyboard || (Keyboard = {}));
var Point = (function () {
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }
    return Point;
})();
var Ansi = (function () {
    function Ansi() {
    }
    Ansi.AnsiCommand = function (finalByte) {
        var Colour = 0;
        var x = 0;
        var y = 0;
        var z = 0;

        switch (finalByte) {
            case '!':
                if (this._AnsiParams.length < 1) {
                    this._AnsiParams.push('0');
                }
                switch (parseInt(this._AnsiParams.shift(), 10)) {
                    case 0:
                        this.onripdetect.trigger();
                        break;
                    case 1:
                        this.onripdisable.trigger();
                        break;
                    case 2:
                        this.onripenable.trigger();
                        break;
                    default:
                        console.log('Unknown ESC sequence: PB(' + this._AnsiParams.toString() + ') IB(' + this._AnsiIntermediates.toString() + ') FB(' + finalByte + ')');
                        break;
                }
                break;
            case '@':
                if (this._AnsiParams.length < 1) {
                    this._AnsiParams.push('1');
                }
                x = Math.max(1, parseInt(this._AnsiParams.shift(), 10));
                Crt.InsChar(x);
                break;
            case '{':
                console.log('Unhandled ESC sequence: Indicates that a font block is following');
                break;
            case 'A':
                if (this._AnsiParams.length < 1) {
                    this._AnsiParams.push('1');
                }
                y = Math.max(1, parseInt(this._AnsiParams.shift(), 10));
                y = Math.max(1, Crt.WhereY() - y);
                Crt.GotoXY(Crt.WhereX(), y);
                break;
            case 'B':
                if (this._AnsiParams.length < 1) {
                    this._AnsiParams.push('1');
                }
                y = Math.max(1, parseInt(this._AnsiParams.shift(), 10));
                y = Math.min(Crt.WindRows, Crt.WhereY() + y);
                Crt.GotoXY(Crt.WhereX(), y);
                break;
            case 'C':
                if (this._AnsiParams.length < 1) {
                    this._AnsiParams.push('1');
                }
                x = Math.max(1, parseInt(this._AnsiParams.shift(), 10));
                x = Math.min(Crt.WindCols, Crt.WhereX() + x);
                Crt.GotoXY(x, Crt.WhereY());
                break;
            case 'c':
                if (this._AnsiParams.length < 1) {
                    this._AnsiParams.push('0');
                }
                console.log('Unhandled ESC sequence: Device Attributes');
                break;
            case 'D':
                if (this._AnsiIntermediates.length === 0) {
                    if (this._AnsiParams.length < 1) {
                        this._AnsiParams.push('1');
                    }
                    x = Math.max(1, parseInt(this._AnsiParams.shift(), 10));
                    x = Math.max(1, Crt.WhereX() - x);
                    Crt.GotoXY(x, Crt.WhereY());
                } else if (this._AnsiIntermediates.indexOf(' ') !== -1) {
                    while (this._AnsiParams.length < 2) {
                        this._AnsiParams.push('0');
                    }
                    x = parseInt(this._AnsiParams.shift(), 10);
                    y = parseInt(this._AnsiParams.shift(), 10);
                    if ((x === 0) && (y >= 0) && (y <= 40)) {
                        Crt.SetFont('SyncTerm-' + y.toString(10));
                    } else {
                        console.log('Unhandled ESC sequence: Secondary Font Selection (set font ' + x + ' to ' + y + ')');
                    }
                    break;
                }
                break;
            case 'E':
                if (this._AnsiParams.length < 1) {
                    this._AnsiParams.push('1');
                }
                y = Math.max(1, parseInt(this._AnsiParams.shift(), 10));
                y = Math.min(Crt.WindRows, Crt.WhereY() + y);
                Crt.GotoXY(1, y);
                break;
            case 'F':
                if (this._AnsiParams.length < 1) {
                    this._AnsiParams.push('1');
                }
                y = Math.max(1, parseInt(this._AnsiParams.shift(), 10));
                y = Math.max(1, Crt.WhereY() - y);
                Crt.GotoXY(1, y);
                break;
            case 'G':
                if (this._AnsiParams.length < 1) {
                    this._AnsiParams.push('1');
                }
                x = Math.max(1, parseInt(this._AnsiParams.shift(), 10));
                if ((x >= 1) && (x <= Crt.WindCols)) {
                    Crt.GotoXY(x, Crt.WhereY());
                }
                break;
            case 'H':
            case 'f':
                while (this._AnsiParams.length < 2) {
                    this._AnsiParams.push('1');
                }
                y = Math.max(1, parseInt(this._AnsiParams.shift(), 10));
                x = Math.max(1, parseInt(this._AnsiParams.shift(), 10));
                Crt.GotoXY(x, y);
                break;
            case 'h':
                if (this._AnsiParams.length < 1) {
                    this._AnsiParams.push('0');
                }
                switch (this._AnsiParams[0]) {
                    case '=255':
                        console.log('Unhandled ESC sequence: Enable DoorWay Mode');
                        break;
                    case '?6':
                        console.log('Unhandled ESC sequence: Enable origin mode');
                        break;
                    case '?7':
                        console.log('Unhandled ESC sequence: Enable auto wrap');
                        break;
                    case '?25':
                        Crt.ShowCursor();
                        break;
                    case '?31':
                        console.log('Unhandled ESC sequence: Enable alt character set');
                        break;
                    case '?32':
                        console.log('Unhandled ESC sequence: Bright Intensity Enable');
                        break;
                    case '?33':
                        console.log('Unhandled ESC sequence: Blink to Bright Intensity Background');
                        break;
                    default:
                        console.log('Unknown ESC sequence: PB(' + this._AnsiParams.toString() + ') IB(' + this._AnsiIntermediates.toString() + ') FB(' + finalByte + ')');
                        break;
                }
                break;
            case 'J':
                if (this._AnsiParams.length < 1) {
                    this._AnsiParams.push('0');
                }
                switch (parseInt(this._AnsiParams.shift(), 10)) {
                    case 0:
                        Crt.ClrEos();
                        break;
                    case 1:
                        Crt.ClrBos();
                        break;
                    case 2:
                        Crt.ClrScr();
                        break;
                }
                break;
            case 'K':
                if (this._AnsiParams.length < 1) {
                    this._AnsiParams.push('0');
                }
                switch (parseInt(this._AnsiParams.shift(), 10)) {
                    case 0:
                        Crt.ClrEol();
                        break;
                    case 1:
                        Crt.ClrBol();
                        break;
                    case 2:
                        Crt.ClrLine();
                        break;
                }
                break;
            case 'L':
                if (this._AnsiParams.length < 1) {
                    this._AnsiParams.push('1');
                }
                y = Math.max(1, parseInt(this._AnsiParams.shift(), 10));
                Crt.InsLine(y);
                break;
            case 'l':
                if (this._AnsiParams.length < 1) {
                    this._AnsiParams.push('0');
                }
                switch (this._AnsiParams[0]) {
                    case '=255':
                        console.log('Unhandled ESC sequence: Disable DoorWay Mode');
                        break;
                    case '?6':
                        console.log('Unhandled ESC sequence: Disable origin mode');
                        break;
                    case '?7':
                        console.log('Unhandled ESC sequence: Disable auto wrap');
                        break;
                    case '?25':
                        Crt.HideCursor();
                        break;
                    case '?31':
                        console.log('Unhandled ESC sequence: Disable alt character set');
                        break;
                    case '?32':
                        console.log('Unhandled ESC sequence: Bright Intensity Disable');
                        break;
                    case '?33':
                        console.log('Unhandled ESC sequence: Blink Normal');
                        break;
                    default:
                        console.log('Unknown ESC sequence: PB(' + this._AnsiParams.toString() + ') IB(' + this._AnsiIntermediates.toString() + ') FB(' + finalByte + ')');
                        break;
                }
                break;
            case 'M':
                if (this._AnsiParams[0][0] === '=') {
                    if (this._AnsiParams.length < 1) {
                        this._AnsiParams.push('0');
                    }
                    x = parseInt(this._AnsiParams.shift(), 10);
                    switch (x) {
                        case 0:
                            console.log('Unhandled ESC sequence: Only CSI | will introduce an ANSI music string.');
                            break;
                        case 1:
                            console.log('Unhandled ESC sequence: Both CSI | and CSI N will introduce an ANSI music string.');
                            break;
                        case 2:
                            console.log('Unhandled ESC sequence: CSI |, CSI N, and CSI M will all intriduce and ANSI music string.');
                            break;
                        default:
                            console.log('Unknown ESC sequence: PB(' + this._AnsiParams.toString() + ') IB(' + this._AnsiIntermediates.toString() + ') FB(' + finalByte + ')');
                            break;
                    }
                } else {
                    if (this._AnsiParams.length < 1) {
                        this._AnsiParams.push('1');
                    }
                    y = Math.max(1, parseInt(this._AnsiParams.shift(), 10));
                    Crt.DelLine(y);
                }
                break;
            case 'm':
                if (this._AnsiParams.length < 1) {
                    this._AnsiParams.push('0');
                }
                while (this._AnsiParams.length > 0) {
                    x = parseInt(this._AnsiParams.shift(), 10);
                    switch (x) {
                        case 0:
                            Crt.NormVideo();
                            break;
                        case 1:
                            Crt.HighVideo();
                            break;
                        case 2:
                            Crt.LowVideo();
                            break;
                        case 3:
                            break;
                        case 4:
                            break;
                        case 5:
                            Crt.SetBlink(true);
                            Crt.SetBlinkRate(500);
                            break;
                        case 6:
                            Crt.SetBlink(true);
                            Crt.SetBlinkRate(250);
                            break;
                        case 7:
                            Crt.ReverseVideo();
                            break;
                        case 8:
                            this._AnsiAttr = Crt.TextAttr;
                            Crt.Conceal();
                            break;
                        case 21:
                            break;
                        case 22:
                            Crt.LowVideo();
                            break;
                        case 24:
                            break;
                        case 25:
                            Crt.SetBlink(false);
                            break;
                        case 27:
                            Crt.ReverseVideo();
                            break;
                        case 28:
                            Crt.TextAttr = this._AnsiAttr;
                            break;
                        case 30:
                        case 31:
                        case 32:
                        case 33:
                        case 34:
                        case 35:
                        case 36:
                        case 37:
                            Colour = this.ANSI_COLORS[x - 30];
                            if (Crt.TextAttr % 16 > 7) {
                                Colour += 8;
                            }
                            Crt.TextColor(Colour);
                            break;
                        case 39:
                            Colour = this.ANSI_COLORS[37 - 30];
                            if (Crt.TextAttr % 16 > 7) {
                                Colour += 8;
                            }
                            Crt.TextColor(Colour);
                            break;
                        case 40:
                        case 41:
                        case 42:
                        case 43:
                        case 44:
                        case 45:
                        case 46:
                        case 47:
                            Colour = this.ANSI_COLORS[x - 40];
                            Crt.TextBackground(Colour);
                            break;
                        case 49:
                            Colour = this.ANSI_COLORS[40 - 40];
                            Crt.TextBackground(Colour);
                            break;
                    }
                }
                break;
            case 'N':
                console.log('Unhandled ESC sequence: ANSI Music');
                break;
            case 'n':
                if (this._AnsiParams.length < 1) {
                    this._AnsiParams.push('0');
                }
                x = parseInt(this._AnsiParams.shift(), 10);
                switch (x) {
                    case 5:
                        this.onesc5n.trigger();
                        break;
                    case 6:
                        this.onesc6n.trigger();
                        break;
                    case 255:
                        this.onesc255n.trigger();
                        break;
                    default:
                        console.log('Unknown ESC sequence: PB(' + this._AnsiParams.toString() + ') IB(' + this._AnsiIntermediates.toString() + ') FB(' + finalByte + ')');
                        break;
                }
                break;
            case 'P':
                if (this._AnsiParams.length < 1) {
                    this._AnsiParams.push('1');
                }
                x = Math.max(1, parseInt(this._AnsiParams.shift(), 10));
                Crt.DelChar(x);
                break;
            case 'Q':
                while (this._AnsiParams.length < 3) {
                    this._AnsiParams.push('0');
                }
                x = parseInt(this._AnsiParams.shift(), 10);
                y = parseInt(this._AnsiParams.shift(), 10);
                z = parseInt(this._AnsiParams.shift(), 10);
                this.onescQ.trigger(x.toString(10));
                break;
            case 'r':
                if (this._AnsiIntermediates.length === 0) {
                    console.log('Unknown ESC sequence: PB(' + this._AnsiParams.toString() + ') IB(' + this._AnsiIntermediates.toString() + ') FB(' + finalByte + ')');
                } else if (this._AnsiIntermediates[0].indexOf('*') !== -1) {
                    console.log('Unhandled ESC sequence: Set the output emulation speed.');
                } else if (this._AnsiIntermediates[0].indexOf(']') !== -1) {
                    console.log('Unhandled ESC sequence: Set Top and Bottom Margins');
                } else {
                    console.log('Unknown ESC sequence: PB(' + this._AnsiParams.toString() + ') IB(' + this._AnsiIntermediates.toString() + ') FB(' + finalByte + ')');
                }
                break;
            case 'S':
                if (this._AnsiParams.length < 1) {
                    this._AnsiParams.push('1');
                }
                y = Math.max(1, parseInt(this._AnsiParams.shift(), 10));
                Crt.ScrollUpScreen(y);
                break;
            case 's':
                if (this._AnsiIntermediates.length === 0) {
                    this._AnsiXY = new Point(Crt.WhereX(), Crt.WhereY());
                } else {
                    console.log('Unhandled ESC sequence: Save Mode Setting');
                }
                break;
            case 'T':
                if (this._AnsiParams.length < 1) {
                    this._AnsiParams.push('1');
                }
                y = Math.max(1, parseInt(this._AnsiParams.shift(), 10));
                Crt.ScrollDownWindow(y);
                break;
            case 'U':
                console.log('Unhandled ESC sequence: Clear screen with default attribute');
                break;
            case 'u':
                if (this._AnsiIntermediates.length === 0) {
                    Crt.GotoXY(this._AnsiXY.x, this._AnsiXY.y);
                } else {
                    console.log('Unhandled ESC sequence: Restore Mode Setting');
                }
                break;
            case 'X':
                if (this._AnsiParams.length < 1) {
                    this._AnsiParams.push('1');
                }
                x = Math.max(1, parseInt(this._AnsiParams.shift(), 10));
                Crt.DelChar(x);
                break;
            case 'Z':
                console.log('Unhandled ESC sequnce: Cursor Backward Tabulation');
                break;
            default:
                console.log('Unknown ESC sequence: PB(' + this._AnsiParams.toString() + ') IB(' + this._AnsiIntermediates.toString() + ') FB(' + finalByte + ')');
                break;
        }
    };

    Ansi.ClrBol = function () {
        return '\x1B[1K';
    };

    Ansi.ClrBos = function () {
        return '\x1B[1J';
    };

    Ansi.ClrEol = function () {
        return '\x1B[K';
    };

    Ansi.ClrEos = function () {
        return '\x1B[J';
    };

    Ansi.ClrLine = function () {
        return '\x1B[2K';
    };

    Ansi.ClrScr = function () {
        return '\x1B[2J';
    };

    Ansi.CursorDown = function (count) {
        if (count === 1) {
            return '\x1B[B';
        } else {
            return '\x1B[' + count.toString() + 'B';
        }
    };

    Ansi.CursorLeft = function (count) {
        if (count === 1) {
            return '\x1B[D';
        } else {
            return '\x1B[' + count.toString() + 'D';
        }
    };

    Ansi.CursorPosition = function (x, y) {
        if (typeof x === 'undefined') {
            x = Crt.WhereXA();
        }
        if (typeof y === 'undefined') {
            y = Crt.WhereYA();
        }

        return '\x1B[' + y + ';' + x + 'R';
    };

    Ansi.CursorRestore = function () {
        return '\x1B[u';
    };

    Ansi.CursorRight = function (count) {
        if (count === 1) {
            return '\x1B[C';
        } else {
            return '\x1B[' + count.toString() + 'C';
        }
    };

    Ansi.CursorSave = function () {
        return '\x1B[s';
    };

    Ansi.CursorUp = function (count) {
        if (count === 1) {
            return '\x1B[A';
        } else {
            return '\x1B[' + count.toString() + 'A';
        }
    };

    Ansi.GotoX = function (x) {
        if (x === 1) {
            return this.CursorLeft(255);
        } else {
            return this.CursorLeft(255) + this.CursorRight(x - 1);
        }
    };

    Ansi.GotoXY = function (x, y) {
        return '\x1B[' + y.toString() + ';' + x.toString() + 'H';
    };

    Ansi.GotoY = function (y) {
        if (y === 1) {
            return this.CursorUp(255);
        } else {
            return this.CursorUp(255) + this.CursorDown(y - 1);
        }
    };

    Ansi.TextAttr = function (attr) {
        return this.TextColor(attr % 16) + this.TextBackground(Math.floor(attr / 16));
    };

    Ansi.TextBackground = function (colour) {
        while (colour >= 8) {
            colour -= 8;
        }
        return '\x1B[' + (40 + this.ANSI_COLORS[colour]).toString() + 'm';
    };

    Ansi.TextColor = function (colour) {
        switch (colour % 16) {
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
                return '\x1B[0;' + (30 + this.ANSI_COLORS[colour % 16]).toString() + 'm' + this.TextBackground(Crt.TextAttr / 16);
            case 8:
            case 9:
            case 10:
            case 11:
            case 12:
            case 13:
            case 14:
            case 15:
                return '\x1B[1;' + (30 + this.ANSI_COLORS[(colour % 16) - 8]).toString() + 'm';
        }

        return '';
    };

    Ansi.Write = function (text) {
        if (Crt.Atari || Crt.C64) {
            Crt.Write(text);
        } else {
            var Buffer = '';

            for (var i = 0; i < text.length; i++) {
                if (text.charAt(i) === '\x1B') {
                    this._AnsiParserState = 1 /* Escape */;
                } else if (this._AnsiParserState === 1 /* Escape */) {
                    if (text.charAt(i) === '[') {
                        this._AnsiParserState = 2 /* Bracket */;
                        this._AnsiBuffer = '';

                        while (this._AnsiParams.length > 0) {
                            this._AnsiParams.pop();
                        }
                        while (this._AnsiIntermediates.length > 0) {
                            this._AnsiIntermediates.pop();
                        }
                    } else {
                        Buffer += text.charAt(i);
                        this._AnsiParserState = 0 /* None */;
                    }
                } else if (this._AnsiParserState === 2 /* Bracket */) {
                    if ((text.charAt(i) >= '0') && (text.charAt(i) <= '?')) {
                        this._AnsiBuffer += text.charAt(i);
                        this._AnsiParserState = 3 /* ParameterByte */;
                    } else if ((text.charAt(i) >= ' ') && (text.charAt(i) <= '/')) {
                        this._AnsiBuffer += text.charAt(i);
                        this._AnsiParserState = 4 /* IntermediateByte */;
                    } else if ((text.charAt(i) >= '@') && (text.charAt(i) <= '~')) {
                        Crt.Write(Buffer);
                        Buffer = '';

                        this.AnsiCommand(text.charAt(i));

                        this._AnsiParserState = 0 /* None */;
                    } else {
                        Buffer += text.charAt(i);
                        this._AnsiParserState = 0 /* None */;
                    }
                } else if (this._AnsiParserState === 3 /* ParameterByte */) {
                    if ((text.charAt(i)) === ';') {
                        this._AnsiParams.push((this._AnsiBuffer === '') ? '0' : this._AnsiBuffer);
                        this._AnsiBuffer = '';
                    } else if ((text.charAt(i) >= '0') && (text.charAt(i) <= '?')) {
                        this._AnsiBuffer += text.charAt(i);
                    } else if ((text.charAt(i) >= ' ') && (text.charAt(i) <= '/')) {
                        this._AnsiParams.push((this._AnsiBuffer === '') ? '0' : this._AnsiBuffer);
                        this._AnsiBuffer = '';

                        this._AnsiIntermediates.push(text.charAt(i));
                        this._AnsiParserState = 4 /* IntermediateByte */;
                    } else if ((text.charAt(i) >= '@') && (text.charAt(i) <= '~')) {
                        this._AnsiParams.push((this._AnsiBuffer === '') ? '0' : this._AnsiBuffer);
                        this._AnsiBuffer = '';

                        Crt.Write(Buffer);
                        Buffer = '';

                        this.AnsiCommand(text.charAt(i));

                        this._AnsiParserState = 0 /* None */;
                    } else {
                        Buffer += text.charAt(i);
                        this._AnsiParserState = 0 /* None */;
                    }
                } else if (this._AnsiParserState === 4 /* IntermediateByte */) {
                    if ((text.charAt(i) >= '0') && (text.charAt(i) <= '?')) {
                        Buffer += text.charAt(i);
                        this._AnsiParserState = 0 /* None */;
                    } else if ((text.charAt(i) >= ' ') && (text.charAt(i) <= '/')) {
                        this._AnsiIntermediates.push(text.charAt(i));
                    } else if ((text.charAt(i) >= '@') && (text.charAt(i) <= '~')) {
                        Crt.Write(Buffer);
                        Buffer = '';

                        this.AnsiCommand(text.charAt(i));

                        this._AnsiParserState = 0 /* None */;
                    } else {
                        Buffer += text.charAt(i);
                        this._AnsiParserState = 0 /* None */;
                    }
                } else {
                    Buffer += text.charAt(i);
                }
            }

            Crt.Write(Buffer);
        }
    };

    Ansi.WriteLn = function (text) {
        this.Write(text + '\r\n');
    };
    Ansi.onesc5n = new TypedEvent();
    Ansi.onesc6n = new TypedEvent();
    Ansi.onesc255n = new TypedEvent();
    Ansi.onescQ = new TypedEvent();
    Ansi.onripdetect = new TypedEvent();
    Ansi.onripdisable = new TypedEvent();
    Ansi.onripenable = new TypedEvent();

    Ansi.ANSI_COLORS = [0, 4, 2, 6, 1, 5, 3, 7];

    Ansi._AnsiAttr = 7;
    Ansi._AnsiBuffer = '';
    Ansi._AnsiIntermediates = [];
    Ansi._AnsiParams = [];
    Ansi._AnsiParserState = 0 /* None */;
    Ansi._AnsiXY = new Point(1, 1);
    return Ansi;
})();
var AnsiParserState;
(function (AnsiParserState) {
    AnsiParserState[AnsiParserState["None"] = 0] = "None";

    AnsiParserState[AnsiParserState["Escape"] = 1] = "Escape";

    AnsiParserState[AnsiParserState["Bracket"] = 2] = "Bracket";

    AnsiParserState[AnsiParserState["ParameterByte"] = 3] = "ParameterByte";

    AnsiParserState[AnsiParserState["IntermediateByte"] = 4] = "IntermediateByte";
})(AnsiParserState || (AnsiParserState = {}));
var CharInfo = (function () {
    function CharInfo(ch, attr, blink, underline, reverse) {
        if (typeof blink === 'undefined') {
            blink = false;
        }
        if (typeof underline === 'undefined') {
            underline = false;
        }
        if (typeof reverse === 'undefined') {
            reverse = false;
        }

        this.Ch = ch;
        this.Attr = attr;
        this.Blink = blink;
        this.Underline = underline;
        this.Reverse = reverse;
    }
    return CharInfo;
})();
var BorderStyle;
(function (BorderStyle) {
    BorderStyle[BorderStyle["Single"] = 0] = "Single";

    BorderStyle[BorderStyle["Double"] = 1] = "Double";

    BorderStyle[BorderStyle["SingleH"] = 2] = "SingleH";

    BorderStyle[BorderStyle["SingleV"] = 3] = "SingleV";

    BorderStyle[BorderStyle["DoubleH"] = 4] = "DoubleH";

    BorderStyle[BorderStyle["DoubleV"] = 5] = "DoubleV";
})(BorderStyle || (BorderStyle = {}));
var ContentAlignment;
(function (ContentAlignment) {
    ContentAlignment[ContentAlignment["BottomLeft"] = 0] = "BottomLeft";
    ContentAlignment[ContentAlignment["BottomCenter"] = 1] = "BottomCenter";
    ContentAlignment[ContentAlignment["BottomRight"] = 2] = "BottomRight";
    ContentAlignment[ContentAlignment["MiddleLeft"] = 3] = "MiddleLeft";
    ContentAlignment[ContentAlignment["MiddleCenter"] = 4] = "MiddleCenter";
    ContentAlignment[ContentAlignment["MiddleRight"] = 5] = "MiddleRight";
    ContentAlignment[ContentAlignment["TopLeft"] = 6] = "TopLeft";
    ContentAlignment[ContentAlignment["TopCenter"] = 7] = "TopCenter";
    ContentAlignment[ContentAlignment["TopRight"] = 8] = "TopRight";
    ContentAlignment[ContentAlignment["Left"] = 9] = "Left";
    ContentAlignment[ContentAlignment["Center"] = 10] = "Center";
    ContentAlignment[ContentAlignment["Right"] = 11] = "Right";
})(ContentAlignment || (ContentAlignment = {}));
var CrtControl = (function () {
    function CrtControl(parent, left, top, width, height) {
        this._BackColour = Crt.BLACK;
        this._Background = null;
        this._Controls = [];
        this._ForeColour = Crt.LIGHTGRAY;
        this._Parent = null;
        this._Parent = parent;
        this._Left = left;
        this._Top = top;
        this._Width = width;
        this._Height = height;

        this.SaveBackground();

        if (this._Parent !== null) {
            parent.AddControl(this);
        }
    }
    CrtControl.prototype.AddControl = function (child) {
        this._Controls.push(child);
    };

    Object.defineProperty(CrtControl.prototype, "BackColour", {
        get: function () {
            return this._BackColour;
        },
        set: function (value) {
            if (value !== this._BackColour) {
                this._BackColour = value;
                this.Paint(true);
            }
        },
        enumerable: true,
        configurable: true
    });


    Object.defineProperty(CrtControl.prototype, "ForeColour", {
        get: function () {
            return this._ForeColour;
        },
        set: function (value) {
            if (value !== this._ForeColour) {
                this._ForeColour = value;
                this.Paint(true);
            }
        },
        enumerable: true,
        configurable: true
    });


    Object.defineProperty(CrtControl.prototype, "Height", {
        get: function () {
            return this._Height;
        },
        set: function (value) {
            if (value !== this._Height) {
                this.RestoreBackground();
                this._Height = value;
                this.SaveBackground();
                this.Paint(true);
            }
        },
        enumerable: true,
        configurable: true
    });


    CrtControl.prototype.Hide = function () {
        this.RestoreBackground();
    };

    Object.defineProperty(CrtControl.prototype, "Left", {
        get: function () {
            return this._Left;
        },
        set: function (value) {
            if (value !== this._Left) {
                this.RestoreBackground();
                this._Left = value;
                this.SaveBackground();
                this.Paint(true);

                for (var i = 0; i < this._Controls.length; i++) {
                    this._Controls[i].Paint(true);
                }
            }
        },
        enumerable: true,
        configurable: true
    });


    CrtControl.prototype.Paint = function (force) {
    };

    Object.defineProperty(CrtControl.prototype, "Parent", {
        get: function () {
            return this._Parent;
        },
        set: function (value) {
            this.RestoreBackground();
            this._Parent = value;
            this.SaveBackground();
            this.Paint(true);
        },
        enumerable: true,
        configurable: true
    });


    CrtControl.prototype.RestoreBackground = function () {
        var Left = this._Left;
        var Top = this._Top;
        var P = this._Parent;
        while (P) {
            Left += P.Left;
            Top += P.Top;
            P = P.Parent;
        }
        Crt.RestoreScreen(this._Background, Left, Top, Left + this._Width - 1, Top + this._Height - 1);
    };

    CrtControl.prototype.SaveBackground = function () {
        var Left = this._Left;
        var Top = this._Top;
        var P = this._Parent;
        while (P) {
            Left += P.Left;
            Top += P.Top;
            P = P.Parent;
        }
        this._Background = Crt.SaveScreen(Left, Top, Left + this._Width - 1, Top + this._Height - 1);
    };

    Object.defineProperty(CrtControl.prototype, "ScreenLeft", {
        get: function () {
            return this._Left + ((this._Parent === null) ? 0 : this._Parent.Left);
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(CrtControl.prototype, "ScreenTop", {
        get: function () {
            return this._Top + ((this._Parent === null) ? 0 : this._Parent.Top);
        },
        enumerable: true,
        configurable: true
    });

    CrtControl.prototype.Show = function () {
        this.Paint(true);

        for (var i = 0; i < this._Controls.length; i++) {
            this._Controls[i].Paint(true);
        }
    };

    Object.defineProperty(CrtControl.prototype, "Top", {
        get: function () {
            return this._Top;
        },
        set: function (value) {
            if (value !== this._Top) {
                this.RestoreBackground();
                this._Top = value;
                this.SaveBackground();
                this.Paint(true);

                for (var i = 0; i < this._Controls.length; i++) {
                    this._Controls[i].Paint(true);
                }
            }
        },
        enumerable: true,
        configurable: true
    });


    Object.defineProperty(CrtControl.prototype, "Width", {
        get: function () {
            return this._Width;
        },
        set: function (value) {
            if (value !== this._Width) {
                this.RestoreBackground();
                this._Width = value;
                this.SaveBackground();
                this.Paint(true);
            }
        },
        enumerable: true,
        configurable: true
    });

    return CrtControl;
})();
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var CrtLabel = (function (_super) {
    __extends(CrtLabel, _super);
    function CrtLabel(parent, left, top, width, text, textAlign, foreColour, backColour) {
        _super.call(this, parent, left, top, width, 1);

        this._Text = text;
        this._TextAlign = textAlign;

        this.ForeColour = foreColour;
        this.BackColour = backColour;

        this.Paint(true);
    }
    CrtLabel.prototype.Paint = function (force) {
        var Lines = this._Text.replace("\r\n", "\n").split("\n");
        for (var i = 0; i < Lines.length; i++) {
            if (i === this.Height) {
                break;
            }

            switch (this._TextAlign) {
                case 10 /* Center */:
                    if (Lines[i].length >= this.Width) {
                        Crt.FastWrite(Lines[i].substring(0, this.Width), this.ScreenLeft, this.ScreenTop + i, new CharInfo(' ', this.ForeColour + (this.BackColour << 4)));
                    } else {
                        var i = 0;
                        var LeftSpaces = '';
                        for (i = 0; i < Math.floor((this.Width - Lines[i].length) / 2); i++) {
                            LeftSpaces += ' ';
                        }
                        var RightSpaces = '';
                        for (i = 0; i < this.Width - Lines[i].length - LeftSpaces.length; i++) {
                            RightSpaces += ' ';
                        }
                        Crt.FastWrite(LeftSpaces + Lines[i] + RightSpaces, this.ScreenLeft, this.ScreenTop + i, new CharInfo(' ', this.ForeColour + (this.BackColour << 4)));
                    }
                    break;
                case 9 /* Left */:
                    Crt.FastWrite(StringUtils.PadRight(Lines[i], ' ', this.Width), this.ScreenLeft, this.ScreenTop + i, new CharInfo(' ', this.ForeColour + (this.BackColour << 4)));
                    break;
                case 11 /* Right */:
                    Crt.FastWrite(StringUtils.PadLeft(Lines[i], ' ', this.Width), this.ScreenLeft, this.ScreenTop + i, new CharInfo(' ', this.ForeColour + (this.BackColour << 4)));
                    break;
            }
        }
    };

    Object.defineProperty(CrtLabel.prototype, "Text", {
        get: function () {
            return this._Text;
        },
        set: function (value) {
            this._Text = value;
            this.Paint(true);
        },
        enumerable: true,
        configurable: true
    });


    Object.defineProperty(CrtLabel.prototype, "TextAlign", {
        get: function () {
            return this._TextAlign;
        },
        set: function (value) {
            if (value !== this._TextAlign) {
                this._TextAlign = value;
                this.Paint(true);
            }
        },
        enumerable: true,
        configurable: true
    });

    return CrtLabel;
})(CrtControl);
var CrtPanel = (function (_super) {
    __extends(CrtPanel, _super);
    function CrtPanel(parent, left, top, width, height, border, foreColour, backColour, text, textAlign) {
        _super.call(this, parent, left, top, width, height);

        this._Border = border;
        this._Text = text;
        this._TextAlign = textAlign;

        this.ForeColour = foreColour;
        this.BackColour = backColour;

        this.Paint(true);
    }
    Object.defineProperty(CrtPanel.prototype, "Border", {
        get: function () {
            return this._Border;
        },
        set: function (value) {
            if (value !== this._Border) {
                this._Border = value;
                this.Paint(true);
            }
        },
        enumerable: true,
        configurable: true
    });


    CrtPanel.prototype.Paint = function (force) {
        var TopLeft;
        var TopRight;
        var BottomLeft;
        var BottomRight;
        var TopBottom;
        var LeftRight;

        switch (this._Border) {
            case 0 /* Single */:
                TopLeft = String.fromCharCode(218);
                TopRight = String.fromCharCode(191);
                BottomLeft = String.fromCharCode(192);
                BottomRight = String.fromCharCode(217);
                TopBottom = String.fromCharCode(196);
                LeftRight = String.fromCharCode(179);
                break;
            case 1 /* Double */:
                TopLeft = String.fromCharCode(201);
                TopRight = String.fromCharCode(187);
                BottomLeft = String.fromCharCode(200);
                BottomRight = String.fromCharCode(188);
                TopBottom = String.fromCharCode(205);
                LeftRight = String.fromCharCode(186);
                break;
            case 4 /* DoubleH */:
            case 3 /* SingleV */:
                TopLeft = String.fromCharCode(213);
                TopRight = String.fromCharCode(184);
                BottomLeft = String.fromCharCode(212);
                BottomRight = String.fromCharCode(190);
                TopBottom = String.fromCharCode(205);
                LeftRight = String.fromCharCode(179);
                break;
            case 5 /* DoubleV */:
            case 2 /* SingleH */:
                TopLeft = String.fromCharCode(214);
                TopRight = String.fromCharCode(183);
                BottomLeft = String.fromCharCode(211);
                BottomRight = String.fromCharCode(189);
                TopBottom = String.fromCharCode(196);
                LeftRight = String.fromCharCode(186);
                break;
        }

        Crt.FastWrite(TopLeft + StringUtils.NewString(TopBottom, this.Width - 2) + TopRight, this.ScreenLeft, this.ScreenTop, new CharInfo(' ', this.ForeColour + (this.BackColour << 4)));

        for (var Line = this.ScreenTop + 1; Line < this.ScreenTop + this.Height - 1; Line++) {
            Crt.FastWrite(LeftRight + StringUtils.NewString(' ', this.Width - 2) + LeftRight, this.ScreenLeft, Line, new CharInfo(' ', this.ForeColour + (this.BackColour << 4)));
        }

        Crt.FastWrite(BottomLeft + StringUtils.NewString(TopBottom, this.Width - 2) + BottomRight, this.ScreenLeft, this.ScreenTop + this.Height - 1, new CharInfo(' ', this.ForeColour + (this.BackColour << 4)));

        if (StringUtils.Trim(this._Text).length > 0) {
            var TitleX = 0;
            var TitleY = 0;
            var WindowTitle = ' ' + StringUtils.Trim(this._Text) + ' ';

            switch (this._TextAlign) {
                case 0 /* BottomLeft */:
                case 3 /* MiddleLeft */:
                case 6 /* TopLeft */:
                    TitleX = this.ScreenLeft + 2;
                    break;
                case 1 /* BottomCenter */:
                case 4 /* MiddleCenter */:
                case 7 /* TopCenter */:
                    TitleX = this.ScreenLeft + Math.round((this.Width - WindowTitle.length) / 2);
                    break;
                case 2 /* BottomRight */:
                case 5 /* MiddleRight */:
                case 8 /* TopRight */:
                    TitleX = this.ScreenLeft + this.Width - WindowTitle.length - 2;
                    break;
            }

            switch (this._TextAlign) {
                case 1 /* BottomCenter */:
                case 0 /* BottomLeft */:
                case 2 /* BottomRight */:
                    TitleY = this.ScreenTop + this.Height - 1;
                    break;
                case 4 /* MiddleCenter */:
                case 3 /* MiddleLeft */:
                case 5 /* MiddleRight */:
                case 7 /* TopCenter */:
                case 6 /* TopLeft */:
                case 8 /* TopRight */:
                    TitleY = this.ScreenTop;
                    break;
            }

            Crt.FastWrite(WindowTitle, TitleX, TitleY, new CharInfo(' ', this.ForeColour + (this.BackColour << 4)));
        }
    };

    Object.defineProperty(CrtPanel.prototype, "Text", {
        get: function () {
            return this._Text;
        },
        set: function (value) {
            this._Text = value;
            this.Paint(true);
        },
        enumerable: true,
        configurable: true
    });


    Object.defineProperty(CrtPanel.prototype, "TextAlign", {
        get: function () {
            return this._TextAlign;
        },
        set: function (value) {
            if (value !== this._TextAlign) {
                this._TextAlign = value;
                this.Paint(true);
            }
        },
        enumerable: true,
        configurable: true
    });

    return CrtPanel;
})(CrtControl);
var CrtProgressBar = (function (_super) {
    __extends(CrtProgressBar, _super);
    function CrtProgressBar(parent, left, top, width, style) {
        _super.call(this, parent, left, top, width, 1);
        this._LastBarWidth = 9999;
        this._LastMarqueeUpdate = 0;
        this._LastPercentText = '';

        this._Style = style;

        this.BackColour = Crt.BLUE;
        this._BarForeColour = Crt.YELLOW;

        this._BlankForeColour = Crt.LIGHTGRAY;
        this._LastMarqueeUpdate = new Date().getTime();
        this._MarqueeAnimationSpeed = 25;
        this._Maximum = 100;
        this._PercentPrecision = 2;
        this._PercentVisible = true;
        this._Value = 0;

        this.Paint(true);
    }
    Object.defineProperty(CrtProgressBar.prototype, "BarForeColour", {
        get: function () {
            return this._BarForeColour;
        },
        set: function (value) {
            if (value !== this._BarForeColour) {
                this._BarForeColour = value;
                this.Paint(true);
            }
        },
        enumerable: true,
        configurable: true
    });


    Object.defineProperty(CrtProgressBar.prototype, "BlankForeColour", {
        get: function () {
            return this._BlankForeColour;
        },
        set: function (value) {
            if (value !== this._BlankForeColour) {
                this._BlankForeColour = value;
                this.Paint(true);
            }
        },
        enumerable: true,
        configurable: true
    });


    Object.defineProperty(CrtProgressBar.prototype, "MarqueeAnimationSpeed", {
        get: function () {
            return this._MarqueeAnimationSpeed;
        },
        set: function (value) {
            this._MarqueeAnimationSpeed = value;
        },
        enumerable: true,
        configurable: true
    });


    Object.defineProperty(CrtProgressBar.prototype, "Maximum", {
        get: function () {
            return this._Maximum;
        },
        set: function (value) {
            if (value !== this._Maximum) {
                this._Maximum = value;
                if (this._Value > this._Maximum) {
                    this._Value = this._Maximum;
                }
                this.Paint(true);
            }
        },
        enumerable: true,
        configurable: true
    });


    CrtProgressBar.prototype.Paint = function (force) {
        if (this._Style === 0 /* Marquee */) {
            if (force) {
                Crt.FastWrite(StringUtils.NewString(String.fromCharCode(176), this.Width), this.ScreenLeft, this.ScreenTop, new CharInfo(' ', this._BlankForeColour + (this.BackColour << 4)));
            }

            if (this._Value > 0) {
                if (this._Value > this.Width) {
                    Crt.FastWrite(String.fromCharCode(176), this.ScreenLeft + this.Width - (15 - Math.floor(this._Value - this.Width)), this.ScreenTop, new CharInfo(' ', this._BlankForeColour + (this.BackColour << 4)));
                } else if (this._Value >= 15) {
                    Crt.FastWrite(StringUtils.NewString(String.fromCharCode(219), Math.min(this._Value, 15)), this.ScreenLeft + this._Value - 15, this.ScreenTop, new CharInfo(' ', this._BarForeColour + (this.BackColour << 4)));
                    Crt.FastWrite(String.fromCharCode(176), this.ScreenLeft + this._Value - 15, this.ScreenTop, new CharInfo(' ', this._BlankForeColour + (this.BackColour << 4)));
                } else {
                    Crt.FastWrite(StringUtils.NewString(String.fromCharCode(219), Math.min(this._Value, 15)), this.ScreenLeft, this.ScreenTop, new CharInfo(' ', this._BarForeColour + (this.BackColour << 4)));
                }
            }
        } else {
            if (force) {
                this._LastBarWidth = 9999;
                this._LastPercentText = '';
            }

            var PaintPercentText = false;
            var Percent = this._Value / this._Maximum;
            var NewBarWidth = Math.floor(Percent * this.Width);
            if (NewBarWidth !== this._LastBarWidth) {
                if (NewBarWidth < this._LastBarWidth) {
                    Crt.FastWrite(StringUtils.NewString(String.fromCharCode(176), this.Width), this.ScreenLeft, this.ScreenTop, new CharInfo(' ', this._BlankForeColour + (this.BackColour << 4)));
                }

                Crt.FastWrite(StringUtils.NewString(String.fromCharCode(this._Style), NewBarWidth), this.ScreenLeft, this.ScreenTop, new CharInfo(' ', this._BarForeColour + (this.BackColour << 4)));

                this._LastBarWidth = NewBarWidth;
                PaintPercentText = true;
            }

            if (this._PercentVisible) {
                var NewPercentText = StringUtils.FormatPercent(Percent, this._PercentPrecision);
                if ((NewPercentText !== this._LastPercentText) || (PaintPercentText)) {
                    this._LastPercentText = NewPercentText;

                    var ProgressStart = Math.round((this.Width - NewPercentText.length) / 2);
                    if (ProgressStart >= NewBarWidth) {
                        Crt.FastWrite(NewPercentText, this.ScreenLeft + ProgressStart, this.ScreenTop, new CharInfo(' ', this._BlankForeColour + (this.BackColour << 4)));
                    } else if (ProgressStart + NewPercentText.length <= NewBarWidth) {
                        Crt.FastWrite(NewPercentText, this.ScreenLeft + ProgressStart, this.ScreenTop, new CharInfo(' ', this.BackColour + (this._BarForeColour << 4)));
                    } else {
                        for (var i = 0; i < NewPercentText.length; i++) {
                            var LetterPosition = ProgressStart + i;
                            var FG = (LetterPosition >= NewBarWidth) ? this._BlankForeColour : this.BackColour;
                            var BG = (LetterPosition >= NewBarWidth) ? this.BackColour : this._BarForeColour;
                            Crt.FastWrite(NewPercentText.charAt(i), this.ScreenLeft + LetterPosition, this.ScreenTop, new CharInfo(' ', FG + (BG << 4)));
                        }
                    }
                }
            }
        }
    };

    Object.defineProperty(CrtProgressBar.prototype, "PercentPrecision", {
        get: function () {
            return this._PercentPrecision;
        },
        set: function (value) {
            if (value !== this._PercentPrecision) {
                this._PercentPrecision = value;
                this.Paint(true);
            }
        },
        enumerable: true,
        configurable: true
    });


    Object.defineProperty(CrtProgressBar.prototype, "PercentVisible", {
        get: function () {
            return this._PercentVisible;
        },
        set: function (value) {
            if (value !== this._PercentVisible) {
                this._PercentVisible = value;
                this.Paint(true);
            }
        },
        enumerable: true,
        configurable: true
    });


    CrtProgressBar.prototype.Step = function () {
        this.StepBy(1);
    };

    CrtProgressBar.prototype.StepBy = function (count) {
        this.Value += count;
    };

    Object.defineProperty(CrtProgressBar.prototype, "Style", {
        get: function () {
            return this._Style;
        },
        set: function (style) {
            if (style !== this._Style) {
                this._Style = style;
                this.Paint(true);
            }
        },
        enumerable: true,
        configurable: true
    });


    Object.defineProperty(CrtProgressBar.prototype, "Value", {
        get: function () {
            return this._Value;
        },
        set: function (value) {
            if (value !== this._Value) {
                if (this._Style === 0 /* Marquee */) {
                    if ((new Date()).getTime() - this._LastMarqueeUpdate >= this._MarqueeAnimationSpeed) {
                        if (value < 0) {
                            value = 0;
                        }
                        if (value >= this.Width + 15) {
                            value = 0;
                        }
                        this._Value = value;
                        this.Paint(false);
                        this._LastMarqueeUpdate = (new Date()).getTime();
                    }
                } else {
                    this._Value = Math.max(0, Math.min(value, this._Maximum));
                    this.Paint(false);
                }
            }
        },
        enumerable: true,
        configurable: true
    });

    return CrtProgressBar;
})(CrtControl);
var ProgressBarStyle;
(function (ProgressBarStyle) {
    ProgressBarStyle[ProgressBarStyle["Blocks"] = 254] = "Blocks";
    ProgressBarStyle[ProgressBarStyle["Continuous"] = 219] = "Continuous";
    ProgressBarStyle[ProgressBarStyle["Marquee"] = 0] = "Marquee";
})(ProgressBarStyle || (ProgressBarStyle = {}));
var Crt = (function () {
    function Crt() {
    }
    Crt.Init = function (container) {
        var _this = this;
        this._Container = container;

        this._Font = new CrtFont();
        this._Font.onchange.on(function () {
            _this.OnFontChanged();
        });

        this._Canvas = document.createElement('canvas');
        this._Canvas.id = 'fTelnetCanvas';
        this._Canvas.innerHTML = 'Your browser does not support the HTML5 Canvas element!<br>The latest version of every major web browser supports this element, so please consider upgrading now:<ul><li><a href="http://www.mozilla.com/firefox/">Mozilla Firefox</a></li><li><a href="http://www.google.com/chrome">Google Chrome</a></li><li><a href="http://www.apple.com/safari/">Apple Safari</a></li><li><a href="http://www.opera.com/">Opera</a></li><li><a href="http://windows.microsoft.com/en-US/internet-explorer/products/ie/home">MS Internet Explorer</a></li></ul>';
        this._Canvas.width = this._Font.Width * this._ScreenSize.x;
        this._Canvas.height = this._Font.Height * this._ScreenSize.y;

        if (!this._Canvas.getContext) {
            console.log('fTelnet Error: Canvas not supported');
            return false;
        }

        this._Container.appendChild(this._Canvas);

        window.addEventListener('keydown', function (ke) {
            _this.OnKeyDown(ke);
        }, false);
        window.addEventListener('keypress', function (ke) {
            _this.OnKeyPress(ke);
        }, false);
        window.addEventListener('resize', function () {
            _this.OnResize();
        }, false);

        this.InitBuffers(true);

        this._Cursor = new Cursor(this._Container, CrtFont.ANSI_COLOURS[this.LIGHTGRAY], this._Font.Size);
        this._Cursor.onhide.on(function () {
            _this.OnBlinkHide();
        });
        this._Cursor.onshow.on(function () {
            _this.OnBlinkShow();
        });

        this._WindMin = 0;
        this._WindMax = (this._ScreenSize.x - 1) | ((this._ScreenSize.y - 1) << 8);

        this._CanvasContext = this._Canvas.getContext('2d');
        this._CanvasContext.font = '12pt monospace';
        this._CanvasContext.textBaseline = 'top';
        this.ClrScr();

        return true;
    };

    Object.defineProperty(Crt, "Atari", {
        get: function () {
            return this._Atari;
        },
        set: function (value) {
            this._Atari = value;
        },
        enumerable: true,
        configurable: true
    });


    Crt.Beep = function () {
    };

    Object.defineProperty(Crt, "Blink", {
        get: function () {
            return this._Blink;
        },
        set: function (value) {
            this._Blink = value;
        },
        enumerable: true,
        configurable: true
    });


    Object.defineProperty(Crt, "BareLFtoCRLF", {
        get: function () {
            return this._BareLFtoCRLF;
        },
        set: function (value) {
            this._BareLFtoCRLF = value;
        },
        enumerable: true,
        configurable: true
    });


    Object.defineProperty(Crt, "C64", {
        get: function () {
            return this._C64;
        },
        set: function (value) {
            this._C64 = value;
        },
        enumerable: true,
        configurable: true
    });


    Object.defineProperty(Crt, "Canvas", {
        get: function () {
            return this._Canvas;
        },
        enumerable: true,
        configurable: true
    });

    Crt.ClrBol = function () {
        this.FastWrite(StringUtils.NewString(' ', this.WhereX()), this.WindMinX + 1, this.WhereYA(), this._CharInfo);
    };

    Crt.ClrBos = function () {
        this.ScrollUpWindow(this.WhereY() - 1);
        this.ScrollDownWindow(this.WhereY() - 1);

        this.ClrBol();
    };

    Crt.ClrEol = function () {
        this.FastWrite(StringUtils.NewString(' ', (this.WindMaxX + 1) - this.WhereX() + 1), this.WhereXA(), this.WhereYA(), this._CharInfo);
    };

    Crt.ClrEos = function () {
        this.ScrollDownWindow(this.WindRows - this.WhereY());
        this.ScrollUpWindow(this.WindRows - this.WhereY());

        this.ClrEol();
    };

    Crt.ClrLine = function () {
        this.FastWrite(StringUtils.NewString(' ', this.WindCols), this.WindMinX + 1, this.WhereYA(), this._CharInfo);
    };

    Crt.ClrScr = function () {
        this.ScrollUpWindow(this.WindRows);
        this.GotoXY(1, 1);
    };

    Crt.Conceal = function () {
        this.TextColor((this.TextAttr & 0xF0) >> 4);
    };

    Object.defineProperty(Crt, "Cursor", {
        get: function () {
            return this._Cursor;
        },
        enumerable: true,
        configurable: true
    });

    Crt.DelChar = function (count) {
        if (typeof count === 'undefined') {
            count = 1;
        }

        var i;
        for (i = this.WhereXA(); i <= this.WindMinX + this.WindCols - count; i++) {
            this.FastWrite(this._Buffer[this.WhereYA()][i + count].Ch, i, this.WhereYA(), this._Buffer[this.WhereYA()][i + count]);
        }
        for (i = this.WindMinX + this.WindCols + 1 - count; i <= this.WindMinX + this.WindCols; i++) {
            this.FastWrite(' ', i, this.WhereYA(), this._CharInfo);
        }
    };

    Crt.DelLine = function (count) {
        if (typeof count === 'undefined') {
            count = 1;
        }
        this.ScrollUpCustom(this.WindMinX + 1, this.WhereYA(), this.WindMaxX + 1, this.WindMaxY + 1, count, this._CharInfo);
    };

    Crt.EnterScrollBack = function () {
        if (!this._InScrollBack) {
            this._InScrollBack = true;

            var NewRow;
            var X;
            var Y;

            this._ScrollBackTemp = [];
            for (Y = 0; Y < this._ScrollBack.length; Y++) {
                NewRow = [];
                for (X = 0; X < this._ScrollBack[Y].length; X++) {
                    NewRow.push(new CharInfo(this._ScrollBack[Y][X].Ch, this._ScrollBack[Y][X].Attr, this._ScrollBack[Y][X].Blink, this._ScrollBack[Y][X].Underline, this._ScrollBack[Y][X].Reverse));
                }
                this._ScrollBackTemp.push(NewRow);
            }

            for (Y = 1; Y <= this._ScreenSize.y; Y++) {
                NewRow = [];
                for (X = 1; X <= this._ScreenSize.x; X++) {
                    NewRow.push(new CharInfo(this._Buffer[Y][X].Ch, this._Buffer[Y][X].Attr, this._Buffer[Y][X].Blink, this._Buffer[Y][X].Underline, this._Buffer[Y][X].Reverse));
                }
                this._ScrollBackTemp.push(NewRow);
            }

            this._ScrollBackPosition = this._ScrollBackTemp.length;
        }
    };

    Crt.FastWrite = function (text, x, y, charInfo, updateBuffer) {
        if (typeof updateBuffer === 'undefined') {
            updateBuffer = true;
        }

        if ((x <= this._ScreenSize.x) && (y <= this._ScreenSize.y)) {
            for (var i = 0; i < text.length; i++) {
                var Char = this._Font.GetChar(text.charCodeAt(i), charInfo);
                if (Char) {
                    if ((!this._InScrollBack) || (this._InScrollBack && !updateBuffer)) {
                        this._CanvasContext.putImageData(Char, (x - 1 + i) * this._Font.Width, (y - 1) * this._Font.Height);
                    }
                }

                if (updateBuffer) {
                    this._Buffer[y][x + i].Ch = text.charAt(i);
                    this._Buffer[y][x + i].Attr = charInfo.Attr;
                    this._Buffer[y][x + i].Blink = charInfo.Blink;
                    this._Buffer[y][x + i].Underline = charInfo.Underline;
                    this._Buffer[y][x + i].Reverse = charInfo.Reverse;
                }

                if (x + i >= this._ScreenSize.x) {
                    break;
                }
            }
        }
    };

    Crt.FillScreen = function (ch) {
        var Line = StringUtils.NewString(ch.charAt(0), this.ScreenCols);

        for (var Y = 1; Y <= this.ScreenRows; Y++) {
            this.FastWrite(Line, 1, Y, this._CharInfo);
        }
    };

    Object.defineProperty(Crt, "Font", {
        get: function () {
            return this._Font;
        },
        enumerable: true,
        configurable: true
    });

    Crt.GeCharInfo = function () {
        return this._CharInfo;
    };

    Crt.GotoXY = function (x, y) {
        if ((x >= 1) && (y >= 1) && ((x - 1 + this.WindMinX) <= this.WindMaxX) && ((y - 1 + this.WindMinY) <= this.WindMaxY)) {
            this._Cursor.Position = new Point(x, y);
        }
    };

    Crt.HideCursor = function () {
        this._Cursor.Visible = false;
    };

    Crt.HighVideo = function () {
        this.TextAttr |= 0x08;
    };

    Crt.InitBuffers = function (initScrollBack) {
        this._Buffer = [];
        for (var Y = 1; Y <= this._ScreenSize.y; Y++) {
            this._Buffer[Y] = [];
            for (var X = 1; X <= this._ScreenSize.x; X++) {
                this._Buffer[Y][X] = new CharInfo(' ', this.LIGHTGRAY, false, false, false);
            }
        }

        if (initScrollBack) {
            this._ScrollBack = [];
        }
    };

    Crt.InsChar = function (count) {
        if (typeof count === 'undefined') {
            count = 1;
        }

        var i;
        for (i = this.WindMinX + this.WindCols; i >= this.WhereXA() + count; i--) {
            this.FastWrite(this._Buffer[this.WhereYA()][i - count].Ch, i, this.WhereYA(), this._Buffer[this.WhereYA()][i - count]);
        }
        for (i = this.WhereXA(); i < this.WhereXA() + count; i++) {
            this.FastWrite(' ', i, this.WhereYA(), this._CharInfo);
        }
    };

    Crt.InsLine = function (count) {
        if (typeof count === 'undefined') {
            count = 1;
        }
        this.ScrollDownCustom(this.WindMinX + 1, this.WhereYA(), this.WindMaxX + 1, this.WindMaxY + 1, count, this._CharInfo);
    };

    Crt.KeyPressed = function () {
        return (this._KeyBuf.length > 0);
    };

    Object.defineProperty(Crt, "LocalEcho", {
        set: function (value) {
            this._LocalEcho = value;
        },
        enumerable: true,
        configurable: true
    });

    Crt.LowVideo = function () {
        this.TextAttr &= 0xF7;
    };

    Crt.NormVideo = function () {
        if (this._C64) {
            this._CharInfo.Attr = this.PETSCII_WHITE;
        } else {
            this._CharInfo.Attr = this.LIGHTGRAY;
        }
        this._CharInfo.Blink = false;
        this._CharInfo.Underline = false;
        this._CharInfo.Reverse = false;
    };

    Crt.OnBlinkHide = function () {
        if (this._Blink) {
            this._BlinkHidden = true;

            for (var Y = 1; Y <= this._ScreenSize.y; Y++) {
                for (var X = 1; X <= this._ScreenSize.x; X++) {
                    if (this._Buffer[Y][X].Blink) {
                        if (this._Buffer[Y][X].Ch !== ' ') {
                            this.FastWrite(' ', X, Y, this._Buffer[Y][X], false);
                        }
                    }
                }
            }
        }
    };

    Crt.OnBlinkShow = function () {
        if (this._Blink || this._BlinkHidden) {
            this._BlinkHidden = false;

            for (var Y = 1; Y <= this._ScreenSize.y; Y++) {
                for (var X = 1; X <= this._ScreenSize.x; X++) {
                    if (this._Buffer[Y][X].Blink) {
                        if (this._Buffer[Y][X].Ch !== ' ') {
                            this.FastWrite(this._Buffer[Y][X].Ch, X, Y, this._Buffer[Y][X], false);
                        }
                    }
                }
            }
        }

        this._Cursor.WindowOffset = Offset.getOffset(this._Canvas);
    };

    Crt.OnFontChanged = function () {
        this._Cursor.Size = this._Font.Size;

        this._Canvas.height = this._Font.Height * this._ScreenSize.y;
        this._Canvas.width = this._Font.Width * this._ScreenSize.x;

        if (this._Buffer !== null) {
            for (var Y = 1; Y <= this._ScreenSize.y; Y++) {
                for (var X = 1; X <= this._ScreenSize.x; X++) {
                    this.FastWrite(this._Buffer[Y][X].Ch, X, Y, this._Buffer[Y][X], false);
                }
            }
        }

        this.onfontchange.trigger();
    };

    Crt.OnKeyDown = function (ke) {
        if ((ke.target instanceof HTMLInputElement) || (ke.target instanceof HTMLTextAreaElement)) {
            return;
        }

        if (this._InScrollBack) {
            var i;
            var X;
            var XEnd;
            var Y;
            var YDest;
            var YSource;

            if (ke.keyCode === 40 /* DOWN */) {
                if (this._ScrollBackPosition < this._ScrollBackTemp.length) {
                    this._ScrollBackPosition += 1;
                    this.ScrollUpCustom(1, 1, this._ScreenSize.x, this._ScreenSize.y, 1, new CharInfo(' ', 7, false, false, false), false);

                    YDest = this._ScreenSize.y;
                    YSource = this._ScrollBackPosition - 1;
                    XEnd = Math.min(this._ScreenSize.x, this._ScrollBackTemp[YSource].length);
                    for (X = 0; X < XEnd; X++) {
                        this.FastWrite(this._ScrollBackTemp[YSource][X].Ch, X + 1, YDest, this._ScrollBackTemp[YSource][X], false);
                    }
                }
            } else if (ke.keyCode === 27 /* ESCAPE */) {
                if (this._Buffer !== null) {
                    for (Y = 1; Y <= this._ScreenSize.y; Y++) {
                        for (X = 1; X <= this._ScreenSize.x; X++) {
                            this.FastWrite(this._Buffer[Y][X].Ch, X, Y, this._Buffer[Y][X], false);
                        }
                    }
                }

                this._InScrollBack = false;
            } else if (ke.keyCode === 34 /* PAGE_DOWN */) {
                for (i = 0; i < this._ScreenSize.y; i++) {
                    this.PushKeyDown(40 /* DOWN */, 40 /* DOWN */, false, false, false);
                }
            } else if (ke.keyCode === 33 /* PAGE_UP */) {
                for (i = 0; i < this._ScreenSize.y; i++) {
                    this.PushKeyDown(38 /* UP */, 38 /* UP */, false, false, false);
                }
            } else if (ke.keyCode === 38 /* UP */) {
                if (this._ScrollBackPosition > this._ScreenSize.y) {
                    this._ScrollBackPosition -= 1;
                    this.ScrollDownCustom(1, 1, this._ScreenSize.x, this._ScreenSize.y, 1, new CharInfo(' ', 7, false, false), false);

                    YDest = 1;
                    YSource = this._ScrollBackPosition - this._ScreenSize.y;
                    XEnd = Math.min(this._ScreenSize.x, this._ScrollBackTemp[YSource].length);
                    for (X = 0; X < XEnd; X++) {
                        this.FastWrite(this._ScrollBackTemp[YSource][X].Ch, X + 1, YDest, this._ScrollBackTemp[YSource][X], false);
                    }
                }
            }

            ke.preventDefault();

            return;
        }

        var keyString = '';

        if (this._Atari) {
            if (ke.ctrlKey) {
                if ((ke.keyCode >= 65) && (ke.keyCode <= 90)) {
                    switch (ke.keyCode) {
                        case 72:
                            keyString = String.fromCharCode(126);
                            break;
                        case 74:
                            keyString = String.fromCharCode(13);
                            break;
                        case 77:
                            keyString = String.fromCharCode(155);
                            break;
                        default:
                            keyString = String.fromCharCode(ke.keyCode - 64);
                            break;
                    }
                } else if ((ke.keyCode >= 97) && (ke.keyCode <= 122)) {
                    switch (ke.keyCode) {
                        case 104:
                            keyString = String.fromCharCode(126);
                            break;
                        case 106:
                            keyString = String.fromCharCode(13);
                            break;
                        case 109:
                            keyString = String.fromCharCode(155);
                            break;
                        default:
                            keyString = String.fromCharCode(ke.keyCode - 96);
                            break;
                    }
                }
            } else {
                switch (ke.keyCode) {
                    case 8 /* BACKSPACE */:
                        keyString = '\x7E';
                        break;
                    case 46 /* DELETE */:
                        keyString = '\x7E';
                        break;
                    case 40 /* DOWN */:
                        keyString = '\x1D';
                        break;
                    case 13 /* ENTER */:
                        keyString = '\x9B';
                        break;
                    case 37 /* LEFT */:
                        keyString = '\x1E';
                        break;
                    case 39 /* RIGHT */:
                        keyString = '\x1F';
                        break;
                    case 32 /* SPACE */:
                        keyString = ' ';
                        break;
                    case 9 /* TAB */:
                        keyString = '\x7F';
                        break;
                    case 38 /* UP */:
                        keyString = '\x1C';
                        break;
                }
            }
        } else if (this._C64) {
            switch (ke.keyCode) {
                case 8 /* BACKSPACE */:
                    keyString = '\x14';
                    break;
                case 46 /* DELETE */:
                    keyString = '\x14';
                    break;
                case 40 /* DOWN */:
                    keyString = '\x11';
                    break;
                case 13 /* ENTER */:
                    keyString = '\r';
                    break;
                case 112 /* F1 */:
                    keyString = '\x85';
                    break;
                case 113 /* F2 */:
                    keyString = '\x89';
                    break;
                case 114 /* F3 */:
                    keyString = '\x86';
                    break;
                case 115 /* F4 */:
                    keyString = '\x8A';
                    break;
                case 116 /* F5 */:
                    keyString = '\x87';
                    break;
                case 117 /* F6 */:
                    keyString = '\x8B';
                    break;
                case 118 /* F7 */:
                    keyString = '\x88';
                    break;
                case 119 /* F8 */:
                    keyString = '\x8C';
                    break;
                case 36 /* HOME */:
                    keyString = '\x13';
                    break;
                case 45 /* INSERT */:
                    keyString = '\x94';
                    break;
                case 37 /* LEFT */:
                    keyString = '\x9D';
                    break;
                case 39 /* RIGHT */:
                    keyString = '\x1D';
                    break;
                case 32 /* SPACE */:
                    keyString = ' ';
                    break;
                case 38 /* UP */:
                    keyString = '\x91';
                    break;
            }
        } else {
            if (ke.ctrlKey) {
                if ((ke.keyCode >= 65) && (ke.keyCode <= 90)) {
                    keyString = String.fromCharCode(ke.keyCode - 64);
                } else if ((ke.keyCode >= 97) && (ke.keyCode <= 122)) {
                    keyString = String.fromCharCode(ke.keyCode - 96);
                }
            } else {
                switch (ke.keyCode) {
                    case 8 /* BACKSPACE */:
                        keyString = '\b';
                        break;
                    case 46 /* DELETE */:
                        keyString = '\x7F';
                        break;
                    case 40 /* DOWN */:
                        keyString = '\x1B[B';
                        break;
                    case 35 /* END */:
                        keyString = '\x1B[K';
                        break;
                    case 13 /* ENTER */:
                        keyString = '\r\n';
                        break;
                    case 27 /* ESCAPE */:
                        keyString = '\x1B';
                        break;
                    case 112 /* F1 */:
                        keyString = '\x1BOP';
                        break;
                    case 113 /* F2 */:
                        keyString = '\x1BOQ';
                        break;
                    case 114 /* F3 */:
                        keyString = '\x1BOR';
                        break;
                    case 115 /* F4 */:
                        keyString = '\x1BOS';
                        break;
                    case 116 /* F5 */:
                        keyString = '\x1BOt';
                        break;
                    case 117 /* F6 */:
                        keyString = '\x1B[17~';
                        break;
                    case 118 /* F7 */:
                        keyString = '\x1B[18~';
                        break;
                    case 119 /* F8 */:
                        keyString = '\x1B[19~';
                        break;
                    case 120 /* F9 */:
                        keyString = '\x1B[20~';
                        break;
                    case 121 /* F10 */:
                        keyString = '\x1B[21~';
                        break;
                    case 122 /* F11 */:
                        keyString = '\x1B[23~';
                        break;
                    case 123 /* F12 */:
                        keyString = '\x1B[24~';
                        break;
                    case 36 /* HOME */:
                        keyString = '\x1B[H';
                        break;
                    case 45 /* INSERT */:
                        keyString = '\x1B@';
                        break;
                    case 37 /* LEFT */:
                        keyString = '\x1B[D';
                        break;
                    case 34 /* PAGE_DOWN */:
                        keyString = '\x1B[U';
                        break;
                    case 33 /* PAGE_UP */:
                        keyString = '\x1B[V';
                        break;
                    case 39 /* RIGHT */:
                        keyString = '\x1B[C';
                        break;
                    case 32 /* SPACE */:
                        keyString = ' ';
                        break;
                    case 9 /* TAB */:
                        keyString = '\t';
                        break;
                    case 38 /* UP */:
                        keyString = '\x1B[A';
                        break;
                }
            }
        }

        this._KeyBuf.push(new KeyPressEvent(ke, keyString));

        if ((keyString) || (ke.ctrlKey)) {
            ke.preventDefault();
        }
    };

    Crt.OnKeyPress = function (ke) {
        if ((ke.target instanceof HTMLInputElement) || (ke.target instanceof HTMLTextAreaElement)) {
            return;
        }

        if (this._InScrollBack) {
            return;
        }

        var keyString = '';

        if (ke.ctrlKey) {
            return;
        }

        var which = (ke.charCode !== null) ? ke.charCode : ke.which;
        if (this._Atari) {
            if ((which >= 33) && (which <= 122)) {
                keyString = String.fromCharCode(which);
            }
        } else if (this._C64) {
            if ((which >= 33) && (which <= 64)) {
                keyString = String.fromCharCode(which);
            } else if ((which >= 65) && (which <= 90)) {
                keyString = String.fromCharCode(which).toLowerCase();
            } else if ((which >= 91) && (which <= 95)) {
                keyString = String.fromCharCode(which);
            } else if ((which >= 97) && (which <= 122)) {
                keyString = String.fromCharCode(which).toUpperCase();
            }
        } else {
            if ((which >= 33) && (which <= 126)) {
                keyString = String.fromCharCode(which);
            }
        }

        this._KeyBuf.push(new KeyPressEvent(ke, keyString));

        if (keyString) {
            ke.preventDefault();
        }
    };

    Crt.OnResize = function () {
        Crt.SetFont(this._Font.Name);
    };

    Crt.PushKeyDown = function (pushedCharCode, pushedKeyCode, ctrl, alt, shift) {
        this.OnKeyDown({
            altKey: alt,
            charCode: pushedCharCode,
            ctrlKey: ctrl,
            keyCode: pushedKeyCode,
            shiftKey: shift,
            preventDefault: function () {
            }
        });
    };

    Crt.PushKeyPress = function (pushedCharCode, pushedKeyCode, ctrl, alt, shift) {
        this.OnKeyPress({
            altKey: alt,
            charCode: pushedCharCode,
            ctrlKey: ctrl,
            keyCode: pushedKeyCode,
            shiftKey: shift,
            preventDefault: function () {
            }
        });
    };

    Crt.ReadKey = function () {
        if (this._KeyBuf.length === 0) {
            return null;
        }

        var KPE = this._KeyBuf.shift();
        if (this._LocalEcho) {
            this.Write(KPE.keyString);
        }
        return KPE;
    };

    Crt.ReDraw = function () {
        for (var Y = 1; Y <= this._ScreenSize.y; Y++) {
            for (var X = 1; X <= this._ScreenSize.x; X++) {
                this.FastWrite(this._Buffer[Y][X].Ch, X, Y, this._Buffer[Y][X], false);
            }
        }
    };

    Crt.RestoreScreen = function (buffer, left, top, right, bottom) {
        var Height = bottom - top + 1;
        var Width = right - left + 1;

        for (var Y = 0; Y < Height; Y++) {
            for (var X = 0; X < Width; X++) {
                this.FastWrite(buffer[Y][X].Ch, X + left, Y + top, buffer[Y][X]);
            }
        }
    };

    Crt.ReverseVideo = function () {
        this.TextAttr = ((this.TextAttr & 0xF0) >> 4) | ((this.TextAttr & 0x0F) << 4);
    };

    Crt.SaveScreen = function (left, top, right, bottom) {
        var Height = bottom - top + 1;
        var Width = right - left + 1;
        var Result = [];

        for (var Y = 0; Y < Height; Y++) {
            Result[Y] = [];
            for (var X = 0; X < Width; X++) {
                Result[Y][X] = new CharInfo(this._Buffer[Y + top][X + left].Ch, this._Buffer[Y + top][X + left].Attr, this._Buffer[Y + top][X + left].Blink, this._Buffer[Y + top][X + left].Underline, this._Buffer[Y + top][X + left].Reverse);
            }
        }

        return Result;
    };

    Object.defineProperty(Crt, "ScreenCols", {
        get: function () {
            return this._ScreenSize.x;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(Crt, "ScreenRows", {
        get: function () {
            return this._ScreenSize.y;
        },
        enumerable: true,
        configurable: true
    });

    Crt.ScrollDownCustom = function (left, top, right, bottom, count, charInfo, updateBuffer) {
        if (typeof updateBuffer === 'undefined') {
            updateBuffer = true;
        }

        var MaxLines = bottom - top + 1;
        if (count > MaxLines) {
            count = MaxLines;
        }

        var Left = (left - 1) * this._Font.Width;
        var Top = (top - 1) * this._Font.Height;
        var Width = (right - left + 1) * this._Font.Width;
        var Height = ((bottom - top + 1 - count) * this._Font.Height);
        if (Height > 0) {
            var Buf = this._CanvasContext.getImageData(Left, Top, Width, Height);
            Left = (left - 1) * this._Font.Width;
            Top = (top - 1 + count) * this._Font.Height;
            this._CanvasContext.putImageData(Buf, Left, Top);
        }

        this._CanvasContext.fillStyle = CrtFont.ANSI_COLOURS[(charInfo.Attr & 0xF0) >> 4];
        Left = (left - 1) * this._Font.Width;
        Top = (top - 1) * this._Font.Height;
        Width = (right - left + 1) * this._Font.Width;
        Height = (count * this._Font.Height);
        this._CanvasContext.fillRect(Left, Top, Width, Height);

        if (updateBuffer) {
            var X = 0;
            var Y = 0;

            for (Y = bottom; Y > count; Y--) {
                for (X = left; X <= right; X++) {
                    this._Buffer[Y][X].Ch = this._Buffer[Y - count][X].Ch;
                    this._Buffer[Y][X].Attr = this._Buffer[Y - count][X].Attr;
                    this._Buffer[Y][X].Blink = this._Buffer[Y - count][X].Blink;
                    this._Buffer[Y][X].Underline = this._Buffer[Y - count][X].Underline;
                    this._Buffer[Y][X].Reverse = this._Buffer[Y - count][X].Reverse;
                }
            }

            for (Y = top; Y <= count; Y++) {
                for (X = left; X <= right; X++) {
                    this._Buffer[Y][X].Ch = charInfo.Ch;
                    this._Buffer[Y][X].Attr = charInfo.Attr;
                    this._Buffer[Y][X].Blink = charInfo.Blink;
                    this._Buffer[Y][X].Underline = charInfo.Underline;
                    this._Buffer[Y][X].Reverse = charInfo.Reverse;
                }
            }
        }
    };

    Crt.ScrollDownScreen = function (count) {
        this.ScrollDownCustom(1, 1, this._ScreenSize.x, this._ScreenSize.y, count, this._CharInfo);
    };

    Crt.ScrollDownWindow = function (count) {
        this.ScrollDownCustom(this.WindMinX + 1, this.WindMinY + 1, this.WindMaxX + 1, this.WindMaxY + 1, count, this._CharInfo);
    };

    Crt.ScrollUpCustom = function (left, top, right, bottom, count, charInfo, updateBuffer) {
        if (typeof updateBuffer === 'undefined') {
            updateBuffer = true;
        }

        var MaxLines = bottom - top + 1;
        if (count > MaxLines) {
            count = MaxLines;
        }

        if ((!this._InScrollBack) || (this._InScrollBack && !updateBuffer)) {
            var Left = (left - 1) * this._Font.Width;
            var Top = (top - 1 + count) * this._Font.Height;
            var Width = (right - left + 1) * this._Font.Width;
            var Height = ((bottom - top + 1 - count) * this._Font.Height);
            if (Height > 0) {
                var Buf = this._CanvasContext.getImageData(Left, Top, Width, Height);
                Left = (left - 1) * this._Font.Width;
                Top = (top - 1) * this._Font.Height;
                this._CanvasContext.putImageData(Buf, Left, Top);
            }

            this._CanvasContext.fillStyle = CrtFont.ANSI_COLOURS[(charInfo.Attr & 0xF0) >> 4];
            Left = (left - 1) * this._Font.Width;
            Top = (bottom - count) * this._Font.Height;
            Width = (right - left + 1) * this._Font.Width;
            Height = (count * this._Font.Height);
            this._CanvasContext.fillRect(Left, Top, Width, Height);
        }

        if (updateBuffer) {
            var NewRow;
            var X;
            var Y;

            for (Y = 0; Y < count; Y++) {
                NewRow = [];
                for (X = left; X <= right; X++) {
                    NewRow.push(new CharInfo(this._Buffer[Y + top][X].Ch, this._Buffer[Y + top][X].Attr, this._Buffer[Y + top][X].Blink, this._Buffer[Y + top][X].Underline, this._Buffer[Y + top][X].Reverse));
                }
                this._ScrollBack.push(NewRow);
            }

            var ScrollBackLength = this._ScrollBack.length;
            while (ScrollBackLength > (this._ScrollBackSize - 2)) {
                this._ScrollBack.shift();
                ScrollBackLength -= 1;
            }

            for (Y = top; Y <= (bottom - count); Y++) {
                for (X = left; X <= right; X++) {
                    this._Buffer[Y][X].Ch = this._Buffer[Y + count][X].Ch;
                    this._Buffer[Y][X].Attr = this._Buffer[Y + count][X].Attr;
                    this._Buffer[Y][X].Blink = this._Buffer[Y + count][X].Blink;
                    this._Buffer[Y][X].Underline = this._Buffer[Y + count][X].Underline;
                    this._Buffer[Y][X].Reverse = this._Buffer[Y + count][X].Reverse;
                }
            }

            for (Y = bottom; Y > (bottom - count); Y--) {
                for (X = left; X <= right; X++) {
                    this._Buffer[Y][X].Ch = charInfo.Ch;
                    this._Buffer[Y][X].Attr = charInfo.Attr;
                    this._Buffer[Y][X].Blink = charInfo.Blink;
                    this._Buffer[Y][X].Underline = charInfo.Underline;
                    this._Buffer[Y][X].Reverse = charInfo.Reverse;
                }
            }
        }
    };

    Crt.ScrollUpScreen = function (count) {
        this.ScrollUpCustom(1, 1, this._ScreenSize.x, this._ScreenSize.y, count, this._CharInfo);
    };

    Crt.ScrollUpWindow = function (count) {
        this.ScrollUpCustom(this.WindMinX + 1, this.WindMinY + 1, this.WindMaxX + 1, this.WindMaxY + 1, count, this._CharInfo);
    };

    Crt.SetBlink = function (value) {
        this._CharInfo.Blink = value;
    };

    Crt.SetBlinkRate = function (milliSeconds) {
        this._Cursor.BlinkRate = milliSeconds;
    };

    Crt.SetCharInfo = function (charInfo) {
        this._CharInfo = new CharInfo(charInfo.Ch, charInfo.Attr, charInfo.Blink, charInfo.Underline, charInfo.Reverse);
    };

    Crt.SetFont = function (font) {
        return this._Font.Load(font, Math.floor(this._Container.clientWidth / this._ScreenSize.x), Math.floor(window.innerHeight / this._ScreenSize.y));
    };

    Crt.SetScreenSize = function (columns, rows) {
        if (this._InScrollBack) {
            return;
        }

        if ((columns === this._ScreenSize.x) && (rows === this._ScreenSize.y)) {
            return;
        }

        var X = 0;
        var Y = 0;

        var OldBuffer;
        if (this._Buffer !== null) {
            OldBuffer = [];
            for (Y = 1; Y <= this._ScreenSize.y; Y++) {
                OldBuffer[Y] = [];
                for (X = 1; X <= this._ScreenSize.x; X++) {
                    OldBuffer[Y][X] = new CharInfo(this._Buffer[Y][X].Ch, this._Buffer[Y][X].Attr, this._Buffer[Y][X].Blink, this._Buffer[Y][X].Underline, this._Buffer[Y][X].Reverse);
                }
            }
        }
        var OldScreenSize = new Point(this._ScreenSize.x, this._ScreenSize.y);

        this._ScreenSize.x = columns;
        this._ScreenSize.y = rows;

        this._WindMin = 0;
        this._WindMax = (this._ScreenSize.x - 1) | ((this._ScreenSize.y - 1) << 8);

        this.InitBuffers(false);

        if (OldBuffer !== null) {
            for (Y = 1; Y <= Math.min(this._ScreenSize.y, OldScreenSize.y); Y++) {
                for (X = 1; X <= Math.min(this._ScreenSize.x, OldScreenSize.x); X++) {
                    this.FastWrite(OldBuffer[Y][X].Ch, X, Y, OldBuffer[Y][X]);
                }
            }
        }

        this.onscreensizechange.trigger();
    };

    Crt.ShowCursor = function () {
        this._Cursor.Visible = true;
    };

    Object.defineProperty(Crt, "TextAttr", {
        get: function () {
            return this._CharInfo.Attr;
        },
        set: function (value) {
            this._CharInfo.Attr = value;
        },
        enumerable: true,
        configurable: true
    });


    Crt.TextBackground = function (colour) {
        this.TextAttr = (this.TextAttr & 0x0F) | ((colour & 0x0F) << 4);
    };

    Crt.TextColor = function (colour) {
        this.TextAttr = (this.TextAttr & 0xF0) | (colour & 0x0F);
    };

    Crt.WhereX = function () {
        return this._Cursor.Position.x;
    };

    Crt.WhereXA = function () {
        return this.WhereX() + this.WindMinX;
    };

    Crt.WhereY = function () {
        return this._Cursor.Position.y;
    };

    Crt.WhereYA = function () {
        return this.WhereY() + this.WindMinY;
    };

    Object.defineProperty(Crt, "WindCols", {
        get: function () {
            return this.WindMaxX - this.WindMinX + 1;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(Crt, "WindMax", {
        get: function () {
            return this._WindMax;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(Crt, "WindMaxX", {
        get: function () {
            return (this.WindMax & 0x00FF);
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(Crt, "WindMaxY", {
        get: function () {
            return ((this.WindMax & 0xFF00) >> 8);
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(Crt, "WindMin", {
        get: function () {
            return this._WindMin;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(Crt, "WindMinX", {
        get: function () {
            return (this.WindMin & 0x00FF);
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(Crt, "WindMinY", {
        get: function () {
            return ((this.WindMin & 0xFF00) >> 8);
        },
        enumerable: true,
        configurable: true
    });

    Crt.Window = function (left, top, right, bottom) {
        if ((left >= 1) && (top >= 1) && (left <= right) && (top <= bottom)) {
            if ((right <= this._ScreenSize.x) && (bottom <= this._ScreenSize.y)) {
                this._WindMin = (left - 1) + ((top - 1) << 8);
                this._WindMax = (right - 1) + ((bottom - 1) << 8);
                this._Cursor.WindowOffset = new Point(left - 1, top - 1);
                this.GotoXY(1, 1);
            }
        }
    };

    Object.defineProperty(Crt, "WindRows", {
        get: function () {
            return this.WindMaxY - this.WindMinY + 1;
        },
        enumerable: true,
        configurable: true
    });

    Crt.Write = function (text) {
        if (this._Atari) {
            this.WriteATASCII(text);
        } else if (this._C64) {
            this.WritePETSCII(text);
        } else {
            this.WriteASCII(text);
        }
    };

    Crt.WriteASCII = function (text) {
        if (typeof text === 'undefined') {
            text = '';
        }

        var X = this.WhereX();
        var Y = this.WhereY();
        var Buf = '';

        for (var i = 0; i < text.length; i++) {
            var DoGoto = false;

            if (text.charCodeAt(i) === 0x00) {
                i += 0;
            } else if (text.charCodeAt(i) === 0x07) {
                this.Beep();
            } else if (text.charCodeAt(i) === 0x08) {
                this.FastWrite(Buf, this.WhereXA(), this.WhereYA(), this._CharInfo);
                X += Buf.length;
                if (X > 1) {
                    X -= 1;
                }
                DoGoto = true;

                Buf = '';
            } else if (text.charCodeAt(i) === 0x09) {
                this.FastWrite(Buf, this.WhereXA(), this.WhereYA(), this._CharInfo);
                X += Buf.length;
                Buf = '';

                if (X === this.WindCols) {
                    X = 1;
                    Y += 1;
                } else {
                    X += 8 - (X % 8);

                    X = Math.min(X, this.WindCols);
                }
                DoGoto = true;
            } else if (text.charCodeAt(i) === 0x0A) {
                this.FastWrite(Buf, this.WhereXA(), this.WhereYA(), this._CharInfo);
                if (this._BareLFtoCRLF && (this._LastChar !== 0x0D)) {
                    X = 1;
                } else {
                    X += Buf.length;
                }
                Y += 1;
                DoGoto = true;

                Buf = '';
            } else if (text.charCodeAt(i) === 0x0C) {
                this.ClrScr();

                X = 1;
                Y = 1;
                Buf = '';
            } else if (text.charCodeAt(i) === 0x0D) {
                this.FastWrite(Buf, this.WhereXA(), this.WhereYA(), this._CharInfo);
                X = 1;
                DoGoto = true;

                Buf = '';
            } else if (text.charCodeAt(i) !== 0) {
                Buf += String.fromCharCode(text.charCodeAt(i) & 0xFF);

                if ((X + Buf.length) > this.WindCols) {
                    this.FastWrite(Buf, this.WhereXA(), this.WhereYA(), this._CharInfo);
                    Buf = '';

                    X = 1;
                    Y += 1;
                    DoGoto = true;
                }
            }

            this._LastChar = text.charCodeAt(i);

            if (Y > this.WindRows) {
                Y = this.WindRows;
                this.ScrollUpWindow(1);
                DoGoto = true;
            }

            if (DoGoto) {
                this.GotoXY(X, Y);
            }
        }

        if (Buf.length > 0) {
            this.FastWrite(Buf, this.WhereXA(), this.WhereYA(), this._CharInfo);
            X += Buf.length;
            this.GotoXY(X, Y);
        }
    };

    Crt.WriteATASCII = function (text) {
        if (typeof text === 'undefined') {
            text = '';
        }

        var X = this.WhereX();
        var Y = this.WhereY();
        var Buf = '';

        for (var i = 0; i < text.length; i++) {
            var DoGoto = false;

            if (text.charCodeAt(i) === 0x00) {
                i += 0;
            }
            if ((text.charCodeAt(i) === 0x1B) && (!this._ATASCIIEscaped)) {
                this._ATASCIIEscaped = true;
            } else if ((text.charCodeAt(i) === 0x1C) && (!this._ATASCIIEscaped)) {
                this.FastWrite(Buf, this.WhereXA(), this.WhereYA(), this._CharInfo);
                X += Buf.length;
                Y = (Y > 1) ? Y - 1 : this.WindRows;
                DoGoto = true;

                Buf = '';
            } else if ((text.charCodeAt(i) === 0x1D) && (!this._ATASCIIEscaped)) {
                this.FastWrite(Buf, this.WhereXA(), this.WhereYA(), this._CharInfo);
                X += Buf.length;
                Y = (Y < this.WindRows) ? Y + 1 : 1;
                DoGoto = true;

                Buf = '';
            } else if ((text.charCodeAt(i) === 0x1E) && (!this._ATASCIIEscaped)) {
                this.FastWrite(Buf, this.WhereXA(), this.WhereYA(), this._CharInfo);
                X += Buf.length;
                X = (X > 1) ? X - 1 : this.WindCols;
                DoGoto = true;

                Buf = '';
            } else if ((text.charCodeAt(i) === 0x1F) && (!this._ATASCIIEscaped)) {
                this.FastWrite(Buf, this.WhereXA(), this.WhereYA(), this._CharInfo);
                X += Buf.length;
                X = (X < this.WindCols) ? X + 1 : 1;
                DoGoto = true;

                Buf = '';
            } else if ((text.charCodeAt(i) === 0x7D) && (!this._ATASCIIEscaped)) {
                this.ClrScr();

                X = 1;
                Y = 1;
                Buf = '';
            } else if ((text.charCodeAt(i) === 0x7E) && (!this._ATASCIIEscaped)) {
                this.FastWrite(Buf, this.WhereXA(), this.WhereYA(), this._CharInfo);
                X += Buf.length;
                Buf = '';
                DoGoto = true;

                if (X > 1) {
                    X -= 1;
                    this.FastWrite(' ', X, this.WhereYA(), this._CharInfo);
                }
            } else if ((text.charCodeAt(i) === 0x7F) && (!this._ATASCIIEscaped)) {
                this.FastWrite(Buf, this.WhereXA(), this.WhereYA(), this._CharInfo);
                X += Buf.length;
                Buf = '';

                if (X === this.WindCols) {
                    X = 1;
                    Y += 1;
                } else {
                    X += 8 - (X % 8);
                }
                DoGoto = true;
            } else if ((text.charCodeAt(i) === 0x9B) && (!this._ATASCIIEscaped)) {
                this.FastWrite(Buf, this.WhereXA(), this.WhereYA(), this._CharInfo);
                X = 1;
                Y += 1;
                DoGoto = true;

                Buf = '';
            } else if ((text.charCodeAt(i) === 0x9C) && (!this._ATASCIIEscaped)) {
                this.FastWrite(Buf, this.WhereXA(), this.WhereYA(), this._CharInfo);
                X = 1;
                Buf = '';

                this.GotoXY(X, Y);
                this.DelLine();
            } else if ((text.charCodeAt(i) === 0x9D) && (!this._ATASCIIEscaped)) {
                this.FastWrite(Buf, this.WhereXA(), this.WhereYA(), this._CharInfo);
                X = 1;
                Buf = '';

                this.GotoXY(X, Y);
                this.InsLine();
            } else if ((text.charCodeAt(i) === 0xFD) && (!this._ATASCIIEscaped)) {
                this.Beep();
            } else if ((text.charCodeAt(i) === 0xFE) && (!this._ATASCIIEscaped)) {
                this.FastWrite(Buf, this.WhereXA(), this.WhereYA(), this._CharInfo);
                X += Buf.length;
                Buf = '';

                this.GotoXY(X, Y);
                this.DelChar();
            } else if ((text.charCodeAt(i) === 0xFF) && (!this._ATASCIIEscaped)) {
                this.FastWrite(Buf, this.WhereXA(), this.WhereYA(), this._CharInfo);
                X += Buf.length;
                Buf = '';

                this.GotoXY(X, Y);
                this.InsChar();
            } else {
                if ((text.charCodeAt(i) === 0x00) && (this._LastChar === 0x0D)) {
                    Buf += '';
                } else {
                    Buf += String.fromCharCode(text.charCodeAt(i) & 0xFF);
                }
                this._ATASCIIEscaped = false;
                this._LastChar = text.charCodeAt(i);

                if ((X + Buf.length) > this.WindCols) {
                    this.FastWrite(Buf, this.WhereXA(), this.WhereYA(), this._CharInfo);
                    Buf = '';

                    X = 1;
                    Y += 1;
                    DoGoto = true;
                }
            }

            if (Y > this.WindRows) {
                Y = this.WindRows;
                this.ScrollUpWindow(1);
                DoGoto = true;
            }

            if (DoGoto) {
                this.GotoXY(X, Y);
            }
        }

        if (Buf.length > 0) {
            this.FastWrite(Buf, this.WhereXA(), this.WhereYA(), this._CharInfo);
            X += Buf.length;
            this.GotoXY(X, Y);
        }
    };

    Crt.WritePETSCII = function (text) {
        if (typeof text === 'undefined') {
            text = '';
        }

        var X = this.WhereX();
        var Y = this.WhereY();
        var Buf = '';

        for (var i = 0; i < text.length; i++) {
            var DoGoto = false;

            if ((Buf !== '') && (this._FlushBeforeWritePETSCII.indexOf(text.charCodeAt(i)) !== -1)) {
                this.FastWrite(Buf, this.WhereXA(), this.WhereYA(), this._CharInfo);
                X += Buf.length;
                DoGoto = true;
                Buf = '';
            }

            if (text.charCodeAt(i) === 0x00) {
                i += 0;
            } else if (text.charCodeAt(i) === 0x05) {
                this.TextColor(this.PETSCII_WHITE);
            } else if (text.charCodeAt(i) === 0x07) {
                this.Beep();
            } else if (text.charCodeAt(i) === 0x08) {
                console.log('PETSCII 0x08');
            } else if (text.charCodeAt(i) === 0x09) {
                console.log('PETSCII 0x09');
            } else if (text.charCodeAt(i) === 0x0A) {
                i += 0;
            } else if ((text.charCodeAt(i) === 0x0D) || (text.charCodeAt(i) === 0x8D)) {
                X = 1;
                Y += 1;
                this._CharInfo.Reverse = false;
                DoGoto = true;
            } else if (text.charCodeAt(i) === 0x0E) {
                this.SetFont('C64-Lower');
            } else if (text.charCodeAt(i) === 0x11) {
                Y += 1;
                DoGoto = true;
            } else if (text.charCodeAt(i) === 0x12) {
                this._CharInfo.Reverse = true;
            } else if (text.charCodeAt(i) === 0x13) {
                X = 1;
                Y = 1;
                DoGoto = true;
            } else if (text.charCodeAt(i) === 0x14) {
                if ((X > 1) || (Y > 1)) {
                    if (X === 1) {
                        X = this.WindCols;
                        Y -= 1;
                    } else {
                        X -= 1;
                    }

                    this.GotoXY(X, Y);
                    this.DelChar(1);
                }
            } else if (text.charCodeAt(i) === 0x1C) {
                this.TextColor(this.PETSCII_RED);
            } else if (text.charCodeAt(i) === 0x1D) {
                if (X === this.WindCols) {
                    X = 1;
                    Y += 1;
                } else {
                    X += 1;
                }
                DoGoto = true;
            } else if (text.charCodeAt(i) === 0x1E) {
                this.TextColor(this.PETSCII_GREEN);
            } else if (text.charCodeAt(i) === 0x1F) {
                this.TextColor(this.PETSCII_BLUE);
            } else if (text.charCodeAt(i) === 0x81) {
                this.TextColor(this.PETSCII_ORANGE);
            } else if (text.charCodeAt(i) === 0x8E) {
                this.SetFont('C64-Upper');
            } else if (text.charCodeAt(i) === 0x90) {
                this.TextColor(this.PETSCII_BLACK);
            } else if (text.charCodeAt(i) === 0x91) {
                if (Y > 1) {
                    Y -= 1;
                    DoGoto = true;
                }
            } else if (text.charCodeAt(i) === 0x92) {
                this._CharInfo.Reverse = false;
            } else if (text.charCodeAt(i) === 0x93) {
                this.ClrScr();
                X = 1;
                Y = 1;
            } else if (text.charCodeAt(i) === 0x94) {
                this.GotoXY(X, Y);
                this.InsChar(1);
            } else if (text.charCodeAt(i) === 0x95) {
                this.TextColor(this.PETSCII_BROWN);
            } else if (text.charCodeAt(i) === 0x96) {
                this.TextColor(this.PETSCII_LIGHTRED);
            } else if (text.charCodeAt(i) === 0x97) {
                this.TextColor(this.PETSCII_DARKGRAY);
            } else if (text.charCodeAt(i) === 0x98) {
                this.TextColor(this.PETSCII_GRAY);
            } else if (text.charCodeAt(i) === 0x99) {
                this.TextColor(this.PETSCII_LIGHTGREEN);
            } else if (text.charCodeAt(i) === 0x9A) {
                this.TextColor(this.PETSCII_LIGHTBLUE);
            } else if (text.charCodeAt(i) === 0x9B) {
                this.TextColor(this.PETSCII_LIGHTGRAY);
            } else if (text.charCodeAt(i) === 0x9C) {
                this.TextColor(this.PETSCII_PURPLE);
            } else if (text.charCodeAt(i) === 0x9D) {
                if ((X > 1) || (Y > 1)) {
                    if (X === 1) {
                        X = this.WindCols;
                        Y -= 1;
                    } else {
                        X -= 1;
                    }
                    DoGoto = true;
                }
            } else if (text.charCodeAt(i) === 0x9E) {
                this.TextColor(this.PETSCII_YELLOW);
            } else if (text.charCodeAt(i) === 0x9F) {
                this.TextColor(this.PETSCII_CYAN);
            } else if (text.charCodeAt(i) !== 0) {
                Buf += String.fromCharCode(text.charCodeAt(i) & 0xFF);

                if ((X + Buf.length) > this.WindCols) {
                    this.FastWrite(Buf, this.WhereXA(), this.WhereYA(), this._CharInfo);
                    Buf = '';

                    X = 1;
                    Y += 1;
                    DoGoto = true;
                }
            }

            if (Y > this.WindRows) {
                Y = this.WindRows;
                this.ScrollUpWindow(1);
                DoGoto = true;
            }

            if (DoGoto) {
                this.GotoXY(X, Y);
            }
        }

        if (Buf.length > 0) {
            this.FastWrite(Buf, this.WhereXA(), this.WhereYA(), this._CharInfo);
            X += Buf.length;
            this.GotoXY(X, Y);
        }
    };

    Crt.WriteLn = function (text) {
        if (typeof text === 'undefined') {
            text = '';
        }
        this.Write(text + '\r\n');
    };
    Crt.onfontchange = new TypedEvent();
    Crt.onscreensizechange = new TypedEvent();

    Crt.BLACK = 0;
    Crt.BLUE = 1;
    Crt.GREEN = 2;
    Crt.CYAN = 3;
    Crt.RED = 4;
    Crt.MAGENTA = 5;
    Crt.BROWN = 6;
    Crt.LIGHTGRAY = 7;
    Crt.DARKGRAY = 8;
    Crt.LIGHTBLUE = 9;
    Crt.LIGHTGREEN = 10;
    Crt.LIGHTCYAN = 11;
    Crt.LIGHTRED = 12;
    Crt.LIGHTMAGENTA = 13;
    Crt.YELLOW = 14;
    Crt.WHITE = 15;
    Crt.BLINK = 128;

    Crt.PETSCII_BLACK = 0;
    Crt.PETSCII_WHITE = 1;
    Crt.PETSCII_RED = 2;
    Crt.PETSCII_CYAN = 3;
    Crt.PETSCII_PURPLE = 4;
    Crt.PETSCII_GREEN = 5;
    Crt.PETSCII_BLUE = 6;
    Crt.PETSCII_YELLOW = 7;
    Crt.PETSCII_ORANGE = 8;
    Crt.PETSCII_BROWN = 9;
    Crt.PETSCII_LIGHTRED = 10;
    Crt.PETSCII_DARKGRAY = 11;
    Crt.PETSCII_GRAY = 12;
    Crt.PETSCII_LIGHTGREEN = 13;
    Crt.PETSCII_LIGHTBLUE = 14;
    Crt.PETSCII_LIGHTGRAY = 15;

    Crt._Atari = false;
    Crt._ATASCIIEscaped = false;
    Crt._BareLFtoCRLF = false;
    Crt._Blink = true;
    Crt._BlinkHidden = false;
    Crt._Buffer = null;
    Crt._C64 = false;
    Crt._Canvas = null;
    Crt._CanvasContext = null;
    Crt._CharInfo = new CharInfo(' ', Crt.LIGHTGRAY);
    Crt._Container = null;
    Crt._Cursor = null;
    Crt._FlushBeforeWritePETSCII = [0x05, 0x07, 0x08, 0x09, 0x0A, 0x0D, 0x0E, 0x11, 0x12, 0x13, 0x14, 0x1c, 0x1d, 0x1e, 0x1f, 0x81, 0x8d, 0x8e, 0x90, 0x91, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98, 0x99, 0x9a, 0x9b, 0x9c, 0x9d, 0x9e, 0x9f];
    Crt._Font = null;
    Crt._InScrollBack = false;
    Crt._KeyBuf = [];
    Crt._LastChar = 0x00;
    Crt._LocalEcho = false;
    Crt._ScreenSize = new Point(80, 25);
    Crt._ScrollBack = null;
    Crt._ScrollBackPosition = -1;
    Crt._ScrollBackSize = 1000;
    Crt._ScrollBackTemp = null;
    Crt._WindMin = 0;
    Crt._WindMax = (80 - 1) | ((25 - 1) << 8);
    return Crt;
})();
var BlinkState;
(function (BlinkState) {
    BlinkState[BlinkState["Show"] = 0] = "Show";
    BlinkState[BlinkState["Hide"] = 1] = "Hide";
})(BlinkState || (BlinkState = {}));
var Cursor = (function () {
    function Cursor(parent, colour, size) {
        var _this = this;
        this.onhide = new TypedEvent();
        this.onshow = new TypedEvent();
        this._BlinkRate = 500;
        this._BlinkState = 1 /* Hide */;

        this._Colour = '#' + colour.toString(16);

        this._Position = new Point(1, 1);
        this._Size = size;

        this._Visible = true;
        this._WindowOffset = new Point(0, 0);
        this._WindowOffsetAdjusted = new Point(0, 0);

        this._Canvas = document.createElement('canvas');
        if (this._Canvas.getContext) {
            this._Canvas.style.position = 'absolute';
            this._Context = this._Canvas.getContext('2d');
            parent.appendChild(this._Canvas);

            this.Update();
            this.Draw();

            this._Timer = setInterval(function () {
                _this.OnTimer();
            }, this._BlinkRate);
        }
    }
    Object.defineProperty(Cursor.prototype, "BlinkRate", {
        set: function (value) {
            var _this = this;
            this._BlinkRate = value;
            clearInterval(this._Timer);
            this._Timer = setInterval(function () {
                _this.OnTimer();
            }, this._BlinkRate);
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(Cursor.prototype, "Colour", {
        set: function (value) {
            this._Colour = value;
            this.Draw();
        },
        enumerable: true,
        configurable: true
    });

    Cursor.prototype.Draw = function () {
        if (this._Context) {
            this._Canvas.width = this._Size.x;
            this._Canvas.height = this._Size.y;

            this._Context.fillStyle = this._Colour;
            this._Context.fillRect(0, this._Size.y - (this._Size.y * 0.20), this._Size.x, this._Size.y * 0.20);
        }
    };

    Cursor.prototype.OnTimer = function () {
        this._BlinkState = (this._BlinkState === 1 /* Hide */) ? 0 /* Show */ : 1 /* Hide */;

        if (this._Visible) {
            this._Canvas.style.opacity = (this._BlinkState === 1 /* Hide */) ? '0' : '1';
        } else {
            this._Canvas.style.opacity = '0';
        }

        switch (this._BlinkState) {
            case 1 /* Hide */:
                this.onhide.trigger();
                break;
            case 0 /* Show */:
                this.onshow.trigger();
                break;
        }
    };

    Object.defineProperty(Cursor.prototype, "Position", {
        get: function () {
            return this._Position;
        },
        set: function (value) {
            this._Position = value;
            this.Update();
        },
        enumerable: true,
        configurable: true
    });


    Object.defineProperty(Cursor.prototype, "Size", {
        set: function (value) {
            this._Size = value;
            this.Draw();
            this.Update();
        },
        enumerable: true,
        configurable: true
    });

    Cursor.prototype.Update = function () {
        if (this._Canvas && this._Visible) {
            this._Canvas.style.left = (this._Position.x - 1) * this._Size.x + this._WindowOffsetAdjusted.x + 'px';
            this._Canvas.style.top = (this._Position.y - 1) * this._Size.y + this._WindowOffsetAdjusted.y + 'px';
        }
    };

    Object.defineProperty(Cursor.prototype, "Visible", {
        set: function (value) {
            this._Visible = value;
            if (this._Visible) {
                this.Update();
            }
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(Cursor.prototype, "WindowOffset", {
        set: function (value) {
            if ((value.x !== this._WindowOffset.x) || (value.y !== this._WindowOffset.y)) {
                this._WindowOffset = value;

                this._Canvas.style.left = '0px';
                this._Canvas.style.top = '0px';
                var CursorPosition = Offset.getOffset(this._Canvas);

                this._WindowOffsetAdjusted.x = value.x - CursorPosition.x;
                this._WindowOffsetAdjusted.y = value.y - CursorPosition.y;

                this.Update();
            }
        },
        enumerable: true,
        configurable: true
    });
    return Cursor;
})();
var CrtFont = (function () {
    function CrtFont() {
        this.onchange = new TypedEvent();
        this._Canvas = null;
        this._CanvasContext = null;
        this._CharMap = [];
        this._Name = 'CP437';
        this._Loading = 0;
        this._NewName = 'CP437';
        this._NewSize = new Point(9, 16);
        this._Png = null;
        this._Size = new Point(9, 16);

        this._Canvas = document.createElement('canvas');
        if (this._Canvas.getContext) {
            this._CanvasContext = this._Canvas.getContext('2d');
            this.Load(this._Name, this._Size.x, this._Size.y);
        }
    }
    CrtFont.prototype.GetChar = function (charCode, charInfo) {
        if (this._Loading > 0) {
            return null;
        }

        if ((charCode < 0) || (charCode > 255) || (charInfo.Attr < 0) || (charInfo.Attr > 255)) {
            return null;
        }

        var CharMapKey = charCode + '-' + charInfo.Attr + '-' + charInfo.Reverse;

        if (!this._CharMap[CharMapKey]) {
            this._CharMap[CharMapKey] = this._CanvasContext.getImageData(charCode * this._Size.x, 0, this._Size.x, this._Size.y);

            var Back;
            var Fore;
            if (this._Name.indexOf('C64') === 0) {
                Back = CrtFont.PETSCII_COLOURS[(charInfo.Attr & 0xF0) >> 4];
                Fore = CrtFont.PETSCII_COLOURS[(charInfo.Attr & 0x0F)];
            } else {
                Back = CrtFont.ANSI_COLOURS[(charInfo.Attr & 0xF0) >> 4];
                Fore = CrtFont.ANSI_COLOURS[(charInfo.Attr & 0x0F)];
            }

            if (charInfo.Reverse) {
                var Temp = Fore;
                Fore = Back;
                Back = Temp;
            }

            var BackR = Back >> 16;
            var BackG = (Back >> 8) & 0xFF;
            var BackB = Back & 0xFF;
            var ForeR = Fore >> 16;
            var ForeG = (Fore >> 8) & 0xFF;
            var ForeB = Fore & 0xFF;

            var R = 0;
            var G = 0;
            var B = 0;
            for (var i = 0; i < this._CharMap[CharMapKey].data.length; i += 4) {
                if (this._CharMap[CharMapKey].data[i] & 0x80) {
                    R = ForeR;
                    G = ForeG;
                    B = ForeB;
                } else {
                    R = BackR;
                    G = BackG;
                    B = BackB;
                }

                this._CharMap[CharMapKey].data[i] = R;
                this._CharMap[CharMapKey].data[i + 1] = G;
                this._CharMap[CharMapKey].data[i + 2] = B;
                this._CharMap[CharMapKey].data[i + 3] = 255;
            }
        }

        return this._CharMap[CharMapKey];
    };

    Object.defineProperty(CrtFont.prototype, "Height", {
        get: function () {
            return this._Size.y;
        },
        enumerable: true,
        configurable: true
    });

    CrtFont.prototype.Load = function (font, maxWidth, maxHeight) {
        var _this = this;
        var BestFit = CrtFonts.GetBestFit(font, maxWidth, maxHeight);
        if (BestFit === null) {
            console.log('fTelnet Error: Font CP=' + font + ' does not exist');
            return false;
        } else {
            if ((this._Png != null) && (this._Name === font) && (this._Size.x === BestFit.x) && (this._Size.y === BestFit.y)) {
                return true;
            }

            CrtFont.ANSI_COLOURS[7] = 0xA8A8A8;
            CrtFont.ANSI_COLOURS[0] = 0x000000;

            this._Loading += 1;
            this._NewName = font;
            this._NewSize = new Point(BestFit.x, BestFit.y);

            if (font.indexOf('Atari') === 0) {
                CrtFont.ANSI_COLOURS[7] = 0x63B6E7;
                CrtFont.ANSI_COLOURS[0] = 0x005184;
            }

            this._Png = new Image();
            this._Png.onload = function () {
                _this.OnPngLoad();
            };
            this._Png.onerror = function () {
                _this.OnPngError();
            };
            this._Png.src = CrtFonts.GetLocalUrl(font, this._NewSize.x, this._NewSize.y);

            return true;
        }
    };

    Object.defineProperty(CrtFont.prototype, "Name", {
        get: function () {
            return this._Name;
        },
        enumerable: true,
        configurable: true
    });

    CrtFont.prototype.OnPngError = function () {
        var _this = this;
        this._Png = new Image();
        this._Png.crossOrigin = 'Anonymous';
        this._Png.onload = function () {
            _this.OnPngLoad();
        };
        this._Png.onerror = function () {
            alert('fTelnet Error: Unable to load requested font');
        };
        this._Png.src = CrtFonts.GetRemoteUrl(this._NewName, this._NewSize.x, this._NewSize.y);
    };

    CrtFont.prototype.OnPngLoad = function () {
        this._Name = this._NewName;
        this._Size = this._NewSize;

        this._Canvas.width = this._Png.width;
        this._Canvas.height = this._Png.height;
        this._CanvasContext.drawImage(this._Png, 0, 0);

        this._CharMap = [];

        this._Loading -= 1;
        this.onchange.trigger();
    };

    Object.defineProperty(CrtFont.prototype, "Size", {
        get: function () {
            return this._Size;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(CrtFont.prototype, "Width", {
        get: function () {
            return this._Size.x;
        },
        enumerable: true,
        configurable: true
    });
    CrtFont.ANSI_COLOURS = [
        0x000000, 0x0000A8, 0x00A800, 0x00A8A8, 0xA80000, 0xA800A8, 0xA85400, 0xA8A8A8,
        0x545454, 0x5454FC, 0x54FC54, 0x54FCFC, 0xFC5454, 0xFC54FC, 0xFCFC54, 0xFCFCFC];

    CrtFont.PETSCII_COLOURS = [
        0x000000, 0xFDFEFC, 0xBE1A24, 0x30E6C6, 0xB41AE2, 0x1FD21E, 0x211BAE, 0xDFF60A,
        0xB84104, 0x6A3304, 0xFE4A57, 0x424540, 0x70746F, 0x59FE59, 0x5F53FE, 0xA4A7A2];
    return CrtFont;
})();
var CrtFonts = (function () {
    function CrtFonts() {
    }
    CrtFonts.GetBestFit = function (font, maxWidth, maxHeight) {
        if (typeof this._Fonts[font] === 'undefined') {
            return null;
        } else if (this._Fonts[font].length === 1) {
            return this._Fonts[font][0];
        } else {
            for (var i = 0; i < this._Fonts[font].length; i++) {
                if ((this._Fonts[font][i].x <= maxWidth) && (this._Fonts[font][i].y <= maxHeight)) {
                    return this._Fonts[font][i];
                }
            }

            return this._Fonts[font][this._Fonts[font].length - 1];
        }
    };

    CrtFonts.GetLocalUrl = function (font, width, height) {
        var ScriptUrl = document.getElementById('fTelnetScript').src;
        var PngUrl = ScriptUrl.replace('/ftelnet.min.js', '/fonts/' + font + '_' + width.toString(10) + 'x' + height.toString(10) + '.png');
        PngUrl = PngUrl.replace('/ftelnet.debug.js', '/fonts/' + font + '_' + width.toString(10) + 'x' + height.toString(10) + '.png');
        return PngUrl;
    };

    CrtFonts.GetRemoteUrl = function (font, width, height) {
        var PngUrl = 'http://embed.ftelnet.ca/ftelnet/fonts/' + font + '_' + width.toString(10) + 'x' + height.toString(10) + '.png';
        return PngUrl;
    };
    CrtFonts._Fonts = [];

    CrtFonts.__ctor = (function () {
        var FontNames = ['Amiga-BStrict_8x8', 'Amiga-BStruct_8x8', 'Amiga-MicroKnight_8x16', 'Amiga-MicroKnight_8x8', 'Amiga-MoSoul_8x16', 'Amiga-MoSoul_8x8', 'Amiga-PotNoodle_8x11', 'Amiga-PotNoodle_8x16', 'Amiga-TopazPlus_8x11', 'Amiga-Topaz_8x11', 'Amiga-Topaz_8x16', 'Atari-Arabic_16x16', 'Atari-Arabic_8x16', 'Atari-Graphics_16x16', 'Atari-Graphics_8x16', 'Atari-Graphics_8x8', 'Atari-International_16x16', 'Atari-International_8x16', 'C128-Lower_8x16', 'C128-Upper_8x16', 'C128-Upper_8x8', 'C128_Lower_8x8', 'C64-Lower_16x16', 'C64-Lower_8x16', 'C64-Lower_8x8', 'C64-Upper_16x16', 'C64-Upper_8x16', 'C64-Upper_8x8', 'CP437_10x19', 'CP437_12x23', 'CP437_6x8', 'CP437_7x12', 'CP437_8x12', 'CP437_8x13', 'CP437_8x14', 'CP437_8x16', 'CP437_8x8', 'CP437_9x16', 'CP737_12x23', 'CP737_9x16', 'CP775_9x16', 'CP850_10x19', 'CP850_12x23', 'CP850_8x13', 'CP850_9x16', 'CP852_10x19', 'CP852_12x23', 'CP852_9x16', 'CP855_9x16', 'CP857_9x16', 'CP860_9x16', 'CP861_9x16', 'CP862_10x19', 'CP863_9x16', 'CP865_10x19', 'CP865_12x23', 'CP865_8x13', 'CP865_9x16', 'CP866_9x16', 'CP869_9x16', 'SyncTerm-0_8x14', 'SyncTerm-0_8x16', 'SyncTerm-0_8x8', 'SyncTerm-10_8x16', 'SyncTerm-11_8x14', 'SyncTerm-11_8x16', 'SyncTerm-11_8x8', 'SyncTerm-12_8x16', 'SyncTerm-13_8x16', 'SyncTerm-14_8x14', 'SyncTerm-14_8x16', 'SyncTerm-14_8x8', 'SyncTerm-15_8x14', 'SyncTerm-15_8x16', 'SyncTerm-15_8x8', 'SyncTerm-16_8x14', 'SyncTerm-16_8x16', 'SyncTerm-16_8x8', 'SyncTerm-17_8x16', 'SyncTerm-17_8x8', 'SyncTerm-18_8x14', 'SyncTerm-18_8x16', 'SyncTerm-18_8x8', 'SyncTerm-19_8x16', 'SyncTerm-19_8x8', 'SyncTerm-1_8x16', 'SyncTerm-20_8x14', 'SyncTerm-20_8x16', 'SyncTerm-20_8x8', 'SyncTerm-21_8x14', 'SyncTerm-21_8x16', 'SyncTerm-21_8x8', 'SyncTerm-22_8x16', 'SyncTerm-23_8x14', 'SyncTerm-23_8x16', 'SyncTerm-23_8x8', 'SyncTerm-24_8x14', 'SyncTerm-24_8x16', 'SyncTerm-24_8x8', 'SyncTerm-25_8x14', 'SyncTerm-25_8x16', 'SyncTerm-25_8x8', 'SyncTerm-26_8x16', 'SyncTerm-26_8x8', 'SyncTerm-27_8x16', 'SyncTerm-28_8x14', 'SyncTerm-28_8x16', 'SyncTerm-28_8x8', 'SyncTerm-29_8x14', 'SyncTerm-29_8x16', 'SyncTerm-29_8x8', 'SyncTerm-2_8x14', 'SyncTerm-2_8x16', 'SyncTerm-2_8x8', 'SyncTerm-30_8x16', 'SyncTerm-31_8x16', 'SyncTerm-32_8x16', 'SyncTerm-32_8x8', 'SyncTerm-33_8x16', 'SyncTerm-33_8x8', 'SyncTerm-34_8x16', 'SyncTerm-34_8x8', 'SyncTerm-35_8x16', 'SyncTerm-35_8x8', 'SyncTerm-36_8x16', 'SyncTerm-36_8x8', 'SyncTerm-37_8x16', 'SyncTerm-38_8x16', 'SyncTerm-39_8x16', 'SyncTerm-3_8x14', 'SyncTerm-3_8x16', 'SyncTerm-3_8x8', 'SyncTerm-40_8x16', 'SyncTerm-4_8x16', 'SyncTerm-5_8x16', 'SyncTerm-6_8x16', 'SyncTerm-7_8x14', 'SyncTerm-7_8x16', 'SyncTerm-7_8x8', 'SyncTerm-8_8x14', 'SyncTerm-8_8x16', 'SyncTerm-8_8x8', 'SyncTerm-9_8x14', 'SyncTerm-9_8x16', 'SyncTerm-9_8x8'];
        for (var i = 0; i < FontNames.length; i++) {
            var NameSize = FontNames[i].split('_');
            var WidthHeight = NameSize[1].split('x');
            var Width = parseInt(WidthHeight[0], 10);
            var Height = parseInt(WidthHeight[1], 10);

            if (typeof CrtFonts._Fonts[NameSize[0]] === 'undefined') {
                CrtFonts._Fonts[NameSize[0]] = [];
            }

            CrtFonts._Fonts[NameSize[0]].push(new Point(Width, Height));
        }

        for (var key in CrtFonts._Fonts) {
            CrtFonts._Fonts[key].sort(function (a, b) {
                if (b.x - a.x === 0) {
                    return b.y - a.y;
                } else {
                    return b.x - a.x;
                }
            });
        }
    })();
    return CrtFonts;
})();
var KeyPressEvent = (function () {
    function KeyPressEvent(keyEvent, keyString) {
        this.altKey = keyEvent.altKey;
        this.charCode = keyEvent.charCode;
        this.ctrlKey = keyEvent.ctrlKey;
        this.keyCode = keyEvent.keyCode;
        this.keyString = keyString;
        this.shiftKey = keyEvent.shiftKey;
    }
    return KeyPressEvent;
})();
var StringUtils = (function () {
    function StringUtils() {
    }
    StringUtils.AddCommas = function (value) {
        var Result = '';

        var Position = 1;
        for (var i = value.toString().length - 1; i >= 0; i--) {
            if ((Position > 3) && (Position % 3 === 1)) {
                Result = ',' + Result;
            }
            Result = value.toString().charAt(i) + Result;
            Position++;
        }

        return Result;
    };

    StringUtils.FormatPercent = function (value, fractionDigits) {
        return (value * 100).toFixed(fractionDigits) + '%';
    };

    StringUtils.NewString = function (ch, length) {
        if (ch.length === 0) {
            return '';
        }

        var Result = '';
        for (var i = 0; i < length; i++) {
            Result += ch.charAt(0);
        }
        return Result;
    };

    StringUtils.PadLeft = function (text, ch, length) {
        if (ch.length === 0) {
            return text;
        }

        while (text.length < length) {
            text = ch.charAt(0) + text;
        }
        return text.substring(0, length);
    };

    StringUtils.PadRight = function (text, ch, length) {
        if (ch.length === 0) {
            return text;
        }

        while (text.length < length) {
            text += ch.charAt(0);
        }
        return text.substring(0, length);
    };

    StringUtils.Trim = function (text) {
        return this.TrimLeft(this.TrimRight(text));
    };

    StringUtils.TrimLeft = function (text) {
        return text.replace(/^\s+/g, '');
    };

    StringUtils.TrimRight = function (text) {
        return text.replace(/\s+$/g, '');
    };
    return StringUtils;
})();
var TelnetCommand;
(function (TelnetCommand) {
    TelnetCommand[TelnetCommand["EndSubnegotiation"] = 240] = "EndSubnegotiation";

    TelnetCommand[TelnetCommand["NoOperation"] = 241] = "NoOperation";

    TelnetCommand[TelnetCommand["DataMark"] = 242] = "DataMark";

    TelnetCommand[TelnetCommand["Break"] = 243] = "Break";

    TelnetCommand[TelnetCommand["InterruptProcess"] = 244] = "InterruptProcess";

    TelnetCommand[TelnetCommand["AbortOutput"] = 245] = "AbortOutput";

    TelnetCommand[TelnetCommand["AreYouThere"] = 246] = "AreYouThere";

    TelnetCommand[TelnetCommand["EraseCharacter"] = 247] = "EraseCharacter";

    TelnetCommand[TelnetCommand["EraseLine"] = 248] = "EraseLine";

    TelnetCommand[TelnetCommand["GoAhead"] = 249] = "GoAhead";

    TelnetCommand[TelnetCommand["Subnegotiation"] = 250] = "Subnegotiation";

    TelnetCommand[TelnetCommand["Will"] = 251] = "Will";

    TelnetCommand[TelnetCommand["Wont"] = 252] = "Wont";

    TelnetCommand[TelnetCommand["Do"] = 253] = "Do";

    TelnetCommand[TelnetCommand["Dont"] = 254] = "Dont";

    TelnetCommand[TelnetCommand["IAC"] = 255] = "IAC";
})(TelnetCommand || (TelnetCommand = {}));
var TelnetNegotiationState;
(function (TelnetNegotiationState) {
    TelnetNegotiationState[TelnetNegotiationState["Data"] = 0] = "Data";

    TelnetNegotiationState[TelnetNegotiationState["IAC"] = 1] = "IAC";

    TelnetNegotiationState[TelnetNegotiationState["Do"] = 2] = "Do";

    TelnetNegotiationState[TelnetNegotiationState["Dont"] = 3] = "Dont";

    TelnetNegotiationState[TelnetNegotiationState["Will"] = 4] = "Will";

    TelnetNegotiationState[TelnetNegotiationState["Wont"] = 5] = "Wont";
})(TelnetNegotiationState || (TelnetNegotiationState = {}));
var TelnetOption;
(function (TelnetOption) {
    TelnetOption[TelnetOption["TransmitBinary"] = 0] = "TransmitBinary";

    TelnetOption[TelnetOption["Echo"] = 1] = "Echo";

    TelnetOption[TelnetOption["Reconnection"] = 2] = "Reconnection";

    TelnetOption[TelnetOption["SuppressGoAhead"] = 3] = "SuppressGoAhead";

    TelnetOption[TelnetOption["ApproxMessageSizeNegotiation"] = 4] = "ApproxMessageSizeNegotiation";
    TelnetOption[TelnetOption["Status"] = 5] = "Status";
    TelnetOption[TelnetOption["TimingMark"] = 6] = "TimingMark";
    TelnetOption[TelnetOption["RemoteControlledTransAndEcho"] = 7] = "RemoteControlledTransAndEcho";
    TelnetOption[TelnetOption["OutputLineWidth"] = 8] = "OutputLineWidth";
    TelnetOption[TelnetOption["OutputPageSize"] = 9] = "OutputPageSize";
    TelnetOption[TelnetOption["OutputCarriageReturnDisposition"] = 10] = "OutputCarriageReturnDisposition";
    TelnetOption[TelnetOption["OutputHorizontalTabStops"] = 11] = "OutputHorizontalTabStops";
    TelnetOption[TelnetOption["OutputHorizontalTabDisposition"] = 12] = "OutputHorizontalTabDisposition";
    TelnetOption[TelnetOption["OutputFormfeedDisposition"] = 13] = "OutputFormfeedDisposition";
    TelnetOption[TelnetOption["OutputVerticalTabstops"] = 14] = "OutputVerticalTabstops";
    TelnetOption[TelnetOption["OutputVerticalTabDisposition"] = 15] = "OutputVerticalTabDisposition";
    TelnetOption[TelnetOption["OutputLinefeedDisposition"] = 16] = "OutputLinefeedDisposition";
    TelnetOption[TelnetOption["ExtendedASCII"] = 17] = "ExtendedASCII";
    TelnetOption[TelnetOption["Logout"] = 18] = "Logout";
    TelnetOption[TelnetOption["ByteMacro"] = 19] = "ByteMacro";
    TelnetOption[TelnetOption["DataEntryTerminal"] = 20] = "DataEntryTerminal";
    TelnetOption[TelnetOption["SUPDUP"] = 21] = "SUPDUP";
    TelnetOption[TelnetOption["SUPDUPOutput"] = 22] = "SUPDUPOutput";
    TelnetOption[TelnetOption["SendLocation"] = 23] = "SendLocation";

    TelnetOption[TelnetOption["TerminalType"] = 24] = "TerminalType";

    TelnetOption[TelnetOption["EndOfRecord"] = 25] = "EndOfRecord";
    TelnetOption[TelnetOption["TACACSUserIdentification"] = 26] = "TACACSUserIdentification";
    TelnetOption[TelnetOption["OutputMarking"] = 27] = "OutputMarking";

    TelnetOption[TelnetOption["TerminalLocationNumber"] = 28] = "TerminalLocationNumber";

    TelnetOption[TelnetOption["Telnet3270Regime"] = 29] = "Telnet3270Regime";
    TelnetOption[TelnetOption["Xdot3PAD"] = 30] = "Xdot3PAD";

    TelnetOption[TelnetOption["WindowSize"] = 31] = "WindowSize";

    TelnetOption[TelnetOption["TerminalSpeed"] = 32] = "TerminalSpeed";
    TelnetOption[TelnetOption["RemoteFlowControl"] = 33] = "RemoteFlowControl";

    TelnetOption[TelnetOption["LineMode"] = 34] = "LineMode";

    TelnetOption[TelnetOption["XDisplayLocation"] = 35] = "XDisplayLocation";
    TelnetOption[TelnetOption["EnvironmentOption"] = 36] = "EnvironmentOption";
    TelnetOption[TelnetOption["AuthenticationOption"] = 37] = "AuthenticationOption";
    TelnetOption[TelnetOption["EncryptionOption"] = 38] = "EncryptionOption";
    TelnetOption[TelnetOption["NewEnvironmentOption"] = 39] = "NewEnvironmentOption";
    TelnetOption[TelnetOption["TN3270E"] = 40] = "TN3270E";
    TelnetOption[TelnetOption["XAUTH"] = 41] = "XAUTH";
    TelnetOption[TelnetOption["CHARSET"] = 42] = "CHARSET";
    TelnetOption[TelnetOption["TelnetRemoteSerialPort"] = 43] = "TelnetRemoteSerialPort";
    TelnetOption[TelnetOption["ComPortControlOption"] = 44] = "ComPortControlOption";
    TelnetOption[TelnetOption["TelnetSuppressLocalEcho"] = 45] = "TelnetSuppressLocalEcho";
    TelnetOption[TelnetOption["TelnetStartTLS"] = 46] = "TelnetStartTLS";
    TelnetOption[TelnetOption["KERMIT"] = 47] = "KERMIT";
    TelnetOption[TelnetOption["SENDURL"] = 48] = "SENDURL";
    TelnetOption[TelnetOption["FORWARD_X"] = 49] = "FORWARD_X";
})(TelnetOption || (TelnetOption = {}));
var WebSocketProtocol = ('https:' === document.location.protocol ? 'wss' : 'ws');
var WebSocketSupportsTypedArrays = (('Uint8Array' in window) && ('set' in Uint8Array.prototype));
var WebSocketSupportsBinaryType = (WebSocketSupportsTypedArrays && ('binaryType' in WebSocket.prototype || !!(new WebSocket(WebSocketProtocol + '://.').binaryType)));

var WebSocketConnection = (function () {
    function WebSocketConnection() {
        this.onclose = new TypedEvent();
        this.onconnect = new TypedEvent();
        this.onlocalecho = new TypedEvent();
        this.onioerror = new TypedEvent();
        this.onsecurityerror = new TypedEvent();
        this._WasConnected = false;
        this._InputBuffer = null;
        this._OutputBuffer = null;
        this._Protocol = 'plain';
        this._WebSocket = null;
        this._InputBuffer = new ByteArray();
        this._LocalEcho = false;
        this._OutputBuffer = new ByteArray();
    }
    Object.defineProperty(WebSocketConnection.prototype, "bytesAvailable", {
        get: function () {
            return this._InputBuffer.bytesAvailable;
        },
        enumerable: true,
        configurable: true
    });

    WebSocketConnection.prototype.close = function () {
        if (this._WebSocket) {
            this._WebSocket.close();
        }
    };

    WebSocketConnection.prototype.connect = function (hostname, port, proxyHostname, proxyPort, proxyPortSecure) {
        var _this = this;
        if (typeof proxyHostname === 'undefined') {
            proxyHostname = '';
        }
        if (typeof proxyPort === 'undefined') {
            proxyPort = 1123;
        }
        if (typeof proxyPortSecure === 'undefined') {
            proxyPortSecure = 11235;
        }

        this._WasConnected = false;

        var Protocols;
        if (('WebSocket' in window) && (WebSocket.CLOSED === 2 || WebSocket.prototype.CLOSED === 2)) {
            Protocols = ['plain'];
        } else {
            if (WebSocketSupportsBinaryType && WebSocketSupportsTypedArrays) {
                Protocols = ['binary', 'base64', 'plain'];
            } else {
                Protocols = ['base64', 'plain'];
            }
        }

        if (proxyHostname === '') {
            this._WebSocket = new WebSocket(WebSocketProtocol + '://' + hostname + ':' + port, Protocols);
        } else {
            this._WebSocket = new WebSocket(WebSocketProtocol + '://' + proxyHostname + ':' + (WebSocketProtocol === 'wss' ? proxyPortSecure : proxyPort) + '/' + hostname + '/' + port, Protocols);
        }

        if (Protocols.indexOf('binary') >= 0) {
            this._WebSocket.binaryType = 'arraybuffer';
        }

        this._WebSocket.onclose = function () {
            _this.OnSocketClose();
        };
        this._WebSocket.onerror = function (e) {
            _this.OnSocketError(e);
        };
        this._WebSocket.onmessage = function (e) {
            _this.OnSocketMessage(e);
        };
        this._WebSocket.onopen = function () {
            _this.OnSocketOpen();
        };
    };

    Object.defineProperty(WebSocketConnection.prototype, "connected", {
        get: function () {
            if (this._WebSocket) {
                return (this._WebSocket.readyState === this._WebSocket.OPEN) || (this._WebSocket.readyState === WebSocket.OPEN);
            }

            return false;
        },
        enumerable: true,
        configurable: true
    });

    WebSocketConnection.prototype.flush = function () {
        var ToSendBytes = [];

        this._OutputBuffer.position = 0;
        while (this._OutputBuffer.bytesAvailable > 0) {
            var B = this._OutputBuffer.readUnsignedByte();
            ToSendBytes.push(B);
        }

        this.Send(ToSendBytes);
        this._OutputBuffer.clear();
    };

    Object.defineProperty(WebSocketConnection.prototype, "LocalEcho", {
        set: function (value) {
            this._LocalEcho = value;
        },
        enumerable: true,
        configurable: true
    });

    WebSocketConnection.prototype.NegotiateInbound = function (data) {
        while (data.bytesAvailable) {
            var B = data.readUnsignedByte();
            this._InputBuffer.writeByte(B);
        }
    };

    WebSocketConnection.prototype.OnSocketClose = function () {
        if (this._WasConnected) {
            this.onclose.trigger();
        } else {
            this.onsecurityerror.trigger();
        }
        this._WasConnected = false;
    };

    WebSocketConnection.prototype.OnSocketError = function (e) {
        this.onioerror.trigger(e);
    };

    WebSocketConnection.prototype.OnSocketOpen = function () {
        if (this._WebSocket.protocol) {
            this._Protocol = this._WebSocket.protocol;
        } else {
            this._Protocol = 'plain';
        }

        this._WasConnected = true;
        this.onconnect.trigger();
    };

    WebSocketConnection.prototype.OnSocketMessage = function (e) {
        if (this._InputBuffer.bytesAvailable === 0) {
            this._InputBuffer.clear();
        }

        var OldPosition = this._InputBuffer.position;
        this._InputBuffer.position = this._InputBuffer.length;

        var Data = new ByteArray();

        var i;
        if (this._Protocol === 'binary') {
            var u8 = new Uint8Array(e.data);
            for (i = 0; i < u8.length; i++) {
                Data.writeByte(u8[i]);
            }
        } else if (this._Protocol === 'base64') {
            Data.writeString(atob(e.data));
        } else {
            Data.writeString(e.data);
        }
        Data.position = 0;

        this.NegotiateInbound(Data);

        this._InputBuffer.position = OldPosition;
    };

    WebSocketConnection.prototype.readBytes = function (bytes, offset, length) {
        return this._InputBuffer.readBytes(bytes, offset, length);
    };

    WebSocketConnection.prototype.readString = function (length) {
        return this._InputBuffer.readString(length);
    };

    WebSocketConnection.prototype.readUnsignedByte = function () {
        return this._InputBuffer.readUnsignedByte();
    };

    WebSocketConnection.prototype.readUnsignedShort = function () {
        return this._InputBuffer.readUnsignedShort();
    };

    WebSocketConnection.prototype.Send = function (data) {
        var i = 0;
        var ToSendString = '';

        if (this._Protocol === 'binary') {
            this._WebSocket.send(new Uint8Array(data).buffer);
        } else if (this._Protocol === 'base64') {
            for (i = 0; i < data.length; i++) {
                ToSendString += String.fromCharCode(data[i]);
            }
            this._WebSocket.send(btoa(ToSendString));
        } else {
            for (i = 0; i < data.length; i++) {
                ToSendString += String.fromCharCode(data[i]);
            }
            this._WebSocket.send(ToSendString);
        }
    };

    WebSocketConnection.prototype.writeByte = function (value) {
        this._OutputBuffer.writeByte(value);
    };

    WebSocketConnection.prototype.writeBytes = function (bytes, offset, length) {
        this._OutputBuffer.writeBytes(bytes, offset, length);
    };

    WebSocketConnection.prototype.writeShort = function (value) {
        this._OutputBuffer.writeShort(value);
    };

    WebSocketConnection.prototype.writeString = function (text) {
        this._OutputBuffer.writeString(text);
        this.flush();
    };
    return WebSocketConnection;
})();
var TelnetConnection = (function (_super) {
    __extends(TelnetConnection, _super);
    function TelnetConnection() {
        _super.call(this);

        this._NegotiatedOptions = [];
        for (var i = 0; i < 256; i++) {
            this._NegotiatedOptions[i] = 0;
        }
        this._NegotiationState = 0 /* Data */;
        this._TerminalTypeIndex = 0;
        this._TerminalTypes = ['ansi-bbs', 'ansi', 'cp437', 'cp437'];
    }
    TelnetConnection.prototype.flush = function () {
        var ToSendBytes = [];

        this._OutputBuffer.position = 0;
        while (this._OutputBuffer.bytesAvailable > 0) {
            var B = this._OutputBuffer.readUnsignedByte();
            ToSendBytes.push(B);

            if (B === 255 /* IAC */) {
                ToSendBytes.push(255 /* IAC */);
            }
        }

        this.Send(ToSendBytes);
        this._OutputBuffer.clear();
    };

    TelnetConnection.prototype.HandleAreYouThere = function () {
        var ToSendBytes = [];
        ToSendBytes.push('.'.charCodeAt(0));
        this.Send(ToSendBytes);
    };

    TelnetConnection.prototype.HandleEcho = function (command) {
        switch (command) {
            case 253 /* Do */:
                this.SendWill(1 /* Echo */);
                this._LocalEcho = true;
                this.onlocalecho.trigger(this._LocalEcho);
                break;
            case 254 /* Dont */:
                this.SendWont(1 /* Echo */);
                this._LocalEcho = false;
                this.onlocalecho.trigger(this._LocalEcho);
                break;
            case 251 /* Will */:
                this.SendDo(1 /* Echo */);
                this._LocalEcho = false;
                this.onlocalecho.trigger(this._LocalEcho);
                break;
            case 252 /* Wont */:
                this.SendDont(1 /* Echo */);
                this._LocalEcho = true;
                this.onlocalecho.trigger(this._LocalEcho);
                break;
        }
    };

    TelnetConnection.prototype.HandleTerminalType = function () {
        this.SendWill(24 /* TerminalType */);
        this.SendSubnegotiate(24 /* TerminalType */);

        var TerminalType = this._TerminalTypes[this._TerminalTypeIndex];
        var ToSendBytes = [];
        ToSendBytes.push(0);

        for (var i = 0; i < TerminalType.length; i++) {
            ToSendBytes.push(TerminalType.charCodeAt(i));
        }
        this.Send(ToSendBytes);

        this.SendSubnegotiateEnd();

        if (this._TerminalTypeIndex < (this._TerminalTypes.length - 1)) {
            this._TerminalTypeIndex += 1;
        } else {
            this._TerminalTypeIndex = 0;
        }
    };

    TelnetConnection.prototype.HandleTerminalLocationNumber = function () {
        this.SendWill(28 /* TerminalLocationNumber */);
        this.SendSubnegotiate(28 /* TerminalLocationNumber */);

        var InternetHostNumber = 0;
        var TerminalNumber = -1;

        var SixtyFourBits = [];
        SixtyFourBits.push(0);
        SixtyFourBits.push((InternetHostNumber & 0xFF000000) >> 24);
        SixtyFourBits.push((InternetHostNumber & 0x00FF0000) >> 16);
        SixtyFourBits.push((InternetHostNumber & 0x0000FF00) >> 8);
        SixtyFourBits.push((InternetHostNumber & 0x000000FF) >> 0);
        SixtyFourBits.push((TerminalNumber & 0xFF000000) >> 24);
        SixtyFourBits.push((TerminalNumber & 0x00FF0000) >> 16);
        SixtyFourBits.push((TerminalNumber & 0x0000FF00) >> 8);
        SixtyFourBits.push((TerminalNumber & 0x000000FF) >> 0);

        var ToSendBytes = [];

        for (var i = 0; i < SixtyFourBits.length; i++) {
            ToSendBytes.push(SixtyFourBits[i]);
            if (SixtyFourBits[i] === 255 /* IAC */) {
                ToSendBytes.push(255 /* IAC */);
            }
        }
        this.Send(ToSendBytes);

        this.SendSubnegotiateEnd();
    };

    TelnetConnection.prototype.HandleWindowSize = function () {
        this.SendWill(31 /* WindowSize */);
        this.SendSubnegotiate(31 /* WindowSize */);

        var Size = [];
        Size[0] = (Crt.WindCols >> 8) & 0xff;
        Size[1] = Crt.WindCols & 0xff;
        Size[2] = (Crt.WindRows >> 8) & 0xff;
        Size[3] = Crt.WindRows & 0xff;

        var ToSendBytes = [];
        for (var i = 0; i < Size.length; i++) {
            ToSendBytes.push(Size[i]);
            if (Size[i] === 255 /* IAC */) {
                ToSendBytes.push(255 /* IAC */);
            }
        }
        this.Send(ToSendBytes);

        this.SendSubnegotiateEnd();
    };

    Object.defineProperty(TelnetConnection.prototype, "LocalEcho", {
        set: function (value) {
            this._LocalEcho = value;

            if (this.connected) {
                if (this._LocalEcho) {
                    this.SendWill(1 /* Echo */);
                } else {
                    this.SendWont(1 /* Echo */);
                }
            }
        },
        enumerable: true,
        configurable: true
    });

    TelnetConnection.prototype.NegotiateInbound = function (data) {
        while (data.bytesAvailable) {
            var B = data.readUnsignedByte();

            if (this._NegotiationState === 0 /* Data */) {
                if (B === 255 /* IAC */) {
                    this._NegotiationState = 1 /* IAC */;
                } else {
                    this._InputBuffer.writeByte(B);
                }
            } else if (this._NegotiationState === 1 /* IAC */) {
                if (B === 255 /* IAC */) {
                    this._NegotiationState = 0 /* Data */;
                    this._InputBuffer.writeByte(B);
                } else {
                    switch (B) {
                        case 241 /* NoOperation */:
                        case 242 /* DataMark */:
                        case 243 /* Break */:
                        case 244 /* InterruptProcess */:
                        case 245 /* AbortOutput */:
                        case 247 /* EraseCharacter */:
                        case 248 /* EraseLine */:
                        case 249 /* GoAhead */:
                            this._NegotiationState = 0 /* Data */;
                            break;
                        case 246 /* AreYouThere */:
                            this.HandleAreYouThere();
                            this._NegotiationState = 0 /* Data */;
                            break;
                        case 253 /* Do */:
                            this._NegotiationState = 2 /* Do */;
                            break;
                        case 254 /* Dont */:
                            this._NegotiationState = 3 /* Dont */;
                            break;
                        case 251 /* Will */:
                            this._NegotiationState = 4 /* Will */;
                            break;
                        case 252 /* Wont */:
                            this._NegotiationState = 5 /* Wont */;
                            break;
                        default:
                            this._NegotiationState = 0 /* Data */;
                            break;
                    }
                }
            } else if (this._NegotiationState === 2 /* Do */) {
                switch (B) {
                    case 246 /* AreYouThere */:
                        this.SendWill(246 /* AreYouThere */);
                        this._NegotiatedOptions[246 /* AreYouThere */] = 0;
                        break;
                    case 0 /* TransmitBinary */:
                        this.SendWill(B);
                        break;
                    case 1 /* Echo */:
                        this.HandleEcho(253 /* Do */);
                        break;
                    case 3 /* SuppressGoAhead */:
                        this.SendWill(B);
                        break;
                    case 24 /* TerminalType */:
                        this.HandleTerminalType();
                        break;
                    case 28 /* TerminalLocationNumber */:
                        this.HandleTerminalLocationNumber();
                        break;
                    case 31 /* WindowSize */:
                        this.HandleWindowSize();
                        break;
                    case 34 /* LineMode */:
                        this.SendWont(B);
                        break;
                    default:
                        this.SendWont(B);
                        break;
                }
                this._NegotiationState = 0 /* Data */;
            } else if (this._NegotiationState === 3 /* Dont */) {
                switch (B) {
                    case 0 /* TransmitBinary */:
                        this.SendWill(B);
                        break;
                    case 1 /* Echo */:
                        this.HandleEcho(254 /* Dont */);
                        break;
                    case 3 /* SuppressGoAhead */:
                        this.SendWill(B);
                        break;
                    case 28 /* TerminalLocationNumber */:
                        this.SendWont(B);
                        break;
                    case 31 /* WindowSize */:
                        this.SendWont(B);
                        break;
                    case 34 /* LineMode */:
                        this.SendWont(B);
                        break;
                    default:
                        this.SendWont(B);
                        break;
                }
                this._NegotiationState = 0 /* Data */;
            } else if (this._NegotiationState === 4 /* Will */) {
                switch (B) {
                    case 0 /* TransmitBinary */:
                        this.SendDo(B);
                        break;
                    case 1 /* Echo */:
                        this.HandleEcho(251 /* Will */);
                        break;
                    case 3 /* SuppressGoAhead */:
                        this.SendDo(B);
                        break;
                    case 28 /* TerminalLocationNumber */:
                        this.SendDont(B);
                        break;
                    case 31 /* WindowSize */:
                        this.SendDont(B);
                        break;
                    case 34 /* LineMode */:
                        this.SendDont(B);
                        break;
                    default:
                        this.SendDont(B);
                        break;
                }
                this._NegotiationState = 0 /* Data */;
            } else if (this._NegotiationState === 5 /* Wont */) {
                switch (B) {
                    case 0 /* TransmitBinary */:
                        this.SendDo(B);
                        break;
                    case 1 /* Echo */:
                        this.HandleEcho(252 /* Wont */);
                        break;
                    case 3 /* SuppressGoAhead */:
                        this.SendDo(B);
                        break;
                    case 28 /* TerminalLocationNumber */:
                        this.SendDont(B);
                        break;
                    case 31 /* WindowSize */:
                        this.SendDont(B);
                        break;
                    case 34 /* LineMode */:
                        this.SendDont(B);
                        break;
                    default:
                        this.SendDont(B);
                        break;
                }
                this._NegotiationState = 0 /* Data */;
            } else {
                this._NegotiationState = 0 /* Data */;
            }
        }
    };

    TelnetConnection.prototype.OnSocketOpen = function () {
        _super.prototype.OnSocketOpen.call(this);

        if (this._LocalEcho) {
            this.SendWill(1 /* Echo */);
        } else {
            this.SendWont(1 /* Echo */);
        }
    };

    TelnetConnection.prototype.SendDo = function (option) {
        if (this._NegotiatedOptions[option] !== 253 /* Do */) {
            this._NegotiatedOptions[option] = 253 /* Do */;

            var ToSendBytes = [];
            ToSendBytes.push(255 /* IAC */);
            ToSendBytes.push(253 /* Do */);
            ToSendBytes.push(option);
            this.Send(ToSendBytes);
        }
    };

    TelnetConnection.prototype.SendDont = function (option) {
        if (this._NegotiatedOptions[option] !== 254 /* Dont */) {
            this._NegotiatedOptions[option] = 254 /* Dont */;

            var ToSendBytes = [];
            ToSendBytes.push(255 /* IAC */);
            ToSendBytes.push(254 /* Dont */);
            ToSendBytes.push(option);
            this.Send(ToSendBytes);
        }
    };

    TelnetConnection.prototype.SendSubnegotiate = function (option) {
        var ToSendBytes = [];
        ToSendBytes.push(255 /* IAC */);
        ToSendBytes.push(250 /* Subnegotiation */);
        ToSendBytes.push(option);
        this.Send(ToSendBytes);
    };

    TelnetConnection.prototype.SendSubnegotiateEnd = function () {
        var ToSendBytes = [];
        ToSendBytes.push(255 /* IAC */);
        ToSendBytes.push(240 /* EndSubnegotiation */);
        this.Send(ToSendBytes);
    };

    TelnetConnection.prototype.SendWill = function (option) {
        if (this._NegotiatedOptions[option] !== 251 /* Will */) {
            this._NegotiatedOptions[option] = 251 /* Will */;

            var ToSendBytes = [];
            ToSendBytes.push(255 /* IAC */);
            ToSendBytes.push(251 /* Will */);
            ToSendBytes.push(option);
            this.Send(ToSendBytes);
        }
    };

    TelnetConnection.prototype.SendWont = function (option) {
        if (this._NegotiatedOptions[option] !== 252 /* Wont */) {
            this._NegotiatedOptions[option] = 252 /* Wont */;

            var ToSendBytes = [];
            ToSendBytes.push(255 /* IAC */);
            ToSendBytes.push(252 /* Wont */);
            ToSendBytes.push(option);
            this.Send(ToSendBytes);
        }
    };
    return TelnetConnection;
})(WebSocketConnection);
var VirtualKeyboard = (function () {
    function VirtualKeyboard() {
    }
    VirtualKeyboard.Init = function (container) {
        var _this = this;
        container.appendChild(this.CreateDivElement());

        var Keys = document.getElementsByClassName('fTelnetKeyboardKey');
        for (var i = 0; i < Keys.length; i++) {
            if (Keys[i].addEventListener) {
                var KeyCode = Keys[i].getAttribute('data-keycode');
                if (this._Keys[KeyCode][2] > 0) {
                    Keys[i].addEventListener('click', function (e) {
                        _this.OnCharCode(e);
                    }, false);
                } else {
                    Keys[i].addEventListener('click', function (e) {
                        _this.OnKeyCode(e);
                    }, false);
                }
            }
        }
    };

    VirtualKeyboard.CreateDivElement = function () {
        var Rows = [
            [
                [27, 'Esc', 0, 0],
                [112, 'F1', 0, 0],
                [113, 'F2', 0, 0],
                [114, 'F3', 0, 0],
                [115, 'F4', 0, 0],
                [116, 'F5', 0, 0],
                [117, 'F6', 0, 0],
                [118, 'F7', 0, 0],
                [119, 'F8', 0, 0],
                [120, 'F9', 0, 0],
                [121, 'F10', 0, 0],
                [122, 'F11', 0, 0],
                [123, 'F12', 0, 0],
                [145, 'Scr<br />Lk', 0, 0],
                [1006, 'Prt<br />Scr', 0, 0],
                [45, 'Ins', 0, 0],
                [46, 'Del', 0, 0]
            ],
            [
                [192, '~<br />`', 126, 96],
                [49, '!<br />1', 33, 49],
                [50, '@<br />2', 64, 50],
                [51, '#<br />3', 35, 51],
                [52, '$<br />4', 36, 52],
                [53, '%<br />5', 37, 53],
                [54, '^<br />6', 94, 54],
                [55, '&<br />7', 38, 55],
                [56, '*<br />8', 42, 56],
                [57, '(<br />9', 40, 57],
                [48, ')<br />0', 41, 48],
                [173, '_<br />-', 95, 45],
                [61, '+<br />=', 43, 61],
                [8, 'Backspace', 0, 0],
                [36, 'Home', 0, 0]
            ],
            [
                [9, 'Tab', 0, 0],
                [81, 'Q', 81, 113],
                [87, 'W', 87, 119],
                [69, 'E', 69, 101],
                [82, 'R', 82, 114],
                [84, 'T', 84, 116],
                [89, 'Y', 89, 121],
                [85, 'U', 85, 117],
                [73, 'I', 73, 105],
                [79, 'O', 79, 111],
                [80, 'P', 80, 112],
                [219, '{<br />[', 123, 91],
                [221, '}<br />]', 125, 93],
                [220, '|<br />\\', 124, 92],
                [33, 'Page<br />Up', 0, 0]
            ],
            [
                [20, 'Caps Lock', 0, 0],
                [65, 'A', 65, 97],
                [83, 'S', 83, 115],
                [68, 'D', 68, 100],
                [70, 'F', 70, 102],
                [71, 'G', 71, 103],
                [72, 'H', 72, 104],
                [74, 'J', 74, 106],
                [75, 'K', 75, 107],
                [76, 'L', 76, 108],
                [59, ':<br />;', 58, 59],
                [222, '"<br />\'', 34, 39],
                [13, 'Enter', 0, 0],
                [34, 'Page<br />Down', 0, 0]
            ],
            [
                [1004, 'Shift', 0, 0],
                [90, 'Z', 90, 122],
                [88, 'X', 88, 120],
                [67, 'C', 67, 99],
                [86, 'V', 86, 118],
                [66, 'B', 66, 98],
                [78, 'N', 78, 110],
                [77, 'M', 77, 109],
                [188, '&lt;<br />,', 60, 44],
                [190, '&gt;<br />.', 62, 46],
                [191, '?<br />/', 63, 47],
                [1005, 'Shift', 0, 0],
                [38, '', 0, 0],
                [35, 'End', 0, 0]
            ],
            [
                [17, 'Ctrl', 0, 0],
                [91, '', 0, 0],
                [18, 'Alt', 0, 0],
                [32, '&nbsp;', 0, 0],
                [18, 'Alt', 0, 0],
                [93, '', 0, 0],
                [17, 'Ctrl', 0, 0],
                [37, '', 0, 0],
                [40, '', 0, 0],
                [39, '', 0, 0]
            ]
        ];

        var Html = '';
        for (var Row = 0; Row < Rows.length; Row++) {
            Html += '<div class="fTelnetKeyboardRow';
            if (Row === 0) {
                Html += ' fTelnetKeyboardRowFunction';
            }
            Html += '">';

            for (var i = 0; i < Rows[Row].length; i++) {
                Html += '<div class="fTelnetKeyboardKey';
                if (typeof this._ClassKeys[Rows[Row][i][0]] !== 'undefined') {
                    Html += ' fTelnetKeyboardKey' + this._ClassKeys[Rows[Row][i][0]];
                }
                Html += '" data-keycode="' + Rows[Row][i][0] + '">';
                Html += Rows[Row][i][1];
                Html += '</div>';

                this._Keys[Rows[Row][i][0]] = Rows[Row][i];
            }

            Html += '</div>';
        }

        this._Div = document.createElement('div');
        this._Div.id = 'fTelnetKeyboard';
        this._Div.innerHTML = Html;
        this._Div.style.display = (this._Visible ? 'block' : 'none');

        return this._Div;
    };

    VirtualKeyboard.HighlightKey = function (className, lit) {
        var Keys = document.getElementsByClassName(className);
        for (var i = 0; i < Keys.length; i++) {
            if (lit) {
                Keys[i].style.color = '#00ff00';
            } else {
                Keys[i].removeAttribute('style');
            }
        }
    };

    VirtualKeyboard.OnCharCode = function (e) {
        var KeyCode = parseInt(e.target.getAttribute('data-keycode'), 10);
        var CharCode = 0;

        if ((KeyCode >= 65) && (KeyCode <= 90)) {
            CharCode = parseInt((this._ShiftPressed !== this._CapsLockEnabled) ? this._Keys[KeyCode][2] : this._Keys[KeyCode][3], 10);
        } else {
            CharCode = parseInt(this._ShiftPressed ? this._Keys[KeyCode][2] : this._Keys[KeyCode][3], 10);
        }

        var NeedReDraw = false;
        var RegularKey = true;
        if (this._AltPressed) {
            NeedReDraw = true;
            RegularKey = false;
        }
        if (this._CtrlPressed) {
            NeedReDraw = true;
            RegularKey = false;
        }
        if (this._ShiftPressed) {
            NeedReDraw = true;
        }

        Crt.PushKeyDown(0, KeyCode, this._CtrlPressed, this._AltPressed, this._ShiftPressed);
        if (RegularKey) {
            Crt.PushKeyPress(CharCode, 0, this._CtrlPressed, this._AltPressed, this._ShiftPressed);
        }

        if (NeedReDraw) {
            this._AltPressed = false;
            this._CtrlPressed = false;
            this._ShiftPressed = false;
            this.ReDrawSpecialKeys();
        }
    };

    VirtualKeyboard.OnKeyCode = function (e) {
        var KeyCode = parseInt(e.target.getAttribute('data-keycode'), 10);

        var NeedReset = false;
        switch (KeyCode) {
            case 18 /* ALTERNATE */:
                this._AltPressed = !this._AltPressed;
                this.ReDrawSpecialKeys();
                break;
            case 20 /* CAPS_LOCK */:
                this._CapsLockEnabled = !this._CapsLockEnabled;
                this.ReDrawSpecialKeys();
                break;
            case 17 /* CONTROL */:
                this._CtrlPressed = !this._CtrlPressed;
                this.ReDrawSpecialKeys();
                break;
            case 1004 /* SHIFTLEFT */:
            case 1005 /* SHIFTRIGHT */:
                this._ShiftPressed = !this._ShiftPressed;
                this.ReDrawSpecialKeys();
                break;
            default:
                NeedReset = true;
                break;
        }

        Crt.PushKeyDown(0, KeyCode, this._CtrlPressed, this._AltPressed, this._ShiftPressed);

        if (NeedReset) {
            this._AltPressed = false;
            this._CtrlPressed = false;
            this._ShiftPressed = false;
            this.ReDrawSpecialKeys();
        }
    };

    VirtualKeyboard.ReDrawSpecialKeys = function () {
        this.HighlightKey('fTelnetKeyboardKeyCapsLock', this._CapsLockEnabled);
        this.HighlightKey('fTelnetKeyboardKeyShiftLeft', this._ShiftPressed);
        this.HighlightKey('fTelnetKeyboardKeyShiftRight', this._ShiftPressed);
        this.HighlightKey('fTelnetKeyboardKeyCtrl', this._CtrlPressed);
        this.HighlightKey('fTelnetKeyboardKeyAlt', this._AltPressed);
    };

    Object.defineProperty(VirtualKeyboard, "Visible", {
        get: function () {
            return this._Visible;
        },
        set: function (value) {
            this._Visible = value;

            if (this._Div != null) {
                this._Div.style.display = (value ? 'block' : 'none');
            }
        },
        enumerable: true,
        configurable: true
    });

    VirtualKeyboard._AltPressed = false;
    VirtualKeyboard._CapsLockEnabled = false;
    VirtualKeyboard._CtrlPressed = false;
    VirtualKeyboard._Div = null;
    VirtualKeyboard._ShiftPressed = false;
    VirtualKeyboard._Visible = true;

    VirtualKeyboard._ClassKeys = {
        '27': 'Escape',
        '145': 'SPID',
        '1006': 'SPID',
        '45': 'SPID',
        '46': 'SPID',
        '8': 'Backspace',
        '9': 'Tab',
        '220': 'Backslash',
        '20': 'CapsLock',
        '13': 'Enter',
        '1004': 'ShiftLeft',
        '1005': 'ShiftRight',
        '38': 'ArrowUp',
        '17': 'Ctrl',
        '91': 'Win',
        '18': 'Alt',
        '32': 'Spacebar',
        '93': 'AppMenu',
        '37': 'ArrowLeft',
        '40': 'ArrowDown',
        '39': 'ArrowRight'
    };

    VirtualKeyboard._Keys = [];
    return VirtualKeyboard;
})();
var CRC = (function () {
    function CRC() {
    }
    CRC.Calculate16 = function (bytes) {
        var CRC = 0;

        var OldPosition = bytes.position;
        bytes.position = 0;

        while (bytes.bytesAvailable > 0) {
            CRC = this.UpdateCrc(bytes.readUnsignedByte(), CRC);
        }
        CRC = this.UpdateCrc(0, CRC);
        CRC = this.UpdateCrc(0, CRC);

        bytes.position = OldPosition;

        return CRC;
    };

    CRC.UpdateCrc = function (curByte, curCrc) {
        return (this.CRC_TABLE[(curCrc >> 8) & 0x00FF] ^ (curCrc << 8) ^ curByte) & 0xFFFF;
    };
    CRC.CRC_TABLE = [
        0x0000, 0x1021, 0x2042, 0x3063, 0x4084, 0x50a5, 0x60c6, 0x70e7,
        0x8108, 0x9129, 0xa14a, 0xb16b, 0xc18c, 0xd1ad, 0xe1ce, 0xf1ef,
        0x1231, 0x0210, 0x3273, 0x2252, 0x52b5, 0x4294, 0x72f7, 0x62d6,
        0x9339, 0x8318, 0xb37b, 0xa35a, 0xd3bd, 0xc39c, 0xf3ff, 0xe3de,
        0x2462, 0x3443, 0x0420, 0x1401, 0x64e6, 0x74c7, 0x44a4, 0x5485,
        0xa56a, 0xb54b, 0x8528, 0x9509, 0xe5ee, 0xf5cf, 0xc5ac, 0xd58d,
        0x3653, 0x2672, 0x1611, 0x0630, 0x76d7, 0x66f6, 0x5695, 0x46b4,
        0xb75b, 0xa77a, 0x9719, 0x8738, 0xf7df, 0xe7fe, 0xd79d, 0xc7bc,
        0x48c4, 0x58e5, 0x6886, 0x78a7, 0x0840, 0x1861, 0x2802, 0x3823,
        0xc9cc, 0xd9ed, 0xe98e, 0xf9af, 0x8948, 0x9969, 0xa90a, 0xb92b,
        0x5af5, 0x4ad4, 0x7ab7, 0x6a96, 0x1a71, 0x0a50, 0x3a33, 0x2a12,
        0xdbfd, 0xcbdc, 0xfbbf, 0xeb9e, 0x9b79, 0x8b58, 0xbb3b, 0xab1a,
        0x6ca6, 0x7c87, 0x4ce4, 0x5cc5, 0x2c22, 0x3c03, 0x0c60, 0x1c41,
        0xedae, 0xfd8f, 0xcdec, 0xddcd, 0xad2a, 0xbd0b, 0x8d68, 0x9d49,
        0x7e97, 0x6eb6, 0x5ed5, 0x4ef4, 0x3e13, 0x2e32, 0x1e51, 0x0e70,
        0xff9f, 0xefbe, 0xdfdd, 0xcffc, 0xbf1b, 0xaf3a, 0x9f59, 0x8f78,
        0x9188, 0x81a9, 0xb1ca, 0xa1eb, 0xd10c, 0xc12d, 0xf14e, 0xe16f,
        0x1080, 0x00a1, 0x30c2, 0x20e3, 0x5004, 0x4025, 0x7046, 0x6067,
        0x83b9, 0x9398, 0xa3fb, 0xb3da, 0xc33d, 0xd31c, 0xe37f, 0xf35e,
        0x02b1, 0x1290, 0x22f3, 0x32d2, 0x4235, 0x5214, 0x6277, 0x7256,
        0xb5ea, 0xa5cb, 0x95a8, 0x8589, 0xf56e, 0xe54f, 0xd52c, 0xc50d,
        0x34e2, 0x24c3, 0x14a0, 0x0481, 0x7466, 0x6447, 0x5424, 0x4405,
        0xa7db, 0xb7fa, 0x8799, 0x97b8, 0xe75f, 0xf77e, 0xc71d, 0xd73c,
        0x26d3, 0x36f2, 0x0691, 0x16b0, 0x6657, 0x7676, 0x4615, 0x5634,
        0xd94c, 0xc96d, 0xf90e, 0xe92f, 0x99c8, 0x89e9, 0xb98a, 0xa9ab,
        0x5844, 0x4865, 0x7806, 0x6827, 0x18c0, 0x08e1, 0x3882, 0x28a3,
        0xcb7d, 0xdb5c, 0xeb3f, 0xfb1e, 0x8bf9, 0x9bd8, 0xabbb, 0xbb9a,
        0x4a75, 0x5a54, 0x6a37, 0x7a16, 0x0af1, 0x1ad0, 0x2ab3, 0x3a92,
        0xfd2e, 0xed0f, 0xdd6c, 0xcd4d, 0xbdaa, 0xad8b, 0x9de8, 0x8dc9,
        0x7c26, 0x6c07, 0x5c64, 0x4c45, 0x3ca2, 0x2c83, 0x1ce0, 0x0cc1,
        0xef1f, 0xff3e, 0xcf5d, 0xdf7c, 0xaf9b, 0xbfba, 0x8fd9, 0x9ff8,
        0x6e17, 0x7e36, 0x4e55, 0x5e74, 0x2e93, 0x3eb2, 0x0ed1, 0x1ef0];
    return CRC;
})();
var FileRecord = (function () {
    function FileRecord(name, size) {
        this._Data = new ByteArray();
        this._Name = '';
        this._Size = 0;
        this._Name = name;
        this._Size = size;
    }
    Object.defineProperty(FileRecord.prototype, "data", {
        get: function () {
            return this._Data;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(FileRecord.prototype, "name", {
        get: function () {
            return this._Name;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(FileRecord.prototype, "size", {
        get: function () {
            return this._Size;
        },
        enumerable: true,
        configurable: true
    });
    return FileRecord;
})();
var YModemReceive = (function () {
    function YModemReceive(connection) {
        this.ontransfercomplete = new TypedEvent();
        this.SOH = 0x01;
        this.STX = 0x02;
        this.EOT = 0x04;
        this.ACK = 0x06;
        this.CAN = 0x18;
        this.CAPG = 'G'.charCodeAt(0);
        this._Blink = false;
        this._ExpectingHeader = true;
        this._Files = [];
        this._LastGTime = 0;
        this._NextByte = 0;
        this._ShouldSendG = true;
        this._TotalBytesReceived = 0;
        this._Connection = connection;
    }
    YModemReceive.prototype.Cancel = function (reason) {
        try  {
            this._Connection.writeByte(this.CAN);
            this._Connection.writeByte(this.CAN);
            this._Connection.writeByte(this.CAN);
            this._Connection.writeByte(this.CAN);
            this._Connection.writeByte(this.CAN);
            this._Connection.writeString('\b\b\b\b\b     \b\b\b\b\b');
        } catch (ioe1) {
            this.HandleIOError(ioe1);
            return;
        }

        try  {
            this._Connection.readString();
        } catch (ioe2) {
            this.HandleIOError(ioe2);
            return;
        }

        this.CleanUp('Cancelling (' + reason + ')');
    };

    YModemReceive.prototype.CleanUp = function (message) {
        var _this = this;
        clearInterval(this._Timer);

        this.lblStatus.Text = 'Status: ' + message;

        setTimeout(function () {
            _this.Dispatch();
        }, 3000);
    };

    YModemReceive.prototype.Dispatch = function () {
        this.pnlMain.Hide();
        Crt.Blink = this._Blink;
        Crt.ShowCursor();

        this.ontransfercomplete.trigger();
    };

    YModemReceive.prototype.Download = function () {
        var _this = this;
        this._Timer = setInterval(function () {
            _this.OnTimer();
        }, 50);

        this._Blink = Crt.Blink;
        Crt.Blink = false;
        Crt.HideCursor();
        this.pnlMain = new CrtPanel(null, 10, 5, 60, 14, 0 /* Single */, Crt.WHITE, Crt.BLUE, 'YModem-G Receive Status (Hit CTRL+X to abort)', 6 /* TopLeft */);
        this.lblFileCount = new CrtLabel(this.pnlMain, 2, 2, 56, 'Receiving file 1', 9 /* Left */, Crt.YELLOW, Crt.BLUE);
        this.lblFileName = new CrtLabel(this.pnlMain, 2, 4, 56, 'File Name: ', 9 /* Left */, Crt.YELLOW, Crt.BLUE);
        this.lblFileSize = new CrtLabel(this.pnlMain, 2, 5, 56, 'File Size: ', 9 /* Left */, Crt.YELLOW, Crt.BLUE);
        this.lblFileReceived = new CrtLabel(this.pnlMain, 2, 6, 56, 'File Recv: ', 9 /* Left */, Crt.YELLOW, Crt.BLUE);
        this.pbFileReceived = new CrtProgressBar(this.pnlMain, 2, 7, 56, 219 /* Continuous */);
        this.lblTotalReceived = new CrtLabel(this.pnlMain, 2, 9, 56, 'Total Recv: ', 9 /* Left */, Crt.YELLOW, Crt.BLUE);
        this.lblStatus = new CrtLabel(this.pnlMain, 2, 11, 56, 'Status: Transferring file(s)', 9 /* Left */, Crt.WHITE, Crt.BLUE);
    };

    YModemReceive.prototype.FileAt = function (index) {
        return this._Files[index];
    };

    Object.defineProperty(YModemReceive.prototype, "FileCount", {
        get: function () {
            return this._Files.length;
        },
        enumerable: true,
        configurable: true
    });

    YModemReceive.prototype.HandleIOError = function (ioe) {
        console.log('I/O Error: ' + ioe);

        if (this._Connection.connected) {
            this.CleanUp('Unhandled I/O error');
        } else {
            this.CleanUp('Connection to server lost');
        }
    };

    YModemReceive.prototype.OnTimer = function () {
        while (Crt.KeyPressed()) {
            var KPE = Crt.ReadKey();
            if ((KPE !== null) && (KPE.keyString.length > 0) && (KPE.keyString.charCodeAt(0) === this.CAN)) {
                this.Cancel('User requested abort');
            }
        }

        while (true) {
            if (this._NextByte === 0) {
                if (this._Connection.bytesAvailable === 0) {
                    if (this._ShouldSendG && ((new Date()).getTime() - this._LastGTime > 3000)) {
                        try  {
                            this._Connection.writeByte(this.CAPG);
                            this._Connection.flush();
                        } catch (ioe1) {
                            this.HandleIOError(ioe1);
                            return;
                        }

                        this._LastGTime = new Date().getTime();
                    }

                    return;
                } else {
                    try  {
                        this._NextByte = this._Connection.readUnsignedByte();
                    } catch (ioe2) {
                        this.HandleIOError(ioe2);
                        return;
                    }
                }
            }

            switch (this._NextByte) {
                case this.CAN:
                    this.CleanUp('Sender requested abort');

                    break;
                case this.SOH:
                case this.STX:
                    this._ShouldSendG = false;

                    var BlockSize = (this._NextByte === this.STX) ? 1024 : 128;

                    if (this._Connection.bytesAvailable < (1 + 1 + BlockSize + 1 + 1)) {
                        return;
                    }

                    this._NextByte = 0;

                    var InBlock = this._Connection.readUnsignedByte();
                    var InBlockInverse = this._Connection.readUnsignedByte();

                    if (InBlockInverse !== (255 - InBlock)) {
                        this.Cancel('Bad block #: ' + InBlockInverse.toString() + ' !== 255-' + InBlock.toString());
                        return;
                    }

                    var Packet = new ByteArray();
                    this._Connection.readBytes(Packet, 0, BlockSize);

                    var InCRC = this._Connection.readUnsignedShort();
                    var OurCRC = CRC.Calculate16(Packet);
                    if (InCRC !== OurCRC) {
                        this.Cancel('Bad CRC: ' + InCRC.toString() + ' !== ' + OurCRC.toString());
                        return;
                    }

                    if (this._ExpectingHeader) {
                        if (InBlock !== 0) {
                            this.Cancel('Expecting header got block ' + InBlock.toString());
                            return;
                        }

                        this._ExpectingHeader = false;

                        var FileName = '';
                        var B = Packet.readUnsignedByte();
                        while ((B !== 0) && (Packet.bytesAvailable > 0)) {
                            FileName += String.fromCharCode(B);
                            B = Packet.readUnsignedByte();
                        }

                        var Temp = '';
                        var FileSize = 0;
                        B = Packet.readUnsignedByte();
                        while ((B >= 48) && (B <= 57) && (Packet.bytesAvailable > 0)) {
                            Temp += String.fromCharCode(B);
                            B = Packet.readUnsignedByte();
                        }
                        FileSize = parseInt(Temp, 10);

                        if (FileName.length === 0) {
                            this.CleanUp('File(s) successfully received!');
                            return;
                        }

                        if (isNaN(FileSize) || (FileSize === 0)) {
                            this.Cancel('File Size missing from header block');
                            return;
                        }

                        this._File = new FileRecord(FileName, FileSize);
                        this.lblFileCount.Text = 'Receiving file ' + (this._Files.length + 1).toString();
                        this.lblFileName.Text = 'File Name: ' + FileName;
                        this.lblFileSize.Text = 'File Size: ' + StringUtils.AddCommas(FileSize) + ' bytes';
                        this.lblFileReceived.Text = 'File Recv: 0 bytes';
                        this.pbFileReceived.Value = 0;
                        this.pbFileReceived.Maximum = FileSize;

                        try  {
                            this._Connection.writeByte(this.CAPG);
                            this._Connection.flush();
                        } catch (ioe3) {
                            this.HandleIOError(ioe3);
                            return;
                        }
                    } else {
                        var BytesToWrite = Math.min(BlockSize, this._File.size - this._File.data.length);
                        this._File.data.writeBytes(Packet, 0, BytesToWrite);
                        this._TotalBytesReceived += BytesToWrite;

                        this.lblFileReceived.Text = 'File Recv: ' + StringUtils.AddCommas(this._File.data.length) + ' bytes';
                        this.pbFileReceived.Value = this._File.data.length;
                        this.lblTotalReceived.Text = 'Total Recv: ' + StringUtils.AddCommas(this._TotalBytesReceived) + ' bytes';
                    }

                    break;
                case this.EOT:
                    this._ShouldSendG = true;

                    try  {
                        this._Connection.writeByte(this.ACK);
                        this._Connection.writeByte(this.CAPG);
                        this._Connection.flush();
                    } catch (ioe4) {
                        this.HandleIOError(ioe4);
                        return;
                    }

                    this._NextByte = 0;

                    this._ExpectingHeader = true;
                    this._Files.push(this._File);

                    this.SaveFile(this._Files.length - 1);

                    break;
                default:
                    this.Cancel('Unexpected byte: ' + this._NextByte.toString());
                    return;
            }
        }
    };

    YModemReceive.prototype.SaveFile = function (index) {
        var ByteString = this._Files[index].data.toString();

        var Buffer = new ArrayBuffer(ByteString.length);
        var View = new DataView(Buffer);
        for (var i = 0; i < ByteString.length; i++) {
            View.setUint8(i, ByteString.charCodeAt(i));
        }

        var FileBlob = new Blob([Buffer], { type: 'application/octet-binary' });
        saveAs(FileBlob, this._Files[index].name);
    };
    return YModemReceive;
})();
var YModemSend = (function () {
    function YModemSend(connection) {
        this.ontransfercomplete = new TypedEvent();
        this.SOH = 0x01;
        this.STX = 0x02;
        this.EOT = 0x04;
        this.ACK = 0x06;
        this.NAK = 0x15;
        this.CAN = 0x18;
        this.SUB = 0x1A;
        this.CAPG = 'G'.charCodeAt(0);
        this._Block = 0;
        this._Blink = false;
        this._EOTCount = 0;
        this._FileBytesSent = 0;
        this._FileCount = 0;
        this._Files = [];
        this._State = 0 /* WaitingForHeaderRequest */;
        this._TotalBytes = 0;
        this._TotalBytesSent = 0;
        this._Connection = connection;
    }
    YModemSend.prototype.Cancel = function (reason) {
        try  {
            this._Connection.writeByte(this.CAN);
            this._Connection.writeByte(this.CAN);
            this._Connection.writeByte(this.CAN);
            this._Connection.writeByte(this.CAN);
            this._Connection.writeByte(this.CAN);
            this._Connection.writeString('\b\b\b\b\b     \b\b\b\b\b');
        } catch (ioe1) {
            this.HandleIOError(ioe1);
            return;
        }

        try  {
            this._Connection.readString();
        } catch (ioe2) {
            this.HandleIOError(ioe2);
            return;
        }

        this.CleanUp('Cancelling (' + reason + ')');
    };

    YModemSend.prototype.CleanUp = function (message) {
        var _this = this;
        clearInterval(this._Timer);

        this.lblStatus.Text = 'Status: ' + message;

        setTimeout(function () {
            _this.Dispatch();
        }, 3000);
    };

    YModemSend.prototype.Dispatch = function () {
        this.pnlMain.Hide();
        Crt.Blink = this._Blink;
        Crt.ShowCursor();

        this.ontransfercomplete.trigger();
    };

    YModemSend.prototype.HandleIOError = function (ioe) {
        console.log('I/O Error: ' + ioe);

        if (this._Connection.connected) {
            this.CleanUp('Unhandled I/O error');
        } else {
            this.CleanUp('Connection to server lost');
        }
    };

    YModemSend.prototype.OnTimer = function () {
        while (Crt.KeyPressed()) {
            var KPE = Crt.ReadKey();
            if ((KPE !== null) && (KPE.keyString.length > 0) && (KPE.keyString.charCodeAt(0) === this.CAN)) {
                this.Cancel('User requested abort');
            }
        }

        if ((this._State !== 3 /* SendingData */) && (this._Connection.bytesAvailable === 0)) {
            return;
        }

        var B = 0;
        switch (this._State) {
            case 0 /* WaitingForHeaderRequest */:
                try  {
                    B = this._Connection.readUnsignedByte();
                } catch (ioe1) {
                    this.HandleIOError(ioe1);
                    return;
                }

                if (B !== this.CAPG) {
                    this.Cancel('Expecting G got ' + B.toString() + ' (State=' + this._State + ')');
                    return;
                }

                try  {
                    this._Connection.readString();
                } catch (ioe2) {
                    this.HandleIOError(ioe2);
                    return;
                }

                if (this._Files.length === 0) {
                    this.SendEmptyHeaderBlock();
                    this.CleanUp('File(s) successfully sent!');
                    return;
                }

                this._File = this._Files.shift();
                this.lblFileCount.Text = 'Sending file ' + (this._FileCount - this._Files.length).toString() + ' of ' + this._FileCount.toString();
                this.lblFileName.Text = 'File Name: ' + this._File.name;
                this.lblFileSize.Text = 'File Size: ' + StringUtils.AddCommas(this._File.size) + ' bytes';
                this.lblFileSent.Text = 'File Sent: 0 bytes';
                this.pbFileSent.Value = 0;
                this.pbFileSent.Maximum = this._File.size;

                this.SendHeaderBlock();

                this._Block = 1;
                this._EOTCount = 0;
                this._FileBytesSent = 0;

                this._State = 1 /* WaitingForHeaderAck */;
                return;

            case 1 /* WaitingForHeaderAck */:
                try  {
                    B = this._Connection.readUnsignedByte();
                } catch (ioe3) {
                    this.HandleIOError(ioe3);
                    return;
                }

                if ((B !== this.ACK) && (B !== this.CAPG)) {
                    this.Cancel('Expecting ACK/G got ' + B.toString() + ' (State=' + this._State + ')');
                    return;
                }

                if (B === this.ACK) {
                    this._State = 2 /* WaitingForFileRequest */;
                } else if (B === this.CAPG) {
                    this._State = 3 /* SendingData */;
                }
                return;

            case 2 /* WaitingForFileRequest */:
                try  {
                    B = this._Connection.readUnsignedByte();
                } catch (ioe4) {
                    this.HandleIOError(ioe4);
                    return;
                }

                if (B !== this.CAPG) {
                    this.Cancel('Expecting G got ' + B.toString() + ' (State=' + this._State + ')');
                    return;
                }

                this._State = 3 /* SendingData */;
                return;

            case 3 /* SendingData */:
                if (this.SendDataBlocks(16)) {
                    this._State = 4 /* WaitingForFileAck */;
                }
                return;

            case 4 /* WaitingForFileAck */:
                try  {
                    B = this._Connection.readUnsignedByte();
                } catch (ioe5) {
                    this.HandleIOError(ioe5);
                    return;
                }

                if ((B !== this.ACK) && (B !== this.NAK)) {
                    this.Cancel('Expecting (N)ACK got ' + B.toString() + ' (State=' + this._State + ')');
                    return;
                }

                if (B === this.ACK) {
                    this._State = 0 /* WaitingForHeaderRequest */;
                } else if (B === this.NAK) {
                    this.SendEOT();
                }
                return;
        }
    };

    YModemSend.prototype.SendDataBlocks = function (blocks) {
        for (var loop = 0; loop < blocks; loop++) {
            var BytesToRead = Math.min(1024, this._File.data.bytesAvailable);

            if (BytesToRead === 0) {
                this.SendEOT();
                return true;
            } else {
                var Packet = new ByteArray();
                this._File.data.readBytes(Packet, 0, BytesToRead);

                if (Packet.length < 1024) {
                    Packet.position = Packet.length;
                    while (Packet.length < 1024) {
                        Packet.writeByte(this.SUB);
                    }
                    Packet.position = 0;
                }

                try  {
                    this._Connection.writeByte(this.STX);
                    this._Connection.writeByte(this._Block % 256);
                    this._Connection.writeByte(255 - (this._Block % 256));
                    this._Connection.writeBytes(Packet);
                    this._Connection.writeShort(CRC.Calculate16(Packet));
                    this._Connection.flush();
                } catch (ioe) {
                    this.HandleIOError(ioe);
                    return false;
                }

                this._Block++;
                this._FileBytesSent += BytesToRead;
                this._TotalBytesSent += BytesToRead;

                this.lblFileSent.Text = 'File Sent: ' + StringUtils.AddCommas(this._FileBytesSent) + ' bytes';
                this.pbFileSent.StepBy(BytesToRead);
                this.lblTotalSent.Text = 'Total Sent: ' + StringUtils.AddCommas(this._TotalBytesSent) + ' bytes';
                this.pbTotalSent.StepBy(BytesToRead);
            }
        }

        return false;
    };

    YModemSend.prototype.SendEmptyHeaderBlock = function () {
        var Packet = new ByteArray();

        for (var i = 0; i < 128; i++) {
            Packet.writeByte(0);
        }

        try  {
            this._Connection.writeByte(this.SOH);
            this._Connection.writeByte(0);
            this._Connection.writeByte(255);
            this._Connection.writeBytes(Packet);
            this._Connection.writeShort(CRC.Calculate16(Packet));
            this._Connection.flush();
        } catch (ioe) {
            this.HandleIOError(ioe);
            return;
        }
    };

    YModemSend.prototype.SendEOT = function () {
        try  {
            this._Connection.writeByte(this.EOT);
            this._Connection.flush();
        } catch (ioe) {
            this.HandleIOError(ioe);
            return;
        }
        this._EOTCount++;
    };

    YModemSend.prototype.SendHeaderBlock = function () {
        var i = 0;
        var Packet = new ByteArray();

        for (i = 0; i < this._File.name.length; i++) {
            Packet.writeByte(this._File.name.charCodeAt(i));
        }

        Packet.writeByte(0);

        var Size = this._File.size.toString();
        for (i = 0; i < Size.length; i++) {
            Packet.writeByte(Size.charCodeAt(i));
        }

        if (Packet.length < 128) {
            while (Packet.length < 128) {
                Packet.writeByte(0);
            }
        } else if (Packet.length === 128) {
            i = 0;
        } else if (Packet.length < 1024) {
            while (Packet.length < 1024) {
                Packet.writeByte(0);
            }
        } else if (Packet.length === 1024) {
            i = 0;
        } else {
            this.Cancel('Header packet exceeded 1024 bytes!');
            return;
        }

        try  {
            this._Connection.writeByte(Packet.length === 128 ? this.SOH : this.STX);
            this._Connection.writeByte(0);
            this._Connection.writeByte(255);
            this._Connection.writeBytes(Packet);
            this._Connection.writeShort(CRC.Calculate16(Packet));
            this._Connection.flush();
        } catch (ioe) {
            this.HandleIOError(ioe);
            return;
        }
    };

    YModemSend.prototype.Upload = function (file, fileCount) {
        var _this = this;
        this._FileCount = fileCount;

        this._Files.push(file);

        if (this._Files.length === fileCount) {
            this._Timer = setInterval(function () {
                _this.OnTimer();
            }, 50);

            for (var i = 0; i < this._Files.length; i++) {
                this._TotalBytes += this._Files[i].size;
            }

            this._Blink = Crt.Blink;
            Crt.Blink = false;
            Crt.HideCursor();
            this.pnlMain = new CrtPanel(null, 10, 5, 60, 16, 0 /* Single */, Crt.WHITE, Crt.BLUE, 'YModem-G Send Status (Hit CTRL+X to abort)', 6 /* TopLeft */);
            this.lblFileCount = new CrtLabel(this.pnlMain, 2, 2, 56, 'Sending file 1 of ' + this._FileCount.toString(), 9 /* Left */, Crt.YELLOW, Crt.BLUE);
            this.lblFileName = new CrtLabel(this.pnlMain, 2, 4, 56, 'File Name: ' + this._Files[0].name, 9 /* Left */, Crt.YELLOW, Crt.BLUE);
            this.lblFileSize = new CrtLabel(this.pnlMain, 2, 5, 56, 'File Size: ' + StringUtils.AddCommas(this._Files[0].size) + ' bytes', 9 /* Left */, Crt.YELLOW, Crt.BLUE);
            this.lblFileSent = new CrtLabel(this.pnlMain, 2, 6, 56, 'File Sent: 0 bytes', 9 /* Left */, Crt.YELLOW, Crt.BLUE);
            this.pbFileSent = new CrtProgressBar(this.pnlMain, 2, 7, 56, 219 /* Continuous */);
            this.lblTotalSize = new CrtLabel(this.pnlMain, 2, 9, 56, 'Total Size: ' + StringUtils.AddCommas(this._TotalBytes) + ' bytes', 9 /* Left */, Crt.YELLOW, Crt.BLUE);
            this.lblTotalSent = new CrtLabel(this.pnlMain, 2, 10, 56, 'Total Sent: 0 bytes', 9 /* Left */, Crt.YELLOW, Crt.BLUE);
            this.pbTotalSent = new CrtProgressBar(this.pnlMain, 2, 11, 56, 219 /* Continuous */);
            this.pbTotalSent.Maximum = this._TotalBytes;
            this.lblStatus = new CrtLabel(this.pnlMain, 2, 13, 56, 'Status: Transferring file(s)', 9 /* Left */, Crt.WHITE, Crt.BLUE);
        }
    };
    return YModemSend;
})();
var YModemSendState;
(function (YModemSendState) {
    YModemSendState[YModemSendState["WaitingForHeaderRequest"] = 0] = "WaitingForHeaderRequest";
    YModemSendState[YModemSendState["WaitingForHeaderAck"] = 1] = "WaitingForHeaderAck";
    YModemSendState[YModemSendState["WaitingForFileRequest"] = 2] = "WaitingForFileRequest";
    YModemSendState[YModemSendState["SendingData"] = 3] = "SendingData";
    YModemSendState[YModemSendState["WaitingForFileAck"] = 4] = "WaitingForFileAck";
})(YModemSendState || (YModemSendState = {}));
//# sourceMappingURL=ftelnet.debug.js.map
