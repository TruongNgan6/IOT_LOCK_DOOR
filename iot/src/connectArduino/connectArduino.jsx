import React, { useState } from "react";

function SerialReader() {
  const [uid, setUID] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // State to store error messages

  const connectToSerial = async () => {
    try {
      console.log("Requesting access to serial port..."); // Log connection request
      const port = await navigator.serial.requestPort(); // Request access
      console.log("Access granted to serial port:", port); // Log if port is granted
      await port.open({ baudRate: 9600 }); // Set baud rate
      console.log("Serial port opened successfully"); // Log successful connection

      setIsConnected(true);

      const textDecoder = new TextDecoderStream();
      const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
      const reader = textDecoder.readable.getReader();

      // Read data from the serial port
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          console.log("Serial connection closed by reader"); // Log when reading ends
          reader.releaseLock();
          break;
        }
        if (value) {
          console.log("Data received:", value); // Log the received data

          const uidMatch = value.match(/UID:\s+([A-Fa-f0-9\s]+)/); // Match UID pattern
          if (uidMatch) {
            console.log("UID found:", uidMatch[1].trim()); // Log UID value
            setUID(uidMatch[1].trim()); // Update UID state
          } else {
            console.warn("No UID found in the data."); // Warn if no UID is found
          }
        } else {
          console.warn("No data received from serial."); // Warn if no data is received
        }
      }
    } catch (error) {
      console.error("Serial connection error:", error);
      setIsConnected(false);
      setErrorMessage("Error connecting to Arduino. Please try again."); // Set error message
    }
  };

  return (
    <div>
      <h2>Serial Reader</h2>
      {!isConnected ? (
        <button onClick={connectToSerial}>Connect to Arduino</button>
      ) : (
        <p>Connected to Arduino</p>
      )}

      {uid && <p>UID RFID Card: {uid}</p>}

      {errorMessage && (
        <p style={{ color: "red" }}>{errorMessage}</p> // Display error message if any
      )}
    </div>
  );
}

export default SerialReader;
