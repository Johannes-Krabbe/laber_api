export function validateAndParsePhoneNumber(phoneNumber: string) {
    const phoneRegex = /^\+(\d{1,3})(\d+)$/;
    const cleanedNumber = phoneNumber.replace(/\s/g, '');
    const match = cleanedNumber.match(phoneRegex);

    if (match) {
        return cleanedNumber;
    } else {
        return null;
    }
}
