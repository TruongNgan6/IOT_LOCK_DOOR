const { ArduinoIoTCloud } = require("arduino-iot-js");

(async () => {
  const client = await ArduinoIoTCloud.connect({
    deviceId: "YOUR_DEVICE_ID",
    secretKey: "YOUR_SECRET_KEY",
    onDisconnect: (message) => console.error(message),
  });

  const value = 20;
  let cloudVar = "test_value";

  client.sendProperty(cloudVar, value);
  console.log(cloudVar, ":", value);

  client.onPropertyValue(cloudVar, (value) =>
    console.log(cloudVar, ":", value)
  );
})();
