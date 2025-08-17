export const decodeBase64Unicode = (str: string) => {
    try {
        return decodeURIComponent(
            atob(str)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
    } catch (e) {
        return 'Error: Could not decode file content.';
    }
}