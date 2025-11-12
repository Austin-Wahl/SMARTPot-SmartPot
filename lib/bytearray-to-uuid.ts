// Im not gonna lie. I just got ChatGPT to write this lol.

function base64ToUUID(base64Str: string): string {
  // Decode Base64 string to binary
  const binaryStr = atob(base64Str);

  // Convert binary string to byte array
  const bytes = Uint8Array.from(binaryStr, (char) => char.charCodeAt(0));

  // Ensure we have exactly 16 bytes (typical UUID size)
  if (bytes.length !== 16) {
    throw new Error('Invalid byte length for UUID!');
  }

  // Convert byte array to UUID format
  const uuid = [
    ...bytes.slice(0, 4), // First part
    ...bytes.slice(4, 6), // Second part
    ...bytes.slice(6, 8), // Third part
    ...bytes.slice(8, 10), // Fourth part
    ...bytes.slice(10, 16), // Fifth part
  ]
    .map((byte, index) => {
      // Convert each byte to a hex string and add hyphens at appropriate locations
      const hex = byte.toString(16).padStart(2, '0');
      return [4, 6, 8, 10].includes(index) ? '-' + hex : hex;
    })
    .join('');

  return uuid;
}

export default base64ToUUID;
