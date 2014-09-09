﻿var DialingDirectory = [];
var RecentConnections = [];
var SiteInitted = false;

$(document).ready(function () {
    // Test features
    TestFeatures();

    // Init HtmlTerm
    SetBestFontSize();
    HtmlTerm.SplashScreen = "G1swbRtbMkobWzA7MEgbWzE7NDQ7MzRt2sTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEG1swOzQ0OzMwbb8bWzBtDQobWzE7NDQ7MzRtsyAgG1szN21XZWxjb21lISAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAbWzA7NDQ7MzBtsxtbMG0NChtbMTs0NDszNG3AG1swOzQ0OzMwbcTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTE2RtbMG0NCg0KG1sxbSAbWzBtIBtbMTs0NDszNG3axMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMQbWzA7NDQ7MzBtvxtbMG0NCiAgG1sxOzQ0OzM0bbMbWzA7MzRt29vb2xtbMzBt29vb29vb29vb29vb29vb29vb29vb2xtbMzRt29vb29vbG1s0NDszMG2zG1swbQ0KICAbWzE7NDQ7MzRtsxtbMDszNG3b29vbG1sxOzMwbdvb29vb29vb29vb29vb29vb29vb29sbWzA7MzBt29sbWzM0bdvb29sbWzQ0OzMwbbMbWzBtDQogIBtbMTs0NDszNG2zG1swOzM0bdvb29sbWzE7MzBt29vb2xtbMG3b29vb29vb29vb29sbWzFt29vb2xtbMzBt29sbWzA7MzBt29sbWzM0bdvb29sbWzQ0OzMwbbMbWzBtDQogIBtbMTs0NDszNG2zG1swOzM0bdvb29sbWzE7MzBt29vb2xtbMG3b29vb29vb29vbG1sxbdvb29sbWzBt29sbWzE7MzBt29sbWzA7MzBt29sbWzM0bdvb29sbWzQ0OzMwbbMbWzBtDQogIBtbMTs0NDszNG2zG1swOzM0bdvb29sbWzE7MzBt29vb2xtbMG3b29vb29vb2xtbMW3b29vbG1swbdvbG1sxbdvbG1szMG3b2xtbMDszMG3b2xtbMzRt29vb2xtbNDQ7MzBtsxtbMG0NCiAgG1sxOzQ0OzM0bbMbWzA7MzRt29vb2xtbMTszMG3b29vbG1swbdvb29vb2xtbMW3b29vbG1swbdvbG1sxbdvb29sbWzMwbdvbG1swOzMwbdvbG1szNG3b29vbG1s0NDszMG2zG1swbQ0KICAbWzE7NDQ7MzRtsxtbMDszNG3b29vbG1sxOzMwbdvb29sbWzBt29vb2xtbMW3b29vbG1swbdvbG1sxbdvb29vb2xtbMzBt29sbWzA7MzBt29sbWzM0bdvb29sbWzQ0OzMwbbMbWzQwOzM3bQ0KICAbWzE7NDQ7MzRtsxtbMDszNG3b29vbG1sxOzMwbdvbG1swOzMwbdvbG1sxbdvb29vb29vb29vb29vb29vb2xtbMDszMG3b2xtbMzRt29vb2xtbNDQ7MzBtsxtbNDA7MzdtDQogIBtbMTs0NDszNG2zG1swOzM0bdvb29sbWzE7MzBt29sbWzBt29vb29vb29vb29vb29vb29vb29sbWzMwbdvbG1szNG3b29vbG1s0NDszMG2zG1s0MDszN20NCiAgG1sxOzQ0OzM0bbMbWzA7MzBt29vb29vb29vb29vb29vb29vb29vb29vb29vb29vbG1szNG3b2xtbNDQ7MzBtsxtbNDA7MzdtDQogIBtbMTs0NDszNG2zG1s0MDszMG3b2xtbMG3b29vb29vb29vb29vb29vb29vb29vb29vb29vbG1szMG3b2xtbNDRtsxtbNDA7MzdtIBtbMzRtIBtbMTs0NzszN23axMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMQbWzMwbb8bWzBtDQogIBtbMTs0NDszNG2zG1swOzMwbdvbG1sxbdvb29vb29vb29vb29vb29sbWzA7MzBt29vb29vb29vb2xtbMW3b2xtbMDszMG3b2xtbNDRtsxtbNDA7MzdtIBtbMzRtIBtbMTs0NzszN22zICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAbWzMwbbMbWzBtDQogIBtbMTs0NDszNG2zG1s0MDszMG3b2xtbMG3b29vb29vb29vb29vb29vb29vb29vb29vb29vbG1szMG3b2xtbNDRtsxtbMG0gG1szNG0gG1sxOzQ3OzM3bbMgICAbWzM0bUh0bWxUZXJtIC0tIFRlbG5ldCBmb3IgdGhlIFdlYiAgICAgG1szMG2zG1swbQ0KG1sxbSAbWzBtIBtbMTs0NDszNG2zG1swOzMwbdvbG1sxbdvb29vb29vb29vb29vb29vb29vb29vb2xtbMDszMG3b29vb29sbWzQ0bbMbWzBtIBtbMzRtIBtbMTs0NzszN22zICAgICAbWzA7NDc7MzRtV2ViIGJhc2VkIEJCUyB0ZXJtaW5hbCBjbGllbnQgICAgG1sxOzMwbbMbWzBtDQogIBtbMTs0NDszNG2zG1swOzM0bdvbG1szMG3b29vb29vb29vb29vb29vb29vb29vb29vb29vbG1szNG3b2xtbNDQ7MzBtsxtbMG0gG1szNG0gG1sxOzQ3OzM3bbMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIBtbMzBtsxtbMG0NCiAgG1sxOzQ0OzM0bcAbWzA7NDQ7MzBtxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTZG1swbSAbWzM0bSAbWzE7NDc7MzdtwBtbMzBtxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTZG1swbQ0KDQobWzExQxtbMTszMm1Db3B5cmlnaHQgKEMpIDIwMDAtMjAxNCBSJk0gU29mdHdhcmUuICBBbGwgUmlnaHRzIFJlc2VydmVkDQobWzA7MzRtxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExA==";
    HtmlTerm.Init("HtmlTermContainer");

    // Init Virtual Keyboard
    VK_Init();

    // See if we should load a specific panel
    if (location.hash) {
        var Panel = location.hash.replace('#', '');
        if (!OpenPanel(Panel)) OpenPanel('HtmlTerm');
    } else {
        OpenPanel('HtmlTerm');
    }

    // Load list of recent connections
    if (localStorage["RecentConnections"]) RecentConnections = JSON.parse(localStorage["RecentConnections"]);
    UpdateRecentMenu();

    // Load dialing directory
    if (false && localStorage["DialingDirectory"]) { // TODO Never use stored dialing directory during testing period
        DialingDirectory = JSON.parse(localStorage["DialingDirectory"]);
    } else {
        InitDialingDirectory();
    }
    UpdateDialingDirectory();
    $("#tblDialingDirectory").tablesorter();

    // Update the embed panel, just in case they refreshed while on that page
    UpdateEmbed();

    SiteInitted = true;
});

$(window).resize(function () {
    if (SiteInitted) SetBestFontSize();
});

$('#cboEmbedConnectionType').change(function () {
    UpdateEmbed();
});

$('#cboEmbedEmulation').change(function () {
    UpdateEmbed();
});

$('#cboEmbedProxyServer').change(function () {
    UpdateEmbed();
});

$('#cboEmbedVirtualKeyboard').change(function () {
    UpdateEmbed();
});

$('#txtEmbedHostname').keyup(function () {
    UpdateEmbed();
});

$('#txtEmbedPort').keyup(function () {
    UpdateEmbed();
});

$('#txtEmbedSplashScreen').keyup(function () {
    UpdateEmbed();
});

function AddToRecentMenu(newEntry) {
    RecentConnections.unshift(newEntry);
    while (RecentConnections.length > 5) RecentConnections.pop();
    localStorage["RecentConnections"] = JSON.stringify(RecentConnections);
    UpdateRecentMenu();
}

function Connect(hostname, port, proxy, connectionType, emulation) {
    // Confirms new connection if already connected
    if (HtmlTerm.Connected()) {
        if (confirm("This will disconnect your existing session -- continue?")) {
            HtmlTerm.Disconnect();
        } else {
            return false;
        }
    }
    
    // Clean up the hostname in case someony copy/pastes it in there with extra spaces
    hostname = $.trim(hostname);

    // Add to recent menu / local storage
    AddToRecentMenu({
        'ConnectionType': connectionType,
        'Emulation': emulation,
        'Hostname': hostname,
        'Port': port,
        'Proxy': proxy
    });

    // Setup new values
    HtmlTerm.ConnectionType = connectionType;
    HtmlTerm.Hostname = hostname;
    HtmlTerm.Port = port;
    HtmlTerm.ProxyHostname = (proxy ? "proxy-us-atl.ftelnet.ca" : "");
    HtmlTerm.ServerName = hostname;
    switch (emulation) {
        case 'c64':
            if (!Crt.C64) {
                Crt.C64 = true;
                Crt.SetFont("PETSCII-Lower", 16, 16);
                Crt.SetScreenSize(40, 25);
            }
            break;
        default:
            if (Crt.C64) {
                Crt.C64 = false;
                SetBestFontSize(true);
                Crt.SetScreenSize(80, 25);
            }
            break;
    }

    // And connect
    HtmlTerm.Connect();
    OpenPanel('HtmlTerm');

    return true;
}

function ConnectToDialingDirectory(index) {
    var Entry = DialingDirectory[index];

    if (Connect(Entry.Hostname, Entry.Port, Entry.Proxy, Entry.ConnectionType, Entry.Emulation)) {
        // Update connection count
        Entry.ConnectionCount += 1;
        DialingDirectory[index] = Entry;
        localStorage["DialingDirectory"] = JSON.stringify(DialingDirectory);
        UpdateDialingDirectory();
    }
}

function ConnectToRecent(index) {
    var Entry = RecentConnections[index];
    Connect(Entry.Hostname, Entry.Port, Entry.Proxy, Entry.ConnectionType, Entry.Emulation);
}

function Download() {
    HtmlTerm.Download();
}

function InitDialingDirectory() {
    DialingDirectory.push({
        'ConnectionCount': 0,
        'ConnectionType': 'telnet',
        'Description': 'fTelnet / HtmlTerm / GameSrv Demo Server',
        'Emulation': 'ansi-bbs',
        'Hostname': 'bbs.ftelnet.ca',
        'Notes': 'Default connection entry',
        'Port': 1123,
        'Proxy': false
    });

    DialingDirectory.push({
        'ConnectionCount': 0,
        'ConnectionType': 'telnet',
        'Description': 'Vertrauen',
        'Emulation': 'ansi-bbs',
        'Hostname': 'vert.synchro.net',
        'Notes': 'Default connection entry<br />Home of <a href="http://www.synchro.net" target="_blank">Synchronet</a>',
        'Port': 23,
        'Proxy': true
    });

    DialingDirectory.push({
        'ConnectionCount': 0,
        'ConnectionType': 'tcp',
        'Description': 'LV-426',
        'Emulation': 'c64',
        'Hostname': 'lv426bbs.homenet.org',
        'Notes': 'Default connection entry<br />A Commodore 64 BBS',
        'Port': 23,
        'Proxy': true
    });

    DialingDirectory.push({
        'ConnectionCount': 0,
        'ConnectionType': 'telnet',
        'Description': 'Starwars Asciimation',
        'Emulation': 'ansi-bbs',
        'Hostname': 'towel.blinkenlights.nl',
        'Notes': 'Default connection entry<br /><a href="http://www.blinkenlights.nl/services.html#starwars" target="_blank">Home Page</a>',
        'Port': 23,
        'Proxy': true
    });

    localStorage["DialingDirectory"] = JSON.stringify(DialingDirectory);
}

function OpenPanel(id) {
    if (!$('#pnl' + id).is(":visible")) {
        $('div[id^="pnl"]').hide('slow');
        $('#pnl' + id).show('slow');
        return true;
    }

    return false;
}

function QuickConnect() {
    var Hostname = $('#txtHostname').val();

    // Validate form
    if (Hostname == "") {
        Hostname = $('#txtHostname').attr("placeholder");
    }

    if (Connect(Hostname, 23, true, 'telnet', 'ansi-bbs')) {
        // Hides the drop down Connect menu
        if ($('.navbar-toggle').is(':visible')) {
            // Mobile
            $('.navbar-collapse').collapse('toggle');
        } else {
            // Desktop
            $("body").trigger("click");
        }
    }
}

function SetBestFontSize(force) {
    if (typeof force === 'undefined') force = false;

    // Abort if we don't have a numeric codepage
    if (SiteInitted && !force) {
        if (isNaN(parseInt(Crt.Font.CodePage, 10))) return;
    }

    // Try to set the biggest font that fits the screen
    SetFontSize(12, 23) ||
        SetFontSize(10, 19) ||
        SetFontSize(9, 16) ||
        SetFontSize(8, 14) ||
        SetFontSize(8, 13) ||
        SetFontSize(8, 12) ||
        SetFontSize(8, 8) ||
        SetFontSize(7, 12) ||
        SetFontSize(6, 8, true);
}

function SetFontSize(width, height, force) {
    if (typeof force === 'undefined') force = false;

    if (force || ((($(window).width() - 30) >= (width * 80)) && (($(window).height() - 60) >= (height * 25)))) { // -60 for top nav
        if (SiteInitted) {
            Crt.SetFont("437", width, height);
        } else {
            HtmlTerm.FontWidth = width;
            HtmlTerm.FontHeight = height;
        }

        $('link#VK_CSS').attr('href', VK_CSS_Url.replace("{size}", width * 80));

        return true;
    }

    return false;
}

function TestFeatures() {
    // Canvas
    var elem = document.createElement('canvas');
    if (elem.getContext && elem.getContext('2d')) {
        $('#tdCanvasSupported').text('Yep!');
        $('#tdCanvasSupported').addClass('text-success text-center');
    } else {
        $('#tdCanvasSupported').text('Nope!');
        $('#tdCanvasSupported').addClass('text-danger text-center');
    }

    // WebSocket
    if ('WebSocket' in window) {
        $('#tdWebSocketSupported').text('Yep!');
        $('#tdWebSocketSupported').addClass('text-success text-center');
    } else {
        $('#tdWebSocketSupported').text('Nope!');
        $('#tdWebSocketSupported').addClass('text-danger text-center');
    }

    // Web Storage
    try {
        localStorage.setItem("test", "test");
        localStorage.removeItem("test");
        $('#tdWebStorageSupported').text('Yep!');
        $('#tdWebStorageSupported').addClass('text-success text-center');
    } catch (e) {
        $('#tdWebStorageSupported').text('Nope!');
        $('#tdWebStorageSupported').addClass('text-danger text-center');
    }
}

function UpdateDialingDirectory() {
    $('#tblDialingDirectory tbody tr').remove();
    if (DialingDirectory && (DialingDirectory.length > 0)) {
        for (var i = 0; i < DialingDirectory.length; i++) {
            var NewRow = '<tr>';
            NewRow += '<td>' + (i + 1) + '</td>';
            NewRow += '<td><a href="#" onclick="ConnectToDialingDirectory(' + i + ');">' + DialingDirectory[i].Description + '</a></td>';
            NewRow += '<td>' + DialingDirectory[i].Hostname + '</td>';
            NewRow += '<td>' + DialingDirectory[i].Port + '</td>';
            NewRow += '<td>' + (DialingDirectory[i].Proxy ? 'yep' : 'nope') + '</td>';
            NewRow += '<td>' + DialingDirectory[i].Notes + '</td>';
            NewRow += '<td class="text-center">' + DialingDirectory[i].ConnectionCount + '</td>';
            NewRow += '</tr>';
            $('#tblDialingDirectory tbody').append(NewRow);
        }
        $("#tblDialingDirectory").trigger('update');
    } else {
        $('#tblDialingDirectory tbody').append('<tr><td colspan="7">You have no dialing directory entries</td></tr>');
    }
}

function UpdateEmbed() {
    // Clean up the hostname in case someony copy/pastes it in there with extra spaces
    $('#txtEmbedHostname').val($.trim($('#txtEmbedHostname').val()));
    
    // Ensure we have a hostname
    if ($('#txtEmbedHostname').val() == '') {
        $('#lblEmbed').html('Please enter a hostname!');
        $('#hlEmbed').attr("href", "javascript:alert('Please enter a hostname!');");
        return;
    }

    // Hostname
    var EmbedValues = 'Hostname=' + $('#txtEmbedHostname').val();
    
    // Port
    if ($('#txtEmbedPort').val() == '') {
        // No port, use default
        if ($('#cboEmbedProxyServer').val() == 'none') {
            // No proxy, use 1123
            EmbedValues += '&Port=1123';
        } else {
            // Proxy, use 23
            EmbedValues += '&Port=23';
        }
    } else {
        EmbedValues += '&Port=' + $('#txtEmbedPort').val();
    }
    
    // Proxy
    if ($('#cboEmbedProxyServer').val() != 'none') {
        var HostPort = $('#cboEmbedProxyServer').val().split(':');
        EmbedValues += '&Proxy=proxy-' + HostPort[0] + '.ftelnet.ca';
        EmbedValues += '&ProxyPort=' + HostPort[1];
    }
    
    // Connection type
    EmbedValues += '&ConnectionType=' + $('#cboEmbedConnectionType').val();
    
    // Emulation
    EmbedValues += '&Emulation=' + $('#cboEmbedEmulation').val();
    
    // Virtual keyboard
    EmbedValues += '&VirtualKeyboard=' + $('#cboEmbedVirtualKeyboard').val();
    
    // Splash screen
    if ($('#txtEmbedSplashScreen').val() != '') {
        EmbedValues += '&SplashScreen=' + encodeURIComponent($('#txtEmbedSplashScreen').val());
    }

    // Build the url and full tag, and update the page
    var EmbedUrl = 'http://embed.ftelnet.ca/?' + EmbedValues;
    var EmbedTag = '&lt;iframe src="' + EmbedUrl + '" width="100%" height="1000"&gt;&lt;/iframe&gt;';
    $('#lblEmbed').html(EmbedTag);
    $('#hlEmbed').attr("href", EmbedUrl);
}

function UpdateRecentMenu() {
    $('.recent-connection').remove();
    if (RecentConnections && (RecentConnections.length > 0)) {
        for (var i = 0; i < RecentConnections.length; i++) {
            $('#liAfterRecent').before('<li class="recent-connection"><a href="#" onclick="ConnectToRecent(' + i + ');">' + (i + 1) + ') ' + RecentConnections[i].Hostname + ':' + RecentConnections[i].Port + '</a></li>');
        }
    } else {
        $('#liAfterRecent').before('<li class="recent-connection"><a href="#">No recent connections...</a></li>');
    }
}

function Upload() {
    $('#fuUpload').change(function () {
        HtmlTerm.Upload(this.files);
    });

    $('#fuUpload').trigger('click');
}
