import { useEffect, useState } from "react";

const NFCReader = () => {
  const [nfcData, setNfcData] = useState("");
  const [nfcSupported, setNfcSupported] = useState(false);
  const [nfcError, setNfcError] = useState("");

  useEffect(() => {
    if ("NDEFReader" in window) {
      setNfcSupported(true);
      const nfc = new window.NDEFReader();

      const startScan = async () => {
        try {
          await nfc.scan();
          nfc.onreading = (event) => {
            const decoder = new TextDecoder();
            for (const record of event.message.records) {
              setNfcData(decoder.decode(record.data));
            }
          };
        } catch (error) {
          if (error.name === "NotAllowedError") {
            setNfcError(
              "NFC is not enabled. Please enable it in your device settings."
            );
          } else if (error.name === "NotSupportedError") {
            setNfcError("This device does not support NFC.");
          } else {
            setNfcError(`Error: ${error.message}`);
          }
        }
      };

      startScan();
    } else {
      
      setNfcError("Web NFC API is not supported in this browser.");
    }
  }, []);

  return (
    <div>
      <h1>NFC Reader</h1>
      {!nfcSupported && <p>NFC is not supported on this device/browser.</p>}
      {nfcError && <p>{nfcError}</p>}
      <p>
        {nfcData ? `Data from NFC: ${nfcData}` : "Tap an NFC tag to read data"}
      </p>
    </div>
  );
};

export default NFCReader;
