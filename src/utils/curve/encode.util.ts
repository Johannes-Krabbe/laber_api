// Convert Uint8Array to string
export function uint8ArrayToString(uint8Array: Uint8Array): string {
  // Convert Uint8Array to regular array
  const numberArray = Array.from(uint8Array);
  
  // Use the spread operator to pass the array elements as separate arguments
  return btoa(String.fromCharCode(...numberArray));
}

// TODO this does not work
// Convert base64 string to Uint8Array
export function base64ToUint8Array(base64: string): Uint8Array {
    const binary = atob(base64);
    const uint8Array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        uint8Array[i] = binary.charCodeAt(i);
    }
    return uint8Array;
};

