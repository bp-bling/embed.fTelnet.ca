<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
    <meta name="description" content="">
    <meta name="author" content="">

    <title>My fTelnet</title>

    <link href="css/iframe.css" rel="stylesheet">

    <link href="HtmlTerm/VirtualKeyboard-720.css" rel="stylesheet" id="VK_CSS">
    <script type="text/javascript">
        var VK_CSS_Url = 'HtmlTerm/VirtualKeyboard-{size}.css';
    </script>
</head>
<body>
    <div id="pnlHtmlTerm">
        <div style="text-align: center;">
            <div id="TopButtons">
                <a href="#" onclick="Connect();">Connect</a>
                <a href="#" onclick="HtmlTerm.Disconnect();">Disconnect</a>
                <a href="#" onclick="Download();">Download</a>
                <a href="#" onclick="Upload();">Upload</a><input type="file" id="fuUpload" style="display: none;" />
            </div>

            <div id="FocusWarning">
                WARNING: The client has lost focus so keyboard input will not be detected.  Please click here to fix that.
            </div>

            <div id="HtmlTermContainer"></div>
        </div>

        <div id="vk-keyboard">
            <div class="vk-row vk-function">
                <div class="vk-key vk-esc" data-keycode="27">Esc</div>
                <div class="vk-key" data-keycode="112">F1</div>
                <div class="vk-key" data-keycode="113">F2</div>
                <div class="vk-key" data-keycode="114">F3</div>
                <div class="vk-key" data-keycode="115">F4</div>
                <div class="vk-key" data-keycode="116">F5</div>
                <div class="vk-key" data-keycode="117">F6</div>
                <div class="vk-key" data-keycode="118">F7</div>
                <div class="vk-key" data-keycode="119">F8</div>
                <div class="vk-key" data-keycode="120">F9</div>
                <div class="vk-key" data-keycode="121">F10</div>
                <div class="vk-key" data-keycode="122">F11</div>
                <div class="vk-key" data-keycode="123">F12</div>
                <div class="vk-key vk-spid" data-keycode="145">Scr<br />Lk</div>
                <div class="vk-key vk-spid" data-keycode="000">Prt<br />Scr</div>
                <div class="vk-key vk-spid" data-keycode="45">Ins</div>
                <div class="vk-key vk-spid" data-keycode="46">Del</div>
            </div>
            <div class="vk-row">
                <div class="vk-key" data-keycode="192">~<br />`</div>
                <div class="vk-key" data-keycode="49">!<br />1</div>
                <div class="vk-key" data-keycode="50">@<br />2</div>
                <div class="vk-key" data-keycode="51">#<br />3</div>
                <div class="vk-key" data-keycode="52">$<br />4</div>
                <div class="vk-key" data-keycode="53">%<br />5</div>
                <div class="vk-key" data-keycode="54">^<br />6</div>
                <div class="vk-key" data-keycode="55">&<br />7</div>
                <div class="vk-key" data-keycode="56">*<br />8</div>
                <div class="vk-key" data-keycode="57">(<br />9</div>
                <div class="vk-key" data-keycode="48">)<br />0</div>
                <div class="vk-key" data-keycode="173">_<br />-</div>
                <div class="vk-key" data-keycode="61">+<br />=</div>
                <div class="vk-key vk-backspace" data-keycode="8">Backspace</div>
                <div class="vk-key" data-keycode="36">Home</div>
            </div>
            <div class="vk-row">
                <div class="vk-key vk-tab" data-keycode="9">Tab</div>
                <div class="vk-key" data-keycode="81">Q</div>
                <div class="vk-key" data-keycode="87">W</div>
                <div class="vk-key" data-keycode="69">E</div>
                <div class="vk-key" data-keycode="82">R</div>
                <div class="vk-key" data-keycode="84">T</div>
                <div class="vk-key" data-keycode="89">Y</div>
                <div class="vk-key" data-keycode="85">U</div>
                <div class="vk-key" data-keycode="73">I</div>
                <div class="vk-key" data-keycode="79">O</div>
                <div class="vk-key" data-keycode="80">P</div>
                <div class="vk-key" data-keycode="219">{<br />[</div>
                <div class="vk-key" data-keycode="221">}<br />]</div>
                <div class="vk-key vk-backslash" data-keycode="220">|<br />\</div>
                <div class="vk-key" data-keycode="33">Page<br />Up</div>
            </div>
            <div class="vk-row">
                <div class="vk-key vk-capslock" data-keycode="20">Caps Lock</div>
                <div class="vk-key" data-keycode="65">A</div>
                <div class="vk-key" data-keycode="83">S</div>
                <div class="vk-key" data-keycode="68">D</div>
                <div class="vk-key" data-keycode="70">F</div>
                <div class="vk-key" data-keycode="71">G</div>
                <div class="vk-key" data-keycode="72">H</div>
                <div class="vk-key" data-keycode="74">J</div>
                <div class="vk-key" data-keycode="75">K</div>
                <div class="vk-key" data-keycode="76">L</div>
                <div class="vk-key" data-keycode="59">:<br />;</div>
                <div class="vk-key" data-keycode="222">"<br />'</div>
                <div class="vk-key vk-enter" data-keycode="13">Enter</div>
                <div class="vk-key" data-keycode="37">Page<br />Down</div>
            </div>
            <div class="vk-row">
                <div class="vk-key vk-lshift" data-keycode="16">Shift</div>
                <div class="vk-key" data-keycode="90">Z</div>
                <div class="vk-key" data-keycode="88">X</div>
                <div class="vk-key" data-keycode="67">C</div>
                <div class="vk-key" data-keycode="86">V</div>
                <div class="vk-key" data-keycode="66">B</div>
                <div class="vk-key" data-keycode="78">N</div>
                <div class="vk-key" data-keycode="77">M</div>
                <div class="vk-key" data-keycode="188">&lt;<br />,</div>
                <div class="vk-key" data-keycode="190">&gt;<br />.</div>
                <div class="vk-key" data-keycode="191">?<br />/</div>
                <div class="vk-key vk-rshift" data-keycode="16">Shift</div>
                <div class="vk-key vk-arrow-up" data-keycode="38"></div>
                <div class="vk-key" data-keycode="35">End</div>
            </div>
            <div class="vk-row">
                <div class="vk-key vk-ctrl" data-keycode="17">Ctrl</div>
                <div class="vk-key vk-win" data-keycode="91"></div>
                <div class="vk-key vk-alt" data-keycode="18">Alt</div>
                <div class="vk-key vk-spacebar" data-keycode="32">&nbsp;</div>
                <div class="vk-key vk-alt" data-keycode="18">Alt</div>
                <div class="vk-key vk-appmenu" data-keycode="93"></div>
                <div class="vk-key vk-ctrl" data-keycode="17">Ctrl</div>
                <div class="vk-key vk-arrow-left" data-keycode="37"></div>
                <div class="vk-key vk-arrow-down" data-keycode="40"></div>
                <div class="vk-key vk-arrow-right" data-keycode="39"></div>
            </div>
        </div>
    </div>

    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"></script>
    <script>window.jQuery || document.write('<script src="js/jquery-1.11.0.min.js"><\/script>')</script>
    
    <script src="HtmlTerm/HtmlTerm.js"></script>
    <script src="HtmlTerm/HtmlTerm.font-437.js"></script>
    <script src="HtmlTerm/HtmlTerm.font-c64.js"></script>
    <script src="HtmlTerm/VirtualKeyboard.js"></script>
    
    <script>
        var TargetHostname = '<?php echo $_GET['Hostname']; ?>';
        var TargetPort = <?php echo $_GET['Port']; ?>;
        var TargetProxy = <?php echo $_GET['Proxy']; ?>;
        var TargetConnectionType = '<?php echo $_GET['ConnectionType']; ?>';
        var TargetEmulation = '<?php echo $_GET['Emulation']; ?>';
    </script>
    <script src="js/iframe.js"></script>

    <script>
        (function (i, s, o, g, r, a, m) {
            i['GoogleAnalyticsObject'] = r; i[r] = i[r] || function () {
                (i[r].q = i[r].q || []).push(arguments)
            }, i[r].l = 1 * new Date(); a = s.createElement(o),
            m = s.getElementsByTagName(o)[0]; a.async = 1; a.src = g; m.parentNode.insertBefore(a, m)
        })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

        ga('create', 'UA-4602017-8', 'ftelnet.ca');
        ga('send', 'pageview');
    </script>
</body>
</html>
