# ShellyRGBW (and other Shelly Devices) with ShellyBLU RC Button 4 — BLE-Only Local Control

Control your Shelly RGBW device completely locally, without Internet or WiFi, using Bluetooth and a Shelly BLU RC Button 4.

## Requirements

- Shelly RGBW with Bluetooth (BLE) enabled  
- Shelly BLU RC Button 4 (Bluetooth remote)  
- Shelly Gen 2 device with scripting capability  

## Setup Instructions

1. Enable Bluetooth (BLE) on your Shelly RGBW.  
2. Pair your Shelly BLU RC Button 4 with the Shelly RGBW.  
3. Open the Shelly Web UI and navigate to **Scripts**, then create a new script.  
4. Paste the script content into the editor.  
5. Update the CONFIG section with your Shelly BLU RC Button 4 MAC address:

```js
let CONFIG = {
    shelly_blu_address: {
        "XX:XX:XX:XX:XX:XX": "shellies/your_device_name"
    },
};
```

6. Customize the button functions (e.g., button1_single(), button1_double()) to implement your preferred actions such as toggling lights, changing colors, etc.
7. Save and activate the script so it runs automatically on startup.

## Example Button Functions

```js
function button1_single() {
    print("Button 1 Single Click");
    Shelly.call("RGBW.Toggle", { id: 0 });
}

function button1_double() {
    print("Button 1 Double Click");
    Shelly.call("RGBW.Set", {
        id: 0,
        brightness: 50,
        rgb: [255, 120, 50],
        white: 0
    });
}

function button1_triple() {
    print("Button 1 Triple Click");
    Shelly.call("RGBW.Set", {
        id: 0,
        brightness: 100,
        rgb: [255, 120, 50],
        white: 0
    });
}

function button1_long() {
    print("Button 1 Long Click");
    Shelly.call("RGBW.Set", {
        id: 0,
        brightness: 100,
        rgb: [0, 0, 0],
        white: 255
    });
}
```

## How It Works

1. The script continuously scans for Bluetooth packets from your Shelly BLU RC Button 4.
2. It decodes the BLE data in the BTHome format to detect which button and click type (single, double, triple, long) was pressed.
3. The corresponding function (e.g., button1_single()) is executed accordingly.
4. This allows you to control your Shelly RGBW fully locally and securely via BLE — no cloud or WiFi required.

## Documentation & Links

- Shelly RGBW API documentation: https://shelly-api-docs.shelly.cloud/gen2/ComponentsAndServices/RGBW/
- BTHome Bluetooth protocol: https://github.com/1technophile/OpenMQTTGateway/wiki/BTHome-Protocol
