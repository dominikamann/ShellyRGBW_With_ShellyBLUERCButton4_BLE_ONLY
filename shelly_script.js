function button2_single() { 
  print("Button 2 Single Click"); 
  Shelly.call("RGBW.Toggle", { id: 0 });
  Shelly.call("RGBW.GetStatus", { id: 0 }, function(res) {
    print("Status (vor Toggle):", JSON.stringify(res));
  });
  }
  
function button2_double() { 
  print("Button 2 Double Click"); 
    Shelly.call("RGBW.Set", {
    id: 0,
    brightness: 50,
    rgb: [255, 120, 50],
    white: 0
    });
  }
function button2_triple() { 
  print("Button 2 Triple Click"); 
    Shelly.call("RGBW.Set", {
    id: 0,
    brightness: 100,
    rgb: [255, 120, 50],
    white: 0
    });
  }

function button2_long()   { 
  print("Button 2 Long Click"); 
    Shelly.call("RGBW.Set", {
    id: 0,
    brightness: 100,
    rgb: [0, 0, 0],
    white: 255
    });
  }

function button1_single() { print("Button 1 Single Click"); }
function button1_double() { print("Button 1 Double Click"); }
function button1_triple() { print("Button 1 Triple Click"); }
function button1_long()   { print("Button 1 Long Click"); }

function button3_single() { print("Button 3 Single Click"); }
function button3_double() { print("Button 3 Double Click"); }
function button3_triple() { print("Button 3 Triple Click"); }
function button3_long()   { print("Button 3 Long Click"); }

function button4_single() { print("Button 4 Single Click"); }
function button4_double() { print("Button 4 Double Click"); }
function button4_triple() { print("Button 4 Triple Click"); }
function button4_long()   { print("Button 4 Long Click"); }

// CONFIG - hier die MAC-Adresse eintragen (nur eine Adresse)
let CONFIG = {
    shelly_blu_address: {
        "7c:c6:b6:72:a7:e6": "shellies/comble_velux1"
    },
};

// Konvertiere alle Adressen in Großbuchstaben (zur Sicherheit)
for (let key in CONFIG.shelly_blu_address) {
    CONFIG.shelly_blu_address[key.toUpperCase()] = CONFIG.shelly_blu_address[key];
}

let ALLTERCO_MFD_ID_STR = "0ba9";
let BTHOME_SVC_ID_STR = "fcd2";

let ALLTERCO_MFD_ID = JSON.parse("0x" + ALLTERCO_MFD_ID_STR);
let BTHOME_SVC_ID = JSON.parse("0x" + BTHOME_SVC_ID_STR);

let SCAN_DURATION = BLE.Scanner.INFINITE_SCAN;

let uint8 = 0;
let int8 = 1;
let uint16 = 2;
let int16 = 3;
let uint24 = 4;
let int24 = 5;

function getByteSize(type) {
    if (type === uint8 || type === int8) return 1;
    if (type === uint16 || type === int16) return 2;
    if (type === uint24 || type === int24) return 3;
    return 255;
}

let BTH = {};
BTH[0x00] = { n: "pid", t: uint8 };
BTH[0x01] = { n: "Battery", t: uint8, u: "%" };
BTH[0x15] = { n: "Battery-OK", t: uint8 };
BTH[0x16] = { n: "Battery-Charging", t: uint8 };
BTH[0x05] = { n: "Illuminance", t: uint24, f: 0.01 };
BTH[0x3f] = { n: "Rotation", t: int16, f: 0.1 };
BTH[0x02] = { n: "Temperature", t: int16, f: 0.01, u: "tC" };
BTH[0x45] = { n: "Temperature", t: int16, f: 0.1, u: "tF" };
BTH[0x04] = { n: "Pressure", t: uint24, f: 0.01};
BTH[0x03] = { n: "Humidity", t: uint16, f: 0.01, u: "%" };
BTH[0x2e] = { n: "Humidity", t: uint8, f: 1, u: "%" };
BTH[0x08] = { n: "Dewpoint", t: uint16, f: 0.01};
BTH[0x14] = { n: "Moisture", t: uint16, f: 0.01};
BTH[0x2f] = { n: "Moisture", t: uint8, f: 1};
BTH[0x20] = { n: "Moisture-Warn", t: uint8 };
BTH[0x12] = { n: "co2", t: uint16};
BTH[0x17] = { n: "co", t: uint8 };
BTH[0x0c] = { n: "Voltage", t: uint16, f: 0.001};
BTH[0x4a] = { n: "Voltage", t: uint16, f: 0.1};
BTH[0x18] = { n: "Cold", t: uint8 };
BTH[0x1c] = { n: "Gas", t: uint8 };
BTH[0x1d] = { n: "Heat", t: uint8 };
BTH[0x1e] = { n: "Light", t: uint8 };
BTH[0x1f] = { n: "Lock", t: uint8 };
BTH[0x1a] = { n: "Door", t: uint8 };
BTH[0x1b] = { n: "Garage-Door", t: uint8 };
BTH[0x21] = { n: "Motion", t: uint8 };
BTH[0x2d] = { n: "Window", t: uint8 };
BTH[0x3a] = { n: "Button", t: uint8 };

let BTHomeDecoder = {
    utoi: function (num, bitsz) {
        let mask = 1 << (bitsz - 1);
        return num & mask ? num - (1 << bitsz) : num;
    },
    getUInt8: function (buffer) {
        return buffer.at(0);
    },
    getInt8: function (buffer) {
        return this.utoi(this.getUInt8(buffer), 8);
    },
    getUInt16LE: function (buffer) {
        return 0xffff & ((buffer.at(1) << 8) | buffer.at(0));
    },
    getInt16LE: function (buffer) {
        return this.utoi(this.getUInt16LE(buffer), 16);
    },
    getUInt24LE: function (buffer) {
        return (
            0x00ffffff & ((buffer.at(2) << 16) | (buffer.at(1) << 8) | buffer.at(0))
        );
    },
    getInt24LE: function (buffer) {
        return this.utoi(this.getUInt24LE(buffer), 24);
    },
    getBufValue: function (type, buffer) {
        if (buffer.length < getByteSize(type)) return null;
        let res = null;
        if (type === uint8) res = this.getUInt8(buffer);
        if (type === int8) res = this.getInt8(buffer);
        if (type === uint16) res = this.getUInt16LE(buffer);
        if (type === int16) res = this.getInt16LE(buffer);
        if (type === uint24) res = this.getUInt24LE(buffer);
        if (type === int24) res = this.getInt24LE(buffer);
        return res;
    },
    unpack: function (buffer) {
        if (typeof buffer !== "string" || buffer.length === 0) return null;
        let result = {};
        let _dib = buffer.at(0);

        result["encryption"] = _dib & 0x1 ? true : false;
        result["BTHome_version"] = _dib >> 5;
        if (result["BTHome_version"] !== 2) return null;
        if (result["encryption"]) return result;
        buffer = buffer.slice(1);

        let _bth;
        let _value;
        let cnt = 1;
        while (buffer.length > 0) {
            _bth = BTH[buffer.at(0)];
            if (typeof _bth === "undefined") {
                console.log("BTH: unknown type");
                break;
            }
            buffer = buffer.slice(1);
            _value = this.getBufValue(_bth.t, buffer);
            if (_value === null) break;
            if (typeof _bth.f !== "undefined") _value = _value * _bth.f;
            if (_bth.n === "Button") {
              result[_bth.n + cnt] = _value;
              cnt++;
            } else {
              result[_bth.n] = _value;
            }
            buffer = buffer.slice(getByteSize(_bth.t));
        }
        return result;
    },
};

let ShellyBLUParser = {
    getData: function (res) {
        let result = BTHomeDecoder.unpack(res.service_data[BTHOME_SVC_ID_STR]);
        result.addr = res.addr;
        result.rssi = res.rssi;
        return result;
    },
};

// === Funktionen je Button und Klicktyp ===



function handleButtonAction(buttonNumber, clickType) {
    var clickTypes = ["single", "double", "triple", "long"];
    if (buttonNumber < 1 || buttonNumber > 4) {
        print("Unbekannter Button: " + buttonNumber);
        return;
    }
    if (clickType < 1 || clickType > 4) {
        print("Unbekannter Klicktyp: " + clickType);
        return;
    }
    var funcName = "button" + buttonNumber + "_" + clickTypes[clickType - 1];
    if (typeof this[funcName] === "function") {
        this[funcName]();
    } else {
        print("Funktion nicht definiert: " + funcName);
    }
}

// Deduplication für Paket ID
let last_packet_id = 0x100;

// Callback für BLE Scan
function scanCB(ev, res) {
    if (ev !== BLE.Scanner.SCAN_RESULT) return;
    if (
        typeof res.service_data === "undefined" ||
        typeof res.service_data[BTHOME_SVC_ID_STR] === "undefined"
    ) return;
    if (
        typeof CONFIG.shelly_blu_address !== "undefined" &&
        !CONFIG.shelly_blu_address.hasOwnProperty(res.addr.toUpperCase())
    ) return;
    
    let BTHparsed = ShellyBLUParser.getData(res);
    if (BTHparsed === null) {
        print("Failed to parse BTH data");
        return;
    }
    if (last_packet_id === BTHparsed.pid) return;
    last_packet_id = BTHparsed.pid;

    print("Shelly BTH packet: " + JSON.stringify(BTHparsed));
    
    // Da nur eine MAC-Adresse, fest Button 1 nutzen
let buttonNumber = null;
let clickType = null;

for (let i = 1; i <= 4; i++) {
    let key = "Button" + i;
    if (BTHparsed[key] && BTHparsed[key] > 0) {
        buttonNumber = i;
        clickType = BTHparsed[key];
        break;
    }
}

if (buttonNumber !== null && clickType !== null) {
    handleButtonAction(buttonNumber, clickType);
} else {
    print("Kein Button-Klick erkannt");
}
}

print("Starting BLE scan");
BLE.Scanner.Start({ duration_ms: SCAN_DURATION, active: false }, scanCB);
